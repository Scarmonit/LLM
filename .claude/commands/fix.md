# /fix - Autonomous Error Resolution

**Description:** Automatically detect, diagnose, and fix errors in code, builds, tests, or deployments

**Usage:** `/fix [error-description-or-file]`

---

## EXECUTION PROTOCOL

### Phase 1: Error Detection

**Auto-detect from:**
1. **Build errors**
   ```bash
   npm run build
   cargo build
   mvn compile
   ```

2. **Test failures**
   ```bash
   npm test
   pytest
   go test
   ```

3. **Linter errors**
   ```bash
   eslint .
   pylint
   golangci-lint
   ```

4. **Runtime errors**
   - Check logs
   - Review stack traces
   - Analyze crash dumps

5. **Git issues**
   - Merge conflicts
   - Rebase failures
   - Cherry-pick errors

### Phase 2: Diagnosis

**For each error:**

1. **Extract Error Details**
   - Error type/category
   - File location
   - Line number
   - Stack trace
   - Error message

2. **Root Cause Analysis**
   - Search codebase for related code
   - Check recent changes (git blame)
   - Review dependencies
   - Check configuration files

3. **Research Solution**
   - Search documentation
   - Check GitHub issues
   - Review Stack Overflow patterns

### Phase 3: Fix Implementation

**Auto-fix strategies:**

1. **Syntax Errors**
   - Missing semicolons, brackets
   - Indentation issues
   - Import/export problems
   - → Fix immediately

2. **Type Errors**
   - Type mismatches
   - Missing type definitions
   - Generic constraints
   - → Add types/casts

3. **Logic Errors**
   - Off-by-one errors
   - Null pointer issues
   - Undefined variables
   - → Implement null checks, bounds validation

4. **Dependency Issues**
   - Missing packages
   - Version conflicts
   - Peer dependency mismatches
   - → Install/update dependencies

5. **Configuration Errors**
   - Invalid JSON/YAML
   - Missing environment variables
   - Wrong file paths
   - → Update configs

6. **Merge Conflicts**
   - Auto-resolve if safe
   - Prefer incoming/current based on context
   - Manual merge if complex

### Phase 4: Verification

**After each fix:**

1. **Re-run original failing command**
2. **Verify fix successful**
3. **Run full test suite**
4. **Check for regressions**

**If fix fails:**
- Try alternative approach
- Revert and try different strategy
- Up to 3 attempts per error

### Phase 5: Prevention

**Add safeguards:**
- Add tests for the bug
- Add linter rules
- Add type checks
- Update documentation

## FIX PATTERNS BY ERROR TYPE

### Import/Module Errors
```typescript
// Before
import { foo } from './bar'

// After (auto-fix)
import { foo } from './bar.js'  // Added extension
// or
npm install <missing-package>
```

### Null Reference Errors
```typescript
// Before
const name = user.name.toUpperCase()

// After (auto-fix)
const name = user?.name?.toUpperCase() ?? ''
```

### Type Errors
```typescript
// Before
const count: number = "5"

// After (auto-fix)
const count: number = parseInt("5", 10)
```

### Async Errors
```typescript
// Before
const data = fetch('/api')

// After (auto-fix)
const data = await fetch('/api')
```

### Environment Errors
```bash
# Before
Error: MISSING_API_KEY

# After (auto-fix)
echo "API_KEY=your_key_here" >> .env
```

## MULTI-ERROR HANDLING

**If multiple errors found:**
1. Prioritize by severity (critical → warning)
2. Fix in dependency order
3. Group related errors
4. Fix in parallel when possible

## SAFETY FEATURES

**Before auto-fixing:**
- ✅ Create git stash (backup)
- ✅ Run tests to establish baseline
- ✅ Check if on feature branch

**After fixing:**
- ✅ Run full test suite
- ✅ Check no new errors introduced
- ✅ Commit fix automatically
- ✅ Create rollback point

## EXAMPLES

```bash
# Fix all errors in project
/fix

# Fix specific file
/fix src/app.ts

# Fix specific error type
/fix "TypeError in user controller"

# Fix failing tests
/fix tests

# Fix merge conflicts
/fix conflicts

# Fix build errors
/fix build
```

## EXECUTION MODES

**Aggressive Mode (default):**
- Fix everything automatically
- Only ask for dangerous operations

**Safe Mode:**
- Show proposed fixes
- Ask before applying

**Learn Mode:**
- Fix errors
- Generate documentation
- Add prevention tests

## FIX CATEGORIES

1. **Syntax & Parsing** → Auto-fix 100%
2. **Type Errors** → Auto-fix 95%
3. **Logic Bugs** → Auto-fix 80%
4. **Runtime Errors** → Auto-fix 70%
5. **Integration Issues** → Auto-fix 60%
6. **Complex Business Logic** → Propose fix, require review

## COMPLETION CRITERIA

**Only complete when:**
- ✅ All errors fixed
- ✅ All tests passing
- ✅ No new errors introduced
- ✅ Code compiles/builds
- ✅ Linter satisfied

**FIX IT. TEST IT. SHIP IT.**
