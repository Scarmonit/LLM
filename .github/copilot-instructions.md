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

## Task Understanding & Scoping

### Understanding the Task
Before making ANY changes:
1. **Read the issue description completely** - Understand what's being asked
2. **Identify the problem statement** - What's broken or missing?
3. **Review acceptance criteria** - What does "done" look like?
4. **Check affected files** - Where will changes be needed?
5. **Assess complexity** - Is this simple, medium, or complex?

### Task Scoping Best Practices
- ✅ **Well-scoped tasks** - Clear problem, specific solution, testable outcomes
- ✅ **Focused changes** - Change only what's necessary to fix the issue
- ✅ **Incremental approach** - Make small changes, test frequently
- ❌ **Scope creep** - Don't add unrelated improvements
- ❌ **Over-engineering** - Don't make changes more complex than needed
- ❌ **Assumptions** - If unclear, ask for clarification

### Types of Tasks You Excel At
1. **Bug Fixes** - Clear reproduction, specific error, known solution
2. **Feature Additions** - Well-defined requirements, clear acceptance criteria
3. **Refactoring** - Improve code quality without changing behavior
4. **Documentation** - Add or update documentation for clarity
5. **Test Coverage** - Add tests for untested code paths

### Types of Tasks That Need Clarification
1. **Vague requirements** - "Make it better" without specifics
2. **Ambiguous scope** - Unclear what should be changed
3. **Missing acceptance criteria** - No definition of "done"
4. **Contradictory requirements** - Conflicting instructions
5. **Incomplete context** - Missing information to understand the problem

**If task is unclear, ask for clarification before starting!**

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
- `CONTRIBUTING.md` - Contribution guidelines and best practices
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

## Working with Issue Templates

This repository provides structured issue templates to ensure clear task delegation:

### Available Templates
1. **Bug Fix** (`.github/ISSUE_TEMPLATE/bug_fix.md`)
   - For fixing broken functionality
   - Requires: steps to reproduce, expected vs actual behavior
   - Focus: Minimal fix, don't break existing code

2. **Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`)
   - For adding new functionality
   - Requires: user stories, acceptance criteria, examples
   - Focus: Well-defined scope, comprehensive tests

3. **Refactoring** (`.github/ISSUE_TEMPLATE/refactoring.md`)
   - For improving code quality without changing behavior
   - Requires: current problems, proposed improvements
   - Focus: Maintain all existing tests, no breaking changes

4. **Documentation** (`.github/ISSUE_TEMPLATE/documentation.md`)
   - For adding or updating documentation
   - Requires: what needs documenting, target audience
   - Focus: Clarity, accuracy, practical examples

### Using Templates Effectively
When an issue uses a template:
1. **Read all sections** - Don't skip any part of the template
2. **Follow the structure** - Template guides your implementation
3. **Check acceptance criteria** - These define when you're done
4. **Update status** - Mark criteria as completed in PR description
5. **Verify complexity** - If marked "complex", plan carefully

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
- ✅ All tests passing (52/52 or more)
- ✅ Real LLM provider working (not mock) for production features
- ✅ Agents running continuously (if applicable)
- ✅ Visible, verifiable output
- ✅ Security scan clean (0 vulnerabilities)
- ✅ Documentation updated
- ✅ User can reproduce/verify results
- ✅ All acceptance criteria from issue template met
- ✅ PR template filled out completely
- ✅ Code review feedback addressed

## Pull Request Best Practices

When creating PRs:
1. **Use the PR template** (`.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`)
2. **Link to the issue** - Use "Fixes #123" to auto-close
3. **Fill all sections** - Don't skip parts of the template
4. **Show test results** - Paste actual test output
5. **Document changes** - List all modified files and why
6. **Update CURRENT_STATE.md** - Reflect new system status
7. **Request review** - Add reviewers or let auto-review handle it

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
