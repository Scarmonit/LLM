# Workflow Orchestrator Command

Execute multi-MCP workflows from the MCP Workflow Orchestrator system.

## Available Commands

**List workflows**: Show all available workflows
```
/workflow list
```

**Run a workflow**: Execute a specific workflow
```
/workflow run <workflow-name>
```

**Show workflow info**: Display details about a workflow
```
/workflow info <workflow-name>
```

## Available Workflows

- **code-quality**: Analyze codebase for quality issues and security vulnerabilities
- **web-test**: Automated web application testing with Playwright
- **deploy-check**: Pre-deployment validation and checklist generation

## How It Works

When you run a workflow:
1. Claude loads the workflow definition from `.claude/orchestrator/workflows/<name>.yaml`
2. Executes each step sequentially, calling the appropriate MCP servers
3. Tracks state and handles errors according to the workflow configuration
4. Generates an execution log in `.claude/orchestrator/logs/`

## Examples

```
/workflow list
/workflow run code-quality
/workflow run web-test
/workflow info deploy-check
```

## Creating Custom Workflows

1. Create a new `.yaml` file in `.claude/orchestrator/workflows/`
2. Follow the workflow structure (see README.md)
3. Run with `/workflow run <your-workflow-name>`

See `.claude/orchestrator/README.md` for full documentation.
