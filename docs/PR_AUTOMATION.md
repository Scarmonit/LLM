# GitHub PR Automation

Automated pull request review, validation, creation, and merging using LLM agents.

## Features

### 🤖 Automated Code Review
- AI-powered code analysis using LLM agents
- Reviews focus on:
  - Code quality and best practices
  - Potential bugs or issues
  - Security concerns
  - Performance implications
  - Maintainability and readability
  - Test coverage

### ✅ PR Validation
- Check if PR is ready to merge
- Validate CI/CD checks status
- Verify mergeable state
- Check for conflicts

### 🔀 Auto-Merge
- Automatically merge PRs when:
  - All checks pass
  - PR is approved
  - No merge conflicts
  - Has 'auto-merge' label

### 📝 PR Creation
- Programmatically create pull requests
- CLI tool for easy PR creation
- Support for draft PRs

## Quick Start

### 1. Set Environment Variables

```bash
export GITHUB_TOKEN=your_github_token
export GITHUB_REPO_OWNER=Scarmonit
export GITHUB_REPO_NAME=LLM

# Optional: For LLM provider
export ANTHROPIC_API_KEY=your_anthropic_key
# OR use Ollama (local)
```

### 2. Create a Pull Request

```bash
# Using the CLI tool
python -m llm_framework.scripts.create_pr \
  --title "Add new feature" \
  --body "This PR adds a new feature" \
  --head feature-branch \
  --base main

# Or in Python
from llm_framework.github_integration import GitHubIntegration

github = GitHubIntegration("owner", "repo")
pr = github.create_pull_request(
    title="Add new feature",
    body="Description",
    head="feature-branch",
    base="main"
)
print(f"Created PR #{pr['number']}")
```

### 3. Review a Pull Request

```bash
# Using the CLI script
python -m llm_framework.scripts.auto_review_pr \
  --pr-number 123 \
  --repo-owner Scarmonit \
  --repo-name LLM

# Or in Python
from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.github_integration import GitHubIntegration
from llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer

# Setup
orchestrator = AgentOrchestrator()
orchestrator.setup_default_providers()
provider = orchestrator.providers[orchestrator.list_providers()[0]]

# Create code review agent
agent = create_code_review_agent(provider)
github = GitHubIntegration("owner", "repo")
reviewer = PRReviewer(agent, github)

# Review the PR
review = reviewer.review_pr(123)
print(f"Review posted: {review['html_url']}")
```

### 4. Validate PR Status

```bash
# Check if PR is ready to merge
python -m llm_framework.scripts.check_pr_status \
  --pr-number 123 \
  --repo-owner Scarmonit \
  --repo-name LLM

# Or in Python
validation = reviewer.validate_pr(123)
if validation["valid"]:
    print("PR is ready to merge!")
else:
    print(f"Not ready: {validation}")
```

### 5. Auto-Merge PR

```bash
# Merge if ready
python -m llm_framework.scripts.auto_merge_pr \
  --pr-number 123 \
  --repo-owner Scarmonit \
  --repo-name LLM \
  --merge-method squash

# Or in Python
result = reviewer.auto_merge_if_ready(123, merge_method="squash")
if result["merged"]:
    print("PR merged successfully!")
else:
    print(f"Cannot merge: {result['reason']}")
```

## GitHub Actions Integration

### Auto-Review Workflow

The repository includes a workflow that automatically reviews PRs when they are opened or updated.

**File:** `.github/workflows/auto-review.yml`

**Triggers:**
- PR opened
- PR synchronized (new commits)
- PR reopened

**What it does:**
1. Checks out code
2. Installs dependencies
3. Runs automated code review using LLM agent
4. Posts review comments to the PR

**Requirements:**
- `GITHUB_TOKEN` (automatically provided)
- `ANTHROPIC_API_KEY` (in repository secrets) OR Ollama setup

### Auto-Merge Workflow

Automatically merges PRs that pass all checks and have the `auto-merge` label.

**File:** `.github/workflows/auto-merge.yml`

**Triggers:**
- PR review submitted
- Check suite completed
- PR labeled with 'auto-merge'

**What it does:**
1. Validates PR is ready (checks passed, no conflicts)
2. Merges PR if all conditions met
3. Posts status comment

**To enable auto-merge on a PR:**
```bash
# Add the 'auto-merge' label to your PR
gh pr edit 123 --add-label auto-merge
```

## API Reference

### GitHubIntegration Class

Extended with PR operations:

```python
from llm_framework.github_integration import GitHubIntegration

github = GitHubIntegration(repo_owner, repo_name, token)

# Create PR
pr = github.create_pull_request(title, body, head, base, draft=False)

# Get PR details
pr_data = github.get_pull_request(pr_number)

# Create review
review = github.create_review(pr_number, body, event="COMMENT")

# Get PR files
files = github.get_pr_files(pr_number)

# Merge PR
merge = github.merge_pull_request(pr_number, merge_method="merge")

# Get check runs
checks = github.get_check_runs(commit_sha)

# Get combined status
status = github.get_combined_status(commit_sha)
```

### PRReviewer Class

```python
from llm_framework.agents.code_review_agent import PRReviewer

reviewer = PRReviewer(agent, github_integration)

# Review PR
review = reviewer.review_pr(pr_number, auto_approve=False)

# Validate PR
validation = reviewer.validate_pr(pr_number)

# Auto-merge if ready
result = reviewer.auto_merge_if_ready(pr_number, merge_method="merge")
```

## Configuration

### Code Review Agent

The code review agent is configured for deterministic, consistent reviews:

- **Temperature:** 0.3 (more deterministic)
- **Max tokens:** 500 (detailed reviews)
- **Focus areas:**
  - Code quality
  - Security
  - Performance
  - Best practices
  - Test coverage

### Merge Methods

Supported merge methods:
- `merge` - Standard merge commit
- `squash` - Squash all commits into one
- `rebase` - Rebase and merge

## Testing

Run the test suite:

```bash
# All tests
PYTHONPATH=src pytest tests/ -v

# PR automation tests only
PYTHONPATH=src pytest tests/test_github_pr_integration.py tests/test_code_review_agent.py -v
```

Test coverage:
- ✅ 9 tests for GitHub PR integration
- ✅ 13 tests for code review agent
- ✅ All 52 tests passing

## Security

### Token Permissions

The GitHub token needs the following permissions:
- `repo` - Access to repository
- `pull_requests:write` - Create and review PRs
- `contents:write` - Merge PRs

### Best Practices

1. Store `GITHUB_TOKEN` in repository secrets
2. Use environment variables for API keys
3. Never commit tokens to code
4. Review auto-merge criteria before enabling
5. Monitor automated reviews for quality

## Troubleshooting

### Review not posting

**Problem:** Automated review doesn't appear on PR

**Solutions:**
- Check `GITHUB_TOKEN` is set and valid
- Verify token has `pull_requests:write` permission
- Check LLM provider is available (Ollama running or API key set)

### Auto-merge not working

**Problem:** PR with 'auto-merge' label not merging

**Solutions:**
- Verify all checks are passing
- Check PR is mergeable (no conflicts)
- Ensure PR has approvals if required
- Check workflow logs for errors

### Code review quality

**Problem:** Reviews are not helpful or too generic

**Solutions:**
- Use more capable LLM provider (Claude > Ollama small models)
- Adjust temperature in code review agent
- Provide more context in PR description
- Fine-tune system prompt in `code_review_agent.py`

## Examples

### Complete Workflow Example

```python
#!/usr/bin/env python3
"""Complete PR workflow example."""

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.github_integration import GitHubIntegration
from llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer

# Setup
orchestrator = AgentOrchestrator()
orchestrator.setup_default_providers()
provider = orchestrator.providers[orchestrator.list_providers()[0]]

github = GitHubIntegration("Scarmonit", "LLM")
agent = create_code_review_agent(provider)
reviewer = PRReviewer(agent, github)

# 1. Create PR
pr = github.create_pull_request(
    title="Add new feature",
    body="This adds feature X",
    head="feature-x",
    base="main"
)
pr_number = pr["number"]
print(f"Created PR #{pr_number}")

# 2. Review PR
review = reviewer.review_pr(pr_number)
print(f"Review posted: {review['html_url']}")

# 3. Validate PR
validation = reviewer.validate_pr(pr_number)
print(f"Valid: {validation['valid']}")
print(f"Checks passed: {validation['checks_passed']}")

# 4. Auto-merge if ready
if validation["valid"]:
    result = reviewer.auto_merge_if_ready(pr_number, merge_method="squash")
    if result["merged"]:
        print("✅ PR merged successfully!")
    else:
        print(f"❌ Cannot merge: {result['reason']}")
else:
    print("⏳ Waiting for checks to pass...")
```

## Contributing

When adding new PR automation features:

1. Add methods to `GitHubIntegration` class
2. Write comprehensive tests
3. Update this documentation
4. Test with real PRs before merging
5. Consider security implications

## License

MIT License - Same as parent project

---

Last Updated: 2025-11-16  
Last Updated By: GitHub Copilot (PR Automation Documentation)
