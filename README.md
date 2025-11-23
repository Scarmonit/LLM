# LLM MCP Servers

Production-ready MCP servers for AWS CLI and Terraform with Windows/Linux cross-platform support.

## Features

- **AWS CLI MCP Server**: Execute AWS commands via MCP protocol
- **Terraform MCP Server**: Manage infrastructure as code through MCP
- **Cross-platform**: Works on Windows (cmd.exe) and Linux (/bin/sh)
- **Security hardening**: Input validation, command sanitization
- **Enterprise monitoring**: Prometheus/Grafana integration ready

## Quick Start

```bash
# Install dependencies
npm install

# Run AWS CLI server
node src/mcp/aws-cli-mcp-server.js

# Run Terraform server
node src/mcp/terraform-mcp-server.js
```

## Configuration

Add to your Claude Code `.claude.json`:

```json
{
  "mcpServers": {
    "aws-cli": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/Users/scarm/LLM/src/mcp/aws-cli-mcp-server.js"]
    },
    "terraform": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/Users/scarm/LLM/src/mcp/terraform-mcp-server.js"]
    }
  }
}
```

## Recent Changes

- **v1.0.1** (2025-11-09): Fixed cross-platform shell compatibility for Windows
- **v1.0.0** (2025-11-08): Initial release with AWS CLI and Terraform support

## Related Projects

- [mcp-unified-orchestrator](https://github.com/Scarmonit/mcp-unified-orchestrator) - Enterprise monitoring stack
- [Autonomous](https://github.com/Scarmonit/Autonomous) - Browser control agent
- [jules-orchestrator](https://github.com/Scarmonit/jules-orchestrator) - Parallel execution orchestrator
