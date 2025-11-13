# 🚀 GEMINI CLI - QUICK START GUIDE

**Status**: ✅ PRODUCTION READY
**Date**: 2025-11-13

---

## INSTANT START

```bash
# Launch Gemini CLI now
gemini

# Or ask a quick question
gemini "What can you help me with?"
```

---

## ✅ WHAT'S WORKING

### Core System
- **Gemini CLI v0.14.0** - Fully operational
- **API Key** - Configured and validated
- **Models** - gemini-2.5-flash-lite, gemini-2.5-flash
- **Response Time** - 1-2 seconds

### Connected MCP Servers (3)

1. **filesystem** - Read/write files in C:/Users/scarm
2. **omnipotent** - System info, processes, network, HTTP, web scraping
3. **a2a-unified** - GitHub trending, Stack Overflow, knowledge base

---

## 💡 EXAMPLES

### Basic Queries
```bash
gemini "Explain quantum computing in simple terms"
gemini "Write a Python function to sort a list"
gemini "What's the weather like?" # Note: May need web access
```

### File Operations (via filesystem MCP)
```bash
# In interactive mode
gemini -i
> "List all .md files in the current directory"
> "Read the contents of README.md"
> "Create a new file called notes.txt with 'Hello World'"
```

### System Information (via omnipotent MCP)
```bash
gemini -i
> "Show me system information"
> "List all running processes"
> "Check network connections"
```

### Knowledge Queries (via a2a-unified MCP)
```bash
gemini -i
> "What are the trending Python repositories on GitHub?"
> "Find Stack Overflow answers about React hooks"
> "Search for documentation on Docker containers"
```

### Automation Mode
```bash
# YOLO mode - auto-accept all actions
gemini "Analyze system resources and create a report" --yolo

# Auto-edit mode - auto-accept only file edits
gemini "Refactor this code" --approval-mode auto_edit
```

---

## 🎯 COMMON COMMANDS

```bash
# Interactive session
gemini

# One-shot query
gemini "Your question here"

# Interactive with initial prompt
gemini "Initial question" -i

# JSON output (for automation)
gemini "Query" -o json

# Check version
gemini --version

# List MCP servers
gemini mcp list

# Debug mode
gemini --debug "Query"
```

---

## 📊 MCP SERVER STATUS

Run this to check server health:
```bash
gemini mcp list
```

Expected output:
- ✅ **filesystem**: Connected
- ✅ **omnipotent**: Connected
- ✅ **a2a-unified**: Connected
- ⚠️ **playwright**: Configured (not connected)
- ⚠️ **memory**: Configured (not connected)
- ⚠️ **github**: Configured (not connected)

---

## 🔧 TROUBLESHOOTING

### If Gemini CLI not found
```bash
export PATH="$PATH:$HOME/AppData/Roaming/npm"
# Or
source ~/.bash_profile
```

### If API key issues
```bash
echo $GEMINI_API_KEY
# Should show: demo-gemini-key or your actual key
```

### If MCP server disconnected
```bash
# Check Docker containers (for a2a-unified)
docker ps --filter name=a2a-unified

# Restart if needed
docker restart a2a-unified-mcp-server
```

---

## 📚 FULL DOCUMENTATION

See comprehensive documentation:
```bash
cat ~/GEMINI-CLI-PRODUCTION-READY-2025-11-13.md
```

Or run test suite:
```bash
bash ~/test-gemini-production.sh
```

---

## 🎉 YOU'RE READY!

Gemini CLI is fully deployed and ready to use. Start with:

```bash
gemini
```

Then ask anything!

---

**Questions?** Check the full documentation in `GEMINI-CLI-PRODUCTION-READY-2025-11-13.md`
