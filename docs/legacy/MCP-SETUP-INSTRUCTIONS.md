# MCP Claude Proxy - Setup & Usage Instructions

Complete guide to set up browser → proxy → MCP Inspector → AWS CLI integration.

---

## 🏗️ Architecture

```
Browser (JSFiddle/Console)
    ↓ HTTP (port 3000)
Proxy Server (mcp-claude-proxy.js)
    ↓ JSON-RPC
MCP Inspector (port 6274)
    ↓ STDIO
AWS MCP Server
    ↓ Shell
AWS CLI
```

---

## 📦 Files Created

1. **mcp-claude-proxy.cjs** - Main proxy server (CommonJS)
2. **mcp-proxy-package.json** - Dependencies configuration
3. **test-mcp-integration.cjs** - Integration test suite (CommonJS)
4. **MCP-SETUP-INSTRUCTIONS.md** - This file

---

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Navigate to the directory
cd C:\Users\scarm

# Install Node.js packages using the package.json
npm install --prefix . express@^4.18.2 cors@^2.8.5 ws@^8.14.2
```

**OR manually install:**
```bash
npm install express cors ws
```

### Step 2: Verify MCP Inspector is Running

The MCP Inspector should already be running at `http://localhost:6274`

**Check status:**
```bash
# Test if MCP Inspector responds
curl http://localhost:6274
```

**If not running, start it:**
```bash
cd LLM
npx @modelcontextprotocol/inspector node src/mcp/aws-cli-mcp-server.js
```

You should see:
```
🚀 MCP Inspector is up and running at:
   http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=1c8c0c736b4c3edde04b3b345cb8ced853978e360a542238c0d2ed5ecce55dac
```

### Step 3: Start the Proxy Server

Open a **new terminal** and run:

```bash
cd C:\Users\scarm
node mcp-claude-proxy.cjs
```

You should see:
```
═══════════════════════════════════════════════════════════
  MCP Claude Proxy Server
═══════════════════════════════════════════════════════════
  Status: RUNNING
  Port: 3000
  MCP Inspector: http://localhost:6274
  Auth Token: 1c8c0c736b4c3edde04b3b345cb8ced853978e360a542238c0d2ed5ecce55dac...
```

**Leave this terminal open** - the proxy server must keep running.

### Step 4: Run Integration Tests

Open a **third terminal** and test the complete chain:

```bash
cd C:\Users\scarm
node test-mcp-integration.cjs
```

This will test:
- ✓ MCP Inspector connectivity
- ✓ Proxy server health
- ✓ MCP tools listing
- ✓ AWS S3 command execution
- ✓ Browser fetch commands

---

## 🌐 Browser Usage

### Option A: Test from Browser Console

1. Open any browser tab
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Paste and run these commands:

```javascript
// Test 1: Check proxy health
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(data => console.log('✓ Proxy Health:', data))
  .catch(err => console.error('✗ Error:', err));

// Test 2: List available MCP tools
fetch('http://localhost:3000/mcp/tools')
  .then(r => r.json())
  .then(data => {
    console.log('✓ Available Tools:', data.tools.map(t => t.name));
  })
  .catch(err => console.error('✗ Error:', err));

// Test 3: Execute AWS S3 list buckets
fetch('http://localhost:3000/mcp/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'aws_s3_list_buckets',
    arguments: { profile: 'default' }
  })
})
  .then(r => r.json())
  .then(data => console.log('✓ AWS S3 Result:', data))
  .catch(err => console.error('✗ Error:', err));
```

### Option B: Use from JSFiddle

1. Navigate to https://jsfiddle.net/
2. Paste this into the **JavaScript** panel:

```javascript
// MCP Claude Proxy Integration Demo

const PROXY_URL = 'http://localhost:3000';

// Health Check
fetch(`${PROXY_URL}/health`)
  .then(r => r.json())
  .then(data => {
    document.body.innerHTML += `<h3>Proxy Status: ${data.status}</h3>`;
    console.log('Health:', data);
  });

// List AWS MCP Tools
fetch(`${PROXY_URL}/mcp/tools`)
  .then(r => r.json())
  .then(data => {
    document.body.innerHTML += `<h3>Available Tools:</h3>`;
    data.tools.forEach(tool => {
      document.body.innerHTML += `<p>• ${tool.name}</p>`;
    });
    console.log('Tools:', data);
  });

// Execute AWS Command
fetch(`${PROXY_URL}/mcp/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'aws_s3_list_buckets',
    arguments: { profile: 'default' }
  })
})
  .then(r => r.json())
  .then(data => {
    document.body.innerHTML += `<h3>AWS S3 Result:</h3>`;
    document.body.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    console.log('AWS Result:', data);
  });
```

3. Click **Run** (or press Ctrl+Enter)

---

## 🔌 API Endpoints

### GET /health
Check proxy server health

**Response:**
```json
{
  "status": "healthy",
  "service": "mcp-claude-proxy",
  "port": 3000,
  "mcpInspector": "http://localhost:6274",
  "timestamp": "2025-11-09T16:40:00.000Z"
}
```

### GET /mcp/tools
List all available MCP tools

**Response:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "aws_execute",
      "description": "Execute AWS CLI commands..."
    },
    {
      "name": "aws_s3_list_buckets",
      "description": "List all S3 buckets"
    }
  ]
}
```

### POST /mcp/execute
Execute an MCP tool

**Request:**
```json
{
  "tool": "aws_s3_list_buckets",
  "arguments": {
    "profile": "default"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": { ... },
  "tool": "aws_s3_list_buckets"
}
```

### POST /aws/execute
Execute general AWS CLI command

**Request:**
```json
{
  "service": "s3",
  "command": "ls",
  "args": [],
  "profile": "default",
  "region": "us-east-1"
}
```

### POST /claude/command
Send command to Claude (placeholder)

**Request:**
```json
{
  "prompt": "Your command here"
}
```

---

## 🔧 Troubleshooting

### Problem: "MCP Inspector not accessible"

**Solution:**
```bash
# Check if MCP Inspector is running
curl http://localhost:6274

# If not, start it:
cd LLM
npx @modelcontextprotocol/inspector node src/mcp/aws-cli-mcp-server.js
```

### Problem: "Proxy server not accessible"

**Solution:**
```bash
# Check if proxy is running
curl http://localhost:3000/health

# If not, start it:
node mcp-claude-proxy.cjs
```

### Problem: "AWS credentials error"

**Solution:**
```bash
# Use your working AWS profile
# In browser/JSFiddle, change profile to 'my-server-profile':
{
  "tool": "aws_s3_list_buckets",
  "arguments": { "profile": "my-server-profile" }
}
```

### Problem: "CORS error in browser"

The proxy has CORS enabled. If you still get errors:
1. Make sure proxy server is running
2. Use `http://localhost:3000` (not https)
3. Check browser console for specific error

---

## 📝 Quick Start Commands

```bash
# Terminal 1: Start MCP Inspector (if not running)
cd LLM && npx @modelcontextprotocol/inspector node src/mcp/aws-cli-mcp-server.js

# Terminal 2: Start Proxy Server
cd C:\Users\scarm && node mcp-claude-proxy.cjs

# Terminal 3: Run Tests
cd C:\Users\scarm && node test-mcp-integration.cjs

# Browser Console: Quick Test
fetch('http://localhost:3000/health').then(r=>r.json()).then(console.log)
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. **MCP Inspector** shows: `🚀 MCP Inspector is up and running`
2. **Proxy Server** shows: `Status: RUNNING` on port 3000
3. **Test Script** shows: All tests passing ✓
4. **Browser Console** shows: Successful fetch responses with data

---

## 🎯 Next Steps

Once everything is working:

1. **Integrate with JSFiddle**: Use the JSFiddle example code above
2. **Build UI**: Create a web interface to send AWS commands
3. **Add More Tools**: Extend proxy to support other MCP tools
4. **Deploy**: Consider deploying proxy to a cloud service

---

**Created:** 2025-11-09
**Auth Token:** 1c8c0c736b4c3edde04b3b345cb8ced853978e360a542238c0d2ed5ecce55dac
**Email:** Scarmonit@gmail.com
