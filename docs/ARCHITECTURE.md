# Architecture - LLM Multi-Provider Framework

> **Purpose:** System design and component relationships. Reference when understanding or modifying the framework.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  run_real_agents.py | task_queue.py | run_continuous.py    │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Orchestration Layer                        │
│              AgentOrchestrator + ContinuousAgent            │
│  - Provider discovery    - Agent lifecycle management       │
│  - Provider selection    - Continuous execution             │
└───────────┬─────────────────────┬───────────────────────────┘
            │                     │
    ┌───────▼─────────┐   ┌──────▼────────┐
    │  Provider Layer │   │  Agent Layer  │
    └───────┬─────────┘   └──────┬────────┘
            │                    │
┌───────────▼─────────────┐  ┌───▼──────────────────┐
│  LLM Providers:         │  │  Specialized Agents: │
│  - Ollama               │  │  - ResearchAgent     │
│  - Claude               │  │  - CodingAgent       │
│  - OpenAI Compatible    │  │  - WritingAgent      │
│  - Intelligent Mock     │  │  + Custom agents     │
└─────────────────────────┘  └──────────────────────┘
```

## Core Components

### 1. Provider Layer

**Purpose:** Abstract LLM access across different services

**Base Class:** `BaseProvider` (abstract)
- Location: `src/llm_framework/core/base_provider.py`
- Methods:
  - `generate(prompt, max_tokens, temperature)` - Get LLM response
  - `is_available()` - Check provider availability
  - `get_name()` - Provider identifier

**Implementations:**

1. **OllamaProvider**
   - Location: `src/llm_framework/providers/ollama_provider.py`
   - Uses: Local Ollama API (HTTP)
   - Default model: qwen2.5:0.5b
   - Configuration: `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
   - Availability: Requires Ollama installation

2. **ClaudeProvider**
   - Location: `src/llm_framework/providers/claude_provider.py`
   - Uses: Anthropic API
   - Configuration: `ANTHROPIC_API_KEY`
   - Availability: Requires API key

3. **OpenAICompatibleProvider**
   - Location: `src/llm_framework/providers/openai_compatible_provider.py`
   - Uses: OpenAI API or compatible services
   - Configuration: `OPENAI_API_KEY`, `OPENAI_BASE_URL`
   - Availability: Requires API key

4. **IntelligentMockProvider**
   - Location: `src/llm_framework/providers/intelligent_mock_provider.py`
   - Uses: Context-aware response generation
   - Configuration: None
   - Availability: Always available (testing only)

**Provider Selection Priority:**
1. Ollama (if installed)
2. Claude (if API key provided)
3. OpenAI (if API key provided)
4. Intelligent Mock (fallback for testing)

### 2. Agent Layer

**Purpose:** Specialized task execution with specific configurations

**Base Class:** `Agent`
- Location: `src/llm_framework/core/agent.py`
- Configuration: `AgentConfig` (name, description, temperature, max_tokens)
- Methods:
  - `execute(task)` - Process a task
  - `get_status()` - Current agent status
  - `clear_history()` - Reset conversation

**Specialized Agents:**

1. **ResearchAgent**
   - Temperature: 0.5 (balanced)
   - Purpose: Information gathering, factual accuracy
   - Max tokens: 150

2. **CodingAgent**
   - Temperature: 0.3 (deterministic)
   - Purpose: Code generation, technical accuracy
   - Max tokens: 150

3. **WritingAgent**
   - Temperature: 0.8 (creative)
   - Purpose: Content creation, varied output
   - Max tokens: 150

### 3. Orchestration Layer

**Purpose:** Coordinate providers and agents

**AgentOrchestrator**
- Location: `src/llm_framework/orchestrator.py`
- Responsibilities:
  - Discover available providers
  - Select best provider
  - Manage agent lifecycle
  - Provide system status

**Key Methods:**
- `setup_default_providers()` - Auto-discover providers
- `setup_default_agents()` - Initialize agents
- `get_agent(name)` - Retrieve specific agent
- `list_providers()` - Available providers
- `get_status()` - System status

**ContinuousAgent**
- Location: `src/llm_framework/continuous_agent.py`
- Responsibilities:
  - Run agents in background threads
  - Task queue management
  - Auto-task generation
  - Status monitoring

**Key Methods:**
- `add_task(task)` - Queue a task
- `start()` - Begin continuous execution
- `stop()` - Graceful shutdown
- `get_status()` - Current state

### 4. User Interface Layer

**Production Runners:**

1. **run_real_agents.py** ⭐ Main runner
   - Runs 3 agents continuously
   - Real Ollama LLM
   - Visible real-time output
   - Status every 30 seconds

2. **run_truly_autonomous.py**
   - Autonomous code analysis
   - Documentation checking
   - Test monitoring
   - Self-directed work finding

3. **run_task_queue_agents.py**
   - User-controlled task queue
   - Agents process submitted tasks
   - No auto-generation

4. **task_queue.py**
   - CLI task management
   - Add/view/manage tasks
   - JSON-based persistence

## Data Flow

### Single Task Execution

```
User/System
    │
    ▼
AgentOrchestrator.get_agent("research")
    │
    ▼
Agent.execute("What is AI?")
    │
    ▼
Provider.generate(prompt, max_tokens=150, temperature=0.5)
    │
    ▼
LLM (Ollama/Claude/OpenAI)
    │
    ▼
Response returned to user
```

### Continuous Execution

```
ContinuousAgent.start()
    │
    ▼
Background Thread Loop:
    │
    ├─ Check task queue
    │   │
    │   ├─ If empty: Generate new task
    │   │
    │   └─ If has tasks: Get next task
    │
    ├─ Agent.execute(task)
    │
    ├─ Store result
    │
    ├─ Callback (if configured)
    │
    └─ Sleep (interval) → Loop
```

## Configuration System

### Environment Variables

```bash
# Ollama (optional - has defaults)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:0.5b

# Claude (required for ClaudeProvider)
ANTHROPIC_API_KEY=your_key_here

# OpenAI (required for OpenAICompatibleProvider)
OPENAI_API_KEY=your_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# GitHub Integration (optional)
GITHUB_TOKEN=your_token
GITHUB_REPO_OWNER=Scarmonit
GITHUB_REPO_NAME=LLM
```

### Agent Configuration

```python
AgentConfig(
    name="research",
    description="Information gathering and analysis",
    temperature=0.5,      # 0.0-1.0, controls randomness
    max_tokens=150        # Maximum response length
)
```

## Extensibility Points

### Adding a New Provider

1. Create new file in `src/llm_framework/providers/`
2. Inherit from `BaseProvider`
3. Implement required methods:
   - `generate()`
   - `is_available()`
   - `get_name()`
4. Add to orchestrator's provider list

Example:
```python
from llm_framework.core.base_provider import BaseProvider

class MyProvider(BaseProvider):
    def generate(self, prompt, max_tokens=150, temperature=0.7):
        # Implementation
        pass
    
    def is_available(self):
        # Check if provider is ready
        pass
    
    def get_name(self):
        return "my_provider"
```

### Adding a New Agent

1. Create new file in `src/llm_framework/agents/`
2. Create `AgentConfig` with specific parameters
3. Add to orchestrator's agent setup

Example:
```python
from llm_framework.core.agent import Agent, AgentConfig

def create_translation_agent(provider):
    config = AgentConfig(
        name="translation",
        description="Language translation tasks",
        temperature=0.4,
        max_tokens=200
    )
    return Agent(config, provider)
```

## Testing Architecture

### Unit Tests (30 tests)

Located in `tests/`:

1. **test_base_provider.py** (4 tests)
   - Provider interface compliance
   - Abstract method enforcement

2. **test_agent.py** (7 tests)
   - Agent execution
   - Configuration handling
   - History management

3. **test_orchestrator.py** (8 tests)
   - Provider discovery
   - Agent management
   - System status

4. **test_continuous_agent.py** (7 tests)
   - Background execution
   - Task queue operations
   - Auto-task generation

5. **test_github_integration.py** (4 tests)
   - Issue posting
   - Comment creation
   - Copilot mentions

### Integration Tests

- `run_real_agents.py` - Full system test
- `test_autonomous_system.py` - Autonomous agent verification
- `simple_working_demo.py` - Basic functionality

## Security Considerations

### API Key Handling
- ✅ Loaded from environment variables
- ✅ Never committed to repository
- ✅ Not logged or printed
- ✅ Lazy initialization (only when needed)

### Input Validation
- ✅ Prompts sanitized
- ✅ Max token limits enforced
- ✅ Temperature bounds checked
- ✅ Timeout limits applied

### Error Handling
- ✅ Provider failures caught
- ✅ Graceful degradation
- ✅ Clear error messages
- ✅ No sensitive data in errors

## Performance Characteristics

### Ollama (qwen2.5:0.5b)
- Latency: 2-5 seconds per request
- Throughput: 6-7 tasks/minute per agent
- Memory: ~500MB
- CPU: Moderate usage
- Scalability: Limited by CPU

### Claude API
- Latency: 1-3 seconds per request
- Throughput: Limited by API rate limits
- Memory: Minimal
- CPU: Minimal
- Scalability: Excellent (cloud-based)

### OpenAI API
- Latency: 1-3 seconds per request
- Throughput: Limited by API rate limits
- Memory: Minimal
- CPU: Minimal
- Scalability: Excellent (cloud-based)

## Design Decisions

### Why Abstract Provider Interface?
- Allows swapping LLM backends without changing agents
- Supports multiple providers simultaneously
- Easy to add new providers
- Provider-agnostic agent development

### Why Specialized Agents?
- Different tasks need different configurations
- Temperature tuning for task type
- Clear separation of concerns
- Easy to customize per use case

### Why Continuous Execution?
- Enables truly autonomous operation
- Background processing
- Always-ready agents
- Supports long-running tasks

### Why Task Queue System?
- User control over agent work
- Persistent task storage
- Clear audit trail
- Prevents busywork generation

## Future Architecture Considerations

### Potential Enhancements
1. **Multi-provider agent** - Single agent using multiple LLMs
2. **Agent collaboration** - Agents working together on complex tasks
3. **Result caching** - Store and reuse similar responses
4. **Load balancing** - Distribute across multiple provider instances
5. **Priority queues** - Urgent vs normal task handling

### Scalability Path
1. Single machine → Multiple agents
2. Multiple agents → Multiple providers
3. Multiple providers → Distributed system
4. Distributed system → Cloud deployment

---

**This architecture is designed to be simple, extensible, and maintainable.**

Last Updated: 2025-11-15
