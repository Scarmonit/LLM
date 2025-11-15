# GitHub Copilot Enhancement Guide

> **Making Copilot Smarter**: This guide explains how to leverage custom instructions, development environment customization, and Model Context Protocol (MCP) servers to enhance GitHub Copilot's capabilities when working with this LLM framework.

## Table of Contents

1. [Overview](#overview)
2. [Custom Instructions](#custom-instructions)
3. [Development Environment](#development-environment)
4. [MCP Servers](#mcp-servers)
5. [Custom Copilot Agent](#custom-copilot-agent)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)

## Overview

This repository is configured with advanced GitHub Copilot features that make the AI assistant context-aware and specialized for working with the LLM Multi-Provider Framework.

### What's Configured

✅ **Custom Instructions** - Repository-specific guidance in `.github/copilot-instructions.md`  
✅ **DevContainer** - Pre-configured development environment with all tools  
✅ **MCP Servers** - Additional capabilities via Model Context Protocol  
✅ **Custom Agent** - Specialized LLM Framework expert agent  

### Benefits

- **Context-Aware**: Copilot understands the framework architecture
- **Best Practices**: Follows documented patterns and avoids past mistakes
- **Enhanced Tools**: Browser automation and advanced Git operations via MCP
- **Specialized Help**: Custom agent for framework-specific questions

## Custom Instructions

### Location

`.github/copilot-instructions.md`

### What It Does

Custom instructions provide Copilot with:

1. **Repository Context**: Understanding of the LLM framework structure
2. **Critical Rules**: Important guidelines to follow (e.g., use real LLMs, not mocks)
3. **Common Pitfalls**: Past mistakes to avoid
4. **Verification Methods**: How to properly test and validate changes
5. **Problem-Solving Framework**: Systematic approach to debugging

### Key Features

#### 1. Quick Start Checklist

When Copilot starts a new session, it's instructed to:
- Read the entire instructions document
- Review `docs/LESSONS_LEARNED.md` for past mistakes
- Check `docs/CURRENT_STATE.md` for system status
- Review `docs/ARCHITECTURE.md` for system design
- Read `VERIFICATION.md` for testing procedures

#### 2. Critical Rules

Copilot is configured to:
- ✅ Use available resources first (install real dependencies)
- ✅ Follow systematic approaches before making changes
- ✅ Verify with real LLMs (no mock data in production)
- ✅ Update documentation after changes

#### 3. Anti-Patterns

Copilot knows to avoid:
- ❌ Claiming "it works" without proof
- ❌ Using mock data as "real"
- ❌ Building infrastructure before testing basics
- ❌ Not using available tools/packages

### How to Use

1. **For Users**: The instructions are automatically loaded when Copilot works on this repo
2. **For Maintainers**: Update `.github/copilot-instructions.md` when:
   - New patterns emerge
   - Common mistakes are discovered
   - Architecture changes
   - New critical rules are needed

### Customization

To customize instructions for your repository:

```bash
# Edit the instructions file
vim .github/copilot-instructions.md

# Add new sections as needed:
# - Project-specific rules
# - Domain knowledge
# - Tool configurations
# - Testing requirements
```

## Development Environment

### DevContainer Configuration

Location: `.devcontainer/devcontainer.json`

### Features

The DevContainer includes:

1. **Python 3.11**
   - Pre-configured Python environment
   - Default interpreter path set
   - Linting and formatting enabled

2. **Git & GitHub CLI**
   - Version control tools
   - GitHub integration

3. **Node.js 20**
   - Required for MCP servers
   - NPX for running packages

4. **VS Code Extensions**
   - Python language support
   - Pylance for type checking
   - Jupyter for notebooks
   - GitHub Copilot & Copilot Chat
   - Prettier for formatting
   - Docker tools

### Configuration Highlights

```json
{
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "GitHub.copilot",
        "GitHub.copilot-chat"
      ],
      "settings": {
        "python.defaultInterpreterPath": "/usr/local/bin/python",
        "python.linting.enabled": true,
        "python.formatting.provider": "black",
        "editor.formatOnSave": true
      }
    }
  }
}
```

### Post-Creation Setup

The DevContainer automatically runs:
```bash
pip install -r requirements.txt
```

This ensures all dependencies are installed immediately.

### Port Forwarding

Pre-configured ports:
- **8000**: Application server
- **8080**: Alternative web server
- **5000**: Development server

### SSH Key Mounting

Your local SSH keys are mounted read-only for Git operations:
```json
{
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh,readonly,type=bind"
  ]
}
```

### Using the DevContainer

#### With VS Code

1. Install "Dev Containers" extension
2. Open repository in VS Code
3. Click "Reopen in Container" when prompted
4. Wait for container to build (first time only)

#### With GitHub Codespaces

1. Go to repository on GitHub
2. Click "Code" → "Codespaces" → "Create codespace"
3. Wait for environment to initialize
4. Start coding with full Copilot integration

## MCP Servers

### What is MCP?

**Model Context Protocol** (MCP) extends Copilot's capabilities by providing additional tools and context that the AI can use when helping you code.

### Configured Servers

The repository includes two MCP servers:

#### 1. Playwright MCP Server

**Purpose**: Browser automation and testing

**Capabilities**:
- Launch and control web browsers
- Interact with web pages
- Take screenshots
- Run automated tests
- Debug web applications

**Configuration**:
```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@playwright/mcp"]
  }
}
```

**Use Cases**:
- Testing web interfaces for agent dashboards
- Automating browser-based workflows
- Debugging JavaScript issues
- Taking screenshots for documentation

#### 2. GitHub MCP Server

**Purpose**: Enhanced GitHub repository operations

**Capabilities**:
- Advanced Git operations
- Repository analysis
- Pull request management
- Issue tracking
- Workflow automation

**Configuration**:
```json
{
  "github-mcp-server": {
    "command": "npx",
    "args": ["-y", "github-mcp-server"]
  }
}
```

**Use Cases**:
- Managing pull requests programmatically
- Analyzing repository statistics
- Automating GitHub workflows
- Integration testing with GitHub API

### How MCP Servers Work

1. **Automatic Startup**: When you open the DevContainer, MCP servers start automatically
2. **Tool Access**: Copilot can now use additional tools provided by these servers
3. **Context Enhancement**: Servers provide real-time context about browser state, repository state, etc.
4. **Seamless Integration**: You interact with Copilot normally; it uses MCP tools as needed

### Example: Using MCP in Practice

**Without MCP**:
```
You: "Can you help me test the agent dashboard?"
Copilot: "Here's how you might write a test..."
```

**With MCP (Playwright)**:
```
You: "Can you help me test the agent dashboard?"
Copilot: "I'll use Playwright to test it. Let me launch a browser..."
[Copilot uses Playwright MCP to actually run the test]
```

### Adding More MCP Servers

To add additional MCP servers:

1. Find an MCP server package (NPM, Python, etc.)
2. Add to `.devcontainer/devcontainer.json`:
   ```json
   {
     "github.copilot.chat.mcp.servers": {
       "your-server-name": {
         "command": "command-to-run",
         "args": ["arg1", "arg2"]
       }
     }
   }
   ```
3. Rebuild the DevContainer

### Available MCP Servers

Popular MCP servers you can add:
- **filesystem**: File system operations
- **sqlite**: Database interactions
- **puppeteer**: Alternative browser automation
- **slack**: Slack integration
- **figma**: Design file access

See: https://modelcontextprotocol.io/servers for more options

## Custom Copilot Agent

### What is a Custom Agent?

A **Custom Copilot Agent** is a specialized AI assistant configured with deep knowledge of your repository. It's like having a team member who knows your codebase inside and out.

### Location

`.github/agents/my-agent.agent.md`

### Our Custom Agent: LLM Framework Expert

**Name**: LLM Framework Expert

**Description**: An expert assistant for the LLM Multi-Provider Framework, helping with agent development, provider configuration, and autonomous system orchestration.

### Core Capabilities

The custom agent has expertise in:

1. **Multi-Provider Architecture**
   - Understanding different LLM providers (Ollama, Claude, OpenAI)
   - Configuring provider settings
   - Switching between providers

2. **Agent Development**
   - Creating specialized agents
   - Configuring agent parameters (temperature, tokens)
   - Agent lifecycle management

3. **Continuous Execution**
   - Setting up autonomous agents
   - Managing task queues
   - Background execution

4. **System Orchestration**
   - Orchestrator configuration
   - Provider discovery
   - Agent coordination

5. **GitHub Integration**
   - PR automation
   - Issue management
   - Copilot integration

### What the Agent Helps With

1. **Configuration**: Setting up providers, API keys, environment variables
2. **Custom Agents**: Creating new specialized agents
3. **Provider Integration**: Adding or switching LLM providers
4. **Troubleshooting**: Debugging agents, providers, continuous execution
5. **Best Practices**: Following documented patterns, avoiding mistakes
6. **Testing**: Writing and running tests
7. **Deployment**: Setting up production agents

### Key Knowledge Areas

The agent knows about:
- Repository structure and architecture (`docs/ARCHITECTURE.md`)
- Current system state (`docs/CURRENT_STATE.md`)
- Past mistakes to avoid (`docs/LESSONS_LEARNED.md`)
- Testing procedures (`VERIFICATION.md`)
- Problem-solving methodology (`SYSTEMATIC_BREAKDOWN.md`)

### Using the Custom Agent

#### In GitHub Copilot Chat

1. **Mention the agent**:
   ```
   @llm-framework-expert How do I add a new provider?
   ```

2. **Ask specialized questions**:
   ```
   @llm-framework-expert What's the best temperature for a coding agent?
   ```

3. **Get troubleshooting help**:
   ```
   @llm-framework-expert My agents aren't starting. What should I check?
   ```

#### Example Conversations

**Adding a New Provider**:
```
You: @llm-framework-expert I want to add support for Google's Gemini. How do I do that?

Agent: To add Gemini support, you'll need to:
1. Create a new provider in `src/llm_framework/providers/gemini_provider.py`
2. Inherit from `BaseProvider`
3. Implement the required methods: generate(), is_available(), get_name()
4. Add Gemini API credentials to environment variables
5. Register in the orchestrator

Here's a template...
```

**Debugging Issues**:
```
You: @llm-framework-expert My continuous agents stop after a few iterations

Agent: Based on the docs/LESSONS_LEARNED.md, this could be:
1. Check if Ollama is still running: `ollama list`
2. Verify the agent's error handling in continuous_agent.py
3. Check the max_iterations setting
4. Review logs for exception messages

Let's verify each...
```

### Customizing the Agent

To customize the agent for your needs:

1. Edit `.github/agents/my-agent.agent.md`
2. Update the capabilities section
3. Add domain-specific knowledge
4. Include links to relevant documentation
5. Merge to main branch to activate

### Creating Additional Agents

You can create multiple specialized agents:

```bash
# Create a new agent file
.github/agents/deployment-expert.agent.md
.github/agents/testing-expert.agent.md
.github/agents/security-expert.agent.md
```

Each agent can focus on a specific domain.

## Usage Examples

### Example 1: Getting Started with a New Feature

**Goal**: Add a new agent type

**Steps**:

1. **Ask the custom agent**:
   ```
   @llm-framework-expert I need to create a "SummaryAgent" that summarizes text. 
   What temperature should I use and where should I put the code?
   ```

2. **Copilot provides context-aware answer**:
   - Suggests temperature: 0.5 (balanced)
   - Location: `src/llm_framework/agents/summary_agent.py`
   - References existing agent patterns
   - Includes test recommendations

3. **Implement with Copilot's help**:
   - Copilot autocompletes based on repository patterns
   - Follows established conventions
   - Uses correct imports from existing code

4. **Test with MCP-enhanced Copilot**:
   ```
   You: "Can you run the tests for my new agent?"
   Copilot: [Uses terminal MCP to run pytest]
   ```

### Example 2: Debugging Production Issues

**Goal**: Figure out why agents stopped running

**Steps**:

1. **Ask for help**:
   ```
   @llm-framework-expert Production agents stopped. How do I debug?
   ```

2. **Agent provides checklist** (from CURRENT_STATE.md):
   - Check Ollama status
   - Verify environment variables
   - Check logs
   - Review recent changes

3. **Copilot helps you verify**:
   - Suggests commands to run
   - Analyzes log output
   - Identifies the issue

4. **Fix with guidance**:
   - Copilot references LESSONS_LEARNED.md
   - Avoids past mistakes
   - Suggests proper fix

### Example 3: Setting Up a New Developer

**Goal**: Onboard a new team member

**Steps**:

1. **Developer opens in DevContainer**:
   - All tools auto-installed
   - MCP servers started
   - Copilot ready

2. **Developer asks**:
   ```
   @llm-framework-expert I'm new to this repo. What should I know?
   ```

3. **Agent provides onboarding**:
   - Links to key documentation
   - Explains architecture
   - Shows how to run tests
   - Demonstrates example usage

4. **Developer starts coding**:
   - Copilot autocompletes with context
   - Follows repo patterns automatically
   - MCP tools available for testing

## Best Practices

### 1. Keep Instructions Updated

**Why**: Outdated instructions lead to wrong suggestions

**How**:
- Update `.github/copilot-instructions.md` when patterns change
- Document new anti-patterns in LESSONS_LEARNED.md
- Keep CURRENT_STATE.md accurate

**When**:
- After major refactoring
- When common mistakes are discovered
- After architecture changes

### 2. Use the Custom Agent for Domain Questions

**Why**: The custom agent has specialized knowledge

**How**:
```
# Good
@llm-framework-expert How should I configure a research agent?

# Less optimal
How should I configure an agent?
```

**Benefit**: More accurate, context-aware answers

### 3. Leverage MCP Servers

**Why**: MCP gives Copilot actual tools, not just suggestions

**Examples**:
- "Test this in a browser" → Uses Playwright MCP
- "Create a PR for this" → Uses GitHub MCP
- "Check the test coverage" → Uses terminal MCP

### 4. Trust but Verify

**Why**: Even enhanced Copilot can make mistakes

**How**:
- Always run tests after Copilot changes
- Review code before committing
- Use the verification checklist in VERIFICATION.md

### 5. Provide Context in Questions

**Good**:
```
@llm-framework-expert I'm adding Gemini support. Looking at claude_provider.py 
for reference. What API differences should I know about?
```

**Less effective**:
```
How do I add a provider?
```

### 6. Keep DevContainer Up to Date

**Why**: New MCP servers and tools become available

**How**:
- Review MCP server catalog periodically
- Update Node.js and Python versions
- Add useful VS Code extensions

**When**:
- Quarterly reviews
- When new MCP servers are released
- When team needs change

### 7. Document Custom Patterns

**Why**: Helps Copilot learn repository-specific patterns

**How**:
- Add examples to custom instructions
- Document in ARCHITECTURE.md
- Include in custom agent knowledge

### 8. Use Copilot for Repetitive Tasks

**Examples**:
- Creating new agents (similar patterns)
- Writing tests (follows template)
- Updating documentation (consistent style)
- Refactoring (systematic changes)

### 9. Combine Features

**Example**: New Feature Development
1. **Custom Agent**: Get architecture guidance
2. **MCP Server**: Test implementation
3. **Custom Instructions**: Follow repo patterns
4. **DevContainer**: Ensure consistent environment

### 10. Share Knowledge

**Why**: Team benefits from collective learning

**How**:
- Update LESSONS_LEARNED.md when you discover something
- Add useful patterns to custom instructions
- Document MCP server usage tips
- Create example conversations

## Troubleshooting

### Copilot Not Using Custom Instructions

**Symptoms**: Suggestions don't follow repo patterns

**Solutions**:
1. Ensure `.github/copilot-instructions.md` is in main branch
2. Restart VS Code / Codespace
3. Check file is valid Markdown
4. Verify GitHub Copilot subscription is active

### MCP Servers Not Starting

**Symptoms**: No enhanced tools available

**Solutions**:
1. Check DevContainer rebuild:
   ```
   Dev Containers: Rebuild Container
   ```
2. Verify Node.js is installed:
   ```bash
   node --version
   npm --version
   ```
3. Check MCP server configuration in `.devcontainer/devcontainer.json`
4. Look at container logs for errors

### Custom Agent Not Responding

**Symptoms**: `@llm-framework-expert` not recognized

**Solutions**:
1. Ensure `.github/agents/my-agent.agent.md` is merged to main
2. Check agent file syntax (YAML frontmatter + Markdown)
3. Restart Copilot
4. Verify GitHub Copilot Chat is enabled

### DevContainer Won't Build

**Symptoms**: Container build fails

**Solutions**:
1. Check Docker is running
2. Review build logs for specific errors
3. Try rebuilding without cache:
   ```
   Dev Containers: Rebuild Container Without Cache
   ```
4. Verify `.devcontainer/devcontainer.json` syntax

### Suggestions Not Relevant

**Symptoms**: Copilot suggests wrong patterns

**Solutions**:
1. Provide more context in your question
2. Reference specific files or patterns
3. Use the custom agent with `@llm-framework-expert`
4. Update custom instructions with correct patterns

## Advanced Topics

### Creating Domain-Specific MCP Servers

If you need custom tools, you can create your own MCP server:

1. **Choose a platform**: Node.js, Python, etc.
2. **Implement MCP protocol**: Follow specification
3. **Add to DevContainer**: Configure in `devcontainer.json`
4. **Document usage**: Update this guide

### Multi-Repository Configurations

For organizations with multiple repos:

1. **Shared instructions**: Common patterns across repos
2. **Repo-specific sections**: Override in each repo
3. **Shared MCP servers**: Organization-wide tools
4. **Agent templates**: Reusable agent configurations

### CI/CD Integration

Leverage Copilot configuration in CI:

1. **Automated tests**: Use same DevContainer in CI
2. **Documentation checks**: Validate instructions are current
3. **Agent validation**: Test custom agent configurations
4. **MCP in CI**: Some MCP servers work in CI pipelines

### Measuring Effectiveness

Track Copilot enhancement impact:

1. **Developer surveys**: Ask about usefulness
2. **Time savings**: Compare with/without enhancements
3. **Error rates**: Monitor code quality metrics
4. **Adoption**: Track custom agent usage

## Resources

### Documentation

- [GitHub Copilot Documentation](https://docs.github.com/copilot)
- [Custom Instructions Guide](https://gh.io/copilot-instructions)
- [Custom Agents Guide](https://gh.io/customagents)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [DevContainer Documentation](https://containers.dev)

### Repository Documentation

- [Repository Instructions](.github/copilot-instructions.md)
- [Custom Agent Configuration](.github/agents/my-agent.agent.md)
- [DevContainer Config](.devcontainer/devcontainer.json)
- [Architecture Guide](ARCHITECTURE.md)
- [Current State](CURRENT_STATE.md)
- [Lessons Learned](LESSONS_LEARNED.md)

### Tools & Servers

- [MCP Server Catalog](https://modelcontextprotocol.io/servers)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [DevContainer Features](https://containers.dev/features)

## Feedback & Contributions

### Improving This Guide

Found something unclear or missing?

1. Open an issue describing the problem
2. Submit a PR with improvements
3. Ask the custom agent for suggestions
4. Share your use cases

### Sharing Your Experience

Help others learn:

1. Document tips in this guide
2. Add to LESSONS_LEARNED.md
3. Update custom agent knowledge
4. Create example conversations

---

**Remember**: These enhancements work best when:
- Instructions are kept up to date
- Custom agent knowledge is accurate
- MCP servers are properly configured
- DevContainer is maintained

**Start using these features today to make Copilot smarter for your workflow!**

Last Updated: 2025-11-15  
Last Updated By: GitHub Copilot (Enhanced Configuration Guide)
