# CLAUDE.md - AI Assistant Guide for LLM Multi-Provider Framework

> **Purpose**: Comprehensive guide for AI assistants (Claude, GitHub Copilot, etc.) working on this repository. Read this file FIRST before making any changes.

**Last Updated**: 2025-11-16
**Repository**: LLM Multi-Provider Framework
**License**: MIT

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Quick Start for AI Assistants](#quick-start-for-ai-assistants)
3. [Codebase Architecture](#codebase-architecture)
4. [Development Workflows](#development-workflows)
5. [Key Conventions](#key-conventions)
6. [Testing Strategy](#testing-strategy)
7. [GitHub Automation](#github-automation)
8. [Common Tasks](#common-tasks)
9. [Critical Rules](#critical-rules)
10. [Lessons Learned](#lessons-learned)

---

## Repository Overview

### What This Repository Does

This is an **autonomous AI orchestration system** that enables running multiple AI agents continuously using various LLM providers. Think of it as a framework for building and deploying AI agents that can work independently or collaboratively on tasks.

**Core Capabilities:**
- **Multi-Provider Support**: Seamlessly switch between Claude, Ollama, OpenAI, or any compatible LLM
- **Autonomous Agents**: Continuous execution with task queue management
- **GitHub Integration**: Automated PR review, creation, and merging
- **Extensible Design**: Easy to add new providers, agents, and capabilities
- **Production Ready**: Deployment via Docker, systemd, or PM2

### Project Statistics

- **Python Files**: 24 source files, 9 test files
- **Test Coverage**: 30+ tests, all passing
- **Code Quality**: Pylint score 9.52/10
- **Security**: CodeQL enabled, 0 vulnerabilities
- **Documentation**: 8 major documentation files
- **CI/CD**: 7 GitHub Actions workflows

### Key Technologies

- **Language**: Python 3.11+
- **LLM Providers**: Anthropic Claude, Ollama, OpenAI
- **Testing**: pytest
- **Code Quality**: pylint, black
- **Deployment**: Docker, systemd, PM2
- **CI/CD**: GitHub Actions

---

## Quick Start for AI Assistants

### Before You Start ANY Work

Read these files in order:

1. **`.github/copilot-instructions.md`** - Repository-specific instructions and rules
2. **`CLAUDE.md`** (this file) - Comprehensive AI assistant guide
3. **`docs/LESSONS_LEARNED.md`** - Past mistakes to avoid
4. **`docs/CURRENT_STATE.md`** - Current system status
5. **`docs/ARCHITECTURE.md`** - System design and component relationships
6. **`CONTRIBUTING.md`** - Contribution guidelines and task scoping

### Essential Pre-flight Checks

Before making changes:

```bash
# 1. Check current state
cat docs/CURRENT_STATE.md

# 2. Verify environment
python --version          # Should be 3.11+
which pytest             # Should be installed
which pylint             # Should be installed

# 3. Run existing tests
python -m pytest tests/ -v

# 4. Check code quality baseline
pylint src/llm_framework/ --rcfile=.pylintrc
```

### First-Time Setup

If this is your first session:

```bash
# Install dependencies
pip install -r requirements.txt

# Verify installation
python -m pytest tests/ -v

# (Optional) Install Ollama for local LLM
# Check docs/CURRENT_STATE.md first - may already be installed!
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull qwen2.5:0.5b
```

---

## Codebase Architecture

### Directory Structure

```
LLM/
├── src/llm_framework/          # Main framework code
│   ├── core/                   # Base abstractions
│   │   ├── base_provider.py   # Abstract LLM provider interface
│   │   └── agent.py            # Agent base class and configuration
│   ├── providers/              # LLM provider implementations
│   │   ├── claude_provider.py
│   │   ├── ollama_provider.py
│   │   ├── openai_compatible_provider.py
│   │   ├── intelligent_mock_provider.py  # Testing only
│   │   └── mock_provider.py               # Testing only
│   ├── agents/                 # Specialized agent implementations
│   │   └── code_review_agent.py
│   ├── scripts/                # Utility scripts
│   │   ├── create_pr.py
│   │   ├── auto_review_pr.py
│   │   ├── auto_merge_pr.py
│   │   └── check_pr_status.py
│   ├── orchestrator.py         # Agent lifecycle management
│   ├── continuous_agent.py     # Continuous execution engine
│   ├── autonomous_agent.py     # Autonomous task discovery
│   └── github_integration.py   # GitHub API integration
├── tests/                      # Test suite
│   ├── test_agent.py
│   ├── test_base_provider.py
│   ├── test_orchestrator.py
│   ├── test_continuous_agent.py
│   └── test_github_integration.py
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── CURRENT_STATE.md
│   ├── LESSONS_LEARNED.md
│   ├── PR_AUTOMATION.md
│   └── COPILOT_GUIDE.md
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD pipelines
│   │   ├── tests.yml
│   │   ├── pylint.yml
│   │   ├── ai-review.yml
│   │   ├── auto-merge.yml
│   │   └── docker-build.yml
│   ├── ISSUE_TEMPLATE/         # Structured issue templates
│   │   ├── bug_fix.md
│   │   ├── feature_request.md
│   │   ├── refactoring.md
│   │   └── documentation.md
│   ├── PULL_REQUEST_TEMPLATE/
│   │   └── pull_request_template.md
│   ├── copilot-instructions.md
│   └── agents/
│       └── my-agent.agent.md
├── deployment/                 # Deployment configurations
│   ├── systemd/
│   ├── pm2/
│   └── DEPLOYMENT.md
├── run_real_agents.py          # ⭐ Main production runner
├── run_continuous.py
├── run_truly_autonomous.py
├── task_queue.py
└── requirements.txt
```

### Core Components

#### 1. Provider Layer (`src/llm_framework/providers/`)

**Purpose**: Abstract LLM access across different services

**Base Class**: `BaseProvider`
- Abstract methods: `generate()`, `is_available()`, `get_provider_name()`
- All providers must implement this interface

**Available Providers**:
1. **OllamaProvider** - Local LLM (default: qwen2.5:0.5b)
2. **ClaudeProvider** - Anthropic API (requires `ANTHROPIC_API_KEY`)
3. **OpenAICompatibleProvider** - OpenAI or compatible APIs
4. **IntelligentMockProvider** - Testing only (NOT for production)

**Provider Selection Priority**:
1. Ollama (if installed and running)
2. Claude (if API key provided)
3. OpenAI (if API key provided)
4. Mock (fallback for testing - should never be used in production)

#### 2. Agent Layer (`src/llm_framework/core/agent.py`)

**Purpose**: Specialized task execution with specific configurations

**Key Classes**:
- `Agent`: Base agent implementation
- `AgentConfig`: Configuration (name, description, temperature, max_tokens)

**Pre-configured Agents**:
- **ResearchAgent**: Temperature 0.5 (balanced) - information gathering
- **CodingAgent**: Temperature 0.3 (deterministic) - code generation
- **WritingAgent**: Temperature 0.8 (creative) - content creation

#### 3. Orchestration Layer

**AgentOrchestrator** (`orchestrator.py`):
- Discovers and manages available providers
- Initializes and manages agents
- Provides system status

**ContinuousAgent** (`continuous_agent.py`):
- Background thread execution
- Task queue management
- Auto-task generation
- Graceful shutdown

**AutonomousAgent** (`autonomous_agent.py`):
- Autonomous work discovery (code analysis, documentation checking)
- Not busywork generation

#### 4. GitHub Integration (`github_integration.py`)

- Create/review/merge pull requests
- Post comments and updates
- Check PR status and validation
- Integration with GitHub Copilot

### Data Flow

**Single Task Execution**:
```
User Input
    ↓
AgentOrchestrator.get_agent("research")
    ↓
Agent.execute("What is AI?")
    ↓
Provider.generate(prompt, temperature=0.5)
    ↓
LLM (Ollama/Claude/OpenAI)
    ↓
Response → User
```

**Continuous Execution**:
```
ContinuousAgent.start()
    ↓
Background Thread Loop:
    ├─ Check task queue
    ├─ Execute task via Agent
    ├─ Store result
    ├─ Callback (if configured)
    └─ Sleep → Repeat
```

---

## Development Workflows

### Issue-Driven Development

This repository uses **structured issue templates** to ensure clear, actionable tasks.

#### Creating an Issue

1. Choose appropriate template from `.github/ISSUE_TEMPLATE/`:
   - `bug_fix.md` - For bugs and fixes
   - `feature_request.md` - For new features
   - `refactoring.md` - For code improvements
   - `documentation.md` - For documentation updates

2. Fill out ALL sections:
   - Problem statement or user story
   - Acceptance criteria (measurable)
   - Affected files (specific paths)
   - Complexity estimate (small/medium/large)
   - Testing strategy

3. **Good Example**:
   ```markdown
   Title: [BUG] OllamaProvider timeout on responses >1000 tokens

   Problem: When processing large responses (>1000 tokens), OllamaProvider
   times out after 30 seconds, causing agent execution to fail.

   Acceptance Criteria:
   - Timeout increased to 120s for large requests
   - Add exponential backoff retry logic (3 attempts)
   - Tests verify timeout handling
   - No regression in normal responses

   Affected Files:
   - src/llm_framework/providers/ollama_provider.py (lines 45-67)
   - tests/test_ollama_provider.py (add timeout tests)

   Complexity: Small (single file, ~30 lines changed)
   ```

4. **Bad Example** (DO NOT DO THIS):
   ```markdown
   Title: Fix timeouts
   Description: The provider times out sometimes. Please fix it.
   ```

See `CONTRIBUTING.md` for more examples and guidelines.

### Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name
# OR for bug fixes
git checkout -b fix/bug-description

# 2. Make changes incrementally
# (Make small changes, test frequently)

# 3. Run tests after each change
python -m pytest tests/ -v

# 4. Check code quality
pylint src/llm_framework/ --rcfile=.pylintrc

# 5. Commit with clear messages
git add .
git commit -m "Add retry logic to OllamaProvider

- Implement exponential backoff (1s, 2s, 4s)
- Add tests for timeout scenarios
- Update documentation

Fixes #123"

# 6. Push to remote
git push -u origin feature/your-feature-name
```

### Pull Request Workflow

1. **Create PR** using template (`.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`)
2. **Fill checklist**:
   - [ ] Tests pass
   - [ ] Code quality checks pass (pylint)
   - [ ] Documentation updated
   - [ ] Real verification performed (not mock)
   - [ ] Security scan clean
3. **Link to issue**: "Fixes #123" or "Closes #456"
4. **Request review** (or assign to @copilot)
5. **Address feedback** if needed
6. **Auto-merge** when all checks pass (if `auto-merge` label is set)

### Auto-Merge System

This repository has automated PR merging:

**Requirements for Auto-Merge**:
- PR is not in draft mode
- All CI checks passed (tests, pylint, docker build)
- No merge conflicts
- PR has `auto-merge` label
- AI Code Review workflow succeeded (informational)

**How It Works**:
1. Create PR
2. Mark as "ready for review" (not draft)
3. Add `auto-merge` label
4. Enable "Auto-merge" in GitHub UI (Squash and merge)
5. When all checks pass → PR auto-merges

See `.github/workflows/auto-merge.yml` for details.

---

## Key Conventions

### Code Style

**Python Style Guide**:
- Follow PEP 8
- Maximum line length: 100 characters (reasonable exceptions allowed)
- Use type hints where helpful
- Descriptive variable names
- Docstrings for all public methods

**Example**:
```python
def generate_response(self, prompt: str, temperature: float = 0.7) -> str:
    """Generate a response from the LLM.

    Args:
        prompt: The input prompt
        temperature: Sampling temperature (0.0-1.0)

    Returns:
        Generated response text

    Raises:
        ProviderError: If generation fails
    """
    pass
```

### Error Handling

**Good**:
```python
try:
    response = self._make_request(prompt)
except requests.Timeout as e:
    raise ProviderError(f"Request timed out after {self.timeout}s") from e
```

**Bad**:
```python
try:
    response = self._make_request(prompt)
except:  # Too broad, silent failure
    pass
```

### Logging

```python
import logging

logger = logging.getLogger(__name__)

# Use appropriate levels
logger.debug("Detailed diagnostic information")
logger.info("General informational messages")
logger.warning("Warning messages")
logger.error("Error messages")
```

### Environment Variables

All configuration via environment variables (never hardcoded):

```python
import os

# Provider configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# GitHub integration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
GITHUB_REPO_NAME = os.getenv("GITHUB_REPO_NAME")
```

### File Organization

- One class per file (generally)
- Group related functions together
- Imports: stdlib → third-party → local
- Docstrings for all public methods

---

## Testing Strategy

### Test Structure

```
tests/
├── test_base_provider.py      # Provider interface tests
├── test_agent.py              # Agent execution tests
├── test_orchestrator.py       # Orchestration tests
├── test_continuous_agent.py   # Continuous execution tests
├── test_github_integration.py # GitHub API tests
└── ...
```

### Running Tests

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_agent.py -v

# Run specific test
python -m pytest tests/test_agent.py::test_agent_execution -v

# Run with coverage
python -m pytest tests/ --cov=src/llm_framework --cov-report=html
```

### Writing Tests

**Unit Test Example**:
```python
import pytest
from llm_framework.core.agent import Agent, AgentConfig
from llm_framework.providers.mock_provider import MockProvider

def test_agent_execution():
    """Test that agent executes tasks correctly."""
    provider = MockProvider()
    config = AgentConfig(
        name="test-agent",
        description="Test agent",
        temperature=0.7
    )
    agent = Agent(config, provider)

    result = agent.execute("Test task")

    assert result is not None
    assert len(result) > 0
```

**Integration Test Example**:
```python
def test_agent_with_real_provider():
    """Test agent with real Ollama provider."""
    # Only runs if Ollama is available
    provider = OllamaProvider(model="qwen2.5:0.5b")
    if not provider.is_available():
        pytest.skip("Ollama not available")

    agent = Agent("test", provider)
    result = agent.execute("What is 2+2?")

    assert result is not None
    assert len(result) > 0
```

### Test Coverage Goals

- Aim for >80% coverage for new code
- 100% coverage for critical paths
- Test edge cases and error conditions
- No mock data for final verification (use real providers when possible)

### CI Testing

All tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

See `.github/workflows/tests.yml`

---

## GitHub Automation

### Workflows

This repository has 7 automated workflows:

#### 1. Tests (`tests.yml`)
- Runs on: PR, push to main
- Actions: Install dependencies, run pytest
- Status: Required for merge

#### 2. Pylint (`pylint.yml`)
- Runs on: PR, push to main
- Actions: Code quality checks
- Target: Score >8.0/10
- Status: Required for merge

#### 3. AI Code Review (`ai-review.yml`)
- Runs on: PR opened/updated
- Actions: Generate diff, invoke external AI review systems
- Supports: Claude webhook, Gemini webhook
- Status: Informational (not blocking)

#### 4. Auto-Merge Gate (`auto-merge.yml`)
- Runs on: PR events, check completions
- Actions: Validate PR readiness, auto-merge if conditions met
- Conditions: All checks pass, not draft, no conflicts, has label
- Status: Controls auto-merge

#### 5. Docker Build (`docker-build.yml`)
- Runs on: PR, push to main
- Actions: Build and test Docker image
- Status: Required for merge

#### 6. Auto Review (`auto-review.yml`)
- Runs on: PR opened
- Actions: Automated code review with GitHub Copilot
- Status: Informational

### GitHub Copilot Integration

This repository is optimized for GitHub Copilot:

**Custom Instructions**: `.github/copilot-instructions.md`
- Repository-specific guidance
- Task understanding templates
- Verification procedures

**Custom Agent**: `.github/agents/my-agent.agent.md`
- LLM Framework Expert agent
- Domain-specific help

**MCP Servers** (in DevContainer):
- playwright: Browser automation
- github-mcp-server: Enhanced Git operations

### Issue Templates

Located in `.github/ISSUE_TEMPLATE/`:
- `bug_fix.md` - Structured bug reports
- `feature_request.md` - Feature proposals with user stories
- `refactoring.md` - Code improvement requests
- `documentation.md` - Documentation updates

### PR Template

Located in `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`

**Required Sections**:
- Description of changes
- Related issue links
- Type of change (bug fix, feature, docs, etc.)
- Testing performed with results
- Code quality verification
- Documentation updates
- Security considerations

---

## Common Tasks

### Adding a New LLM Provider

1. Create new file in `src/llm_framework/providers/`
2. Inherit from `BaseProvider`
3. Implement required methods:

```python
from llm_framework.core.base_provider import BaseProvider

class MyProvider(BaseProvider):
    def generate(self, prompt: str, **kwargs) -> str:
        """Generate response from LLM."""
        # Implementation
        pass

    def is_available(self) -> bool:
        """Check if provider is available."""
        # Check API key, connectivity, etc.
        pass

    def get_provider_name(self) -> str:
        """Return provider name."""
        return "my_provider"
```

4. Add to orchestrator's provider list in `orchestrator.py`
5. Add tests in `tests/test_my_provider.py`
6. Update documentation

### Adding a New Agent

1. Create `AgentConfig` with specific parameters:

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

2. (Optional) Create specialized agent class in `src/llm_framework/agents/`
3. Add to orchestrator's agent setup
4. Add tests
5. Update documentation

### Adding a New Feature

Follow this workflow:

1. **Create Issue** using `feature_request.md` template
2. **Create Branch**: `git checkout -b feature/feature-name`
3. **Implement Feature**:
   - Write code following conventions
   - Add tests (aim for >80% coverage)
   - Update documentation
4. **Verify**:
   ```bash
   python -m pytest tests/ -v
   pylint src/llm_framework/ --rcfile=.pylintrc
   ```
5. **Create PR** using PR template
6. **Address Review** feedback
7. **Merge** when approved

### Fixing a Bug

1. **Create Issue** using `bug_fix.md` template
2. **Create Branch**: `git checkout -b fix/bug-description`
3. **Write Test** that reproduces the bug
4. **Fix Bug** (test should now pass)
5. **Verify** no regressions:
   ```bash
   python -m pytest tests/ -v
   ```
6. **Create PR** and link to issue
7. **Merge** when approved

### Refactoring Code

1. **Create Issue** using `refactoring.md` template
2. **Create Branch**: `git checkout -b refactor/component-name`
3. **Refactor** while keeping tests passing
4. **Verify** no behavior change:
   ```bash
   # All tests should still pass
   python -m pytest tests/ -v

   # Code quality should improve
   pylint src/llm_framework/ --rcfile=.pylintrc
   ```
5. **Document** what was improved and why
6. **Create PR**
7. **Merge** when approved

### Updating Documentation

1. **Create Issue** using `documentation.md` template (or just update directly)
2. **Update** relevant files:
   - `README.md` - User-facing changes
   - `docs/ARCHITECTURE.md` - Design changes
   - `docs/CURRENT_STATE.md` - System status
   - `docs/LESSONS_LEARNED.md` - New insights
   - Code docstrings - API changes
3. **Verify** links and formatting
4. **Create PR** (if significant changes)
5. **Merge**

---

## Critical Rules

### DO NOT

❌ **Use mock data and claim it's "real"**
- MockProvider is for testing only
- Never use in production verification
- User explicitly requested no mock data

❌ **Skip systematic review before making changes**
- Always understand existing code first
- Test each layer independently
- Identify root cause, not symptoms

❌ **Build infrastructure without testing basics**
- Verify foundation works first
- Don't create deployment configs for broken code
- Test incrementally

❌ **Claim success without verification**
- "Working" means user can run it and see results
- Show actual output, not just metrics
- No false claims or theoretical success

❌ **Auto-generate busywork tasks**
- Autonomous means finding USEFUL work
- Not self-generated meaningless tasks
- User control or value creation only

❌ **Ignore past mistakes**
- Read `docs/LESSONS_LEARNED.md` before starting
- Don't repeat documented failures
- Update lessons learned when discovering new patterns

❌ **Make changes without documenting**
- Update `docs/CURRENT_STATE.md` in real-time
- Document installations immediately
- Commit documentation updates

❌ **Install dependencies without checking first**
- Check `docs/CURRENT_STATE.md` for existing installations
- Verify on system before reinstalling
- Document immediately after installation

### DO

✅ **Read documentation first**
- `.github/copilot-instructions.md`
- `CLAUDE.md` (this file)
- `docs/LESSONS_LEARNED.md`
- `docs/CURRENT_STATE.md`
- `docs/ARCHITECTURE.md`

✅ **Use available resources**
- Install real dependencies (Ollama, packages)
- Check `requirements.txt` for packages
- Don't create workarounds for installable tools

✅ **Test incrementally**
- Run tests after each change
- Verify with real data when possible
- Show actual output

✅ **Be honest about limitations**
- Admit when something doesn't work
- State clearly what's needed
- No false claims or defensive behavior

✅ **Update documentation**
- `docs/CURRENT_STATE.md` - after any changes
- `docs/LESSONS_LEARNED.md` - after learning something new
- Code docstrings - when changing APIs
- README.md - when user-facing changes

✅ **Follow systematic approach**
- Understand → Plan → Implement → Test → Document
- Small changes, frequent testing
- Clear communication

---

## Lessons Learned

### Key Insights from Past Work

#### Session History

This repository has gone through multiple development sessions. Key lessons:

##### Session 1: Foundation Building
**Mistake**: Built complex infrastructure (Docker, systemd, PM2) before verifying basic agent execution worked.

**Lesson**: Test basics first. Don't build on broken foundation.

##### Session 2: Mock vs Real Data
**Mistake**: Used MockProvider and claimed agents were "working with real LLM".

**Lesson**: If user says no mock, NO MOCK. Be honest about what's really running.

##### Session 3: Documentation Is Critical
**Mistake**: Installed Ollama 5+ times in same session without documenting.

**Lesson**: DOCUMENT EVERY ACTION IN REAL-TIME. Check `docs/CURRENT_STATE.md` before installations.

##### Session 4: Code Quality Matters
**Success**: Used automated tools (black, pylint) to improve code quality from 8.0 to 9.52.

**Lesson**: Automated tools save time. Test after every change. Accept reasonable remaining issues.

##### Session 5: Structured Templates Enable AI
**Success**: Created issue/PR templates with clear acceptance criteria, examples, and complexity indicators.

**Lesson**: Templates are communication protocols. Good examples > abstract rules. Structure enables better AI assistance.

### What "Working" Actually Means

**NOT working**:
- Tests pass ✗
- Metrics show numbers ✗
- Code exists ✗
- Claims made ✗

**IS working**:
- User runs command ✓
- Sees real output ✓
- Real LLM responses ✓
- Can verify themselves ✓

### What "Autonomous" Actually Means

**NOT autonomous**:
- Auto-generates own tasks ✗
- Loops doing busywork ✗
- No user control ✗

**IS autonomous**:
- Finds useful work (code analysis) ✓
- OR processes user tasks ✓
- Creates value ✓

### Anti-Patterns to Avoid

#### The "Trust Me" Pattern ❌
```
"Agents are working!"
"Tests pass!"
"Everything operational!"
```
Without showing actual proof → FAILS

#### The "Mock is Real" Pattern ❌
```
"Using MockLLMProvider (real implementation)"
```
If it's mock, it's NOT real → FAILS

#### The "Metrics Prove Success" Pattern ❌
```
"Iterations=6, Pending=2, Results=6"
```
Numbers without context → MEANINGLESS

#### The "Infrastructure First" Pattern ❌
```
Building: Docker, systemd, PM2, GitHub integration
Before: Basic agent execution works
```
Complex systems on broken foundation → FAILS

### Success Patterns to Follow

#### The "Show Don't Tell" Pattern ✅
```python
print("Task: What is AI?")
result = agent.execute("What is AI?")
print(f"Response: {result}")
```
Actual visible output → WORKS

#### The "Install Don't Workaround" Pattern ✅
```bash
# Don't create mock
# DO install real tool
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull qwen2.5:0.5b
```
Use real dependencies → WORKS

#### The "Test Then Build" Pattern ✅
```
1. Test: Does basic agent work?
2. Test: Can it use LLM?
3. Test: Can it run continuously?
4. Build: Add features
```
Foundation first → WORKS

See `docs/LESSONS_LEARNED.md` for complete history.

---

## Verification Checklist

Before claiming any work is complete:

### Code Changes
- [ ] All tests pass: `python -m pytest tests/ -v`
- [ ] Code quality maintained: `pylint src/llm_framework/ --rcfile=.pylintrc`
- [ ] No new security issues: Check CodeQL results
- [ ] Real verification performed (not mock data)
- [ ] Documentation updated

### New Features
- [ ] Tests written (>80% coverage)
- [ ] Integration tests if applicable
- [ ] Documentation updated (README, ARCHITECTURE)
- [ ] Examples provided
- [ ] Edge cases handled

### Bug Fixes
- [ ] Test reproduces bug before fix
- [ ] Test passes after fix
- [ ] No regressions in other tests
- [ ] Root cause documented
- [ ] Prevention strategy noted

### Documentation Updates
- [ ] Accurate and up-to-date
- [ ] Links verified
- [ ] Examples tested
- [ ] Formatting correct
- [ ] Cross-references updated

### Before Creating PR
- [ ] Branch up-to-date with main
- [ ] All commits have clear messages
- [ ] PR template filled completely
- [ ] Issue linked (Fixes #123)
- [ ] Ready for review (not draft)

### After PR Merged
- [ ] Delete feature branch
- [ ] Update `docs/CURRENT_STATE.md`
- [ ] Update `docs/LESSONS_LEARNED.md` if applicable
- [ ] Verify deployment if needed

---

## Environment Variables Reference

### LLM Provider Configuration

```bash
# Anthropic Claude
export ANTHROPIC_API_KEY=your_key_here

# Ollama (local)
export OLLAMA_BASE_URL=http://localhost:11434  # Default
export OLLAMA_MODEL=qwen2.5:0.5b              # Default

# OpenAI or compatible
export OPENAI_API_KEY=your_key_here
export OPENAI_BASE_URL=https://api.openai.com/v1  # Default
```

### GitHub Integration

```bash
export GITHUB_TOKEN=your_github_token
export GITHUB_REPO_OWNER=Scarmonit
export GITHUB_REPO_NAME=LLM
```

### Deployment

```bash
# See deployment/DEPLOYMENT.md for deployment-specific variables
```

---

## Quick Reference Commands

### Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest tests/ -v

# Check code quality
pylint src/llm_framework/ --rcfile=.pylintrc

# Format code
black src/ tests/

# Run main production system
python run_real_agents.py

# Run continuous agents
python run_continuous.py --agent all --interval 60

# Task queue management
python task_queue.py add "Your task here"
python task_queue.py list
```

### Git Operations

```bash
# Create feature branch
git checkout -b feature/feature-name

# Check status
git status

# Commit changes
git add .
git commit -m "Clear, descriptive message"

# Push to remote
git push -u origin feature/feature-name

# Update from main
git fetch origin main
git rebase origin/main
```

### GitHub CLI (if available)

```bash
# Create PR
gh pr create --title "Title" --body "Description"

# Check PR status
gh pr status

# Merge PR
gh pr merge 123 --squash
```

---

## Getting Help

### Documentation Resources

- **README.md** - User-facing documentation
- **CONTRIBUTING.md** - Contribution guidelines
- **docs/ARCHITECTURE.md** - System design
- **docs/CURRENT_STATE.md** - Current status
- **docs/LESSONS_LEARNED.md** - Past mistakes and insights
- **docs/PR_AUTOMATION.md** - PR automation guide
- **docs/COPILOT_GUIDE.md** - Copilot best practices

### Common Questions

**Q: How do I verify if Ollama is installed?**
```bash
which ollama
ollama list
```
If not installed, check `docs/CURRENT_STATE.md` first.

**Q: Tests are failing. What should I do?**
1. Read error messages carefully
2. Check if dependencies are installed
3. Verify environment variables are set
4. Run specific failing test with `-v` flag
5. Check `docs/LESSONS_LEARNED.md` for similar issues

**Q: How do I add a new LLM provider?**
See "Adding a New LLM Provider" in Common Tasks section above.

**Q: Can I use MockProvider for verification?**
NO. MockProvider is for unit tests only. Use real providers (Ollama, Claude, OpenAI) for verification.

**Q: How do I know if my changes are good enough?**
- All tests pass
- Pylint score maintained or improved
- Real verification with actual LLM
- Documentation updated
- User can reproduce results

---

## Final Checklist for AI Assistants

Before completing ANY task:

- [ ] I have read `.github/copilot-instructions.md`
- [ ] I have read this file (`CLAUDE.md`)
- [ ] I have checked `docs/CURRENT_STATE.md`
- [ ] I have reviewed `docs/LESSONS_LEARNED.md`
- [ ] I understand the task acceptance criteria
- [ ] I have tested my changes with real data (not mock)
- [ ] All tests pass
- [ ] Code quality is maintained
- [ ] Documentation is updated
- [ ] I can show visible proof of functionality
- [ ] User can verify the results themselves

---

## Conclusion

This repository is a production-ready autonomous AI framework with:
- Clear architecture and abstractions
- Comprehensive testing and CI/CD
- Extensive documentation and guidelines
- Structured workflows and automation
- Battle-tested patterns and lessons learned

**Remember**: Systematic approach, honest verification, real tools, and clear documentation are the keys to success.

**When in doubt**: Read the documentation, test incrementally, and show real results.

---

**Last Updated**: 2025-11-16
**Maintainer**: LLM Multi-Provider Framework Team
**License**: MIT

For questions or improvements to this guide, please create an issue using the `documentation.md` template.
