# Contributing to LLM Multi-Provider Framework

Thank you for your interest in contributing! This project is designed to work seamlessly with **GitHub Copilot coding agent** for autonomous task completion.

## Table of Contents

- [Getting Started](#getting-started)
- [Working with GitHub Copilot Coding Agent](#working-with-github-copilot-coding-agent)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Guidelines](#documentation-guidelines)
- [Pull Request Process](#pull-request-process)

## Getting Started

1. **Fork and clone** the repository
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Read the docs**:
   - `.github/copilot-instructions.md` - Repository-specific guidance
   - `docs/ARCHITECTURE.md` - System design
   - `docs/CURRENT_STATE.md` - Current status
   - `docs/LESSONS_LEARNED.md` - Past mistakes to avoid
4. **Run tests**: `PYTHONPATH=src python -m pytest tests/ -v`
5. **Check code quality**: `pylint src/llm_framework/`

## Working with GitHub Copilot Coding Agent

This repository is optimized for GitHub Copilot coding agent. When creating tasks:

### ✅ Good Task Descriptions

**Clear and Specific:**
```markdown
Title: [BUG] OllamaProvider fails with timeout on large responses

Problem: When processing responses >1000 tokens, the OllamaProvider 
times out and raises an exception.

Acceptance Criteria:
- Timeout increased to 120 seconds for large requests
- Add retry logic with exponential backoff
- Tests verify timeout behavior
- No breaking changes to existing code

Affected Files: src/llm_framework/providers/ollama_provider.py
```

**Well-Scoped:**
- Focus on ONE specific problem
- Include problem statement
- Define acceptance criteria
- List affected files (if known)
- Specify expected behavior

### ❌ Poor Task Descriptions

**Vague and Broad:**
```markdown
Title: Fix the agents

The agents aren't working right. Can you make them better?
```

**Problems:**
- No specific problem identified
- No acceptance criteria
- No scope definition
- No testable outcomes

### Task Scoping Guidelines

**Copilot coding agent excels at:**
- ✅ Bug fixes with clear reproduction steps
- ✅ Adding well-defined features
- ✅ Refactoring with clear goals
- ✅ Documentation updates
- ✅ Test coverage improvements
- ✅ Code quality improvements

**Copilot coding agent struggles with:**
- ❌ Ambiguous or open-ended tasks
- ❌ Tasks requiring deep domain knowledge
- ❌ Complex architectural decisions
- ❌ Tasks with unclear success criteria

### Using Issue Templates

We provide templates for common task types:
- **Bug Fix** (`.github/ISSUE_TEMPLATE/bug_fix.md`)
- **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`)
- **Refactoring** (`.github/ISSUE_TEMPLATE/refactoring.md`)
- **Documentation** (`.github/ISSUE_TEMPLATE/documentation.md`)

Use these templates to ensure you provide all necessary information.

### Assigning to Copilot

To assign a task to GitHub Copilot coding agent:

1. **Create an issue** using the appropriate template
2. **Mention @copilot** in the issue or comment
3. **OR** Use the GitHub UI to assign from the agents panel
4. **Monitor progress** via PR updates and comments
5. **Provide feedback** by commenting on the PR

## Development Workflow

### 1. Create an Issue
- Use the appropriate issue template
- Fill in all required sections
- Add labels: `bug`, `enhancement`, `refactoring`, `documentation`
- Add `copilot-task` label if delegating to Copilot

### 2. Work on the Task
- Create a feature branch: `git checkout -b feature/your-feature-name`
- Make small, focused commits
- Test incrementally
- Follow the systematic approach in `.github/copilot-instructions.md`

### 3. Submit a Pull Request
- Use the PR template (`.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`)
- Fill in all sections completely
- Link to the related issue: `Fixes #123`
- Ensure all tests pass
- Request review

### 4. Address Feedback
- Respond to review comments
- Make requested changes
- Re-run tests after changes
- Update documentation if needed

## Code Standards

### Style Guide
- **Python**: Follow PEP 8
- **Formatting**: Use `black` for automatic formatting
- **Line length**: 100 characters max (80 preferred)
- **Imports**: Use `isort` for import organization

### Quality Metrics
- **Pylint score**: Maintain or improve (target: 9.0+)
- **Test coverage**: Add tests for new code
- **Security**: No vulnerabilities (CodeQL must pass)
- **Type hints**: Use type hints for public APIs

### Code Review Checklist
Before submitting a PR, verify:
- [ ] Code follows style guide
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Security scan passes
- [ ] Pylint score maintained

## Testing Requirements

### Running Tests
```bash
# All tests
PYTHONPATH=src python -m pytest tests/ -v

# Specific test file
PYTHONPATH=src python -m pytest tests/test_agent.py -v

# With coverage
PYTHONPATH=src python -m pytest tests/ --cov=llm_framework --cov-report=html
```

### Test Guidelines
- **Unit tests** for all core functionality
- **Integration tests** for provider interactions
- **Mock external services** (APIs, GitHub)
- **Test edge cases** and error conditions
- **Use descriptive test names** that explain what's being tested

### Example Test
```python
def test_ollama_provider_handles_timeout():
    """Test that OllamaProvider properly handles timeout errors."""
    provider = OllamaProvider(timeout=1)
    with pytest.raises(TimeoutError):
        provider.generate("test" * 10000)
```

## Documentation Guidelines

### What to Document
- **New features**: Add to README.md and create docs/FEATURE.md if complex
- **API changes**: Update docstrings and API documentation
- **Configuration**: Update .env.example and documentation
- **Breaking changes**: Document in CHANGELOG.md and migration guide
- **Architecture changes**: Update docs/ARCHITECTURE.md

### Documentation Style
- **Clear and concise**: Get to the point quickly
- **Examples**: Include code examples for usage
- **Accuracy**: Test all code examples
- **Structure**: Use headers, lists, and code blocks
- **Links**: Link to related documentation

### Required Updates
When making changes, update:
- `docs/CURRENT_STATE.md` - Current system status
- `docs/LESSONS_LEARNED.md` - If you learn something new
- `README.md` - If adding features or changing usage
- `docs/ARCHITECTURE.md` - If changing system design

## Pull Request Process

### 1. Before Submitting
- [ ] All tests pass locally
- [ ] Code quality checks pass (pylint, black)
- [ ] Documentation updated
- [ ] CURRENT_STATE.md updated if applicable
- [ ] PR template filled out completely

### 2. PR Review
- GitHub Copilot or maintainers will review
- Address all feedback and comments
- Make changes in new commits (don't force push)
- Re-request review after changes

### 3. Automated Checks
All PRs must pass:
- ✅ Unit tests (pytest)
- ✅ Code quality (pylint)
- ✅ Security scan (CodeQL)
- ✅ Auto-review (if enabled)

### 4. Merging
- Maintainer will merge once approved
- Or use `auto-merge` label for automatic merging when ready
- Squash commits for cleaner history (optional)

## Best Practices

### For All Contributors

1. **Read documentation first** - Understand the system before changing it
2. **Test incrementally** - Don't wait until the end to test
3. **Make small changes** - Easier to review and less likely to break
4. **Be systematic** - Follow the problem-solving framework in docs
5. **Be honest** - Admit when stuck or unsure
6. **Update docs** - Keep documentation in sync with code

### For Copilot Coding Agent

When delegating to Copilot:
1. **Provide context** - Include relevant background information
2. **Be specific** - Clear acceptance criteria and scope
3. **Reference docs** - Point to relevant architecture docs
4. **Set expectations** - Specify what "done" looks like
5. **Iterate** - Provide feedback on PRs to refine results

### For Human Contributors

1. **Start small** - Pick "good first issue" labels
2. **Ask questions** - Use GitHub Discussions for clarification
3. **Follow templates** - They ensure you provide necessary info
4. **Be patient** - Reviews may take time
5. **Learn from past** - Read docs/LESSONS_LEARNED.md

## Repository Structure

```
LLM/
├── .github/
│   ├── copilot-instructions.md      ⭐ Start here
│   ├── ISSUE_TEMPLATE/              📝 Issue templates
│   ├── PULL_REQUEST_TEMPLATE/       📝 PR template
│   └── workflows/                   🔧 CI/CD
├── docs/
│   ├── ARCHITECTURE.md              🏗️ System design
│   ├── CURRENT_STATE.md             📊 Current status
│   ├── LESSONS_LEARNED.md           📚 Past mistakes
│   └── PR_AUTOMATION.md             🤖 PR automation
├── src/llm_framework/
│   ├── core/                        🎯 Core framework
│   ├── providers/                   🔌 LLM providers
│   ├── agents/                      🤖 Specialized agents
│   └── scripts/                     🛠️ Utility scripts
├── tests/                           ✅ Test suite
├── deployment/                      🚀 Deployment configs
├── README.md                        📖 Main docs
├── CONTRIBUTING.md                  👥 This file
└── requirements.txt                 📦 Dependencies
```

## Need Help?

- **Questions**: Open a [GitHub Discussion](https://github.com/Scarmonit/LLM/discussions)
- **Bugs**: Create an issue with the Bug Fix template
- **Features**: Create an issue with the Feature Request template
- **Documentation**: Check the `docs/` directory
- **Examples**: See `example.py` and other runner scripts

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

Whether you're fixing a typo or adding a major feature, every contribution helps make this project better.
