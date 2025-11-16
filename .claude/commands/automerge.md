# /automerge - Intelligent PR Auto-Merge

**Description:** Automatically review, approve, and merge pull requests with safety checks

**Usage:** `/automerge <pr-number> [strategy]`

**Merge Strategies:** `squash` (default), `merge`, `rebase`

---

## EXECUTION PROTOCOL

1. **PR Analysis**
   ```bash
   gh pr view <pr-number> --json title,body,commits,files,reviews,checks
   ```

2. **Safety Checks**
   - ✅ All CI checks passing
   - ✅ No merge conflicts
   - ✅ Required reviews met
   - ✅ No requested changes pending
   - ✅ Branch up-to-date with base

3. **Code Review** (if not reviewed)
   - Analyze all changed files
   - Check for:
     - Security vulnerabilities
     - Code quality issues
     - Breaking changes
     - Test coverage
   - Add review comment with findings

4. **Merge Execution**
   ```bash
   gh pr merge <pr-number> --<strategy> --auto --delete-branch
   ```

## MERGE STRATEGIES

**Squash (default):**
- Combines all commits into one
- Clean history
- Good for feature branches

**Merge:**
- Preserves all commits
- Creates merge commit
- Good for long-lived branches

**Rebase:**
- Replays commits on base
- Linear history
- Good for clean histories

## SAFETY FEATURES

**Auto-abort if:**
- ❌ CI failing
- ❌ Merge conflicts exist
- ❌ Required approvals missing
- ❌ Security issues detected
- ❌ Breaking changes without major version bump

**Auto-approve if:**
- ✅ Dependabot PR (minor/patch updates)
- ✅ Documentation-only changes
- ✅ Automated test additions
- ✅ Code formatting/linting fixes

## EXAMPLES

```bash
# Auto-merge with default squash
/automerge 123

# Use merge strategy
/automerge 123 merge

# Use rebase strategy
/automerge 123 rebase
```

**TRUST BUT VERIFY. THEN MERGE.**
