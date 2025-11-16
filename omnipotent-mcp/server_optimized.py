#!/usr/bin/env python3
"""
Omnipotent MCP Server - FIXED VERSION
Using standard MCP Server API instead of FastMCP
"""

import asyncio
import json
import os
import sys
import subprocess
import psutil
import platform
import socket
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict
import time
import hashlib

import httpx
import requests
from bs4 import BeautifulSoup
import aiohttp

from mcp.server import Server
import mcp.server.stdio
from mcp.types import TextContent, CallToolResult, Tool

# Configure logging to stderr
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

# Initialize MCP server
server = Server("omnipotent")

# ============================================================================
# CONFIGURATION & LOGGING
# ============================================================================

# Configuration
CACHE_TTL_SHORT = 60  # 1 minute
CACHE_TTL_MEDIUM = 300  # 5 minutes
CACHE_TTL_LONG = 3600  # 1 hour
HTTP_POOL_SIZE = 30
MAX_RETRIES = 3
RATE_LIMIT_CALLS = 150
RATE_LIMIT_PERIOD = 60

# ============================================================================
# CACHING LAYER WITH INTELLIGENCE
# ============================================================================

class SmartCache:
    """Intelligent cache with TTL and LRU eviction"""
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, tuple[Any, datetime, int]] = {}  # value, timestamp, access_count
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
        self.evictions = 0
    
    def get(self, key: str, ttl_seconds: int = CACHE_TTL_MEDIUM) -> Optional[Any]:
        if key in self.cache:
            value, timestamp, access_count = self.cache[key]
            if datetime.now() - timestamp < timedelta(seconds=ttl_seconds):
                self.cache[key] = (value, timestamp, access_count + 1)
                self.hits += 1
                return value
            else:
                del self.cache[key]
        self.misses += 1
        return None
    
    def set(self, key: str, value: Any):
        if len(self.cache) >= self.max_size:
            self._evict_lru()
        self.cache[key] = (value, datetime.now(), 0)
    
    def _evict_lru(self):
        """Evict least recently used item"""
        if not self.cache:
            return
        lru_key = min(self.cache.items(), key=lambda x: x[1][2])[0]
        del self.cache[lru_key]
        self.evictions += 1
    
    def clear(self):
        self.cache.clear()
    
    def stats(self) -> Dict:
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "size": len(self.cache),
            "evictions": self.evictions
        }

cache = SmartCache(max_size=2000)

# ============================================================================
# RATE LIMITING
# ============================================================================

class RateLimiter:
    """Token bucket rate limiter with burst support"""
    def __init__(self, calls: int, period: int):
        self.calls = calls
        self.period = period
        self.tokens = calls
        self.last_update = time.time()
        self.lock = asyncio.Lock()
    
    async def acquire(self) -> bool:
        async with self.lock:
            now = time.time()
            elapsed = now - self.last_update
            self.tokens = min(self.calls, self.tokens + elapsed * (self.calls / self.period))
            self.last_update = now
            
            if self.tokens >= 1:
                self.tokens -= 1
                return True
            return False

rate_limiter = RateLimiter(RATE_LIMIT_CALLS, RATE_LIMIT_PERIOD)

# ============================================================================
# HTTP CLIENT POOL
# ============================================================================

class HTTPClientPool:
    """Async HTTP client with connection pooling"""
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.httpx_client: Optional[httpx.AsyncClient] = None
        self.request_count = 0
        self.error_count = 0
    
    async def get_session(self) -> aiohttp.ClientSession:
        if self.session is None or self.session.closed:
            connector = aiohttp.TCPConnector(limit=HTTP_POOL_SIZE, limit_per_host=20)
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
        return self.session
    
    async def get_httpx_client(self) -> httpx.AsyncClient:
        if self.httpx_client is None:
            limits = httpx.Limits(max_keepalive_connections=HTTP_POOL_SIZE, max_connections=HTTP_POOL_SIZE * 2)
            self.httpx_client = httpx.AsyncClient(limits=limits, timeout=30.0, follow_redirects=True)
        return self.httpx_client
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
        if self.httpx_client:
            await self.httpx_client.aclose()
    
    def stats(self) -> Dict:
        success_rate = ((self.request_count - self.error_count) / self.request_count * 100) if self.request_count > 0 else 100
        return {
            "total_requests": self.request_count,
            "errors": self.error_count,
            "success_rate": round(success_rate, 2)
        }

http_pool = HTTPClientPool()

# ============================================================================
# METRICS COLLECTOR
# ============================================================================

class MetricsCollector:
    """Collect and persist performance metrics"""
    def __init__(self):
        self.tool_calls = defaultdict(int)
        self.tool_errors = defaultdict(int)
        self.tool_latencies = defaultdict(list)
    
    def record_call(self, tool_name: str, latency: float, error: bool = False):
        self.tool_calls[tool_name] += 1
        self.tool_latencies[tool_name].append(latency)
        if error:
            self.tool_errors[tool_name] += 1
    
    def get_stats(self) -> Dict:
        stats = {}
        for tool in self.tool_calls:
            latencies = self.tool_latencies[tool]
            avg_latency = sum(latencies) / len(latencies) if latencies else 0
            success_rate = ((self.tool_calls[tool] - self.tool_errors[tool]) / self.tool_calls[tool] * 100) if self.tool_calls[tool] > 0 else 100
            stats[tool] = {
                "calls": self.tool_calls[tool],
                "errors": self.tool_errors[tool],
                "avg_latency_ms": round(avg_latency * 1000, 2),
                "success_rate": round(success_rate, 2)
            }
        return stats

metrics = MetricsCollector()

# ============================================================================
# DECORATORS
# ============================================================================

def with_metrics(func):
    """Track metrics for tool calls"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        error = False
        try:
            result = await func(*args, **kwargs)
            return result
        except Exception as e:
            error = True
            raise
        finally:
            latency = time.time() - start
            metrics.record_call(func.__name__, latency, error)
    return wrapper

def with_cache(ttl: int = CACHE_TTL_MEDIUM):
    """Cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key from function name and args
            cache_key = f"{func.__name__}:{hashlib.md5(json.dumps({'args': args, 'kwargs': kwargs}, sort_keys=True).encode()).hexdigest()}"
            cached = cache.get(cache_key, ttl)
            if cached is not None:
                return cached
            result = await func(*args, **kwargs)
            cache.set(cache_key, result)
            return result
        return wrapper
    return decorator

def with_rate_limit(func):
    """Apply rate limiting"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if not await rate_limiter.acquire():
            return json.dumps({"error": "Rate limit exceeded", "success": False})
        return await func(*args, **kwargs)
    return wrapper

@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List all available tools"""
    return [
        Tool(
            name="system_info",
            description="Get comprehensive system information including OS, CPU, memory, disk, network",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="list_processes",
            description="List all running processes with optional name filter",
            inputSchema={
                "type": "object",
                "properties": {
                    "filter_name": {"type": "string", "description": "Filter processes by name"}
                },
                "required": []
            }
        ),
        Tool(
            name="execute_command",
            description="Execute a system command and return output",
            inputSchema={
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "Command to execute"},
                    "timeout": {"type": "number", "description": "Timeout in seconds", "default": 30}
                },
                "required": ["command"]
            }
        ),
        Tool(
            name="read_file_advanced",
            description="Read file with advanced options",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "File path"},
                    "encoding": {"type": "string", "description": "File encoding", "default": "utf-8"},
                    "max_lines": {"type": "number", "description": "Max lines to read (0 = all)", "default": 0}
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="write_file_advanced",
            description="Write file with advanced options",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "File path"},
                    "content": {"type": "string", "description": "Content to write"},
                    "encoding": {"type": "string", "description": "File encoding", "default": "utf-8"},
                    "create_dirs": {"type": "boolean", "description": "Create parent dirs", "default": True}
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="http_request",
            description="Make HTTP request with full control",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "URL to request"},
                    "method": {"type": "string", "description": "HTTP method", "default": "GET"},
                    "timeout": {"type": "number", "description": "Timeout in seconds", "default": 30}
                },
                "required": ["url"]
            }
        ),
        Tool(
            name="scrape_webpage",
            description="Scrape webpage content with optional CSS selector",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "URL to scrape"},
                    "selector": {"type": "string", "description": "CSS selector (optional)"}
                },
                "required": ["url"]
            }
        ),
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
    """Handle tool calls"""

    @with_metrics
    @with_rate_limit
    async def system_info_impl():
        info = {
            "platform": {
                "system": platform.system(),
                "release": platform.release(),
                "version": platform.version(),
                "machine": platform.machine(),
                "processor": platform.processor(),
                "hostname": socket.gethostname()
            },
            "cpu": {
                "physical_cores": psutil.cpu_count(logical=False),
                "logical_cores": psutil.cpu_count(logical=True),
                "cpu_percent": psutil.cpu_percent(interval=1)
            },
            "memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "percent": psutil.virtual_memory().percent,
                "used": psutil.virtual_memory().used
            },
            "disk": []
        }
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                info["disk"].append({
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "percent": usage.percent
                })
            except:
                pass
        return CallToolResult(content=[TextContent(type="text", text=json.dumps(info, indent=2))])

    @with_metrics
    @with_rate_limit
    async def list_processes_impl(filter_name: str = ""):
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'username', 'memory_percent', 'cpu_percent']):
            try:
                pinfo = proc.info
                if filter_name.lower() in pinfo['name'].lower() or not filter_name:
                    processes.append({
                        "pid": pinfo['pid'],
                        "name": pinfo['name'],
                        "username": pinfo['username'],
                        "memory_percent": pinfo['memory_percent'],
                        "cpu_percent": pinfo['cpu_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        processes.sort(key=lambda x: x['memory_percent'] or 0, reverse=True)
        return CallToolResult(content=[TextContent(type="text", text=json.dumps(processes[:50], indent=2))])

    @with_metrics
    @with_rate_limit
    async def execute_command_impl(command: str, timeout: int = 30):
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            output = {
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
            return CallToolResult(content=[TextContent(type="text", text=json.dumps(output, indent=2))])
        except subprocess.TimeoutExpired:
            return CallToolResult(content=[TextContent(type="text", text=json.dumps({"error": f"Command timed out after {timeout} seconds"}))])

    @with_metrics
    @with_rate_limit
    async def read_file_advanced_impl(path: str, encoding: str = "utf-8", max_lines: int = 0):
        filepath = Path(path).expanduser().resolve()
        with open(filepath, 'r', encoding=encoding) as f:
            if max_lines > 0:
                lines = [f.readline() for _ in range(max_lines)]
                content = ''.join(lines)
            else:
                content = f.read()
        result = {
            "path": str(filepath),
            "size": filepath.stat().st_size,
            "content": content,
            "lines": len(content.splitlines())
        }
        return CallToolResult(content=[TextContent(type="text", text=json.dumps(result, indent=2))])

    @with_metrics
    @with_rate_limit
    async def write_file_advanced_impl(path: str, content: str, encoding: str = "utf-8", create_dirs: bool = True):
        filepath = Path(path).expanduser().resolve()
        if create_dirs:
            filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w', encoding=encoding) as f:
            f.write(content)
        result = {
            "path": str(filepath),
            "size": filepath.stat().st_size,
            "success": True
        }
        return CallToolResult(content=[TextContent(type="text", text=json.dumps(result, indent=2))])

    @with_metrics
    @with_cache(ttl=CACHE_TTL_MEDIUM)
    @with_rate_limit
    async def http_request_impl(url: str, method: str = "GET", timeout: int = 30):
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method.upper(),
                url=url,
                timeout=timeout
            )
            result = {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text[:5000],
                "success": response.status_code < 400
            }
            return CallToolResult(content=[TextContent(type="text", text=json.dumps(result, indent=2))])

    @with_metrics
    @with_cache(ttl=CACHE_TTL_MEDIUM)
    @with_rate_limit
    async def scrape_webpage_impl(url: str, selector: str = None):
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        if selector:
            elements = soup.select(selector)
            content = [elem.get_text(strip=True) for elem in elements]
        else:
            content = soup.get_text(strip=True)[:5000]
        result = {
            "url": url,
            "status_code": response.status_code,
            "title": soup.title.string if soup.title else None,
            "content": content
        }
        return CallToolResult(content=[TextContent(type="text", text=json.dumps(result, indent=2))])

    try:
        if name == "system_info":
            return await system_info_impl()
        elif name == "list_processes":
            return await list_processes_impl(**arguments)
        elif name == "execute_command":
            return await execute_command_impl(**arguments)
        elif name == "read_file_advanced":
            return await read_file_advanced_impl(**arguments)
        elif name == "write_file_advanced":
            return await write_file_advanced_impl(**arguments)
        elif name == "http_request":
            return await http_request_impl(**arguments)
        elif name == "scrape_webpage":
            return await scrape_webpage_impl(**arguments)
        else:
            return CallToolResult(content=[TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))])
    
    except Exception as e:
        logger.error(f"Error in {name}: {e}")
        return CallToolResult(content=[TextContent(type="text", text=json.dumps({"error": str(e)}))])

async def main():
    """Run the omnipotent MCP server"""
    logger.info("Starting Omnipotent MCP Server (Fixed Version)...")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Platform: {platform.platform()}")
    
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
