# Copilot Instructions for LLM Multi-Provider Framework

> **READ THIS FIRST** - Any Copilot session working on this repository MUST review this document before starting work.

## Quick Start Checklist

When starting a new session:
- [ ] Read this entire document
- [ ] Review `docs/LESSONS_LEARNED.md` for past mistakes
- [ ] Check `docs/CURRENT_STATE.md` for system status
- [ ] Review `docs/ARCHITECTURE.md` for system design
- [ ] Read `VERIFICATION.md` for testing procedures
- [ ] Update all docs when completing work

## Repository Overview

This is an **LLM Multi-Provider Framework** with autonomous agent capabilities.

**Core Purpose:** Enable autonomous AI agents to run continuously using various LLM providers (Ollama, Claude, OpenAI).

**Key Components:**
- `src/llm_framework/core/` - Base classes (BaseProvider, Agent)
- `src/llm_framework/providers/` - LLM provider implementations
- `src/llm_framework/agents/` - Specialized agent types
- `src/llm_framework/orchestrator.py` - Agent management
- `src/llm_framework/continuous_agent.py` - Continuous execution

## GitHub Workflow & Code Review Process

### Primary Code Reviewer: GitHub Copilot
**GitHub Copilot is the primary, GitHub-native code reviewer for this repository.** It provides:
- Inline code suggestions during development
- Automated code review feedback on pull requests
- Integration with GitHub's native review workflow
- Context-aware improvements based on repository patterns

### External AI Review Systems
In addition to Copilot, this repository supports **external AI code review systems** via the `AI Code Review` workflow (`.github/workflows/ai-review.yml`):

**Supported External AI Systems:**
- **Claude AI** - Configured via `CLAUDE_WEBHOOK_URL` variable/secret
- **Gemini AI** - Configured via `GEMINI_WEBHOOK_URL` variable/secret

**How It Works:**
1. The `AI Code Review` workflow runs on all PRs targeting `main` and `Scarmonit` branches
2. It collects diff summaries and PR metadata
3. If configured, it invokes external AI systems via webhooks
4. The workflow completes as a **required status check** that gates auto-merge
5. External AI feedback can be posted as PR comments (if configured)

**Configuration:**
- Set repository variables `CLAUDE_WEBHOOK_URL` and/or `GEMINI_WEBHOOK_URL` to enable
- Optionally set corresponding API keys as secrets (`CLAUDE_API_KEY`, `GEMINI_API_KEY`)
- The workflow is extensible - add new AI systems by following existing patterns

### Pull Request Workflow

**Recommended PR Lifecycle:**
1. **Draft Phase** - Create PR as draft while work is in progress
   - CI checks run but auto-merge gate is skipped
   - Use this time for iterative development and testing
   - Copilot and external AI can provide early feedback

2. **Ready for Review** - Mark PR as "ready for review" when structurally complete
   - Auto-merge gate (`ready` job) activates
   - All CI checks must pass (tests, pylint, etc.)
   - `AI Code Review` check must succeed
   - PR must be mergeable (no conflicts)

3. **Auto-merge** - Enable auto-merge in GitHub UI (Squash and merge)
   - Once all checks are green, PR auto-merges
   - Requires `auto-merge` label to be set
   - Uses "Squash and merge" strategy by default

**Auto-merge Gate Checks:**
- ✅ PR is not in draft mode
- ✅ All CI checks passed (no failures)
- ✅ No pending checks (all completed)
- ✅ PR is mergeable (no conflicts)
- ℹ️ AI Code Review status (tracked but not blocking by default)

**Workflows:**
- `.github/workflows/ai-review.yml` - AI Code Review workflow (runs on PR events)
- `.github/workflows/auto-merge.yml` - Auto-merge gate and execution
- `.github/workflows/tests.yml` - Python test suite
- `.github/workflows/pylint.yml` - Code quality checks

## Critical Rules (DO NOT VIOLATE)

### 1. Use Available Resources FIRST
- ✅ Install packages via pip (dependencies in `requirements.txt`)
- ✅ Install Ollama if needed (available via installer)
- ✅ Use existing framework components before creating new ones
- ❌ Do NOT create workarounds for installable dependencies
- ❌ Do NOT claim something works without real verification

### 2. Systematic Approach Required
Before making ANY changes:
1. Review entire repository structure
2. Understand existing components
3. Test each layer independently
4. Identify root cause of issues
5. Plan solution systematically
6. Document your analysis

See `SYSTEMATIC_BREAKDOWN.md` for methodology.

### 3. Honest Verification Only
- ✅ Test with REAL LLMs (Ollama, Claude, OpenAI)
- ✅ Show actual output/responses
- ✅ Admit limitations if they exist
- ❌ Do NOT use mock/fake data for "proof"
- ❌ Do NOT show metrics without context
- ❌ Do NOT claim success without verification

### 4. Documentation Updates Required
When completing work, UPDATE:
- `docs/CURRENT_STATE.md` - Current system status
- `docs/LESSONS_LEARNED.md` - What worked/failed
- `docs/ARCHITECTURE.md` - Any design changes
- This file - New insights or rules

## Common Pitfalls (Learn from Past Mistakes)

### ❌ MISTAKE: Claiming "it works" without proof
**Why it fails:** User can't verify, leads to distrust
**Solution:** Always show real output, actual responses, verifiable results

### ❌ MISTAKE: Auto-generating busywork tasks
**Why it fails:** Not useful, just creates activity without value
**Solution:** User-submitted tasks OR autonomous useful work (code analysis, etc.)

### ❌ MISTAKE: Using mock data as "real"
**Why it fails:** Defeats purpose of LLM framework
**Solution:** Install real LLM (Ollama) or use API keys

### ❌ MISTAKE: Building infrastructure without testing basics
**Why it fails:** Complex systems fail when foundation is broken
**Solution:** Test each layer, build incrementally, verify continuously

### ❌ MISTAKE: Not using available tools/packages
**Why it fails:** Reinventing wheel, creating fragile workarounds
**Solution:** Check what's installable, use requirements.txt, install dependencies

See `docs/LESSONS_LEARNED.md` for complete history.

## How to Verify "Working" Status

### ✅ GOOD Verification:
```bash
# 1. Run production system
python run_real_agents.py

# 2. See actual output showing:
#    - Which provider (must be real: ollama/claude/openai)
#    - Actual tasks being processed
#    - Real LLM responses (not mock)
#    - Continuous operation (not one-shot)

# 3. Run tests
python -m pytest tests/ -v

# 4. Check security
# (CodeQL runs automatically)
```

### ❌ BAD Verification:
- Showing only metrics (Iterations=5, Pending=2)
- Using intelligent mock and calling it "real"
- Running tests without functional verification
- Claiming deployment without showing it running

## Problem-Solving Framework

When encountering issues:

1. **Understand First**
   - Read all related code
   - Check documentation
   - Review past mistakes in `docs/LESSONS_LEARNED.md`

2. **Diagnose Systematically**
   - Test each component independently
   - Identify root cause (not symptoms)
   - Document findings

3. **Utilize Resources**
   - Check `requirements.txt` for dependencies
   - Install needed packages (don't work around)
   - Use existing framework features

4. **Implement Properly**
   - Make minimal changes
   - Test incrementally
   - Verify with real data

5. **Document Thoroughly**
   - Update `docs/CURRENT_STATE.md`
   - Add to `docs/LESSONS_LEARNED.md`
   - Update architecture docs if needed

## Available Tools & Resources

### Installed & Ready:
- ✅ Python 3.x with pip
- ✅ pytest for testing
- ✅ pylint for code quality
- ✅ CodeQL for security scanning
- ✅ Ollama (installed via script)
- ✅ qwen2.5:0.5b model (pulled)

### Available via pip:
- anthropic (Claude API)
- openai (OpenAI API)
- requests (HTTP)
- All packages in `requirements.txt`

### Available Providers:
1. **OllamaProvider** - Local LLM (installed)
2. **ClaudeProvider** - Requires ANTHROPIC_API_KEY
3. **OpenAICompatibleProvider** - Requires OPENAI_API_KEY
4. **IntelligentMockProvider** - Testing only (NOT for production)

## Current System State

See `docs/CURRENT_STATE.md` for latest status.

**Last Verified Working:**
- Date: 2025-11-15
- Provider: Ollama (qwen2.5:0.5b)
- Agents: 3 running (research, coding, writing)
- Runner: `run_real_agents.py`
- Tests: 30/30 passing
- Security: 0 vulnerabilities

## Key Files to Reference

**Before starting work:**
- `.github/copilot-instructions.md` (this file)
- `docs/LESSONS_LEARNED.md`
- `docs/CURRENT_STATE.md`
- `docs/ARCHITECTURE.md`

**During work:**
- `VERIFICATION.md` - How to test
- `SYSTEMATIC_BREAKDOWN.md` - Methodology
- `requirements.txt` - Dependencies

**After completing work:**
- Update all `docs/` files
- Run full verification
- Document what worked/failed

## Communication Protocol

### When Reporting Progress:
1. Show actual output (copy/paste from terminal)
2. State which provider is being used
3. Prove it's working with real verification
4. List any limitations honestly
5. Provide clear next steps

### When Encountering Issues:
1. Document the problem clearly
2. Show what you tried
3. Explain why it failed
4. Ask for clarification if needed
5. Update `docs/LESSONS_LEARNED.md`

## Success Criteria

Work is complete when:
- ✅ All tests passing (30/30)
- ✅ Real LLM provider working (not mock)
- ✅ Agents running continuously
- ✅ Visible, verifiable output
- ✅ Security scan clean (0 vulnerabilities)
- ✅ Documentation updated
- ✅ User can reproduce/verify results

## Final Reminder

**DO NOT:**
- Rush to solutions
- Skip systematic review
- Use mock data as "proof"
- Claim success without verification
- Ignore past mistakes

**DO:**
- Read documentation first
- Use available resources
- Test incrementally
- Be honest about limitations
- Update knowledge base when done

---

**This document is living and should be updated by each Copilot session that learns something new.**

Last Updated: 2025-11-15
Last Updated By: Copilot (autonomous agent implementation)
