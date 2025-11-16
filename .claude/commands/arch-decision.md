# Architectural Decision Helper

Use sequential thinking + web search to evaluate architectural decisions with research-backed recommendations.

**Usage:** `/arch-decision <decision description>`

**What it does:**
1. Uses sequential thinking to break down the decision
2. Searches for best practices and recent approaches
3. Evaluates trade-offs
4. Provides recommendation with rationale
5. Stores decision in knowledge graph for future reference

**Example:**
```bash
/arch-decision Should I use REST or GraphQL for my API?
```

---

Use sequential thinking to analyze this architectural decision: {{arg:decision}}

Steps:
1. Use mcp__sequential-thinking to break down the decision into key factors
2. Use WebSearch to find recent best practices and comparisons (2025)
3. Continue sequential thinking to evaluate trade-offs
4. Generate recommendation with clear rationale
5. Use mcp__memory to store the decision and rationale for future reference
