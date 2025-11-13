# Omnipotent MCP Server

The most comprehensive and powerful Model Context Protocol (MCP) server for Claude Code CLI.

## 🚀 Features

### System Control & Monitoring
- **system_info**: Get comprehensive system information (OS, CPU, memory, disk, network)
- **list_processes**: List all running processes with filtering
- **kill_process**: Terminate processes by PID (with force option)
- **execute_command**: Execute any system command with timeout control
- **network_connections**: View all network connections

### File & Code Operations
- **read_file_advanced**: Read files with encoding and line limit options
- **write_file_advanced**: Write files with auto-directory creation
- **search_files**: Search for files using glob patterns (recursive or not)
- **execute_python**: Execute Python code in isolated subprocess

### Web Scraping & HTTP
- **http_request**: Full HTTP client (GET, POST, PUT, DELETE, etc.)
- **scrape_webpage**: Extract webpage content with CSS selectors
- **download_file**: Download files from URLs

### Environment Management
- **get_env_var**: Get environment variable values
- **set_env_var**: Set environment variables
- **list_env_vars**: List all environment variables with filtering

### Text Processing
- **analyze_text**: Comprehensive text analysis (word count, etc.)
- **regex_search**: Search text using regex patterns

### Git Operations
- **git_status**: Get repository status
- **git_log**: View commit history

### Database & JSON
- **query_json_file**: Query JSON files with path-based extraction

### Automation
- **cron_schedule_info**: Get scheduling information and syntax

### Clipboard (Windows)
- **get_clipboard**: Get clipboard content
- **set_clipboard**: Set clipboard content

### Compression
- **create_zip**: Create ZIP archives from files/directories
- **extract_zip**: Extract ZIP archives

## 📦 Installation

```bash
cd omnipotent-mcp
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv add "mcp[cli]" httpx requests beautifulsoup4 psutil gitpython
```

## 🔧 Configuration

Add to your Claude Code CLI configuration (`~/.claude/settings.json` or Claude Desktop config):

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

## 🧪 Testing

Test the server using MCP Inspector:

```bash
npx @modelcontextprotocol/inspector uv --directory C:/Users/scarm/omnipotent-mcp run server.py
```

## 📚 Tool Examples

### System Information
```python
# Claude can now ask:
"What's my system information?"
# Uses: system_info()
```

### Process Management
```python
# Claude can now:
"List all Python processes"
# Uses: list_processes(filter_name="python")

"Kill process 1234"
# Uses: kill_process(pid=1234)
```

### File Operations
```python
# Claude can:
"Search for all .py files in my Documents"
# Uses: search_files(directory="~/Documents", pattern="*.py")

"Read the first 10 lines of config.json"
# Uses: read_file_advanced(path="config.json", max_lines=10)
```

### Web Scraping
```python
# Claude can:
"Scrape the headlines from https://news.ycombinator.com"
# Uses: scrape_webpage(url="...", selector=".titleline > a")

"Download https://example.com/file.zip to ~/Downloads"
# Uses: download_file(url="...", destination="~/Downloads/file.zip")
```

### Code Execution
```python
# Claude can:
"Run this Python code: print('Hello from MCP!')"
# Uses: execute_python(code="print('Hello from MCP!')")

"Execute 'git status' in the current directory"
# Uses: execute_command(command="git status")
```

### Git Operations
```python
# Claude can:
"Show me the git status of the current repo"
# Uses: git_status(repo_path=".")

"Show me the last 5 commits"
# Uses: git_log(repo_path=".", max_count=5)
```

### Text Analysis
```python
# Claude can:
"Analyze this text: [long text]"
# Uses: analyze_text(text="...")

"Find all email addresses in this text"
# Uses: regex_search(text="...", pattern=r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
```

### Compression
```python
# Claude can:
"Create a ZIP archive of my project folder"
# Uses: create_zip(source_path="./project", zip_path="project.zip")

"Extract archive.zip to ~/extracted"
# Uses: extract_zip(zip_path="archive.zip", destination="~/extracted")
```

## ⚠️ Security Considerations

This server has powerful capabilities. Please ensure:

1. **Never expose this server to the internet** - STDIO transport only
2. **Review all commands** - Claude will ask for approval for dangerous operations
3. **Use with trusted data** - Be careful with file paths and commands
4. **Monitor usage** - Check logs for unexpected behavior
5. **Restrict access** - Only use with trusted Claude Code CLI instances

## 🔐 Permissions

Claude Code CLI will request permission for:
- File system operations
- Process management
- Network requests
- Code execution
- Environment variable access

## 🐛 Troubleshooting

### Server won't start
```bash
# Check Python version (requires 3.10+)
python --version

# Reinstall dependencies
cd omnipotent-mcp
uv add "mcp[cli]" httpx requests beautifulsoup4 psutil gitpython
```

### Tools not appearing
1. Restart Claude Code CLI completely
2. Check the server configuration path is absolute
3. View logs at `~/.claude/logs/mcp*.log`

### Permission errors
Some tools require elevated privileges:
- Process killing: May need admin/sudo
- System commands: May need appropriate permissions
- Clipboard: Windows only

## 📊 Server Capabilities

- **Total Tools**: 30+
- **Categories**: System, Files, Web, Git, Database, Automation
- **Transport**: STDIO (secure, local only)
- **Language**: Python 3.10+
- **Dependencies**: Minimal, all open source

## 🚀 Advanced Usage

### Chaining Operations

Claude can chain multiple tools together:

```
"Download https://example.com/data.json, query it for the 'items' field,
and save the results to results.txt"

# Uses:
# 1. download_file(url, "data.json")
# 2. query_json_file("data.json", "items")
# 3. write_file_advanced("results.txt", content)
```

### Automation Workflows

```
"Every file in ~/Documents/reports, zip them, and give me the archive size"

# Uses:
# 1. search_files("~/Documents/reports", "*")
# 2. create_zip(source_path, "reports.zip")
# 3. (returns size automatically)
```

## 📝 License

MIT License - Use freely, modify as needed

## 🤝 Contributing

This is a comprehensive starting point. You can add:
- Database connectors (PostgreSQL, MySQL, MongoDB, Redis)
- AI/ML integrations (OpenAI, Anthropic APIs)
- Cloud service integrations (AWS, Azure, GCP)
- More automation tools
- Custom tools for your workflow

## 🎯 What Makes This Omnipotent?

1. **System Control**: Full process and system management
2. **File Operations**: Advanced file I/O and searching
3. **Web Capabilities**: HTTP client, web scraping, downloads
4. **Code Execution**: Run Python code and system commands
5. **Git Integration**: Version control operations
6. **Text Processing**: Regex, analysis, transformations
7. **Automation**: Scheduling info and helpers
8. **Data Processing**: JSON querying, compression
9. **Environment Control**: Full env var management
10. **Network Monitoring**: Connection tracking

This server gives Claude Code CLI the ability to do **anything** you can do from a command line, with the intelligence to know when and how to use each tool.

## 🌟 Pro Tips

1. **Combine with Claude's thinking**: Ask Claude to plan complex multi-step operations
2. **Use filters**: Most list operations support filtering to reduce noise
3. **Check permissions**: Some operations require admin/sudo
4. **Monitor resources**: Use system_info to track resource usage
5. **Automate workflows**: Chain operations for complex tasks

Enjoy your omnipotent Claude Code CLI! 🎉
