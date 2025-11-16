#!/usr/bin/env python3
"""
Omnipotent MCP Server - Maximum Capability MCP Server for Claude Code CLI
Provides comprehensive system control, automation, web, database, AI, and more.
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
from typing import Any, Optional
from datetime import datetime

import httpx
import requests
from bs4 import BeautifulSoup
from mcp.server.fastmcp import FastMCP

# Configure logging to stderr
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("omnipotent")

# ============================================================================
# SYSTEM CONTROL & MONITORING TOOLS
# ============================================================================

@mcp.tool()
def system_info() -> str:
    """Get comprehensive system information including OS, CPU, memory, disk, network."""
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
            "cpu_percent": psutil.cpu_percent(interval=1),
            "per_cpu": psutil.cpu_percent(interval=1, percpu=True)
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
                "fstype": partition.fstype,
                "total": usage.total,
                "used": usage.used,
                "free": usage.free,
                "percent": usage.percent
            })
        except:
            pass

    return json.dumps(info, indent=2)

@mcp.tool()
def list_processes(filter_name: str = "") -> str:
    """List all running processes with optional name filter."""
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
    return json.dumps(processes[:50], indent=2)  # Top 50 processes

@mcp.tool()
def kill_process(pid: int, force: bool = False) -> str:
    """Kill a process by PID. Use force=True for force kill."""
    try:
        proc = psutil.Process(pid)
        name = proc.name()
        if force:
            proc.kill()
            return f"Force killed process {pid} ({name})"
        else:
            proc.terminate()
            return f"Terminated process {pid} ({name})"
    except psutil.NoSuchProcess:
        return f"Process {pid} not found"
    except psutil.AccessDenied:
        return f"Access denied to kill process {pid}"
    except Exception as e:
        return f"Error killing process {pid}: {str(e)}"

@mcp.tool()
def execute_command(command: str, shell: bool = True, timeout: int = 30) -> str:
    """Execute a system command and return output. Be careful with this!"""
    try:
        result = subprocess.run(
            command,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return json.dumps({
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0
        }, indent=2)
    except subprocess.TimeoutExpired:
        return json.dumps({"error": f"Command timed out after {timeout} seconds"})
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def network_connections() -> str:
    """Get all network connections."""
    connections = []
    for conn in psutil.net_connections(kind='inet'):
        connections.append({
            "fd": conn.fd,
            "family": str(conn.family),
            "type": str(conn.type),
            "local_addr": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
            "remote_addr": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else None,
            "status": conn.status,
            "pid": conn.pid
        })
    return json.dumps(connections, indent=2)

# ============================================================================
# FILE & CODE OPERATIONS
# ============================================================================

@mcp.tool()
def read_file_advanced(path: str, encoding: str = "utf-8", max_lines: int = 0) -> str:
    """Read file with advanced options. max_lines=0 means read all."""
    try:
        filepath = Path(path).expanduser().resolve()
        with open(filepath, 'r', encoding=encoding) as f:
            if max_lines > 0:
                lines = [f.readline() for _ in range(max_lines)]
                content = ''.join(lines)
            else:
                content = f.read()

        return json.dumps({
            "path": str(filepath),
            "size": filepath.stat().st_size,
            "content": content,
            "lines": len(content.splitlines())
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def write_file_advanced(path: str, content: str, encoding: str = "utf-8", create_dirs: bool = True) -> str:
    """Write file with advanced options. Can create parent directories."""
    try:
        filepath = Path(path).expanduser().resolve()
        if create_dirs:
            filepath.parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding=encoding) as f:
            f.write(content)

        return json.dumps({
            "path": str(filepath),
            "size": filepath.stat().st_size,
            "success": True
        })
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def search_files(directory: str, pattern: str, recursive: bool = True, max_results: int = 100) -> str:
    """Search for files matching pattern in directory."""
    try:
        dirpath = Path(directory).expanduser().resolve()
        if recursive:
            files = list(dirpath.rglob(pattern))[:max_results]
        else:
            files = list(dirpath.glob(pattern))[:max_results]

        results = [{
            "path": str(f),
            "size": f.stat().st_size if f.is_file() else 0,
            "is_dir": f.is_dir(),
            "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
        } for f in files]

        return json.dumps(results, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def execute_python(code: str, timeout: int = 10) -> str:
    """Execute Python code in a subprocess and return output."""
    try:
        result = subprocess.run(
            [sys.executable, '-c', code],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return json.dumps({
            "returncode": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0
        }, indent=2)
    except subprocess.TimeoutExpired:
        return json.dumps({"error": f"Code execution timed out after {timeout} seconds"})
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# WEB SCRAPING & HTTP TOOLS
# ============================================================================

@mcp.tool()
async def http_request(
    url: str,
    method: str = "GET",
    headers: dict = None,
    body: str = None,
    timeout: int = 30
) -> str:
    """Make HTTP request with full control over method, headers, and body."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method.upper(),
                url=url,
                headers=headers or {},
                content=body,
                timeout=timeout
            )

            return json.dumps({
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text,
                "success": response.status_code < 400
            }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def scrape_webpage(url: str, selector: str = None) -> str:
    """Scrape webpage content. Optionally extract elements matching CSS selector."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        if selector:
            elements = soup.select(selector)
            content = [elem.get_text(strip=True) for elem in elements]
        else:
            content = soup.get_text(strip=True)

        return json.dumps({
            "url": url,
            "status_code": response.status_code,
            "title": soup.title.string if soup.title else None,
            "content": content,
            "links": [a.get('href') for a in soup.find_all('a', href=True)][:50]
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def download_file(url: str, destination: str) -> str:
    """Download file from URL to destination path."""
    try:
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()

        dest_path = Path(destination).expanduser().resolve()
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        with open(dest_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return json.dumps({
            "url": url,
            "destination": str(dest_path),
            "size": dest_path.stat().st_size,
            "success": True
        })
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# ENVIRONMENT & CONFIGURATION
# ============================================================================

@mcp.tool()
def get_env_var(name: str, default: str = None) -> str:
    """Get environment variable value."""
    value = os.environ.get(name, default)
    return json.dumps({"name": name, "value": value})

@mcp.tool()
def set_env_var(name: str, value: str) -> str:
    """Set environment variable for current session."""
    os.environ[name] = value
    return json.dumps({"name": name, "value": value, "success": True})

@mcp.tool()
def list_env_vars(filter_prefix: str = "") -> str:
    """List all environment variables, optionally filtered by prefix."""
    env_vars = {k: v for k, v in os.environ.items() if k.startswith(filter_prefix)}
    return json.dumps(env_vars, indent=2)

# ============================================================================
# TEXT PROCESSING & ANALYSIS
# ============================================================================

@mcp.tool()
def analyze_text(text: str) -> str:
    """Analyze text: word count, line count, character count, etc."""
    lines = text.splitlines()
    words = text.split()

    return json.dumps({
        "characters": len(text),
        "characters_no_spaces": len(text.replace(" ", "")),
        "words": len(words),
        "lines": len(lines),
        "sentences": text.count('.') + text.count('!') + text.count('?'),
        "avg_word_length": sum(len(w) for w in words) / len(words) if words else 0,
        "unique_words": len(set(words))
    }, indent=2)

@mcp.tool()
def regex_search(text: str, pattern: str, flags: int = 0) -> str:
    """Search text using regex pattern. Returns all matches."""
    import re
    try:
        matches = re.findall(pattern, text, flags)
        return json.dumps({
            "pattern": pattern,
            "matches": matches,
            "count": len(matches)
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# GIT OPERATIONS
# ============================================================================

@mcp.tool()
def git_status(repo_path: str = ".") -> str:
    """Get git repository status."""
    try:
        import git
        repo = git.Repo(repo_path)

        return json.dumps({
            "branch": repo.active_branch.name,
            "is_dirty": repo.is_dirty(),
            "untracked_files": repo.untracked_files,
            "modified_files": [item.a_path for item in repo.index.diff(None)],
            "staged_files": [item.a_path for item in repo.index.diff("HEAD")],
            "remote_url": repo.remotes.origin.url if repo.remotes else None
        }, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def git_log(repo_path: str = ".", max_count: int = 10) -> str:
    """Get git commit history."""
    try:
        import git
        repo = git.Repo(repo_path)
        commits = []

        for commit in repo.iter_commits(max_count=max_count):
            commits.append({
                "hash": commit.hexsha[:8],
                "author": str(commit.author),
                "date": commit.committed_datetime.isoformat(),
                "message": commit.message.strip()
            })

        return json.dumps(commits, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

@mcp.tool()
def query_json_file(file_path: str, json_path: str = "") -> str:
    """Query JSON file. Use json_path like 'data.items[0].name' to extract specific values."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)

        if json_path:
            for key in json_path.split('.'):
                if '[' in key:
                    # Handle array access like items[0]
                    name, idx = key.rstrip(']').split('[')
                    data = data[name][int(idx)]
                else:
                    data = data[key]

        return json.dumps(data, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# SCHEDULING & AUTOMATION
# ============================================================================

@mcp.tool()
def cron_schedule_info() -> str:
    """Get information about scheduling a task (returns cron syntax help)."""
    return json.dumps({
        "info": "Use system cron or Windows Task Scheduler for persistent scheduling",
        "cron_format": "minute hour day month weekday command",
        "examples": {
            "every_hour": "0 * * * * /path/to/script",
            "daily_at_midnight": "0 0 * * * /path/to/script",
            "every_monday": "0 0 * * 1 /path/to/script"
        },
        "windows_task_scheduler": "schtasks /create /tn TaskName /tr 'command' /sc schedule",
        "unix_cron": "crontab -e to edit, crontab -l to list"
    }, indent=2)

# ============================================================================
# CLIPBOARD & SCREENSHOTS
# ============================================================================

@mcp.tool()
def get_clipboard() -> str:
    """Get clipboard content (Windows only)."""
    try:
        if platform.system() == "Windows":
            import win32clipboard
            win32clipboard.OpenClipboard()
            try:
                data = win32clipboard.GetClipboardData()
                return json.dumps({"clipboard": data, "success": True})
            finally:
                win32clipboard.CloseClipboard()
        else:
            return json.dumps({"error": "Only supported on Windows"})
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def set_clipboard(text: str) -> str:
    """Set clipboard content (Windows only)."""
    try:
        if platform.system() == "Windows":
            import win32clipboard
            win32clipboard.OpenClipboard()
            try:
                win32clipboard.EmptyClipboard()
                win32clipboard.SetClipboardText(text)
                return json.dumps({"success": True})
            finally:
                win32clipboard.CloseClipboard()
        else:
            return json.dumps({"error": "Only supported on Windows"})
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# COMPRESSION & ARCHIVES
# ============================================================================

@mcp.tool()
def create_zip(source_path: str, zip_path: str) -> str:
    """Create ZIP archive from file or directory."""
    import zipfile
    try:
        source = Path(source_path).expanduser().resolve()
        zip_file = Path(zip_path).expanduser().resolve()

        with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            if source.is_file():
                zf.write(source, source.name)
            else:
                for file in source.rglob('*'):
                    if file.is_file():
                        zf.write(file, file.relative_to(source.parent))

        return json.dumps({
            "source": str(source),
            "archive": str(zip_file),
            "size": zip_file.stat().st_size,
            "success": True
        })
    except Exception as e:
        return json.dumps({"error": str(e)})

@mcp.tool()
def extract_zip(zip_path: str, destination: str) -> str:
    """Extract ZIP archive to destination."""
    import zipfile
    try:
        zip_file = Path(zip_path).expanduser().resolve()
        dest = Path(destination).expanduser().resolve()
        dest.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(zip_file, 'r') as zf:
            zf.extractall(dest)
            file_list = zf.namelist()

        return json.dumps({
            "archive": str(zip_file),
            "destination": str(dest),
            "files_extracted": len(file_list),
            "files": file_list[:20],  # First 20 files
            "success": True
        })
    except Exception as e:
        return json.dumps({"error": str(e)})

# ============================================================================
# MAIN SERVER ENTRY POINT
# ============================================================================

def main():
    """Run the omnipotent MCP server."""
    logger.info("Starting Omnipotent MCP Server...")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Platform: {platform.platform()}")

    # Run the server using stdio transport
    mcp.run(transport='stdio')

if __name__ == "__main__":
    main()
