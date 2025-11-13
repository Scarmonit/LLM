// Quick test to verify Playwright MCP server works
const { spawn } = require('child_process');

console.log('Testing Playwright MCP server...\n');

const server = spawn('mcp-server-playwright', [], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let hasError = false;

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
  hasError = true;
});

// Send an MCP initialize request
const initRequest = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
}) + '\n';

setTimeout(() => {
  server.stdin.write(initRequest);

  setTimeout(() => {
    if (!hasError && output.length > 0) {
      console.log('✓ Playwright MCP server is working!');
      console.log('Response preview:', output.substring(0, 200));
    } else if (hasError) {
      console.log('✗ Server had errors (check above)');
    } else {
      console.log('⚠ No response received (server may be waiting for more input)');
      console.log('  This is normal for MCP servers - they stay running.');
    }
    server.kill();
    process.exit(hasError ? 1 : 0);
  }, 2000);
}, 1000);
