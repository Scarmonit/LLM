# Selenium Grid MCP Server - Complete Setup Guide

**Production-ready MCP server for Claude Desktop browser automation**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Usage in Claude Desktop](#usage-in-claude-desktop)
7. [Available Tools](#available-tools)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## Overview

This MCP (Model Context Protocol) server exposes your Selenium Grid browser automation as native tools that Claude Desktop can call directly. Instead of asking Claude to write code, you can now use commands like "take a screenshot of example.com" and Claude will use the built-in tools.

### What This Provides

- ✅ **Native browser automation** in Claude Desktop conversations
- ✅ **6 production-ready tools** for web automation
- ✅ **Zero external API costs** - runs locally via Selenium Grid
- ✅ **Real browser rendering** - actual Chrome/Firefox automation
- ✅ **Seamless integration** - tools appear automatically in Claude

---

## Prerequisites

### Required Software

1. **Node.js v18+** (for ES modules and native fetch)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **Selenium Grid running in Docker**
   ```bash
   docker run -d --name selenium-grid -p 4444:4444 -p 7900:7900 --shm-size="2g" selenium/standalone-chrome:latest
   ```

3. **Claude Desktop** installed
   - Download from: https://claude.ai/download

### Required Files

Ensure these files exist in `C:\Users\scarm\`:
- ✅ `selenium-client.cjs` - Your existing Selenium client
- ✅ `selenium-mcp-server.js` - The MCP server (created in this guide)
- ✅ `test-mcp-server.js` - Test harness (created in this guide)

---

## Installation

### Step 1: Install MCP SDK

The MCP server requires the official MCP SDK:

```bash
cd C:\Users\scarm
npm install @modelcontextprotocol/sdk
```

**Verify installation:**
```bash
npm list @modelcontextprotocol/sdk
```

Expected output:
```
@modelcontextprotocol/sdk@x.x.x
```

### Step 2: Verify Selenium Grid is Running

```bash
# Check if container is running
docker ps | grep selenium

# Check Grid status
curl http://localhost:4444/status
```

Expected: `"ready": true`

If not running:
```bash
docker start selenium-grid
```

If doesn't exist:
```bash
docker run -d --name selenium-grid -p 4444:4444 -p 7900:7900 --shm-size="2g" selenium/standalone-chrome:latest
```

### Step 3: Test the MCP Server

Run the test suite to verify everything works:

```bash
node test-mcp-server.js
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║     Selenium Grid MCP Server - Test Suite                         ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════
  Test 1: Server Startup
═══════════════════════════════════════════════════════════════════
✓ Server started successfully

═══════════════════════════════════════════════════════════════════
  Test 2: List Tools
═══════════════════════════════════════════════════════════════════
✓ Tools registered: 6
  • selenium_screenshot
  • selenium_scrape
  • selenium_get_title
  • selenium_grid_status
  • selenium_execute_script
  • selenium_get_page_source
✓ All expected tools are present

...

═══════════════════════════════════════════════════════════════════
  Test Summary
═══════════════════════════════════════════════════════════════════
✓ Server Startup
✓ List Tools
✓ Grid Status
✓ Get Page Title
✓ Scrape Text

Results: 5/5 tests passed

🎉 All tests passed! MCP server is working correctly.
```

---

## Configuration

### Step 1: Locate Claude Desktop Config

**Windows Config Path:**
```
C:\Users\scarm\AppData\Roaming\Claude\claude_desktop_config.json
```

**PowerShell command to open:**
```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

**If file doesn't exist**, create it with this initial content:
```json
{
  "mcpServers": {}
}
```

### Step 2: Add Selenium MCP Server

Add the `selenium-grid` server to your config:

```json
{
  "mcpServers": {
    "selenium-grid": {
      "command": "node",
      "args": [
        "C:\\Users\\scarm\\selenium-mcp-server.js"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

**Important Notes:**
- Use **double backslashes** (`\\`) in Windows paths
- If you have other MCP servers, add `selenium-grid` as a new entry
- Don't remove existing servers

**Example with multiple servers:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\scarm"]
    },
    "selenium-grid": {
      "command": "node",
      "args": [
        "C:\\Users\\scarm\\selenium-mcp-server.js"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

### Step 3: Restart Claude Desktop

1. **Close Claude Desktop completely** (check system tray)
2. **Open Claude Desktop** again
3. **Wait 5-10 seconds** for MCP servers to initialize

### Step 4: Verify in Claude Desktop

In a new Claude conversation, ask:
```
What MCP tools do you have available?
```

Claude should list the selenium tools:
- `selenium_screenshot`
- `selenium_scrape`
- `selenium_get_title`
- `selenium_grid_status`
- `selenium_execute_script`
- `selenium_get_page_source`

---

## Testing

### Quick Test Commands

After configuration, test in Claude Desktop:

**Test 1: Grid Status**
```
Check the Selenium Grid status
```

**Test 2: Get Page Title**
```
Get the title of https://example.com
```

**Test 3: Screenshot**
```
Take a screenshot of https://example.com and save it as test-claude.png
```

**Test 4: Scrape Text**
```
Scrape the h1 text from https://example.com
```

### Manual Testing (Command Line)

You can also test the server manually:

```bash
# Start the server
node selenium-mcp-server.js

# In another terminal, send MCP requests via stdin:
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node selenium-mcp-server.js
```

---

## Available Tools

### 1. `selenium_screenshot`
Take a screenshot of a webpage.

**Parameters:**
- `url` (required): URL to screenshot (e.g., "https://example.com")
- `output_file` (optional): Save path (default: "screenshot.png")

**Example Usage in Claude:**
```
Take a screenshot of https://github.com and save it as github.png
```

**Returns:** Path to saved PNG file

---

### 2. `selenium_scrape`
Scrape text content from a webpage element.

**Parameters:**
- `url` (required): URL to scrape
- `selector` (required): CSS selector (e.g., "h1", ".title", "#content")

**Example Usage in Claude:**
```
Scrape the main heading from https://example.com
```

**Returns:** Text content of the element

---

### 3. `selenium_get_title`
Navigate to a URL and get the page title.

**Parameters:**
- `url` (required): URL to navigate to

**Example Usage in Claude:**
```
What's the title of https://www.wikipedia.org?
```

**Returns:** Page title string

---

### 4. `selenium_grid_status`
Check Selenium Grid server status.

**Parameters:** None

**Example Usage in Claude:**
```
Is the Selenium Grid ready?
```

**Returns:** Grid status information (ready state, nodes, etc.)

---

### 5. `selenium_execute_script`
Execute custom JavaScript in the browser context.

**Parameters:**
- `url` (required): URL to navigate to
- `script` (required): JavaScript code to execute

**Example Usage in Claude:**
```
Execute this JavaScript on example.com: return document.links.length
```

**Returns:** Script execution result (JSON)

---

### 6. `selenium_get_page_source`
Retrieve the complete HTML source of a page.

**Parameters:**
- `url` (required): URL to get source from

**Example Usage in Claude:**
```
Get the HTML source of https://example.com
```

**Returns:** Complete HTML source code

---

## Troubleshooting

### Issue 1: "Server not starting"

**Symptoms:**
- Test suite fails on "Server Startup"
- Claude Desktop shows no selenium tools

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version  # Must be v18+
   ```

2. **Verify MCP SDK is installed:**
   ```bash
   npm list @modelcontextprotocol/sdk
   ```

   If not installed:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

3. **Check file paths:**
   ```bash
   # Verify selenium-client.cjs exists
   ls C:\Users\scarm\selenium-client.cjs

   # Verify selenium-mcp-server.js exists
   ls C:\Users\scarm\selenium-mcp-server.js
   ```

4. **Check for syntax errors:**
   ```bash
   node --check selenium-mcp-server.js
   ```

---

### Issue 2: "Cannot connect to Selenium Grid"

**Symptoms:**
- `selenium_grid_status` returns error
- Tools fail with "Request failed" error

**Solutions:**

1. **Check if Grid is running:**
   ```bash
   docker ps | grep selenium
   ```

   If not running:
   ```bash
   docker start selenium-grid
   ```

2. **Verify Grid is accessible:**
   ```bash
   curl http://localhost:4444/status
   ```

   Expected: `"ready": true`

3. **Restart Grid if needed:**
   ```bash
   docker restart selenium-grid
   ```

4. **Check Grid logs:**
   ```bash
   docker logs selenium-grid
   ```

---

### Issue 3: "Tools not appearing in Claude Desktop"

**Symptoms:**
- Claude says "I don't have selenium tools"
- Tools don't show in MCP tools list

**Solutions:**

1. **Verify config file location:**
   ```powershell
   notepad "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

2. **Check JSON syntax:**
   - Use a JSON validator: https://jsonlint.com/
   - Common mistakes: missing commas, wrong quotes

3. **Verify path format:**
   ```json
   "args": [
     "C:\\Users\\scarm\\selenium-mcp-server.js"  // Correct: double backslashes
   ]
   ```

4. **Restart Claude Desktop:**
   - Close completely (check system tray)
   - Wait 5 seconds
   - Reopen

5. **Check Claude Desktop logs:**
   ```
   C:\Users\scarm\AppData\Roaming\Claude\logs\
   ```

---

### Issue 4: "Command timeout"

**Symptoms:**
- Tools fail with "Command timed out after 45000ms"
- Grid shows as busy

**Solutions:**

1. **Check Grid has available slots:**
   ```bash
   curl http://localhost:4444/status | grep -o '"maxSessions":[^,]*'
   ```

2. **Restart Grid to clear stuck sessions:**
   ```bash
   docker restart selenium-grid
   ```

3. **Wait for previous commands to complete:**
   - Grid has limited concurrent sessions (usually 1)
   - Wait for current automation to finish

4. **Increase timeout in selenium-mcp-server.js** (if needed):
   ```javascript
   const DEFAULT_TIMEOUT = 60000; // 60 seconds instead of 45
   ```

---

### Issue 5: "Module not found" errors

**Symptoms:**
- Error: "Cannot find module '@modelcontextprotocol/sdk'"
- Error: "Cannot find module './selenium-client.cjs'"

**Solutions:**

1. **Install MCP SDK:**
   ```bash
   cd C:\Users\scarm
   npm install @modelcontextprotocol/sdk
   ```

2. **Verify selenium-client.cjs exists:**
   ```bash
   ls selenium-client.cjs
   ```

3. **Check package.json has correct type:**
   ```json
   {
     "type": "module"
   }
   ```

   If missing:
   ```bash
   echo '{"type":"module"}' > package.json
   ```

---

## Advanced Configuration

### Custom Timeout Settings

Edit `selenium-mcp-server.js` to adjust timeouts:

```javascript
// Line ~14
const DEFAULT_TIMEOUT = 45000; // Default command timeout (45s)

// Line ~60
timeout = DEFAULT_TIMEOUT // Change for specific commands
```

### Custom Grid URL

If running Selenium Grid on a different host/port:

**In claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "selenium-grid": {
      "command": "node",
      "args": [
        "C:\\Users\\scarm\\selenium-mcp-server.js"
      ],
      "env": {
        "SELENIUM_GRID_URL": "http://192.168.1.100:4444"
      }
    }
  }
}
```

**In selenium-mcp-server.js** (add support for env var):
```javascript
// Update SeleniumClient instantiation
const gridUrl = process.env.SELENIUM_GRID_URL || 'http://localhost:4444';
const client = new SeleniumClient(gridUrl);
```

### Adding Browser Capabilities

Modify `selenium-client.cjs` to customize browser options:

```javascript
// In createSession method
const defaultCapabilities = {
  browserName: 'chrome',
  'goog:chromeOptions': {
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--headless',  // Add for headless mode
      '--window-size=1920,1080'  // Custom window size
    ]
  }
};
```

### Enabling Debug Logging

**In selenium-mcp-server.js**, add logging:

```javascript
// After line ~420 (in tool execution)
console.error(`[DEBUG] Executing tool: ${name}`);
console.error(`[DEBUG] Arguments:`, JSON.stringify(args));
```

**View logs:**
```bash
# Logs go to stderr
node selenium-mcp-server.js 2> debug.log
```

---

## Performance Tips

### 1. Reuse Browser Sessions

For multiple operations on the same page, use `selenium_execute_script` to avoid multiple session creations.

**Instead of:**
```
Get title of example.com
Get source of example.com
Scrape h1 from example.com
```

**Do:**
```
Execute this script on example.com: return {title: document.title, source: document.documentElement.outerHTML, h1: document.querySelector('h1').textContent}
```

### 2. Increase Grid Capacity

Run multiple Grid nodes for parallel automation:

```bash
# Stop existing single-node Grid
docker stop selenium-grid
docker rm selenium-grid

# Start Grid hub
docker run -d -p 4444:4444 --name selenium-hub selenium/hub:latest

# Start multiple Chrome nodes
docker run -d --link selenium-hub:hub selenium/node-chrome:latest
docker run -d --link selenium-hub:hub selenium/node-chrome:latest
```

### 3. Use Headless Mode

Already enabled by default in `selenium-client.cjs`. Headless mode is faster and uses less resources.

---

## Security Considerations

### Network Access

The MCP server can navigate to any URL. Be cautious:
- Don't visit untrusted URLs
- Be aware of SSRF (Server-Side Request Forgery) risks
- Consider implementing URL allowlists for production

### File System Access

Screenshots are saved to the working directory:
- Default: `C:\Users\scarm\`
- Ensure proper file permissions
- Be cautious with `output_file` parameter

### Resource Limits

Selenium Grid runs in Docker with resource limits:
- `--shm-size="2g"` prevents memory issues
- Consider CPU/memory limits for production:
  ```bash
  docker run -d --name selenium-grid \
    --memory="2g" \
    --cpus="2" \
    -p 4444:4444 -p 7900:7900 \
    --shm-size="2g" \
    selenium/standalone-chrome:latest
  ```

---

## FAQ

**Q: Can I use this with Firefox or Edge?**

A: Yes! Change the Docker image:
```bash
# Firefox
docker run -d --name selenium-grid -p 4444:4444 --shm-size="2g" selenium/standalone-firefox:latest

# Edge
docker run -d --name selenium-grid -p 4444:4444 --shm-size="2g" selenium/standalone-edge:latest
```

**Q: How do I watch the browser automation live?**

A: Open VNC viewer at http://localhost:7900 (password: `secret`)

**Q: Can multiple users share one Grid?**

A: Yes, but be aware of slot limits. Scale with multiple nodes or use Grid in distributed mode.

**Q: Does this work on Mac/Linux?**

A: Yes! Just update the file paths in `claude_desktop_config.json`:
```json
// Mac
"args": ["/Users/username/selenium-mcp-server.js"]

// Linux
"args": ["/home/username/selenium-mcp-server.js"]
```

**Q: How do I update the MCP server?**

A: Edit the files, then restart Claude Desktop. No need to reinstall.

**Q: Can I disable the MCP server temporarily?**

A: Yes, in `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "selenium-grid": {
      ...
      "disabled": true  // Set to true
    }
  }
}
```

---

## Support & Resources

### Documentation
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Selenium Grid**: https://www.selenium.dev/documentation/grid/
- **W3C WebDriver**: https://www.w3.org/TR/webdriver/

### Files in This Integration
- `selenium-client.cjs` - Selenium REST API client
- `selenium-mcp-server.js` - MCP server implementation
- `test-mcp-server.js` - Test suite
- `claude-desktop-config-snippet.json` - Config example
- `MCP-SERVER-SETUP.md` - This file

### Logs & Debugging
- **Claude Desktop logs**: `C:\Users\scarm\AppData\Roaming\Claude\logs\`
- **Grid logs**: `docker logs selenium-grid`
- **MCP server logs**: stderr output (redirect to file for debugging)

---

## What's Next?

### Immediate
1. ✅ MCP server installed
2. ✅ Tests passing
3. ✅ Added to Claude Desktop
4. ⏭️ Start using in conversations!

### Try These Commands in Claude Desktop

```
Take a screenshot of https://github.com/trending

Scrape the first article title from https://news.ycombinator.com

What's the title of https://www.wikipedia.org?

Check if the Selenium Grid is ready

Get the page source of https://example.com
```

---

**🎉 You now have production-ready browser automation in Claude Desktop!**

**Cost:** $0 forever
**Dependencies:** Just Node.js + Docker
**Limitations:** None
**Capabilities:** Full browser automation

Start automating! 🚀
