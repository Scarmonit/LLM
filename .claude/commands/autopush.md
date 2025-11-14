# /autopush - Intelligent Git Auto-Commit & Push

**Description:** Automatically stage, commit with AI-generated message, and push changes to remote

**Usage:** `/autopush [branch] [message-hint]`

---

## EXECUTION PROTOCOL

When user runs `/autopush`:

1. **Analyze Changes**
   - Run `git status` and `git diff` in parallel
   - Review all modified, added, deleted files
   - Understand the nature of changes

2. **Smart Commit Message Generation**
   - Follow conventional commits format
   - Analyze git log for repository style
   - Categories: feat|fix|docs|style|refactor|test|chore|perf
   - Make it descriptive but concise

3. **Execute Push Sequence**
   ```bash
   git add .
   git commit -m "Generated message"
   git push origin <branch>
   ```

4. **Handle Conflicts**
   - If push fails, check for upstream changes
   - Offer to pull --rebase and retry
   - Report conflicts if any

## COMMIT MESSAGE RULES

**Format:**
```
<type>(<scope>): <subject>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Examples:**
- `feat(auth): add JWT token validation`
- `fix(api): resolve memory leak in database connection`
- `docs: update installation guide with Docker instructions`
- `refactor(utils): improve error handling in file processor`

## BRANCH HANDLING

**Default:** Current branch
**If specified:** Switch to branch first (create if doesn't exist)

## SAFETY CHECKS

**Before pushing:**
- ✅ Check not on protected branch (main/master) without confirmation
- ✅ Verify remote exists
- ✅ No merge conflicts
- ✅ No uncommitted sensitive files (.env, keys, credentials)

**Auto-exclude:**
- `.env` files (unless explicitly staged)
- `*.key`, `*.pem` files
- `credentials.json`, `secrets.yaml`
- Warn user if these detected

## EXECUTION

```bash
# Basic usage
/autopush

# With custom branch
/autopush feat/new-feature

# With message hint
/autopush main "security updates"
```

**NO ASKING - JUST DO IT.**
