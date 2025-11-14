# Database Design

Data-driven database schema design using normalization theory + 2025 best practices.

**Usage:** `/db-design <requirements description>`

**What it does:**
1. Analyzes data requirements
2. Searches database design patterns (2025)
3. Uses sequential thinking for normalization and optimization
4. Recommends schema with trade-offs explained
5. Provides migration strategy

**Example:**
```bash
/db-design E-commerce system with users, products, orders, and inventory
```

---

Design database schema for: {{arg:requirements}}

Process:
1. Use mcp__sequential-thinking to analyze requirements:
   - Identify entities and relationships
   - Determine cardinality (1:1, 1:many, many:many)
   - Identify access patterns (reads vs writes)
   - Consider scale requirements

2. Use WebSearch for:
   - Database design patterns for this domain (2025)
   - SQL vs NoSQL decision factors
   - Indexing strategies
   - Partitioning/sharding approaches

3. Continue sequential thinking to:
   - Apply normalization (3NF or denormalize?)
   - Design indexes based on query patterns
   - Identify potential bottlenecks
   - Plan for scale

4. Output:
   - Recommended database type (SQL/NoSQL)
   - Complete schema (tables/collections)
   - Index recommendations
   - Denormalization trade-offs
   - Migration strategy
   - Query optimization tips

5. Store design in mcp__memory for future reference
