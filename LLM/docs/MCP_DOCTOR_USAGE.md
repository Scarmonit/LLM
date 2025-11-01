# MCP Doctor - Usage Guide

**The meta-MCP that fixes other MCPs**

## Overview

MCP Doctor is an MCP server that diagnoses and fixes other MCP servers. It provides 5 powerful tools for MCP debugging, validation, and generation.

## Installation

Already installed! MCP Doctor is configured in your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-doctor": {
      "command": "node",
      "args": ["C:\\Users\\scarm\\LLM\\src\\mcp\\mcp-doctor-server.js"]
    }
  }
}
```

**Restart Claude Desktop** to load MCP Doctor.

---

## Tools

### 1. `diagnose_mcp` - Health Check for MCP Servers

**What it does:** Comprehensive diagnostic of an MCP server

**Checks:**
- ✅ Config syntax and structure
- ✅ Command executable exists
- ✅ File paths are valid
- ✅ Source code analysis (imports, transport, error handling)
- ✅ Common configuration issues

**Example:**

```
User: "Diagnose the aws-cli-native MCP server"

MCP Doctor runs: diagnose_mcp({
  server_name: "aws-cli-native",
  server_file_path: "C:\\Users\\scarm\\LLM\\src\\mcp\\aws-cli-mcp-server.js"
})

Response:
# MCP Diagnosis: aws-cli-native

Status: ✅ HEALTHY

## Info
✓ node installed: v20.11.0
✓ Server file exists: C:\Users\scarm\LLM\src\mcp\aws-cli-mcp-server.js
✓ Source code analyzed
✓ Environment variables configured: 2
```

---

### 2. `fix_mcp_schema` - Auto-Fix Schema Errors

**What it does:** Automatically fixes common MCP tool schema errors

**Fixes:**
- Missing `required` field
- Wrong type capitalization (`String` → `string`)
- Missing descriptions
- Invalid enum values (missing quotes)

**Example:**

```
User: "Fix schema errors in my-broken-mcp.js"

MCP Doctor runs: fix_mcp_schema({
  server_file_path: "C:\\path\\to\\my-broken-mcp.js",
  dry_run: false
})

Response:
✅ FIXED

Applied fixes:
1. Added missing "required" field to inputSchema
2. Fixed type: "String" → "string"
3. Fixed enum values: added quotes

File: C:\path\to\my-broken-mcp.js
```

**Dry run mode:**

```
User: "Show me what schema fixes would be applied to my-broken-mcp.js without applying them"

MCP Doctor runs: fix_mcp_schema({
  server_file_path: "C:\\path\\to\\my-broken-mcp.js",
  dry_run: true
})
```

---

### 3. `validate_mcp_config` - Config Validation

**What it does:** Validates Claude Desktop MCP configuration file

**Checks:**
- ✅ Valid JSON syntax
- ✅ Required fields present
- ✅ Proper structure
- ✅ Each server has command and args
- ✅ Disabled servers

**Example:**

```
User: "Validate my MCP configuration"

MCP Doctor runs: validate_mcp_config({})

Response:
# Config Validation

File: C:\Users\scarm\AppData\Roaming\Claude\claude_desktop_config.json
Status: ✅ VALID

## Info
ℹ️  Found 12 MCP server(s)
ℹ️  Server "onepassword-docker": disabled
```

---

### 4. `test_mcp_tools` - Tool Testing

**What it does:** Provides instructions for testing MCP tools

**Note:** Full automated testing requires spawning server processes and JSON-RPC communication. This tool provides testing guidance.

**Example:**

```
User: "Test the mcp-doctor server"

MCP Doctor runs: test_mcp_tools({
  server_name: "mcp-doctor"
})

Response:
🧪 Testing MCP: mcp-doctor

Recommendation: Use this workflow instead:
1. Start server: node mcp-doctor-server.js
2. Send JSON-RPC: {"jsonrpc":"2.0","method":"tools/list","id":1}
3. Verify response structure

For automated testing, see: tests/mcp-doctor.test.js
```

---

### 5. `generate_mcp_template` - Scaffold New MCP Server

**What it does:** Generates a working MCP server template with best practices

**Includes:**
- Proper MCP SDK imports
- StdioServerTransport setup
- Tool definitions with schemas
- Error handling
- Placeholder tool implementations

**Example:**

```
User: "Generate a new MCP server called 'weather-mcp' with tools: get_forecast, get_current"

MCP Doctor runs: generate_mcp_template({
  server_name: "weather-mcp",
  tools: ["get_forecast", "get_current"],
  output_path: "C:\\Users\\scarm\\LLM\\src\\mcp\\weather-mcp-server.js"
})

Response:
✅ Generated MCP server: C:\Users\scarm\LLM\src\mcp\weather-mcp-server.js

Tools included: get_forecast, get_current

Next steps:
1. npm install @modelcontextprotocol/sdk
2. chmod +x C:\Users\scarm\LLM\src\mcp\weather-mcp-server.js
3. Add to claude_desktop_config.json:

{
  "mcpServers": {
    "weather-mcp": {
      "command": "node",
      "args": ["C:\\Users\\scarm\\LLM\\src\\mcp\\weather-mcp-server.js"]
    }
  }
}
```

---

## Common Workflows

### Debugging a Non-Loading MCP Server

**Problem:** MCP server appears in config but doesn't load in Claude Desktop

**Solution:**

```
1. Ask Claude: "Diagnose the [server-name] MCP server"
2. MCP Doctor checks:
   - Config syntax ✓
   - Command executable ✓
   - File paths ✓
   - Common issues
3. Fix identified issues
4. Restart Claude Desktop
```

### Creating a New MCP Server

**Problem:** Want to create a custom MCP server

**Solution:**

```
1. Ask Claude: "Generate an MCP server called 'my-tool' with tools: tool1, tool2"
2. MCP Doctor creates template
3. Implement tool logic
4. Test with: node my-tool-server.js
5. Add to claude_desktop_config.json
6. Restart Claude Desktop
```

### Fixing Schema Errors

**Problem:** MCP server has schema validation errors

**Solution:**

```
1. Ask Claude: "Fix schema errors in [server-file.js]"
2. MCP Doctor auto-fixes:
   - Missing required fields
   - Type capitalization
   - Enum values
   - Descriptions
3. Verify with: npm run lint
4. Restart Claude Desktop
```

---

## Testing MCP Doctor

### Automated Tests

```bash
npm test tests/mcp-doctor.test.js
```

**Tests:**
- ✅ Server starts without errors
- ✅ Responds to tools/list
- ✅ All 5 tools are defined
- ✅ Proper error handling exists

### Manual Testing

**Test diagnose_mcp:**
```
Ask Claude: "Diagnose the mcp-doctor server itself"
```

**Test validate_mcp_config:**
```
Ask Claude: "Validate my MCP configuration"
```

**Test generate_mcp_template:**
```
Ask Claude: "Generate a test MCP server called 'demo' with tool: hello"
```

---

## Integration with Other MCPs

MCP Doctor works best when combined with:

1. **Sequential Thinking MCP** - For complex debugging analysis
2. **Filesystem MCP** - For reading/writing MCP server code
3. **GitHub MCP** - For checking official MCP examples
4. **Memory MCP** - For storing common MCP bug patterns

**Example workflow:**

```
1. Sequential Thinking → Analyze MCP problem
2. MCP Doctor → Diagnose server
3. Filesystem → Read source code
4. GitHub → Check official examples
5. MCP Doctor → Fix schema
6. Memory → Store bug pattern + fix
```

---

## Troubleshooting

### MCP Doctor Not Loading

**Check:**
1. Config path correct: `C:\Users\scarm\LLM\src\mcp\mcp-doctor-server.js`
2. Node.js installed: `node --version`
3. MCP SDK installed: `npm list @modelcontextprotocol/sdk`
4. Restart Claude Desktop

### Tool Execution Errors

**Common issues:**
- File paths must be absolute (not relative)
- Config path auto-detected (Windows: `%APPDATA%\Claude\claude_desktop_config.json`)
- Server must be in config to diagnose it

---

## Advanced Usage

### Batch Diagnosis

```
Ask Claude: "Diagnose all my MCP servers and report which ones have issues"
```

MCP Doctor will iterate through all servers in config.

### Creating MCP Server Library

```
Ask Claude: "Generate 5 MCP servers: weather-mcp, news-mcp, stocks-mcp, crypto-mcp, sports-mcp"
```

MCP Doctor will scaffold all 5 servers with proper structure.

### Automated Fixing

```
Ask Claude: "Find and fix all schema errors in src/mcp/*.js files"
```

MCP Doctor will batch-process all MCP servers.

---

## Source Code

- **Server:** `C:\Users\scarm\LLM\src\mcp\mcp-doctor-server.js`
- **Tests:** `C:\Users\scarm\tests\mcp-doctor.test.js`
- **Config:** `C:\Users\scarm\AppData\Roaming\Claude\claude_desktop_config.json`

---

## Summary

MCP Doctor is the **ultimate debugging tool for MCPs**. It:

✅ Diagnoses MCP server health
✅ Auto-fixes schema errors
✅ Validates configurations
✅ Tests tool availability
✅ Generates working templates

**Start using it:** Just ask Claude to diagnose, fix, validate, test, or generate MCP servers!
