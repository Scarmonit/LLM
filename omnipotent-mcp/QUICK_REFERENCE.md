# Omnipotent MCP - Quick Reference Card

## 🚀 Setup (One-Time)

```json
// Add to .claude/settings.json
{
  "mcpServers": {
    "omnipotent": {
      "command": "uv",
      "args": ["--directory", "C:/Users/scarm/omnipotent-mcp", "run", "server.py"]
    }
  }
}
```

Restart Claude Code CLI → Done!

## 📋 Quick Commands

### System
```
"Show system info"              → system_info()
"List all processes"            → list_processes()
"List Python processes"         → list_processes(filter_name="python")
"Kill process 1234"             → kill_process(pid=1234)
"Run git status"                → execute_command(command="git status")
"Show network connections"      → network_connections()
```

### Files
```
"Read config.json"              → read_file_advanced(path="config.json")
"Write 'test' to file.txt"      → write_file_advanced(path="file.txt", content="test")
"Find all .py files"            → search_files(directory=".", pattern="*.py")
"Run: print(2+2)"               → execute_python(code="print(2+2)")
```

### Web
```
"GET https://api.github.com"    → http_request(url="...")
"Scrape https://news.ycombinator.com" → scrape_webpage(url="...")
"Download file.zip from URL"    → download_file(url="...", destination="...")
```

### Environment
```
"What is PATH?"                 → get_env_var(name="PATH")
"Set MY_VAR to hello"           → set_env_var(name="MY_VAR", value="hello")
"List all env vars"             → list_env_vars()
```

### Text
```
"Analyze this text: ..."        → analyze_text(text="...")
"Find emails in text"           → regex_search(text="...", pattern=r"\b[\w.-]+@[\w.-]+\.\w+\b")
```

### Git
```
"Show git status"               → git_status()
"Last 10 commits"               → git_log(max_count=10)
```

### Other
```
"Read data.json"                → query_json_file(file_path="data.json")
"Zip folder to archive.zip"     → create_zip(source_path="folder", zip_path="archive.zip")
"Extract archive.zip"           → extract_zip(zip_path="archive.zip", destination="out")
```

## 🎯 Tool Categories

**System** (5): system_info, list_processes, kill_process, execute_command, network_connections
**Files** (4): read_file_advanced, write_file_advanced, search_files, execute_python
**Web** (3): http_request, scrape_webpage, download_file
**Env** (3): get_env_var, set_env_var, list_env_vars
**Text** (2): analyze_text, regex_search
**Git** (2): git_status, git_log
**Data** (1): query_json_file
**Auto** (1): cron_schedule_info
**Clip** (2): get_clipboard, set_clipboard (Windows)
**Zip** (2): create_zip, extract_zip

**Total: 25+ tools**

## ⚡ Power Combos

```
"Download API data, extract field, save to file"
"Find all Chrome processes over 500MB and kill them"
"Scrape headlines, analyze word count, save summary"
"Search for TODOs in .py files, compile list"
"Get git status, last commits, create report"
```

## ⚠️ Safety

- ✅ Local only (no internet exposure)
- ✅ User approval for dangerous ops
- ✅ Subprocess isolation
- ✅ Comprehensive logging

## 🐛 Troubleshooting

**Server won't start:**
```bash
cd C:/Users/scarm/omnipotent-mcp
uv run test_server.py
```

**Tools not appearing:**
1. Check config path is absolute
2. Restart Claude completely
3. Check logs: ~/.claude/logs/mcp*.log

**Permission errors:**
Some tools need admin/sudo

## 📚 Docs

- README.md - Overview
- USAGE_GUIDE.md - Complete reference
- OMNIPOTENT-MCP-SETUP.md - Setup guide
- OMNIPOTENT-MCP-COMPLETE.md - Full documentation

## 🎉 Getting Started

1. Add config to Claude
2. Restart Claude
3. Try: "What omnipotent tools do you have?"
4. Start with: "Show system info"
5. Explore!

---

**Location**: C:/Users/scarm/omnipotent-mcp/
**Status**: ✅ Ready
**Tools**: 25+
**Quality**: Production-ready

Enjoy! 🚀
