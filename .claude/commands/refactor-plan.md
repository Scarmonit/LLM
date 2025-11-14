# Refactor Plan

Create data-driven refactoring strategy using code analysis + research.

**Usage:** `/refactor-plan <code file or description>`

**What it does:**
1. Analyzes code complexity and technical debt
2. Searches for refactoring best practices (2025)
3. Uses sequential thinking to prioritize changes
4. Creates step-by-step refactoring plan
5. Estimates risk and effort

**Example:**
```bash
/refactor-plan src/legacy-service.js
```

---

Create refactoring plan for: {{arg:target}}

Process:
1. If file path provided, analyze the code:
   - Complexity metrics (cyclomatic, nesting depth)
   - Code smells (long functions, duplicates, tight coupling)
   - Dependencies and imports

2. Use WebSearch for:
   - Modern patterns for this type of code (2025)
   - Refactoring techniques and best practices
   - Common pitfalls to avoid

3. Use mcp__sequential-thinking to:
   - Identify highest-value refactorings
   - Order refactorings by risk (safest first)
   - Break down into incremental steps

4. Output:
   - Priority-ordered refactoring steps
   - Risk assessment for each step
   - Testing strategy
   - Estimated effort
   - Success metrics

5. Store plan in mcp__memory for tracking progress
