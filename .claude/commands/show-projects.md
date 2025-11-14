# Show Projects

List all projects created via /build-full-stack workflow with their specifications.

**Usage:** `/show-projects [project name]`

**What it does:**
- Lists all full stack projects stored in knowledge graph
- Shows tech stack, architecture, and status
- Optionally retrieves specific project details

**Example:**
```bash
/show-projects
/show-projects RealTimeChatApp_Project
```

---

{{#if arg:project}}
Retrieving project: {{arg:project}}

Use mcp__memory__open_nodes to get project details:
```javascript
mcp__memory__open_nodes(["{{arg:project}}"])
```

Display:
- Project description
- Tech stack decisions
- Architecture patterns
- Database schema
- Security measures
- Current status

{{else}}
Listing all projects in knowledge graph:

Use mcp__memory__search_nodes with query "full_stack_project" to find all projects.

Display table:
```
| Project Name              | Tech Stack                  | Status     |
|---------------------------|----------------------------|------------|
| ProjectA                  | Node.js, React, Postgres   | Ready      |
| ProjectB                  | Go, Vue, MongoDB           | In Progress|
```

{{/if}}
