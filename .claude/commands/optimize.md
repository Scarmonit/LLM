---
description: Run optimization diagnostics and performance checks for Claude Code
---

# Claude Code Optimization Check

Run comprehensive diagnostics to ensure Claude Code is optimally configured:

1. Check Claude Code version
2. Verify settings.json configuration
3. List active MCP servers
4. Check environment variables
5. Verify hooks are properly configured
6. Display session statistics
7. Check for available updates

Use `/doctor` for detailed diagnostics and `/config` to adjust settings.

Please run the following commands and provide a summary:
- `claude --version`
- `claude doctor`
- `claude mcp list`
- Check if CLAUDE.md exists and is readable
- Verify .claude/settings.json permissions
- List active hooks in .claude/hooks/
