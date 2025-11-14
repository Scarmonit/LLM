# Smart Mode: MCP-First Problem Solving

**YOU ARE IN `/smart` MODE - YOU MUST USE MCP TOOLS ACTIVELY**

This mode exists to demonstrate and utilize the full power of Model Context Protocol (MCP) servers. When in `/smart` mode, PREFER MCP tools over native tools whenever applicable.

## THE GOLDEN RULE

**USE THE MCPs! That's literally the entire point of this mode.**

When you have a choice between a native tool and an MCP tool, USE THE MCP TOOL to demonstrate its capabilities.

## MCP Tools (USE THESE FIRST)

### mcp__filesystem__* (File Operations)
**USE FOR:**
- `read_text_file` - Reading files (instead of Read tool)
- `write_file` - Creating/overwriting files (instead of Write tool)
- `edit_file` - Making line-based edits (instead of Edit tool)
- `list_directory` - Listing directories
- `directory_tree` - Getting full directory structure
- `search_files` - Finding files by pattern
- `read_multiple_files` - Reading many files at once

**EXAMPLE:**
```
User: "Show me what's in my Documents folder"
→ Use mcp__filesystem__list_directory NOT Bash ls
→ Use mcp__filesystem__directory_tree for nested structure
```

### mcp__playwright__* (Browser Automation)
**USE FOR:**
- `browser_navigate` - Go to URLs
- `browser_snapshot` - See page structure (accessible tree)
- `browser_click` - Click elements
- `browser_type` - Type into fields
- `browser_fill_form` - Fill multiple form fields
- `browser_take_screenshot` - Capture visuals
- `browser_evaluate` - Run JavaScript on page

**EXAMPLE:**
```
User: "Scrape the top stories from Hacker News"
→ Use mcp__playwright__browser_navigate
→ Use mcp__playwright__browser_snapshot to see structure
→ Use mcp__playwright__browser_evaluate to extract data
```

### mcp__wsl-exec__* (WSL/Linux)
**USE FOR:**
- `get_system_info` - WSL system information
- `get_environment` - Environment variables
- `list_processes` - Running processes
- `get_disk_usage` - Disk space info
- `get_directory_info` - Directory contents
- `execute_command` - Run Linux commands in WSL

**EXAMPLE:**
```
User: "Check if Docker is running in WSL"
→ Use mcp__wsl-exec__list_processes with filter: "docker"
→ Use mcp__wsl-exec__get_system_info for system details
```

### mcp__sequential-thinking__* (Complex Reasoning)
**USE FOR:**
- Breaking down complex problems
- Multi-step analysis with verification
- Planning solutions before executing
- Reasoning through ambiguous requests

**EXAMPLE:**
```
User: "Help me architect a scalable microservices system"
→ Use mcp__sequential-thinking__sequentialthinking to:
  - Analyze requirements (thought 1)
  - Evaluate architectures (thought 2-3)
  - Consider trade-offs (thought 4-5)
  - Recommend solution (thought 6)
```

### mcp__context7__* (Library Documentation)
**USE FOR:**
- Getting up-to-date docs for any library
- Finding code examples
- Understanding API changes

**EXAMPLE:**
```
User: "How do I use React Server Components?"
→ Use mcp__context7__resolve-library-id for "react"
→ Use mcp__context7__get-library-docs with topic: "server components"
```

## Native Tools (Use When MCPs Don't Apply)

- **TodoWrite** - Task tracking (always use for 3+ steps)
- **Bash** - Git commands, npm/node, Windows utilities
- **Grep/Glob** - Quick code searches (but consider filesystem MCP for complex searches)
- **Task** - Spawn sub-agents for large refactors/research

## Decision Matrix

| Task Type | FIRST CHOICE (MCP) | Fallback (Native) |
|-----------|-------------------|-------------------|
| Read file | `mcp__filesystem__read_text_file` | Read tool |
| Write file | `mcp__filesystem__write_file` | Write tool |
| Edit file | `mcp__filesystem__edit_file` | Edit tool |
| List directory | `mcp__filesystem__list_directory` | Bash ls |
| Web scraping | `mcp__playwright__*` | N/A |
| WSL commands | `mcp__wsl-exec__execute_command` | N/A (can't reach WSL directly) |
| Complex analysis | `mcp__sequential-thinking__*` | Think it through normally |
| Library docs | `mcp__context7__*` | WebSearch/WebFetch |
| Git operations | Bash (git commands) | N/A |
| Run tests | Bash (npm test, etc) | N/A |

## Workflow Example: "Fix the auth bug"

**BAD (No MCPs):**
```
1. Read auth.js
2. Edit fix
3. Done
```

**GOOD (MCP-First):**
```
1. mcp__filesystem__search_files pattern:"auth" 
2. mcp__filesystem__read_multiple_files (all auth files)
3. mcp__sequential-thinking (analyze the bug)
4. mcp__filesystem__edit_file (apply fix)
5. Bash: npm test (verify fix)
```

## Smart Mode Checklist

Before responding, ask yourself:

- [ ] Can I use `mcp__filesystem__*` instead of Read/Write/Edit?
- [ ] Would `mcp__sequential-thinking__*` help me think through this?
- [ ] Is this a web task that needs `mcp__playwright__*`?
- [ ] Should I use `mcp__wsl-exec__*` for Linux/WSL operations?
- [ ] Do I need library docs via `mcp__context7__*`?

**If you answered YES to any of these, USE THE MCP!**

## The Point

`/smart` mode is about demonstrating MCP capabilities. If you're not actively using MCPs, you're missing the entire point. Show the user what these powerful tools can do.

**USE. THE. MCPS.**
