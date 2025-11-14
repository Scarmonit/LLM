# Tech Compare

Systematic technology comparison using benchmarks + 2025 industry data.

**Usage:** `/tech-compare <technology A> vs <technology B> for <use case>`

**What it does:**
1. Uses sequential thinking to identify decision factors
2. Searches benchmarks, case studies, trends (2025)
3. Compares objectively across multiple dimensions
4. Provides recommendation with data backing
5. Stores decision rationale in knowledge graph

**Example:**
```bash
/tech-compare PostgreSQL vs MongoDB for analytics workload
```

---

Compare: {{arg:comparison}}

Process:
1. Use mcp__sequential-thinking to identify comparison factors:
   - Performance characteristics
   - Learning curve
   - Community/ecosystem
   - Cost (hosting, licensing, maintenance)
   - Scale/reliability
   - Feature fit for use case

2. Use WebSearch for (2025 data):
   - Benchmarks and performance comparisons
   - Production case studies
   - Community trends and adoption
   - Known issues and limitations
   - Cost analysis

3. Continue sequential thinking to:
   - Weight factors by use case importance
   - Calculate objective scores
   - Identify deal-breakers
   - Consider team expertise

4. Output comparison matrix:
   ```
   | Factor       | Tech A | Tech B | Winner |
   |--------------|--------|--------|--------|
   | Performance  | X/10   | Y/10   | ...    |
   | Learning     | X/10   | Y/10   | ...    |
   | ...          | ...    | ...    | ...    |
   ```

5. Final recommendation with:
   - Clear winner (or "depends on...")
   - Key trade-offs
   - Migration considerations
   - Long-term outlook

6. Store in mcp__memory for future reference
