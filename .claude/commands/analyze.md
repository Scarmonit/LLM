---
description: Analyze code complexity, maintainability, and technical debt
argument-hint: <file-or-directory>
---

# Code Complexity Analysis

Perform comprehensive analysis of code quality and complexity for: **$ARGUMENTS**

## Analysis Tasks

1. **Cyclomatic Complexity**
   - Identify functions/methods with high complexity (>10)
   - Flag deeply nested control structures
   - Suggest refactoring opportunities

2. **Code Metrics**
   - Lines of code (LOC)
   - Comment ratio
   - Function/class size distribution
   - Duplicate code detection

3. **Maintainability Index**
   - Rate overall maintainability (0-100 scale)
   - Identify code smells
   - Technical debt assessment

4. **Dependency Analysis**
   - Coupling between modules
   - Circular dependencies
   - Dependency depth

## Output Format

Provide a summary table with:
- File/Module name
- Complexity score
- Maintainability rating
- Key issues
- Recommended actions

Use `ultrathink` mode for thorough analysis of large codebases.
