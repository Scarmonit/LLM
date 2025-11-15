# LLM Multi-Provider Framework

Autonomous AI orchestration system with support for multiple LLM providers including Claude and Ollama, featuring continuous agent execution and GitHub Copilot integration.

## Features

- **Multi-Provider Support**: Seamlessly switch between different LLM providers (Claude, Ollama)
- **Agent System**: Pre-built specialized agents for different tasks:
  - Research Agent: Information gathering and analysis
  - Coding Agent: Software development assistance
  - Writing Agent: Content creation and editing
- **Continuous Execution**: Agents can run continuously, processing task queues autonomously
- **GitHub Integration**: Agents can send prompts and results to GitHub Copilot via issues/comments
- **Extensible Architecture**: Easy to add custom providers and agents
- **Provider Abstraction**: Unified interface across different LLM backends

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
