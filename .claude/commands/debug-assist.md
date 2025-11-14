# Debug Assist

Systematic root cause analysis for complex bugs using sequential thinking + web search.

**Usage:** `/debug-assist <bug description>`

**What it does:**
1. Uses sequential thinking to break down the problem
2. Searches for similar issues and solutions (2025)
3. Analyzes potential root causes systematically
4. Provides debugging strategy with specific steps
5. Stores findings in knowledge graph for future reference

**Example:**
```bash
/debug-assist Memory leak in Node.js application after running for 24 hours
```

---

Analyze this bug systematically: {{arg:bug}}

Process:
1. Use mcp__sequential-thinking to break down the problem:
   - What are the symptoms?
   - When does it occur?
   - What changed recently?
   - What are the likely causes?

2. Use WebSearch to find:
   - Similar issues in 2025
   - Known bugs in relevant libraries/frameworks
   - Common root causes for this type of issue

3. Continue sequential thinking to:
   - Rank causes by likelihood
   - Identify diagnostic steps
   - Suggest fixes

4. Output:
   - Most likely root cause
   - Debugging steps to verify
   - Suggested fixes
   - Prevention strategies

5. Use mcp__memory to store the analysis for future reference
