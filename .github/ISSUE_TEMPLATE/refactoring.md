---
name: 🔧 Refactoring
about: Propose code improvement without changing functionality
title: '[REFACTOR] '
labels: refactoring
assignees: copilot
---

## Refactoring Goal

**Summary:**
<!-- What needs to be improved and why? -->

**Current Problems:**
<!-- What issues exist in the current implementation? -->
- [ ] Code duplication
- [ ] Poor performance
- [ ] Hard to maintain
- [ ] Hard to test
- [ ] Unclear structure
- [ ] Other: 

**Expected Benefits:**
<!-- What will improve after refactoring? -->

## Current State

**Files to Refactor:**
<!-- List specific files and line numbers if known -->
- `src/llm_framework/...` (lines X-Y)

**Current Implementation:**
```python
# Show relevant current code or describe the pattern
```

**Why This Needs Refactoring:**
<!-- Technical debt, performance issues, maintainability concerns, etc. -->

## Proposed Improvements

**New Approach:**
<!-- Describe the improved design/implementation -->

**Example After Refactoring:**
```python
# Show how the code should look after refactoring
```

**Design Patterns Used:**
<!-- What patterns or principles guide this refactoring? -->

## Acceptance Criteria

Define success for this refactoring:
- [ ] All existing tests still pass
- [ ] No change in external behavior/API
- [ ] Code is more maintainable
- [ ] Code is more testable
- [ ] Performance is same or better
- [ ] Documentation is updated

## Impact Analysis

**Breaking Changes:**
- [ ] No breaking changes (external API unchanged)
- [ ] Internal breaking changes (describe below):
- [ ] External breaking changes (requires major version bump):

**Affected Components:**
<!-- Which parts of the system depend on the code being refactored? -->
- Component 1: 
- Component 2: 

**Risk Assessment:** <!-- low / medium / high -->
<!-- How risky is this refactoring? -->

## Testing Strategy

**Verification Approach:**
- [ ] Existing tests must pass unchanged
- [ ] Add tests for new internal structure (if needed)
- [ ] Manual testing of affected features
- [ ] Performance benchmarks (before/after)

**Regression Testing:**
```bash
# Commands to verify no functionality changed
python -m pytest tests/ -v
# Any specific test suites:
python -m pytest tests/test_XXX.py -v
```

## Complexity Indicators

**Estimated Scope:** <!-- small / medium / large -->
- **Small:** Single file, <100 lines changed
- **Medium:** Multiple files, 100-300 lines changed
- **Large:** Multiple modules, >300 lines changed

**Dependencies:**
<!-- Does this require other refactorings first? -->

## Migration Plan

**Steps:**
1. <!-- First refactoring step -->
2. <!-- Second refactoring step -->
3. <!-- Final verification -->

**Rollback Plan:**
<!-- How can this be reverted if issues arise? -->

## Documentation Updates

**Docs to Update:**
- [ ] Code comments
- [ ] Architecture documentation
- [ ] API documentation
- [ ] Developer guides

## Additional Context

<!-- Add references, related issues, or design discussions -->

---

**For GitHub Copilot:**
This refactoring follows best practices:
1. No change in external behavior/functionality
2. All existing tests must pass
3. Incremental changes with testing at each step
4. Document why, not just what
5. Verify with real testing, not assumptions
