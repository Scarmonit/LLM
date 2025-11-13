# 🚀 Unified Intelligent MCP - Quick Start Guide

## ⚡ Get Started in 3 Steps

### Step 1: Restart Claude Code
The MCP server is already configured and ready. Just restart Claude Code to load it.

### Step 2: Verify Installation
After restart, test with this simple tool call:
```json
Tool: mcp_health_check
{
  "verbose": true
}
```

### Step 3: Try Your First Workflow
Run an intelligent problem-solving workflow:
```json
Tool: intelligent_solve
{
  "problem": "How to optimize a slow database query?",
  "maxSteps": 5
}
```

---

## 🎯 Common Use Cases

### 1️⃣ **Complex Problem Solving**
```json
Tool: intelligent_solve
{
  "problem": "Design a microservices architecture for an e-commerce platform",
  "context": {
    "scale": "100k daily users",
    "requirements": ["scalability", "high availability", "low latency"]
  },
  "maxSteps": 8
}
```

### 2️⃣ **Automated Workflows**
```json
Tool: thinking_execute_workflow
{
  "workflowName": "CI/CD Pipeline",
  "steps": [
    {"name": "Lint", "action": "lint", "params": {}},
    {"name": "Test", "action": "test", "params": {}},
    {"name": "Build", "action": "build", "params": {}},
    {"name": "Deploy", "action": "deploy", "params": {"env": "staging"}}
  ],
  "parallel": false
}
```

### 3️⃣ **System Monitoring**
```json
Tool: system_monitor
{
  "duration": 30,
  "interval": 5
}
```
Returns CPU and memory statistics over 30 seconds.

### 4️⃣ **Multi-MCP Coordination**
```json
Tool: mcp_coordinate_workflow
{
  "name": "Data Processing Pipeline",
  "operations": [
    {
      "mcp": "filesystem",
      "action": "read",
      "params": {"path": "/data/input.csv"}
    },
    {
      "mcp": "system",
      "action": "process",
      "params": {"command": "transform"}
    },
    {
      "mcp": "filesystem",
      "action": "write",
      "params": {
        "path": "/data/output.json",
        "content": "processed data"
      }
    }
  ]
}
```

### 5️⃣ **File Operations with State Tracking**
```json
Tool: integration_file_search
{
  "directory": "/home/user/projects",
  "pattern": "*.ts",
  "recursive": true
}
```

---

## 📊 Available Tools Reference

| Tool | Category | Purpose |
|------|----------|---------|
| `intelligent_solve` | Thinking | Solve complex problems with sequential reasoning |
| `thinking_execute_workflow` | Thinking | Run multi-step workflows with state tracking |
| `thinking_analyze_and_plan` | Thinking | Analyze goals and create execution plans |
| `system_get_info` | System | Get comprehensive system information |
| `process_list` | System | List and filter running processes |
| `process_info` | System | Get detailed process information |
| `network_connections` | System | View active network connections |
| `system_monitor` | System | Real-time system monitoring |
| `integration_file_read` | Integration | Read files with state tracking |
| `integration_file_write` | Integration | Write files with auto-directory creation |
| `integration_file_search` | Integration | Search files by pattern |
| `mcp_health_check` | Integration | Verify MCP integrations |
| `mcp_get_state` | Integration | Get workflow and execution state |
| `mcp_coordinate_workflow` | Integration | Orchestrate multi-MCP workflows |

---

## 🔍 Checking State

View your workflow state at any time:
```json
Tool: mcp_get_state
{
  "includeHistory": true,
  "historyLimit": 20
}
```

State files are stored in:
- Workflows: `~/.unified-intelligent-mcp/workflows/`
- Executions: `~/.unified-intelligent-mcp/executions/history.jsonl`

---

## 🎓 Tips

1. **Start Simple**: Begin with `mcp_health_check` to verify everything works
2. **Use Thinking Tools**: For complex problems, `intelligent_solve` provides step-by-step reasoning
3. **Track State**: All operations are automatically tracked - use `mcp_get_state` to review
4. **Coordinate MCPs**: Use `mcp_coordinate_workflow` to orchestrate complex multi-step operations
5. **Monitor System**: Use `system_monitor` for real-time performance metrics

---

## 📖 Full Documentation

For detailed documentation, see:
- **README.md**: Complete feature guide and examples
- **DEPLOYMENT-COMPLETE.md**: Full deployment details and architecture

---

## 🐛 Troubleshooting

**Tools not appearing?**
- Restart Claude Code
- Check `~/.mcp.json` contains `unified-intelligent` entry

**Server errors?**
- Check Node.js version: `node --version` (needs >=18)
- Review logs in `~/.claude/logs/`

**Need help?**
- Run `mcp_health_check` for diagnostics
- Check state directory: `~/.unified-intelligent-mcp/`

---

**Ready to use!** 🎉

Start with `mcp_health_check` and explore from there.
