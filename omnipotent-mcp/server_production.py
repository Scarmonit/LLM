#!/usr/bin/env python3
"""
Omnipotent MCP Server v3.0 - PRODUCTION READY
Maximum capability MCP server with enterprise features:
- Security validation and sanitization
- File size limits and resource protection
- Path traversal prevention
- Command execution whitelist/blacklist
- Comprehensive error handling
- Production logging
- Health monitoring
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
import hashlib
import re
from pathlib import Path
from typing import Any, Optional, Dict, List, Set
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict
import time

import httpx
from bs4 import BeautifulSoup
from mcp.server.fastmcp import FastMCP

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
MAX_RESPONSE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_SCRAPE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_PROCESS_LIST = 200

# Dangerous command patterns to block
BLOCKED_COMMANDS = [
    r'rm\s+-rf\s+/',
    r'del\s+/[SF]',
    r'format\s+[A-Z]:',
    r'mkfs\.',
    r'dd\s+if=',
    r'>\s*/dev/sd',
    r'shutdown',
    r'reboot',
    r'init\s+[06]',
    r'systemctl\s+(halt|poweroff|reboot)',
]

# Dangerous paths to protect
PROTECTED_PATHS = [
    '/etc/shadow',
    '/etc/passwd',
    '/boot',
    '/sys',
    '/proc',
    'C:\\Windows\\System32',
    'C:\\Windows\\SysWOW64',
]

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(funcName)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.FileHandler('/tmp/omnipotent-mcp.log') if os.name != 'nt' else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# SECURITY VALIDATORS
# ============================================================================

class SecurityValidator:
    """Security validation for all operations"""
    
    @staticmethod
    def validate_path(path: str) -> tuple[bool, str]:
        """Validate file path for security"""
        try:
            resolved = Path(path).expanduser().resolve()
            path_str = str(resolved)
            
            # Check protected paths
            for protected in PROTECTED_PATHS:
                if path_str.startswith(protected):
                    return False, f"Access denied: Protected path {protected}"
            
            # Check for path traversal
            if '..' in path or path.startswith('/proc') or path.startswith('/sys'):
                return False, "Access denied: Path traversal detected"
            
            return True, path_str
        except Exception as e:
            return False, f"Invalid path: {str(e)}"
    
    @staticmethod
    def validate_command(command: str) -> tuple[bool, str]:
        """Validate command for dangerous patterns"""
        for pattern in BLOCKED_COMMANDS:
            if re.search(pattern, command, re.IGNORECASE):
                return False, f"Blocked: Dangerous command pattern detected"
        
        return True, "OK"
    
    @staticmethod
    def validate_file_size(size: int) -> tuple[bool, str]:
        """Validate file size limits"""
        if size > MAX_FILE_SIZE:
            return False, f"File too large: {size} bytes (max {MAX_FILE_SIZE})"
        return True, "OK"
    
    @staticmethod
    def sanitize_output(output: str, max_size: int = MAX_RESPONSE_SIZE) -> str:
        """Sanitize and truncate output"""
        if len(output) > max_size:
            return output[:max_size] + f"\n\n... (truncated {len(output) - max_size} bytes)"
        return output

validator = SecurityValidator()

# ============================================================================
# PERFORMANCE LAYER (From Optimized Version)
# ============================================================================

CACHE_TTL_SECONDS = 60
HTTP_POOL_SIZE = 20
MAX_RETRIES = 3
RATE_LIMIT_CALLS = 100
RATE_LIMIT_PERIOD = 60

class CacheManager:
    """In-memory cache with TTL"""
    def __init__(self):
        self.cache: Dict[str, tuple[Any, datetime]] = {}
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str, ttl_seconds: int = CACHE_TTL_SECONDS) -> Optional[Any]:
        if key in self.cache:
            value, timestamp = self.cache[key]
            if datetime.now() - timestamp < timedelta(seconds=ttl_seconds):
                self.hits += 1
                return value
            else:
                del self.cache[key]
        self.misses += 1
        return None
    
    def set(self, key: str, value: Any):
        self.cache[key] = (value, datetime.now())
    
    def clear(self):
        self.cache.clear()
    
    def stats(self) -> Dict[str, int]:
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "size": len(self.cache)
        }

cache = CacheManager()

class HTTPClientPool:
    """Reusable HTTP client pool"""
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.request_count = 0
        self.error_count = 0
    
    async def get_client(self) -> httpx.AsyncClient:
        if self.client is None:
            limits = httpx.Limits(max_keepalive_connections=HTTP_POOL_SIZE, max_connections=HTTP_POOL_SIZE * 2)
            self.client = httpx.AsyncClient(
                limits=limits,
                timeout=30.0,
                follow_redirects=True,
                max_redirects=5
            )
        return self.client
    
    async def close(self):
        if self.client:
            await self.client.aclose()
            self.client = None
    
    def stats(self) -> Dict[str, int]:
        success_rate = ((self.request_count - self.error_count) / self.request_count * 100) if self.request_count > 0 else 100
        return {
            "total_requests": self.request_count,
            "errors": self.error_count,
            "success_rate": round(success_rate, 2)
        }

http_pool = HTTPClientPool()

class MetricsCollector:
    """Performance metrics"""
    def __init__(self):
        self.tool_calls = defaultdict(int)
        self.tool_errors = defaultdict(int)
        self.tool_latencies = defaultdict(list)
        self.security_blocks = defaultdict(int)
    
    def record_call(self, tool_name: str, latency: float, error: bool = False):
        self.tool_calls[tool_name] += 1
        self.tool_latencies[tool_name].append(latency)
        if error:
            self.tool_errors[tool_name] += 1
    
    def record_security_block(self, reason: str):
        self.security_blocks[reason] += 1
    
    def get_stats(self) -> Dict:
        stats = {}
        for tool in self.tool_calls:
            latencies = self.tool_latencies[tool]
            avg_latency = sum(latencies) / len(latencies) if latencies else 0
            stats[tool] = {
                "calls": self.tool_calls[tool],
                "errors": self.tool_errors[tool],
                "avg_latency_ms": round(avg_latency * 1000, 2),
                "success_rate": round((self.tool_calls[tool] - self.tool_errors[tool]) / self.tool_calls[tool] * 100, 2) if self.tool_calls[tool] > 0 else 100
            }
        return {
            "tools": stats,
            "security_blocks": dict(self.security_blocks),
            "total_blocks": sum(self.security_blocks.values())
        }

metrics = MetricsCollector()

# ============================================================================
# DECORATORS
# ============================================================================

def with_metrics(func):
    """Track metrics"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        error = False
        try:
            result = await func(*args, **kwargs)
            return result
        except Exception as e:
            error = True
            logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
            raise
        finally:
            latency = time.time() - start
            metrics.record_call(func.__name__, latency, error)
    return wrapper

def with_cache(ttl: int = CACHE_TTL_SECONDS):
    """Cache results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{json.dumps(args)}:{json.dumps(kwargs)}"
            cached = cache.get(cache_key, ttl)
            if cached is not None:
                return cached
            result = await func(*args, **kwargs)
            cache.set(cache_key, result)
            return result
        return wrapper
    return decorator

# ============================================================================
# INITIALIZE MCP SERVER
# ============================================================================

mcp = FastMCP("omnipotent-production")

# ============================================================================
# SYSTEM MONITORING TOOLS (SECURE & OPTIMIZED)
# ============================================================================

@mcp.tool()
@with_metrics
@with_cache(ttl=30)
async def system_info() -> str:
    """Get system information (cached 30s)"""
    info = {
        "platform": {
            "system": platform.system(),
            "release": platform.release(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "hostname": socket.gethostname()
        },
        "cpu": {
            "physical_cores": psutil.cpu_count(logical=False),
            "logical_cores": psutil.cpu_count(logical=True),
            "cpu_percent": psutil.cpu_percent(interval=0),
            "per_cpu": psutil.cpu_percent(interval=0, percpu=True)
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

    return json.dumps(info, indent=2)

@mcp.tool()
@with_metrics
@with_cache(ttl=5)
async def list_processes(filter_name: str = "") -> str:
    """List processes (cached 5s, limited to 200)"""
    processes = []
    count = 0
    for proc in psutil.process_iter(['pid', 'name', 'username', 'memory_percent', 'cpu_percent', 'status']):
        if count >= MAX_PROCESS_LIST:
            break
        try:
            pinfo = proc.info
            if filter_name.lower() in pinfo['name'].lower() or not filter_name:
                processes.append({
                    "pid": pinfo['pid'],
                    "name": pinfo['name'],
                    "username": pinfo['username'],
                    "memory_percent": round(pinfo['memory_percent'] or 0, 2),
                    "cpu_percent": round(pinfo['cpu_percent'] or 0, 2),
                    "status": pinfo['status']
                })
                count += 1
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    processes.sort(key=lambda x: x['memory_percent'], reverse=True)
    return json.dumps({
        "processes": processes,
        "count": len(processes),
        "limited": count >= MAX_PROCESS_LIST
    }, indent=2)

@mcp.tool()
@with_metrics
async def kill_process(pid: int, force: bool = False) -> str:
    """Kill process (secure)"""
    try:
        proc = psutil.Process(pid)
        name = proc.name()
        
        # Block killing critical system processes
        if name.lower() in ['init', 'systemd', 'csrss.exe', 'wininit.exe', 'services.exe']:
            metrics.record_security_block("critical_process_kill")
            return json.dumps({"success": False, "error": "Cannot kill critical system process"})
        
        if force:
            proc.kill()
        else:
            proc.terminate()
        
        await asyncio.sleep(0.5)
        return json.dumps({
            "success": True,
            "pid": pid,
            "name": name,
            "method": "force" if force else "terminate"
        })
    except psutil.NoSuchProcess:
        return json.dumps({"success": True, "message": f"Process {pid} not found"})
    except psutil.AccessDenied:
        return json.dumps({"success": False, "error": f"Access denied"})
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool()
@with_metrics
async def execute_command(command: str, shell: bool = True, timeout: int = 30) -> str:
    """Execute command with security validation"""
    # Validate command
    valid, msg = validator.validate_command(command)
    if not valid:
        metrics.record_security_block("dangerous_command")
        logger.warning(f"Blocked command: {command}")
        return json.dumps({"success": False, "error": msg, "blocked": True})
    
    try:
        proc = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        
        stdout_str = validator.sanitize_output(stdout.decode('utf-8', errors='replace'))
        stderr_str = validator.sanitize_output(stderr.decode('utf-8', errors='replace'))
        
        return json.dumps({
            "returncode": proc.returncode,
            "stdout": stdout_str,
            "stderr": stderr_str,
            "success": proc.returncode == 0
        }, indent=2)
    except asyncio.TimeoutError:
        return json.dumps({"error": f"Command timed out", "success": False})
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})

# ============================================================================
# SECURE FILE OPERATIONS
# ============================================================================

@mcp.tool()
@with_metrics
async def read_file_secure(path: str, encoding: str = "utf-8", max_lines: int = 0) -> str:
    """Secure file read with validation"""
    # Validate path
    valid, resolved_path = validator.validate_path(path)
    if not valid:
        metrics.record_security_block("invalid_path")
        return json.dumps({"success": False, "error": resolved_path})
    
    try:
        filepath = Path(resolved_path)
        
        # Check file size
        if filepath.exists():
            size = filepath.stat().st_size
            valid, msg = validator.validate_file_size(size)
            if not valid:
                metrics.record_security_block("file_too_large")
                return json.dumps({"success": False, "error": msg})
        
        loop = asyncio.get_event_loop()
        content = await loop.run_in_executor(None, lambda: filepath.read_text(encoding=encoding))
        
        if max_lines > 0:
            lines = content.splitlines()[:max_lines]
            content = '\n'.join(lines)
        
        content = validator.sanitize_output(content)

        return json.dumps({
            "path": str(filepath),
            "size": filepath.stat().st_size,
            "content": content,
            "lines": len(content.splitlines()),
            "success": True
        }, indent=2)
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool()
@with_metrics
async def write_file_secure(path: str, content: str, encoding: str = "utf-8") -> str:
    """Secure file write with validation"""
    # Validate path
    valid, resolved_path = validator.validate_path(path)
    if not valid:
        metrics.record_security_block("invalid_path")
        return json.dumps({"success": False, "error": resolved_path})
    
    # Validate content size
    valid, msg = validator.validate_file_size(len(content.encode(encoding)))
    if not valid:
        metrics.record_security_block("content_too_large")
        return json.dumps({"success": False, "error": msg})
    
    try:
        filepath = Path(resolved_path)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: filepath.write_text(content, encoding=encoding))

        return json.dumps({
            "path": str(filepath),
            "size": filepath.stat().st_size,
            "success": True
        })
    except Exception as e:
        return json.dumps({"success": False, "error": str(e)})

@mcp.tool()
@with_metrics
async def batch_read_files(paths: List[str], encoding: str = "utf-8") -> str:
    """Batch read with validation"""
    async def read_one(path: str):
        valid, resolved = validator.validate_path(path)
        if not valid:
            return {"path": path, "error": resolved, "success": False}
        
        try:
            filepath = Path(resolved)
            if filepath.stat().st_size > MAX_FILE_SIZE:
                return {"path": path, "error": "File too large", "success": False}
            
            loop = asyncio.get_event_loop()
            content = await loop.run_in_executor(None, lambda: filepath.read_text(encoding=encoding))
            content = validator.sanitize_output(content)
            
            return {
                "path": str(filepath),
                "content": content,
                "size": filepath.stat().st_size,
                "success": True
            }
        except Exception as e:
            return {"path": path, "error": str(e), "success": False}
    
    results = await asyncio.gather(*[read_one(p) for p in paths[:20]])  # Limit to 20 files
    successful = sum(1 for r in results if r.get("success"))
    
    return json.dumps({
        "results": results,
        "total": len(results),
        "successful": successful
    }, indent=2)

# ============================================================================
# SECURE HTTP OPERATIONS
# ============================================================================

@mcp.tool()
@with_metrics
async def http_request_secure(
    url: str,
    method: str = "GET",
    headers: dict = None,
    body: str = None,
    timeout: int = 30
) -> str:
    """Secure HTTP request with size limits"""
    try:
        client = await http_pool.get_client()
        http_pool.request_count += 1
        
        response = await client.request(
            method=method.upper(),
            url=url,
            headers=headers or {},
            content=body,
            timeout=timeout
        )
        
        content = response.text
        if len(content) > MAX_RESPONSE_SIZE:
            content = validator.sanitize_output(content)

        return json.dumps({
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "content": content,
            "success": response.status_code < 400,
            "truncated": len(response.text) > MAX_RESPONSE_SIZE
        }, indent=2)
    except Exception as e:
        http_pool.error_count += 1
        return json.dumps({"error": str(e), "success": False})

@mcp.tool()
@with_metrics
async def scrape_webpage_secure(url: str, selector: str = None) -> str:
    """Secure web scraping with size limits"""
    try:
        client = await http_pool.get_client()
        response = await client.get(url, timeout=30)
        response.raise_for_status()
        
        # Limit response size
        if len(response.content) > MAX_SCRAPE_SIZE:
            return json.dumps({
                "error": f"Page too large ({len(response.content)} bytes)",
                "success": False
            })

        soup = BeautifulSoup(response.text, 'html.parser')

        if selector:
            elements = soup.select(selector)[:100]  # Limit results
            content = [elem.get_text(strip=True)[:1000] for elem in elements]
        else:
            content = soup.get_text(strip=True)[:MAX_SCRAPE_SIZE]

        return json.dumps({
            "url": url,
            "status_code": response.status_code,
            "title": soup.title.string if soup.title else None,
            "content": content,
            "links": [a.get('href') for a in soup.find_all('a', href=True)][:50],
            "success": True
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "success": False})

# ============================================================================
# HEALTH & MONITORING
# ============================================================================

@mcp.tool()
async def health_check() -> str:
    """Health check endpoint"""
    return json.dumps({
        "status": "healthy",
        "version": "3.0",
        "timestamp": datetime.now().isoformat(),
        "cache_stats": cache.stats(),
        "http_stats": http_pool.stats(),
        "metrics": metrics.get_stats()
    }, indent=2)

@mcp.tool()
async def get_metrics() -> str:
    """Get detailed metrics"""
    return json.dumps(metrics.get_stats(), indent=2)

@mcp.tool()
async def clear_cache() -> str:
    """Clear cache"""
    cache.clear()
    return json.dumps({"success": True, "message": "Cache cleared"})

# ============================================================================
# UTILITIES (Preserved from original)
# ============================================================================

@mcp.tool()
@with_metrics
async def get_env_var(name: str, default: str = None) -> str:
    """Get environment variable"""
    value = os.environ.get(name, default)
    return json.dumps({"name": name, "value": value})

@mcp.tool()
@with_metrics
async def analyze_text(text: str) -> str:
    """Analyze text"""
    text = validator.sanitize_output(text, MAX_RESPONSE_SIZE)
    lines = text.splitlines()
    words = text.split()
    
    return json.dumps({
        "characters": len(text),
        "words": len(words),
        "lines": len(lines),
        "unique_words": len(set(words))
    }, indent=2)

# ============================================================================
# MAIN
# ============================================================================

async def cleanup():
    """Cleanup on shutdown"""
    await http_pool.close()
    logger.info("Shutdown complete")

def main():
    """Run production server"""
    logger.info("=" * 70)
    logger.info("Omnipotent MCP Server v3.0 - PRODUCTION")
    logger.info("=" * 70)
    logger.info(f"Python: {sys.version}")
    logger.info(f"Platform: {platform.platform()}")
    logger.info(f"Security: Enabled")
    logger.info(f"Max File Size: {MAX_FILE_SIZE / 1024 / 1024}MB")
    logger.info(f"Max Response Size: {MAX_RESPONSE_SIZE / 1024 / 1024}MB")
    logger.info("=" * 70)

    try:
        mcp.run(transport='stdio')
    finally:
        asyncio.run(cleanup())

if __name__ == "__main__":
    main()
