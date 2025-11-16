# LLM Multi-Provider Framework

Autonomous AI orchestration system with support for multiple LLM providers including Claude and Ollama, featuring continuous agent execution, GitHub Copilot integration, and automated PR management.

## Features

- **Multi-Provider Support**: Seamlessly switch between different LLM providers (Claude, Ollama)
- **Agent System**: Pre-built specialized agents for different tasks:
  - Research Agent: Information gathering and analysis
  - Coding Agent: Software development assistance
  - Writing Agent: Content creation and editing
  - Code Review Agent: ✨ NEW - Automated PR code review
- **Continuous Execution**: Agents can run continuously, processing task queues autonomously
- **GitHub Integration**: 
  - Agents can send prompts and results to GitHub Copilot via issues/comments
  - ✨ NEW - **PR Automation**: Auto-review, validate, create, and merge pull requests
- **Extensible Architecture**: Easy to add custom providers and agents
- **Provider Abstraction**: Unified interface across different LLM backends

## ✨ NEW: GitHub PR Automation

Automate your pull request workflow with AI-powered code review:

- **Auto-Review**: Automatically review PRs when opened or updated
- **Validation**: Check if PRs are ready to merge (checks, approvals, conflicts)
- **Auto-Merge**: Merge PRs automatically when all conditions are met
- **PR Creation**: Create pull requests programmatically

See [PR Automation Documentation](docs/PR_AUTOMATION.md) for detailed guide.

### Quick Start with PR Automation

```bash
# Set environment variables
export GITHUB_TOKEN=your_token
export ANTHROPIC_API_KEY=your_key  # or use Ollama

# Create a PR
python -m llm_framework.scripts.create_pr \
  --title "Add feature" --head feature-branch --base main

# Review a PR
python -m llm_framework.scripts.auto_review_pr --pr-number 123

# Auto-merge when ready (add 'auto-merge' label to PR)
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Scarmonit/LLM.git
cd LLM
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## 🤖 Enhanced GitHub Copilot Integration

This repository is configured with advanced GitHub Copilot features to make the AI assistant smarter and more context-aware:

### What Makes Copilot Smarter Here?

✅ **Custom Instructions** - Repository-specific guidance in `.github/copilot-instructions.md`  
✅ **Custom Agent** - Specialized "LLM Framework Expert" agent for domain-specific help  
✅ **MCP Servers** - Additional tools via Model Context Protocol (browser automation, GitHub operations)  
✅ **Optimized DevContainer** - Pre-configured development environment with all tools ready  

### Quick Benefits

- **Context-Aware Suggestions**: Copilot understands the framework architecture and patterns
- **Avoid Past Mistakes**: Knows about documented pitfalls and anti-patterns  
- **Enhanced Tools**: Can use browser automation and advanced Git operations via MCP
- **Specialized Help**: Ask `@llm-framework-expert` for framework-specific guidance
- **Instant Setup**: Open in DevContainer and everything is ready

### Getting Started

#### Option 1: GitHub Codespaces (Recommended)
```bash
# 1. Click "Code" → "Codespaces" → "Create codespace"
# 2. Wait for environment to initialize
# 3. Start coding with enhanced Copilot!
```

#### Option 2: VS Code DevContainer
```bash
# 1. Install "Dev Containers" extension
# 2. Open repository in VS Code
# 3. Click "Reopen in Container" when prompted
# 4. Copilot is now enhanced with custom features
```

#### Option 3: Local Development
```bash
git clone https://github.com/Scarmonit/LLM.git
cd LLM
pip install -r requirements.txt
# Copilot custom instructions work, but MCP servers require DevContainer
```

### Using the Custom Copilot Agent

Ask domain-specific questions:
```
@llm-framework-expert How do I add a new LLM provider?
@llm-framework-expert What's the best temperature for a research agent?
@llm-framework-expert My agents aren't starting. How do I debug?
```

### MCP Servers Available

- **playwright**: Browser automation and testing
- **github-mcp-server**: Enhanced GitHub repository operations

**Learn More**: See [Copilot Enhancement Guide](docs/COPILOT_GUIDE.md) for complete details on custom instructions, MCP servers, and best practices.

## Development Environment

Pre-configured DevContainer includes:
- Python 3.11 with all dependencies
- Node.js 20 for MCP servers
- GitHub CLI for Git operations
- GitHub Copilot with custom configuration
- Automatic setup on container creation

## Quick Start

### Using Claude Provider

Set your Anthropic API key:
```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### Using Ollama Provider

Install and run Ollama:
```bash
# Install Ollama from https://ollama.ai
# Pull a model
ollama pull llama2

# Ollama server runs on http://localhost:11434 by default
```

### Running a Single Agent

```bash
python example.py
```

### Running Continuous Agents

Run agents continuously with automatic task processing:

```bash
# Run all agents continuously
python run_continuous.py --agent all --interval 60

# Run specific agent
python run_continuous.py --agent research --interval 30

# With GitHub integration
export GITHUB_REPO_OWNER=your-username
export GITHUB_REPO_NAME=your-repo
export GITHUB_TOKEN=your-github-token
python run_continuous.py --agent all --issue-number 123
```

Options:
- `--agent`: Choose which agent to run (`research`, `coding`, `writing`, or `all`)
- `--interval`: Time between task checks in seconds (default: 60)
- `--max-iterations`: Maximum iterations before stopping (default: unlimited)
- `--repo-owner`: GitHub repository owner
- `--repo-name`: GitHub repository name
- `--issue-number`: GitHub issue number for threaded conversation

## Usage

### Basic Usage

```python
from llm_framework.orchestrator import AgentOrchestrator

# Create orchestrator
orchestrator = AgentOrchestrator()

# Set up providers
orchestrator.setup_default_providers()

# Set up agents
orchestrator.setup_default_agents()

# Use an agent
research_agent = orchestrator.get_agent("research")
result = research_agent.execute("What are the latest AI trends?")
print(result)
```

### Continuous Agent Execution

```python
from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.continuous_agent import ContinuousAgent

# Set up orchestrator
orchestrator = AgentOrchestrator()
orchestrator.setup_default_providers()
orchestrator.setup_default_agents()

# Get an agent
agent = orchestrator.get_agent("research")

# Create continuous agent
continuous = ContinuousAgent(agent, interval=60)

# Add tasks to the queue
continuous.add_task("Research quantum computing")
continuous.add_task("Analyze market trends in AI")

# Start continuous execution
continuous.start()

# Check status
status = continuous.get_status()
print(f"Running: {status['is_running']}, Iterations: {status['iteration_count']}")

# Stop when done
continuous.stop()
```

### GitHub Integration

```python
from llm_framework.github_integration import GitHubIntegration, AgentGitHubBridge
from llm_framework.continuous_agent import ContinuousAgent

# Set up GitHub integration
github = GitHubIntegration("your-username", "your-repo")
bridge = AgentGitHubBridge(github, issue_number=123)

# Set up continuous agent with GitHub callback
continuous = ContinuousAgent(agent, interval=60)
continuous.on_result_callback = bridge  # Results sent to GitHub

# Add tasks and start
continuous.add_task("Research AI ethics")
continuous.start()
```

The agent will automatically send task results to the specified GitHub issue, mentioning @copilot for review.

## Creating Custom Agents

```python
from llm_framework.core.agent import Agent, AgentConfig

config = AgentConfig(
    name="Custom Agent",
    description="My custom agent",
    system_prompt="You are a specialized assistant...",
    temperature=0.7
)

agent = Agent(config, provider)
result = agent.execute("Your task here")
```

## Testing

Run tests with pytest:
```bash
pytest tests/
```

## Project Structure

```
LLM/
├── src/
│   └── llm_framework/
│       ├── core/                  # Core framework components
│       ├── providers/             # LLM provider implementations
│       ├── agents/                # Pre-built agent implementations
│       ├── orchestrator.py        # Agent orchestration
│       ├── continuous_agent.py    # Continuous execution support
│       └── github_integration.py  # GitHub Copilot integration
├── tests/                         # Unit tests
├── example.py                     # Basic example
├── run_continuous.py              # Continuous agent runner
└── requirements.txt               # Python dependencies
```

## Environment Variables

- `ANTHROPIC_API_KEY`: API key for Claude provider
- `OLLAMA_BASE_URL`: Ollama server URL (default: http://localhost:11434)
- `GITHUB_TOKEN`: GitHub personal access token for integration
- `GITHUB_REPO_OWNER`: Repository owner for GitHub integration
- `GITHUB_REPO_NAME`: Repository name for GitHub integration

## Always-Running Deployment

To ensure agents are **always running** in production, see the [Deployment Guide](deployment/DEPLOYMENT.md) for multiple options:

### Quick Deploy Options

**Docker (Recommended):**
```bash
cp .env.example .env  # Configure your API keys
docker-compose up -d
```

**Linux systemd:**
```bash
sudo deployment/systemd/install.sh
sudo systemctl enable llm-agents
sudo systemctl start llm-agents
```

**PM2 (Cross-platform):**
```bash
pm2 start deployment/pm2/ecosystem.config.json
pm2 save && pm2 startup
```

All options include:
- ✅ Automatic restart on failure
- ✅ Auto-start on system boot
- ✅ Log management
- ✅ Process monitoring

See [deployment/DEPLOYMENT.md](deployment/DEPLOYMENT.md) for complete instructions.

## License

MIT License
