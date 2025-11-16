# Omnipotent MCP Server - Complete Usage Guide

## 🎯 Quick Start

### 1. Add to Claude Code CLI

Add this to your `~/.claude/settings.json` (or `.claude/settings.json` in your project):

```json
{
  "mcpServers": {
    "omnipotent": {
      "command": "uv",
      "args": [
        "--directory",
        "C:/Users/scarm/omnipotent-mcp",
        "run",
        "server.py"
      ]
    }
  }
}
```

### 2. Restart Claude Code CLI

Completely quit and restart Claude Code CLI to load the new server.

### 3. Verify Connection

In Claude Code CLI, type:
```
What tools do you have available from the omnipotent server?
```

You should see 30+ tools listed!

## 📋 Complete Tool Reference

### System Control & Monitoring

#### system_info()
Get comprehensive system information.

**Example:**
```
"Show me my system information"
"What's my CPU and memory usage?"
```

**Returns:**
- Platform details (OS, version, architecture)
- CPU information (cores, usage)
- Memory usage (total, available, percent)
- Disk partitions and usage

#### list_processes(filter_name: str = "")
List running processes with optional filtering.

**Examples:**
```
"List all running processes"
"Show me all Python processes"
"What Chrome processes are running?"
```

**Parameters:**
- `filter_name`: Optional. Filter by process name (case-insensitive)

**Returns:** Top 50 processes sorted by memory usage

#### kill_process(pid: int, force: bool = False)
Terminate a process by PID.

**Examples:**
```
"Kill process 1234"
"Force kill process 5678"
```

**Parameters:**
- `pid`: Process ID to kill
- `force`: If True, force kill (SIGKILL). Otherwise graceful terminate (SIGTERM)

**Warning:** Requires appropriate permissions. Use with caution!

#### execute_command(command: str, shell: bool = True, timeout: int = 30)
Execute any system command.

**Examples:**
```
"Run the command 'git status'"
"Execute 'dir' to see files"
"Run 'npm install' with a 60 second timeout"
```

**Parameters:**
- `command`: Command to execute
- `shell`: Run in shell (default: True)
- `timeout`: Maximum execution time in seconds

**Returns:** stdout, stderr, return code

**Warning:** Extremely powerful! Can execute ANY command.

#### network_connections()
Get all network connections.

**Examples:**
```
"Show me all network connections"
"What connections are active?"
```

**Returns:** List of all TCP/UDP connections with local/remote addresses

---

### File & Code Operations

#### read_file_advanced(path: str, encoding: str = "utf-8", max_lines: int = 0)
Read file with advanced options.

**Examples:**
```
"Read the file config.json"
"Show me the first 10 lines of README.md"
"Read data.txt with latin-1 encoding"
```

**Parameters:**
- `path`: File path (supports ~ expansion)
- `encoding`: Character encoding (default: utf-8)
- `max_lines`: Max lines to read (0 = all)

#### write_file_advanced(path: str, content: str, encoding: str = "utf-8", create_dirs: bool = True)
Write file with directory auto-creation.

**Examples:**
```
"Write 'Hello World' to test.txt"
"Create a file at ~/projects/new/data.json with this content: {...}"
```

**Parameters:**
- `path`: Destination file path
- `content`: Content to write
- `encoding`: Character encoding
- `create_dirs`: Auto-create parent directories

#### search_files(directory: str, pattern: str, recursive: bool = True, max_results: int = 100)
Search for files matching a pattern.

**Examples:**
```
"Find all .py files in my Documents"
"Search for *.json in the current directory (non-recursive)"
"Find all README.md files anywhere in my home folder"
```

**Parameters:**
- `directory`: Starting directory
- `pattern`: Glob pattern (e.g., "*.py", "**/*.txt")
- `recursive`: Search subdirectories
- `max_results`: Maximum results to return

#### execute_python(code: str, timeout: int = 10)
Execute Python code in isolation.

**Examples:**
```
"Run this Python code: print(2 + 2)"
"Execute: import sys; print(sys.version)"
```

**Parameters:**
- `code`: Python code to execute
- `timeout`: Max execution time in seconds

**Warning:** Runs in subprocess but still powerful!

---

### Web Scraping & HTTP

#### http_request(url: str, method: str = "GET", headers: dict = None, body: str = None, timeout: int = 30)
Make HTTP requests with full control.

**Examples:**
```
"GET https://api.github.com/users/anthropics"
"POST to https://api.example.com/data with this JSON body: {...}"
```

**Parameters:**
- `url`: Target URL
- `method`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `headers`: Optional request headers
- `body`: Optional request body
- `timeout`: Request timeout in seconds

#### scrape_webpage(url: str, selector: str = None)
Scrape webpage content with CSS selectors.

**Examples:**
```
"Scrape https://news.ycombinator.com"
"Get all headlines from https://news.ycombinator.com using selector '.titleline > a'"
```

**Parameters:**
- `url`: Webpage URL
- `selector`: Optional CSS selector for specific elements

**Returns:** Text content, links, title

#### download_file(url: str, destination: str)
Download files from URLs.

**Examples:**
```
"Download https://example.com/file.zip to ~/Downloads/file.zip"
```

**Parameters:**
- `url`: File URL
- `destination`: Local save path

---

### Environment Management

#### get_env_var(name: str, default: str = None)
Get environment variable.

**Examples:**
```
"What is the PATH environment variable?"
"Get the value of ANTHROPIC_API_KEY"
```

#### set_env_var(name: str, value: str)
Set environment variable for current session.

**Examples:**
```
"Set MY_VAR to 'hello'"
```

**Note:** Only affects current MCP server session!

#### list_env_vars(filter_prefix: str = "")
List environment variables.

**Examples:**
```
"List all environment variables"
"Show all env vars starting with PYTHON"
```

---

### Text Processing & Analysis

#### analyze_text(text: str)
Comprehensive text analysis.

**Examples:**
```
"Analyze this text: [paste long text]"
```

**Returns:**
- Character count (with/without spaces)
- Word count
- Line count
- Sentence count
- Average word length
- Unique word count

#### regex_search(text: str, pattern: str, flags: int = 0)
Search text using regex.

**Examples:**
```
"Find all email addresses in this text: ..."
"Search for phone numbers matching pattern \d{3}-\d{3}-\d{4}"
```

---

### Git Operations

#### git_status(repo_path: str = ".")
Get git repository status.

**Examples:**
```
"What's the git status of the current directory?"
"Show git status for ~/projects/myapp"
```

**Returns:**
- Current branch
- Dirty status
- Untracked files
- Modified files
- Staged files
- Remote URL

#### git_log(repo_path: str = ".", max_count: int = 10)
View commit history.

**Examples:**
```
"Show me the last 5 commits"
"Get git log for ~/projects/myapp with 20 commits"
```

---

### Database & JSON

#### query_json_file(file_path: str, json_path: str = "")
Query JSON files with path-based extraction.

**Examples:**
```
"Read data.json"
"Get the 'users' field from data.json"
"Extract data.users[0].name from data.json"
```

**Path syntax:**
- `"users"` - Get users field
- `"users[0]"` - Get first user
- `"users[0].name"` - Get name of first user

---

### Automation

#### cron_schedule_info()
Get scheduling information and syntax.

**Examples:**
```
"How do I schedule a task?"
"Show me cron syntax"
```

**Returns:** Cron syntax, examples, platform-specific info

---

### Clipboard (Windows Only)

#### get_clipboard()
Get clipboard content.

**Examples:**
```
"What's in my clipboard?"
```

#### set_clipboard(text: str)
Set clipboard content.

**Examples:**
```
"Copy 'Hello World' to clipboard"
```

---

### Compression & Archives

#### create_zip(source_path: str, zip_path: str)
Create ZIP archives.

**Examples:**
```
"Zip the folder ~/projects/myapp to myapp.zip"
"Create archive.zip from file.txt"
```

#### extract_zip(zip_path: str, destination: str)
Extract ZIP archives.

**Examples:**
```
"Extract archive.zip to ~/extracted"
```

---

## 🎨 Advanced Usage Patterns

### Multi-Step Workflows

Claude can chain tools together intelligently:

**Example 1: Web scraping to file**
```
"Scrape headlines from https://news.ycombinator.com and save them to headlines.txt"
```

Claude will:
1. Use `scrape_webpage()` to get content
2. Use `write_file_advanced()` to save results

**Example 2: Process monitoring and control**
```
"Find all Chrome processes using more than 500MB RAM and kill them"
```

Claude will:
1. Use `list_processes(filter_name="chrome")`
2. Analyze memory usage
3. Use `kill_process()` for processes over 500MB

**Example 3: Git workflow**
```
"Show me git status, then create a summary of the last 10 commits"
```

Claude will:
1. Use `git_status()`
2. Use `git_log(max_count=10)`
3. Summarize the information

### Complex Queries

**System health check:**
```
"Give me a complete system health report including CPU, memory, disk, and top processes"
```

**Project analysis:**
```
"Find all Python files in ~/projects, analyze their total line count, and search for TODO comments"
```

**Data pipeline:**
```
"Download https://api.example.com/data.json, extract the 'items' field, and save to processed.json"
```

---

## ⚠️ Safety & Permissions

### Dangerous Operations

These tools require extra care:

1. **execute_command** - Can run ANY system command
2. **execute_python** - Can execute arbitrary Python code
3. **kill_process** - Can terminate any process
4. **write_file_advanced** - Can overwrite files
5. **set_env_var** - Can modify environment

### Permission Model

Claude Code CLI will ask for your approval before executing potentially dangerous operations. Always review:

- File paths before writing
- Commands before executing
- PIDs before killing processes
- URLs before downloading

### Best Practices

1. **Review commands**: Always check what Claude plans to do
2. **Use specific paths**: Avoid wildcards in dangerous operations
3. **Test first**: Try safe operations before risky ones
4. **Backup data**: Before bulk file operations
5. **Monitor logs**: Check `~/.claude/logs/mcp*.log` for issues

---

## 🐛 Troubleshooting

### Server not connecting

**Check server status:**
```bash
cd C:/Users/scarm/omnipotent-mcp
uv run server.py
```

Should see:
```
Starting Omnipotent MCP Server...
Python version: 3.12.x
Platform: Windows-...
```

**Check configuration:**
Ensure absolute path in config:
```json
"command": "uv",
"args": ["--directory", "C:/Users/scarm/omnipotent-mcp", "run", "server.py"]
```

### Tools not appearing

1. **Restart Claude completely** - Quit (not just close window)
2. **Check logs**: `~/.claude/logs/mcp*.log`
3. **Verify Python**: `python --version` (needs 3.10+)

### Permission errors

Some operations need elevation:
- **Windows**: Run as Administrator
- **Unix**: Use sudo or adjust permissions

### Import errors

If you get import errors:
```bash
cd omnipotent-mcp
uv add "mcp[cli]" httpx requests beautifulsoup4 psutil gitpython
```

---

## 📊 Tool Categories Summary

| Category | Tool Count | Power Level |
|----------|------------|-------------|
| System Control | 5 | ⚡⚡⚡⚡⚡ |
| File Operations | 4 | ⚡⚡⚡⚡ |
| Web & HTTP | 3 | ⚡⚡⚡⚡ |
| Environment | 3 | ⚡⚡⚡ |
| Text Processing | 2 | ⚡⚡⚡ |
| Git | 2 | ⚡⚡⚡ |
| Database | 1 | ⚡⚡⚡ |
| Automation | 1 | ⚡⚡ |
| Clipboard | 2 | ⚡⚡ |
| Compression | 2 | ⚡⚡ |

**Total: 25+ tools** across 10 categories!

---

## 🚀 Next Steps

1. **Try basic operations**: Start with `system_info()` or `list_processes()`
2. **Explore file operations**: Search, read, write files
3. **Test web capabilities**: Scrape a webpage, make HTTP requests
4. **Automate workflows**: Chain multiple tools together
5. **Build custom tools**: Modify `server.py` to add your own tools!

---

## 💡 Pro Tips

1. **Use natural language**: Claude understands what you want
   - Good: "Show me Python processes"
   - Also good: "What Python stuff is running?"

2. **Be specific with paths**: Use absolute paths when possible
   - Good: "C:/Users/scarm/Documents/file.txt"
   - Works: "~/Documents/file.txt"

3. **Chain operations**: Let Claude plan multi-step workflows
   - "Download this, extract that, analyze the other thing"

4. **Ask for summaries**: Claude can interpret tool output
   - "Give me a summary of system health"
   - Claude uses multiple tools and synthesizes results

5. **Error recovery**: If something fails, Claude can try alternative approaches

---

## 🎓 Learning Examples

### Beginner

```
"What's my computer's operating system?"
# Uses: system_info()

"List all files in my Documents folder"
# Uses: search_files(directory="~/Documents", pattern="*", recursive=False)
```

### Intermediate

```
"Find all TODO comments in Python files in my projects folder"
# Uses: search_files() + regex_search()

"Download the latest Claude Code release notes"
# Uses: http_request() or scrape_webpage()
```

### Advanced

```
"Create a backup of all my .env files, zip them with today's date"
# Uses: search_files() + create_zip() + write_file_advanced()

"Monitor system resources and kill any process using over 2GB RAM"
# Uses: system_info() + list_processes() + kill_process()
```

---

Enjoy your omnipotent Claude Code CLI! 🎉
