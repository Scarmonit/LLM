# MCP Servers Quick Reference
**Last Updated**: 2025-11-13

## Status Check
```bash
claude mcp list
```

## Available MCP Servers

### 🔧 Omnipotent MCP
**Tools**: `mcp__omnipotent__*`
- `system_info` - Get CPU, memory, disk, network stats
- `list_processes` - List running processes (filter by name)
- `kill_process` - Terminate a process by PID
- `execute_command` - Run system commands
- `network_connections` - View network connections
- `read_file_advanced` - Read files with encoding options
- `write_file_advanced` - Write files with directory creation
- `search_files` - Find files by pattern
- `http_request` - Make HTTP requests
- `scrape_webpage` - Extract content from URLs
- `download_file` - Download files from URLs
- `get_env_var` / `set_env_var` / `list_env_vars` - Environment management
- `analyze_text` - Text statistics and analysis
- `regex_search` - Search with regex patterns
- `git_status` / `git_log` - Git repository operations
- `query_json_file` - Query JSON files with paths
- `get_clipboard` / `set_clipboard` - Clipboard operations (Windows)
- `create_zip` / `extract_zip` - Archive operations

### 🧠 A2A-Unified MCP
**Tools**: `mcp__a2a-unified__*`
- `search_knowledge` - Search knowledge base
- `get_trending_repos` - GitHub trending repositories
- `get_stackoverflow_qa` - Stack Overflow answers
- `remember` / `recall` / `list_memories` - Persistent memory
- `read_file` / `write_file` / `list_directory` - File ops
- `run_command` - Execute commands
- `sql_query` - SQL queries on local DB
- `get_error_stats` / `get_recent_errors` - Error monitoring
- `get_tool_usage_stats` - Usage statistics

### 📂 Filesystem MCP
**Tools**: `mcp__filesystem__*`
- `read_text_file` - Read text files
- `read_media_file` - Read images/audio
- `read_multiple_files` - Batch file reading
- `write_file` - Create/overwrite files
- `edit_file` - Line-based edits
- `create_directory` - Create directories
- `list_directory` / `list_directory_with_sizes` - List contents
- `directory_tree` - Recursive tree view
- `move_file` - Move/rename files
- `search_files` - Find files by pattern
- `get_file_info` - File metadata
- `list_allowed_directories` - Show accessible paths

### 🐙 GitHub MCP
**Tools**: `mcp__github__*`
- Repository: `create_repository`, `fork_repository`, `search_repositories`
- Files: `get_file_contents`, `create_or_update_file`, `push_files`
- Issues: `create_issue`, `list_issues`, `get_issue`, `update_issue`, `add_issue_comment`
- PRs: `create_pull_request`, `get_pull_request`, `list_pull_requests`, `merge_pull_request`
- PR Reviews: `create_pull_request_review`, `get_pull_request_reviews`, `get_pull_request_comments`
- PR Operations: `get_pull_request_files`, `get_pull_request_status`, `update_pull_request_branch`
- Branches: `create_branch`, `list_commits`
- Search: `search_code`, `search_issues`, `search_users`

### 🧩 Sequential Thinking MCP
**Tools**: `mcp__sequential-thinking__sequentialthinking`
- Multi-step problem solving with branching and revision
- Track progress through complex reasoning chains
- Generate and verify solution hypotheses

### 🧠 Memory MCP
**Tools**: `mcp__memory__*`
- `create_entities` - Create knowledge graph entities
- `create_relations` - Link entities with relationships
- `add_observations` - Add facts to entities
- `delete_entities` / `delete_observations` / `delete_relations` - Remove data
- `read_graph` - View entire knowledge graph
- `search_nodes` - Search entities and observations
- `open_nodes` - Get specific entities by name

### 🌐 Playwright MCP
**Tools**: `mcp__playwright__*`
- Browser control, navigation, screenshots
- Element interaction (click, type, hover)
- Form filling, file uploads
- Network and console monitoring
- Tab management

### 🔬 Everything MCP
**Tools**: `mcp__everything__*`
- Protocol testing and debugging tools
- Resource references and templates
- Progress notifications
- Multi-modal content testing

### 🤖 Claude Code MCP
**Tools**: `mcp__claude-code__claude_code`
- Autonomous code operations
- Multi-step workflows
- Git automation
- File operations with context awareness

## Quick Examples

### System Monitoring
```javascript
// Get system info
mcp__omnipotent__system_info()

// List Python processes
mcp__omnipotent__list_processes({filter_name: "python"})

// Network connections
mcp__omnipotent__network_connections()
```

### Knowledge & Search
```javascript
// Search knowledge base
mcp__a2a-unified__search_knowledge({
  query: "python async programming",
  limit: 5
})

// Trending repos
mcp__a2a-unified__get_trending_repos({
  language: "python",
  limit: 10
})
```

### File Operations
```javascript
// Read multiple files
mcp__filesystem__read_multiple_files({
  paths: ["file1.txt", "file2.js", "file3.py"]
})

// Search files
mcp__filesystem__search_files({
  path: "C:/Users/scarm",
  pattern: "*.md"
})
```

### GitHub Operations
```javascript
// Create PR
mcp__github__create_pull_request({
  owner: "user",
  repo: "project",
  title: "Feature: Add new capability",
  head: "feature-branch",
  base: "main",
  body: "Description here"
})

// Search code
mcp__github__search_code({
  q: "language:python async def"
})
```

### Memory & Context
```javascript
// Remember something
mcp__a2a-unified__remember({
  key: "project_status",
  value: "All servers deployed and operational",
  category: "deployment"
})

// Create entity in knowledge graph
mcp__memory__create_entities({
  entities: [{
    name: "Project X",
    entityType: "Project",
    observations: ["Started 2025-11-13", "Status: Active"]
  }]
})
```

## Service Management

### Start Servers
```bash
# Omnipotent MCP
cd C:/Users/scarm/omnipotent-mcp && python server_optimized.py &

# Unified Intelligent MCP
cd C:/Users/scarm/src/mcp/unified-intelligent-mcp && npm start &
```

### Check Status
```bash
# List all MCP servers
claude mcp list

# Check processes
ps aux | grep -E "(python server_optimized|node dist/index)"
```

### Logs & Debugging
```bash
# Claude Code session logs
tail -f ~/.claude/logs/session-$(date +%Y%m%d).log

# MCP server logs
# Check background process output or server-specific log files
```

## Configuration Files

- **MCP Config**: `C:/Users/scarm/.mcp.json`
- **Claude Settings**: `C:/Users/scarm/.claude/settings.json`
- **Session Logs**: `C:/Users/scarm/.claude/logs/`

## Troubleshooting

### Server Not Responding
```bash
# Restart MCP servers
pkill -f "server_optimized.py"
pkill -f "unified-intelligent-mcp"

# Then start them again
# ... (see Start Servers section)
```

### Check Configuration
```bash
# Verify MCP config
cat ~/.mcp.json | python -m json.tool

# Test server health
claude doctor
```

## Resource Limits

- **Timeout**: 30s per MCP call (configurable)
- **Output**: 50,000 tokens max
- **Filesystem**: C:/Users/scarm directory accessible
- **Network**: Full HTTP/HTTPS access

## Security Notes

- Omnipotent MCP has system command execution capability
- File operations restricted to allowed directories
- GitHub MCP requires authentication token
- Review permissions before granting tool access
