# Contributing to LLM Multi-Provider Framework

Thank you for your interest in contributing! This guide will help you create effective issues and pull requests, especially when working with GitHub Copilot coding agent.

## Table of Contents

- [Quick Start](#quick-start)
- [Task Scoping Guidelines](#task-scoping-guidelines)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Best Practices for Copilot Delegation](#best-practices-for-copilot-delegation)
- [Documentation Requirements](#documentation-requirements)
- [Getting Help](#getting-help)

## Quick Start

### Prerequisites

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your API keys if needed
```

### Run Tests

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_agent.py -v

# Check code quality
pylint src/ --rcfile=.pylintrc
```

### Verify Installation

```bash
# Test with Ollama (local, no API key needed)
python run_real_agents.py
```

## Task Scoping Guidelines

Well-scoped tasks lead to better results from both human contributors and AI assistants. Here's how to create clear, actionable issues.

### ✅ Good Task Scoping Examples

#### Example 1: Bug Fix - Well Scoped

```markdown
Title: [BUG] OllamaProvider timeout on responses >1000 tokens

Problem: When processing large responses (>1000 tokens), OllamaProvider 
times out after 30 seconds, causing agent execution to fail.

Reproduction:
1. Configure agent with OllamaProvider
2. Submit task requiring detailed response (>1000 tokens)
3. Observe timeout error after 30s

Acceptance Criteria:
- Timeout increased to 120s for large requests
- Add exponential backoff retry logic (3 attempts)
- Tests verify timeout handling for various response sizes
- No regression in normal (<1000 token) responses

Affected Files:
- src/llm_framework/providers/ollama_provider.py (lines 45-67)
- tests/test_ollama_provider.py (add timeout tests)

Complexity: Small (single file, ~30 lines changed)
```

**Why this is good:**
- Clear problem statement
- Specific reproduction steps
- Measurable acceptance criteria
- Identifies affected files
- Indicates complexity/scope

#### Example 2: Feature Request - Well Scoped

```markdown
Title: [FEATURE] Add streaming response support for Claude provider

User Story: As a developer using ClaudeProvider for long-running tasks,
I want to receive streaming responses so that I can show progress to users
instead of waiting for complete responses.

Proposed Solution:
- Add stream parameter to ClaudeProvider.generate()
- Implement callback mechanism for partial responses
- Update Agent class to support streaming callbacks

Acceptance Criteria:
- ClaudeProvider.generate(stream=True) yields partial responses
- Callback function called with each chunk
- Backward compatible (stream=False by default)
- Example in README.md showing streaming usage
- Tests verify both streaming and non-streaming modes

Component Impact:
New: src/llm_framework/providers/streaming.py (base streaming interface)
Modified:
- src/llm_framework/providers/claude_provider.py (~50 lines)
- src/llm_framework/core/agent.py (~30 lines)
- tests/test_claude_provider.py (add streaming tests)
- README.md (add streaming example)

Dependencies:
- anthropic>=0.7.0 (already in requirements.txt)

Complexity: Medium (multiple files, ~150 lines total)
```

**Why this is good:**
- Clear user story and benefit
- Specific technical approach
- Detailed acceptance criteria
- Complete component impact assessment
- Identifies dependencies
- Realistic complexity estimate

### ❌ Bad Task Scoping Examples

#### Example 1: Bug Fix - Poorly Scoped

```markdown
Title: Fix the timeouts

Description: The provider times out sometimes. Please fix it.
```

**Why this is bad:**
- No specifics on which provider
- No reproduction steps
- No acceptance criteria
- No affected file identification
- Can't estimate complexity
- Copilot would have to guess requirements

#### Example 2: Feature Request - Poorly Scoped

```markdown
Title: Make the framework better

Description: Add more features to make it more useful.
Acceptance: Make it better.
```

**Why this is bad:**
- No specific feature identified
- No user story or benefit
- No technical approach
- No measurable success criteria
- Impossible to scope or implement
- Completely ambiguous

### Task Scoping Checklist

Before creating an issue, verify:

- [ ] **Clear Problem/Goal**: One sentence summary of what needs to change
- [ ] **Context**: Why is this needed? What problem does it solve?
- [ ] **Specifics**: Exact files, functions, or modules involved
- [ ] **Acceptance Criteria**: Measurable definition of "done"
- [ ] **Scope Indicators**: Estimated complexity (small/medium/large)
- [ ] **Testing Strategy**: How will this be verified?
- [ ] **Examples**: Code examples showing before/after or usage

## Development Workflow

### 1. Create an Issue (or Pick One)

- Use issue templates in `.github/ISSUE_TEMPLATE/`
- Follow task scoping guidelines above
- Add appropriate labels
- Assign to @copilot for AI assistance or to yourself

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- **Read first**: `.github/copilot-instructions.md`, `docs/LESSONS_LEARNED.md`
- **Plan**: Outline changes before coding
- **Minimize**: Make the smallest changes needed
- **Test incrementally**: Don't write everything then test

### 4. Test Your Changes

```bash
# Run tests frequently
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
python -m pytest tests/ -v

# Check code quality
pylint src/llm_framework/ --rcfile=.pylintrc

# Manual verification
python run_real_agents.py  # or other relevant script
```

### 5. Document Your Changes

- Update relevant documentation files
- Add/update code comments for complex logic
- Update `docs/CURRENT_STATE.md` if system state changed
- Add to `docs/LESSONS_LEARNED.md` if you discovered something important

### 6. Create Pull Request

- Use PR template in `.github/PULL_REQUEST_TEMPLATE/`
- Link to related issue
- Describe what changed and why
- Show test results
- Request review

### 7. Code Review Process

- GitHub Copilot is the primary reviewer
- Address review comments
- Re-run tests after changes
- Update documentation as needed

## Code Standards

### Python Code Style

- Follow PEP 8
- Use type hints where helpful
- Maximum line length: 100 characters (reasonable exceptions allowed)
- Use descriptive variable names

```python
# Good
def generate_response(self, prompt: str, temperature: float = 0.7) -> str:
    """Generate a response from the LLM.
    
    Args:
        prompt: The input prompt
        temperature: Sampling temperature (0.0-1.0)
        
    Returns:
        Generated response text
    """
    pass

# Bad
def gen(p, t=0.7):  # No types, unclear names
    pass
```

### Code Organization

- One class per file (generally)
- Group related functions
- Imports: stdlib, third-party, local
- Docstrings for all public methods

### Error Handling

```python
# Good - Specific exceptions with context
try:
    response = self._make_request(prompt)
except requests.Timeout as e:
    raise ProviderError(f"Request timed out after {self.timeout}s") from e

# Bad - Generic exception catching
try:
    response = self._make_request(prompt)
except:
    pass  # Silent failure
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

## Testing Requirements

### Unit Tests Required

All new code must have unit tests:

```python
# tests/test_new_feature.py
import pytest
from llm_framework.new_feature import NewClass

def test_new_class_initialization():
    """Test that NewClass initializes correctly."""
    obj = NewClass(param="value")
    assert obj.param == "value"

def test_new_class_method():
    """Test that method works as expected."""
    obj = NewClass(param="value")
    result = obj.method()
    assert result == expected_output
```

### Integration Tests

For features involving multiple components:

```python
def test_agent_with_provider_integration():
    """Test agent execution with real provider."""
    provider = OllamaProvider(model="qwen2.5:0.5b")
    agent = Agent("test-agent", provider)
    
    result = agent.execute("Simple test task")
    
    assert result is not None
    assert len(result) > 0
```

### Test Coverage Goals

- Aim for >80% coverage for new code
- 100% coverage for critical paths
- Test edge cases and error conditions

### Testing with Real Providers

**DO:**
```bash
# Test with Ollama (installed locally)
python run_real_agents.py
```

**DON'T:**
```python
# Don't use mock data and claim "it works"
mock_provider = MockProvider()  # ❌ Not acceptable for verification
```

## Best Practices for Copilot Delegation

When creating tasks for GitHub Copilot coding agent:

### 1. Provide Complete Context

```markdown
<!-- Good: Complete context -->
Task: Add retry logic to ClaudeProvider

Context:
- Current file: src/llm_framework/providers/claude_provider.py
- Current behavior: Single request attempt, fails on network error
- Related issue: #123
- Similar implementation: See OllamaProvider.generate() for example

Requirements:
- 3 retry attempts with exponential backoff
- Only retry on network errors (not API errors)
- Log each retry attempt
- Tests in tests/test_claude_provider.py

<!-- Bad: Incomplete context -->
Task: Add retries
```

### 2. Specify Acceptance Criteria

```markdown
<!-- Good: Measurable criteria -->
Acceptance Criteria:
- [ ] ClaudeProvider retries up to 3 times on network errors
- [ ] Exponential backoff: 1s, 2s, 4s delays
- [ ] API errors (4xx, 5xx) are not retried
- [ ] Each retry is logged at INFO level
- [ ] Tests verify retry behavior with mocked network failures
- [ ] Existing tests still pass

<!-- Bad: Vague criteria -->
Acceptance: Make it work better
```

### 3. Indicate Complexity

Help Copilot understand the scope:

```markdown
Complexity: Small
- Single file modification (claude_provider.py)
- ~40 lines of code added
- 2 new tests
- No breaking changes
- No new dependencies
```

### 4. Reference Related Work

```markdown
Related Files:
- src/llm_framework/providers/ollama_provider.py (has similar retry logic)
- src/llm_framework/core/base_provider.py (base class)

Related Docs:
- docs/ARCHITECTURE.md (provider design)
- docs/LESSONS_LEARNED.md (see Session 3 for retry patterns)
```

### 5. Provide Examples

```python
# Example usage after implementation:
provider = ClaudeProvider(
    api_key="...",
    max_retries=3,
    retry_delay=1.0
)

# Should retry on network error
try:
    response = provider.generate("Test prompt")
except NetworkError:
    # Failed after 3 retries
    pass
```

### 6. Specify Verification Method

```markdown
Verification:
1. Run: python -m pytest tests/test_claude_provider.py::test_retry_logic -v
2. Manual test: python -c "from llm_framework.providers import ClaudeProvider; ..."
3. Check: All existing tests pass
4. Verify: No new pylint warnings
```

## Documentation Requirements

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change public APIs
- Fix a significant bug
- Add new configuration options
- Change system architecture

### Required Documentation Updates

For most changes:

- [ ] Code comments (if complex logic)
- [ ] Docstrings (for new functions/classes)
- [ ] README.md (if user-facing changes)
- [ ] docs/CURRENT_STATE.md (if system state changes)

For significant changes:

- [ ] docs/ARCHITECTURE.md (if design changes)
- [ ] docs/LESSONS_LEARNED.md (if you learned something valuable)
- [ ] API documentation (if API changes)
- [ ] Migration guides (if breaking changes)

### Documentation Style

```python
def example_function(param1: str, param2: int = 10) -> dict:
    """Brief description of what this function does.
    
    More detailed explanation if needed. Describe the purpose,
    behavior, and any important implementation details.
    
    Args:
        param1: Description of param1
        param2: Description of param2, including default behavior
        
    Returns:
        Description of return value and structure
        
    Raises:
        ValueError: When param1 is empty
        RuntimeError: When operation fails
        
    Example:
        >>> result = example_function("test", 20)
        >>> print(result)
        {'status': 'success', 'value': 20}
    """
    pass
```

## Getting Help

### Resources

- **Documentation**: [README.md](README.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Current State**: [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md)
- **Past Mistakes**: [docs/LESSONS_LEARNED.md](docs/LESSONS_LEARNED.md)
- **Copilot Guidelines**: [.github/copilot-instructions.md](.github/copilot-instructions.md)

### Ask Questions

- **GitHub Discussions**: For questions and ideas
- **Issues**: For bugs and feature requests
- **Pull Requests**: For code review and feedback

### Working with Copilot

If Copilot is not performing well:

1. **Check your issue**: Is it well-scoped per guidelines above?
2. **Provide context**: Did you link to relevant files and docs?
3. **Specify criteria**: Are acceptance criteria measurable?
4. **Review instructions**: Does your issue reference `.github/copilot-instructions.md`?

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Provide helpful, actionable feedback
- Assume good intentions
- Help others learn and improve

## License

By contributing, you agree that your contributions will be licensed under the same license as this project.

---

## Quick Reference: Issue Creation

### Bug Fix Template
```markdown
Title: [BUG] Specific problem description
Problem: What's broken and how to reproduce
Acceptance: Specific criteria for the fix
Files: List affected files
Complexity: Small/Medium/Large
```

### Feature Template
```markdown
Title: [FEATURE] Specific feature name
User Story: As a [user], I want [goal] so that [benefit]
Acceptance: Measurable completion criteria
Impact: New/modified files and dependencies
Complexity: Small/Medium/Large
```

### Refactoring Template
```markdown
Title: [REFACTOR] What's being improved
Current Problems: List specific issues
Proposed Improvement: Clear approach
Acceptance: Tests pass, no behavior change
Files: What files will change
```

### Documentation Template
```markdown
Title: [DOCS] What documentation needed
Audience: Who needs this
Type: Tutorial/Guide/Reference/etc
Topics: What should be covered
Examples: Code examples needed
```

---

**Remember**: Good issues lead to good results. Take time to scope tasks clearly, and both human and AI contributors will thank you!
