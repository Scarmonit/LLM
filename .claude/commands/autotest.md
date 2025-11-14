# /autotest - Intelligent Test Generation & Execution

**Description:** Generate comprehensive tests automatically, then run them

**Usage:** `/autotest [file-or-directory]`

---

## EXECUTION PROTOCOL

### Phase 1: Analysis

1. **Scan Target**
   - Identify language/framework
   - Detect existing test setup
   - Find test patterns used

2. **Detect Testing Framework**
   - JavaScript: Jest, Vitest, Mocha
   - Python: pytest, unittest
   - Go: testing package
   - Java: JUnit
   - TypeScript: Jest + ts-jest

### Phase 2: Test Generation

**For each function/class/component:**

1. **Generate Unit Tests**
   - Happy path scenarios
   - Edge cases
   - Error conditions
   - Boundary values
   - Null/undefined handling

2. **Generate Integration Tests**
   - Component interactions
   - API endpoints
   - Database queries
   - External service mocks

3. **Generate E2E Tests** (if UI)
   - User workflows
   - Critical paths
   - Form submissions
   - Navigation flows

### Phase 3: Test Execution

1. **Install Dependencies**
   ```bash
   npm install -D jest @testing-library/react
   # or
   pip install pytest pytest-cov
   ```

2. **Run Tests**
   ```bash
   npm test -- --coverage
   # or
   pytest --cov --cov-report=html
   ```

3. **Fix Failing Tests**
   - Analyze failures
   - Update tests or code
   - Retry until passing

### Phase 4: Coverage Analysis

1. **Generate Coverage Report**
2. **Identify Gaps**
3. **Generate Additional Tests** for uncovered code
4. **Target: 80%+ coverage**

## TEST PATTERNS

### JavaScript/TypeScript
```typescript
describe('Component/Function Name', () => {
  it('should handle normal case', () => {})
  it('should handle edge case', () => {})
  it('should throw error on invalid input', () => {})
  it('should handle async operations', async () => {})
})
```

### Python
```python
class TestFeature:
    def test_normal_case(self):
        pass

    def test_edge_case(self):
        pass

    def test_error_handling(self):
        with pytest.raises(Exception):
            pass
```

### Go
```go
func TestFeature(t *testing.T) {
    t.Run("normal case", func(t *testing.T) {})
    t.Run("edge case", func(t *testing.T) {})
    t.Run("error handling", func(t *testing.T) {})
}
```

## SMART FEATURES

**Auto-mock:**
- API calls
- Database connections
- File system operations
- External services
- Time/dates

**Auto-fixtures:**
- Test data generation
- Factory patterns
- Seed data for databases

**Auto-cleanup:**
- Teardown after tests
- Clear mocks
- Reset state

## COVERAGE GOALS

**Minimum targets:**
- Statements: 80%
- Branches: 75%
- Functions: 90%
- Lines: 80%

**Priority testing:**
1. Business logic (100% coverage)
2. API endpoints (95% coverage)
3. Error handlers (100% coverage)
4. Utils/helpers (80% coverage)
5. UI components (70% coverage)

## CI/CD INTEGRATION

**Auto-generate:**
- GitHub Actions workflow
- GitLab CI config
- Jenkins pipeline

**Test on:**
- Every commit
- Every PR
- Before merge
- Before deploy

## EXAMPLES

```bash
# Test entire project
/autotest

# Test specific file
/autotest src/utils/parser.ts

# Test directory
/autotest src/components/

# Generate and run with coverage
/autotest --coverage
```

## EXECUTION GUARANTEE

**This command will:**
1. Generate comprehensive tests
2. Run all tests
3. Fix any failing tests
4. Report coverage
5. Only complete when all tests pass

**NO SKIPPING. 100% TEST COVERAGE MISSION.**
