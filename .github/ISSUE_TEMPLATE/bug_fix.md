---
name: 🐛 Bug Fix
about: Report a bug and request a fix
title: '[BUG] '
labels: bug
assignees: copilot
---

## Problem Statement

**Brief Description:**
<!-- Describe the bug in 1-2 sentences -->

**Current Behavior:**
<!-- What is happening now? -->

**Expected Behavior:**
<!-- What should happen instead? -->

**Error Messages/Logs:**
```
<!-- Paste any error messages or relevant logs here -->
```

## Reproduction Steps

1. 
2. 
3. 

**Environment:**
- OS: 
- Python Version: 
- LLM Provider: 
- Other relevant details:

## Acceptance Criteria

Define success criteria for this fix:
- [ ] <!-- What must work after the fix? -->
- [ ] <!-- What behavior must be verified? -->
- [ ] <!-- What edge cases must be handled? -->

## Affected Components

**Files to Investigate:**
<!-- List the files most likely affected by this bug -->
- `src/llm_framework/...`
- `tests/...`

**Related Code:**
<!-- Reference specific functions, classes, or modules if known -->

## Complexity Indicators

**Estimated Scope:** <!-- small / medium / large -->
- **Small:** Single file, <50 lines changed
- **Medium:** Multiple files, 50-200 lines changed
- **Large:** Multiple modules, >200 lines changed

**Dependencies:** 
<!-- Does this fix require other changes or updates? -->
- [ ] No dependencies
- [ ] Requires dependency updates
- [ ] Requires breaking changes
- [ ] Requires documentation updates

## Testing Strategy

**Tests Required:**
- [ ] Unit tests for the fix
- [ ] Integration tests if multiple components affected
- [ ] Manual verification steps

**Verification Command:**
```bash
# How should this fix be verified?
python -m pytest tests/test_XXX.py -v
```

## Additional Context

<!-- Add any other context, screenshots, or examples here -->

---

**For GitHub Copilot:**
This issue follows the repository's systematic approach. Please:
1. Review `.github/copilot-instructions.md` before starting
2. Check `docs/LESSONS_LEARNED.md` for past mistakes
3. Test with real verification (not mock data)
4. Update documentation if applicable
