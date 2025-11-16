# Map Codebase

Analyze a codebase and store its structure in the knowledge graph for persistent memory across sessions.

**Usage:** `/map-codebase [directory]`

**What it does:**
1. Analyzes codebase structure (languages, entry points, dependencies)
2. Identifies key files and components
3. Stores findings in knowledge graph using memory MCP
4. Enables incremental codebase exploration with persistent context

**Example:**
```bash
/map-codebase ~/my-project
```

---

Run the codebase mapper tool and automatically save results to knowledge graph:

```bash
cd {{arg:directory:.}}

# Run mapper
node ~/.claude/automation/codebase-mapper.cjs > /tmp/map-output.json 2>&1

# Show results
cat .claude/codebase-map.json

# Instructions to Claude:
# 1. Read the .claude/codebase-map.json file
# 2. Use mcp__memory__create_entities to store all entities from the analysis
# 3. Use mcp__memory__create_relations to store all relationships
# 4. Confirm the codebase is now mapped in knowledge graph
```
