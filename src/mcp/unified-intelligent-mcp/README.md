# Unified Intelligent MCP Server

A comprehensive Model Context Protocol (MCP) server that combines sequential thinking capabilities with omnipotent system operations, seamlessly integrating with filesystem and memory MCPs for complete workflow orchestration.

## Features

### 🧠 **Sequential Thinking Engine**
- Multi-step problem solving with adaptive reasoning
- Workflow execution with state tracking
- Intelligent planning and analysis
- Revision and backtracking support

### 💻 **Omnipotent System Operations**
- Comprehensive system information (CPU, memory, disk, network)
- Process management and monitoring
- Network connection tracking
- Real-time system monitoring

### 🔗 **MCP Integration**
- Filesystem operations with state tracking
- Memory MCP coordination (when available)
- Multi-MCP workflow orchestration
- Health monitoring and verification

## Installation

### Quick Install

```bash
cd unified-intelligent-mcp
npm install
npm run deploy
```

This will:
1. Install all dependencies
2. Build the TypeScript project
3. Configure Claude Code integration
4. Create necessary directories

### Verify Installation

```bash
npm run verify
```

## Configuration

The deployment script automatically configures Claude Code. Manual configuration:

**Location**: `~/.claude/settings.json`

```json
{
  "mcpServers": {
    "unified-intelligent": {
      "command": "node",
      "args": ["/absolute/path/to/unified-intelligent-mcp/dist/index.js"],
      "env": {
        "DEBUG": "0"
      }
    }
  }
}
```

## Available Tools

### Thinking Tools

#### `intelligent_solve`
Solve complex problems using sequential thinking.

```json
{
  "problem": "How to optimize database query performance?",
  "context": {"database": "PostgreSQL", "scale": "large"},
  "maxSteps": 10
}
```

**Returns**: Thinking process, solution, and workflow ID

#### `thinking_execute_workflow`
Execute multi-step workflows with state tracking.

```json
{
  "workflowName": "Deploy Application",
  "steps": [
    {"name": "Build", "action": "build", "params": {}},
    {"name": "Test", "action": "test", "params": {}},
    {"name": "Deploy", "action": "deploy", "params": {}}
  ],
  "parallel": false
}
```

#### `thinking_analyze_and_plan`
Analyze a goal and create an execution plan.

```json
{
  "goal": "Migrate monolith to microservices",
  "constraints": ["zero downtime", "gradual migration"],
  "resources": {"team": 5, "timeline": "6 months"}
}
```

### System Tools

#### `system_get_info`
Get comprehensive system information.

```json
{
  "categories": ["system", "cpu", "memory", "disk"]
}
```

#### `process_list`
List all running processes.

```json
{
  "filter": "node",
  "limit": 50
}
```

#### `process_info`
Get detailed process information.

```json
{
  "pid": 12345
}
```

#### `network_connections`
Get active network connections.

```json
{
  "filter": "tcp"
}
```

#### `system_monitor`
Monitor system in real-time.

```json
{
  "duration": 10,
  "interval": 1
}
```

### Integration Tools

#### `integration_file_read`
Read files with state tracking.

```json
{
  "path": "/path/to/file.txt",
  "encoding": "utf-8"
}
```

#### `integration_file_write`
Write files with automatic directory creation.

```json
{
  "path": "/path/to/new/file.txt",
  "content": "File content",
  "createDirs": true
}
```

#### `integration_file_search`
Search for files matching pattern.

```json
{
  "directory": "/project",
  "pattern": "*.ts",
  "recursive": true
}
```

#### `mcp_health_check`
Verify all integrations are working.

```json
{
  "verbose": true
}
```

#### `mcp_get_state`
Get current workflow and execution state.

```json
{
  "includeHistory": true,
  "historyLimit": 50
}
```

#### `mcp_coordinate_workflow`
Orchestrate complex workflows across multiple MCPs.

```json
{
  "name": "Full Deployment Pipeline",
  "operations": [
    {"mcp": "filesystem", "action": "read", "params": {"path": "/config.json"}},
    {"mcp": "system", "action": "process", "params": {"command": "build"}},
    {"mcp": "memory", "action": "store", "params": {"key": "deployment_id"}}
  ]
}
```

## Architecture

```
unified-intelligent-mcp/
├── src/
│   ├── index.ts                    # Main server
│   ├── integrations/
│   │   └── state-manager.ts        # State tracking & persistence
│   ├── tools/
│   │   ├── thinking-tools.ts       # Sequential thinking
│   │   ├── system-tools.ts         # System operations
│   │   └── integration-tools.ts    # MCP coordination
│   └── utils/
│       └── logger.ts               # Logging utilities
├── config/                         # Configuration files
├── scripts/
│   ├── deploy.sh                   # Deployment automation
│   └── verify.sh                   # Installation verification
└── dist/                           # Compiled output
```

## State Management

The server maintains persistent state in `~/.unified-intelligent-mcp/`:

- **workflows/**: Workflow execution records
- **executions/**: Tool execution history
- **state.json**: Current state snapshot

State is automatically:
- Tracked during execution
- Persisted to disk
- Synchronized with memory MCP (when available)
- Restored on server restart

## Usage Examples

### Example 1: Complex Problem Solving

```javascript
// Using intelligent_solve
{
  "problem": "Design a scalable authentication system",
  "context": {
    "users": 1000000,
    "requirements": ["OAuth2", "2FA", "SSO"]
  },
  "maxSteps": 8
}
```

### Example 2: Multi-Step Workflow

```javascript
// Using thinking_execute_workflow
{
  "workflowName": "CI/CD Pipeline",
  "steps": [
    {"name": "Checkout", "action": "git_clone"},
    {"name": "Install", "action": "npm_install"},
    {"name": "Test", "action": "npm_test"},
    {"name": "Build", "action": "npm_build"},
    {"name": "Deploy", "action": "deploy_prod"}
  ],
  "parallel": false
}
```

### Example 3: System Monitoring

```javascript
// Using system_monitor
{
  "duration": 60,
  "interval": 5
}
// Returns CPU/memory statistics over 1 minute
```

### Example 4: Coordinated MCP Workflow

```javascript
// Using mcp_coordinate_workflow
{
  "name": "Data Processing Pipeline",
  "operations": [
    {
      "mcp": "filesystem",
      "action": "read",
      "params": {"path": "/data/input.json"}
    },
    {
      "mcp": "system",
      "action": "process",
      "params": {"command": "transform"}
    },
    {
      "mcp": "filesystem",
      "action": "write",
      "params": {"path": "/data/output.json", "content": "..."}
    },
    {
      "mcp": "memory",
      "action": "track",
      "params": {"entity": "pipeline_run"}
    }
  ]
}
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Debug Mode

Enable debug logging:

```bash
# In settings.json
{
  "mcpServers": {
    "unified-intelligent": {
      "env": {
        "DEBUG": "1"
      }
    }
  }
}
```

## Troubleshooting

### Server Won't Start

1. Check Node.js version: `node --version` (requires >=18.0.0)
2. Verify build completed: `npm run build`
3. Check logs: `~/.claude/logs/session-*.log`

### Tools Not Available

1. Restart Claude Code
2. Verify configuration: Check `~/.claude/settings.json`
3. Run health check: Use `mcp_health_check` tool

### State Not Persisting

1. Check directory permissions: `~/.unified-intelligent-mcp/`
2. Verify disk space
3. Check logs for write errors

## Integration with Other MCPs

### Filesystem MCP

The server automatically uses filesystem MCP when available for enhanced file operations.

### Memory MCP

State tracking integrates with memory MCP to create entities and relations for:
- Workflow executions
- Tool invocations
- System state snapshots

### Sequential Thinking MCP

This server implements its own sequential thinking engine but can also coordinate with external sequential-thinking MCP for enhanced reasoning.

## Performance

- **Tool Execution**: <100ms average
- **Workflow Coordination**: Depends on complexity
- **State Persistence**: Async, non-blocking
- **System Monitoring**: Real-time with configurable intervals

## Security

- All file operations respect system permissions
- No arbitrary code execution
- State files use secure JSON serialization
- Process operations are read-only by default

## Contributing

Contributions welcome! Areas for enhancement:
- Additional thinking strategies
- More system operation tools
- Enhanced memory MCP integration
- Performance optimizations

## License

MIT

## Support

For issues, questions, or contributions:
- Check logs in `~/.claude/logs/`
- Run `npm run verify` for diagnostics
- Review state in `~/.unified-intelligent-mcp/`

---

**Built with ❤️ using the Model Context Protocol**
