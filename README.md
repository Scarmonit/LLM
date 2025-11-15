# LLM Multi-Provider Framework

Autonomous AI orchestration system with support for multiple LLM providers including Claude and Ollama.

## Features

- **Multi-Provider Support**: Seamlessly switch between different LLM providers (Claude, Ollama)
- **Agent System**: Pre-built specialized agents for different tasks:
  - Research Agent: Information gathering and analysis
  - Coding Agent: Software development assistance
  - Writing Agent: Content creation and editing
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

### Running the Example

```bash
python example.py
```

## Usage

```python
from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.providers.claude_provider import ClaudeProvider

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
│       ├── core/           # Core framework components
│       ├── providers/      # LLM provider implementations
│       ├── agents/         # Pre-built agent implementations
│       └── orchestrator.py # Agent orchestration
├── tests/                  # Unit tests
├── example.py             # Example usage
└── requirements.txt       # Python dependencies
```

## License

MIT License
