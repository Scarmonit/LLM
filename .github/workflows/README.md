# AI-Review and Auto-Merge System

This directory contains GitHub Actions workflows that implement an AI-powered code review and automated merge system for the Scarmonit/LLM repository.

## Workflows

### 1. AI Code Review (`ai-review.yml`)

**Purpose:** Provides a framework for integrating external AI code review systems while serving as a status check gate.

**When it runs:**
- Pull requests opened, synchronized, or reopened
- Only on PRs targeting `main` or `Scarmonit` branches

**What it does:**
1. Collects comprehensive diff statistics (files changed, insertions, deletions)
2. Creates a diff artifact for potential AI analysis
3. Invokes configured external AI systems (Claude, Gemini) via webhooks
4. Always completes successfully to serve as a green check

**Configuration:**

To enable external AI reviews, set repository variables:
- `CLAUDE_WEBHOOK_URL` - URL for Claude AI webhook (optional)
- `GEMINI_WEBHOOK_URL` - URL for Gemini AI webhook (optional)
- `CLAUDE_API_KEY` - API key for Claude (secret, optional)
- `GEMINI_API_KEY` - API key for Gemini (secret, optional)

**Extending:**

To add a new AI system:
1. Add a new step with `if: vars.YOUR_AI_WEBHOOK_URL != ''`
2. Follow the pattern of existing webhook steps
3. Include error handling with `continue-on-error: true`

### 2. Auto-merge Gate (`auto-merge.yml`)

**Purpose:** Validates PR readiness and executes automated merges when all conditions are met.

**When it runs:**
- Pull request reviews submitted
- Check suites completed
- Pull requests opened, synchronized, labeled, or marked ready for review

**Jobs:**

#### Job: `ready`
Validates whether a PR is ready for auto-merge.

**Checks performed:**
- ✅ PR is not in draft mode
- ✅ All CI checks have passed (no failures)
- ✅ No checks are still pending
- ✅ PR is mergeable (no conflicts)
- ℹ️ AI Code Review status (tracked but not blocking)

**Output:**
- `auto_merge_ready`: `true` or `false`

#### Job: `auto-merge`
Executes the actual merge if conditions are met.

**Conditions:**
- Depends on `ready` job output being `true`
- PR must have the `auto-merge` label
- Uses existing Python scripts for merge execution

## Pull Request Workflow

### Recommended Lifecycle:

1. **Draft Phase**
   ```
   Create PR as draft while work is in progress
   ├─ CI checks run
   ├─ Auto-merge gate is skipped
   └─ Iterate on feedback
   ```

2. **Ready for Review**
   ```
   Mark PR as ready when structurally complete
   ├─ Auto-merge gate activates
   ├─ All CI checks must pass
   ├─ AI Code Review must succeed
   └─ PR must be mergeable
   ```

3. **Auto-merge**
   ```
   Enable auto-merge in GitHub UI
   ├─ Add 'auto-merge' label
   ├─ Select "Squash and merge"
   └─ PR merges when all checks green
   ```

## Permissions

Both workflows use minimal required permissions:
- `contents: read` - Read repository content
- `pull-requests: write` - Create comments and reviews
- `checks: read` - Read check run status

The `auto-merge` job additionally requires:
- `contents: write` - Merge pull requests

## Testing

To test these workflows locally:

1. **Validate YAML syntax:**
   ```bash
   python -c "import yaml; yaml.safe_load(open('.github/workflows/ai-review.yml'))"
   python -c "import yaml; yaml.safe_load(open('.github/workflows/auto-merge.yml'))"
   ```

2. **Check workflow structure:**
   ```bash
   # Run the validation script
   python scripts/validate_workflows.py
   ```

## Troubleshooting

### AI Code Review workflow fails
- Check that webhook URLs are properly formatted
- Verify API keys are set as secrets (if required)
- Review workflow logs for specific errors

### Auto-merge gate fails
- Check job summary for specific failure reason
- Verify all required CI checks are passing
- Ensure PR is not in draft mode
- Check for merge conflicts

### Auto-merge doesn't execute
- Verify `auto-merge` label is present on PR
- Check that `ready` job output is `true`
- Review permissions and authentication

## Integration with Existing Workflows

These workflows are designed to complement existing CI/CD:
- `tests.yml` - Python test suite
- `pylint.yml` - Code quality checks
- `docker-build.yml` - Container builds
- `auto-review.yml` - Existing review automation

All existing functionality is preserved and enhanced by this system.

## Future Enhancements

Potential improvements:
- Add more AI review systems (GPT-4, CodeLlama, etc.)
- Implement AI-generated review comments
- Add configurable blocking/non-blocking AI checks
- Support for custom merge strategies per PR
- Integration with code quality metrics
