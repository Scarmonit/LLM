# /autopr - Autonomous Pull Request Creation

**Description:** Automatically create comprehensive PR with AI-generated title, description, and metadata

**Usage:** `/autopr [base-branch] [pr-title]`

---

## EXECUTION PROTOCOL

1. **Analyze Changes**
   - Get full diff from base branch: `git diff <base>...HEAD`
   - Review ALL commits in branch (not just latest)
   - Check file changes, additions, deletions

2. **Generate PR Content**

   **Title Format:**
   ```
   <type>: <concise description>
   ```

   **Body Format:**
   ```markdown
   ## Summary
   - Bullet point 1
   - Bullet point 2
   - Bullet point 3

   ## Changes Made
   - Component/File 1: Description
   - Component/File 2: Description

   ## Test Plan
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   - [ ] Documentation updated

   ## Screenshots (if UI changes)
   [If applicable]

   ## Related Issues
   Closes #XXX (if applicable)

   🤖 Generated with Claude Code
   ```

3. **Execute PR Creation**
   ```bash
   # Push current branch if needed
   git push -u origin <current-branch>

   # Create PR using gh CLI
   gh pr create --title "..." --body "..." --base <base-branch>
   ```

4. **Post-Creation**
   - Add relevant labels automatically
   - Request reviewers (if configured)
   - Link to issues (if detected)
   - Return PR URL

## SMART FEATURES

**Auto-detect:**
- Breaking changes → add label "breaking-change"
- Dependencies updated → add label "dependencies"
- Bug fixes → add label "bug"
- New features → add label "enhancement"
- Documentation → add label "documentation"

**Auto-request reviewers:**
- Check CODEOWNERS file
- Look at recent PR reviewers
- Check git blame for modified files

## SAFETY

**Checks before creating:**
- ✅ Current branch pushed to remote
- ✅ Base branch exists
- ✅ No existing PR for this branch
- ✅ All tests passing (if CI configured)

## EXAMPLES

```bash
# Basic - creates PR from current branch to main
/autopr

# Specify base branch
/autopr develop

# With custom title hint
/autopr main "Add authentication system"
```

**NO STOPPING. JUST CREATE THE PR.**
