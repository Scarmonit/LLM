# Quick Start Guide

> **Goal:** Get up and running with the LLM Multi-Provider Framework in under 20 minutes.

**New to the project?** This guide will help you:
- Set up your development environment
- Run your first autonomous agent
- Understand what's happening under the hood
- Know where to go next

---

## 1. Prerequisites (5 minutes)

Before you begin, ensure you have:

### Required
- **Python 3.8+** - Check with `python --version` or `python3 --version`
- **pip** - Python package manager (usually comes with Python)
- **Git** - For cloning the repository
- **Virtual environment** - Recommended for dependency isolation

### Optional (for real LLM providers)
- **Ollama** (recommended for local development) - Install from [ollama.ai](https://ollama.ai)
- **Anthropic API Key** - For Claude provider ([get one here](https://console.anthropic.com))
- **OpenAI API Key** - For OpenAI provider ([get one here](https://platform.openai.com))

### Quick System Check
```bash
# Check Python version (should be 3.8+)
python --version

# Check pip is available
pip --version

# Check Git is installed
git --version
```

**Note:** The framework can run with a mock provider for testing, so you can get started immediately without API keys or Ollama.

---

## 2. Installation (2 minutes)

### Clone the Repository
```bash
git clone https://github.com/Scarmonit/LLM.git
cd LLM
```

### Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed anthropic-0.7.0 requests-2.31.0 pydantic-2.0.0 ...
```

### Verify Installation
```bash
# Run tests to confirm everything is working
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
python -m pytest tests/ -v
```

**Expected:** All tests should pass (55 tests as of this writing).

✅ **Installation complete!** You're ready to run your first agent.

---

## 3. First Agent Run (3 minutes)

### Run the Simple Demo

The easiest way to see the framework in action:

```bash
python simple_working_demo.py
```

**Expected output:**
```
================================================================================
  LLM Multi-Provider Framework - Simple Demo
================================================================================

Started: 2025-11-20 12:00:00
Duration: 60 seconds
Mode: Continuous agent demonstration

⚠  No API keys found
  Using intelligent mock to demonstrate concept
  For real LLM: export ANTHROPIC_API_KEY=your_key

Setting up framework...
✓ Provider: intelligent_mock
✓ Agents: research, coding, writing

================================================================================
  Running Agent - Watch It Work
================================================================================

Agent will:
  1. Receive a task
  2. Process it with LLM
  3. Return result
  4. Repeat every 20 seconds for 1 minute

[Task 1] 12:00:05
  Question: Explain what an autonomous AI agent is in one sentence
  Processing... done (0.1s)
  Answer: An autonomous AI agent is a software system that can independently...
```

### What's Happening?

1. **Framework Setup**: The orchestrator discovers available providers and initializes agents
2. **Agent Selection**: A research agent is selected (optimized for factual accuracy)
3. **Task Processing**: The agent receives tasks and processes them using the LLM
4. **Continuous Operation**: Tasks are processed every 20 seconds for demonstration

### Understanding the Output

- **Provider**: Which LLM backend is being used (mock, ollama, claude, openai)
- **Agents**: Available specialized agents (research, coding, writing, code_review)
- **Tasks**: Questions or tasks submitted to the agent
- **Answers**: Responses from the LLM provider

**Note:** The demo uses a mock provider by default. To use a real LLM, see the next section.

---

## 4. Adding a Provider (5 minutes)

The framework supports multiple LLM providers. Choose one based on your needs:

### Option A: Ollama (Recommended - Local & Free)

**Best for:** Local development, no API costs, privacy

1. **Install Ollama** (if not already installed):
   ```bash
   # Linux/Mac
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Or download from https://ollama.ai
   ```

2. **Pull a Model**:
   ```bash
   # Small, fast model (recommended for testing)
   ollama pull qwen2.5:0.5b
   
   # Or use a larger model
   ollama pull llama2
   ```

3. **Verify Ollama is Running**:
   ```bash
   ollama list
   ```
   
   **Expected output:**
   ```
   NAME              ID              SIZE     MODIFIED
   qwen2.5:0.5b     abc123...       397MB    2 minutes ago
   ```

4. **Run with Ollama**:
   ```bash
   python run_real_agents.py
   ```
   
   **Expected output:**
   ```
   ✓ Providers: ['ollama']
   ✓ Using REAL Ollama LLM (qwen2.5:0.5b)
   ✓ Agents: ['research', 'coding', 'writing']
   
   [Status Report]
     research   | Running=True  | Completed=  2 | Results=  2
     coding     | Running=True  | Completed=  1 | Results=  1
     writing    | Running=True  | Completed=  2 | Results=  2
   ```

### Option B: Claude (Cloud-based)

**Best for:** Production use, high-quality responses

1. **Get API Key**: Sign up at [console.anthropic.com](https://console.anthropic.com)

2. **Set Environment Variable**:
   ```bash
   export ANTHROPIC_API_KEY=your_api_key_here
   ```

3. **Run the Demo**:
   ```bash
   python simple_working_demo.py
   ```
   
   **Expected output:**
   ```
   ✓ ANTHROPIC_API_KEY found - will use REAL Claude LLM
   ✓ Provider: claude
   ```

### Option C: OpenAI (Cloud-based)

**Best for:** OpenAI ecosystem, ChatGPT models

1. **Get API Key**: Sign up at [platform.openai.com](https://platform.openai.com)

2. **Set Environment Variable**:
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

3. **Run the Demo**:
   ```bash
   python simple_working_demo.py
   ```

### Provider Priority

The framework automatically selects the best available provider in this order:
1. **Ollama** (if installed and running)
2. **Claude** (if `ANTHROPIC_API_KEY` is set)
3. **OpenAI** (if `OPENAI_API_KEY` is set)
4. **Mock** (fallback for testing)

---

## 5. Running Tests (2 minutes)

### Run Full Test Suite
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
python -m pytest tests/ -v
```

**Expected output:**
```
tests/test_base_provider.py::test_base_provider_initialization PASSED    [ 1%]
tests/test_agent.py::test_agent_initialization PASSED                    [ 3%]
...
============================== 55 passed in 3.21s ==============================
```

### Run Specific Tests
```bash
# Test a specific file
python -m pytest tests/test_agent.py -v

# Test a specific function
python -m pytest tests/test_agent.py::test_agent_initialization -v

# Run with coverage
python -m pytest tests/ --cov=src/llm_framework --cov-report=term-missing
```

### Interpret Results

- ✅ **All tests passing**: Framework is working correctly
- ❌ **Some tests failing**: 
  - Check that dependencies are installed: `pip install -r requirements.txt`
  - Ensure Python version is 3.8+: `python --version`
  - Check that `PYTHONPATH` is set correctly

### Code Quality Check

```bash
# Run linting
pylint src/llm_framework/ --rcfile=.pylintrc
```

**Expected:** Score should be 9.0+ out of 10

---

## 6. Next Steps

Congratulations! 🎉 You now have a working LLM agent framework.

### Learn More

**Architecture & Design:**
- 📖 [ARCHITECTURE.md](ARCHITECTURE.md) - System design and component relationships
- 📖 [CURRENT_STATE.md](CURRENT_STATE.md) - Current system status and features

**Contributing:**
- 📖 [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute, task scoping guidelines
- 📖 [README.md](../README.md) - Full feature list and examples

**Advanced Topics:**
- 📖 [PR_AUTOMATION.md](PR_AUTOMATION.md) - Automated PR workflow
- 📖 [COPILOT_GUIDE.md](COPILOT_GUIDE.md) - GitHub Copilot enhancement features

### Try These Next

#### 1. Create a Custom Agent
```python
from llm_framework.core.agent import Agent, AgentConfig
from llm_framework.orchestrator import AgentOrchestrator

# Setup
orch = AgentOrchestrator()
orch.setup_default_providers()

# Create custom agent
config = AgentConfig(
    name="translator",
    description="Language translation specialist",
    temperature=0.4,
    max_tokens=200
)
provider = orch.list_providers()[0]
agent = Agent(config, orch._providers[provider])

# Use it
result = agent.execute("Translate 'Hello World' to Spanish")
print(result)
```

#### 2. Run Continuous Agents
```bash
# Run agents continuously with task queue
python run_task_queue_agents.py

# In another terminal, add tasks
python task_queue.py add research "What are the latest AI trends?"
python task_queue.py add coding "Explain Python decorators"
python task_queue.py queue
```

#### 3. GitHub Integration
```bash
# Set up environment
export GITHUB_TOKEN=your_github_token
export GITHUB_REPO_OWNER=your-username
export GITHUB_REPO_NAME=your-repo

# Run with GitHub integration
python run_continuous.py --agent research --issue-number 123
```

#### 4. Deploy to Production

See deployment options in [deployment/DEPLOYMENT.md](../deployment/DEPLOYMENT.md):
- Docker (recommended)
- systemd (Linux)
- PM2 (cross-platform)

### Common Tasks Reference

```bash
# Start agents with Ollama
python run_real_agents.py

# Run simple demo
python simple_working_demo.py

# Run tests
python -m pytest tests/ -v

# Check code quality
pylint src/llm_framework/

# Add task to queue
python task_queue.py add research "Your question here"

# View task queue
python task_queue.py queue
```

### Getting Help

- **Issues**: Found a bug? [Create an issue](https://github.com/Scarmonit/LLM/issues)
- **Discussions**: Questions or ideas? [Start a discussion](https://github.com/Scarmonit/LLM/discussions)
- **Contributing**: Want to help? See [CONTRIBUTING.md](../CONTRIBUTING.md)

### Troubleshooting

**Agents not starting?**
- Check Ollama is running: `ollama list`
- Verify Python version: `python --version` (should be 3.8+)
- Check dependencies: `pip install -r requirements.txt`

**Tests failing?**
- Set PYTHONPATH: `export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"`
- Reinstall dependencies: `pip install --upgrade -r requirements.txt`

**Provider not available?**
- Ollama: Install from [ollama.ai](https://ollama.ai)
- Claude/OpenAI: Check that API key environment variable is set

**Need more help?**
- Review [LESSONS_LEARNED.md](LESSONS_LEARNED.md) for common pitfalls
- Check [CURRENT_STATE.md](CURRENT_STATE.md) for system status
- Ask in [GitHub Discussions](https://github.com/Scarmonit/LLM/discussions)

---

**Total Time:** ~15-20 minutes from zero to running agents! 🚀

**Next:** Check out [ARCHITECTURE.md](ARCHITECTURE.md) to understand how everything works together.
