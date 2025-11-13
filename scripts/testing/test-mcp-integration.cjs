#!/usr/bin/env node

/**
 * MCP Integration Test Script
 * Tests the complete chain: Browser → Proxy → MCP Inspector → AWS MCP Server
 */

const http = require('http');

const PROXY_HOST = 'localhost';
const PROXY_PORT = 3000;
const MCP_INSPECTOR_HOST = 'localhost';
const MCP_INSPECTOR_PORT = 6274;

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  TEST: ${name}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

/**
 * Make HTTP request helper
 */
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

/**
 * Test 1: Verify MCP Inspector is running
 */
async function testMCPInspector() {
  logTest('MCP Inspector Connectivity');

  try {
    const response = await makeRequest({
      hostname: MCP_INSPECTOR_HOST,
      port: MCP_INSPECTOR_PORT,
      path: '/',
      method: 'GET',
      timeout: 5000
    });

    if (response.statusCode === 200) {
      log('✓ MCP Inspector is accessible', 'green');
      log(`  URL: http://${MCP_INSPECTOR_HOST}:${MCP_INSPECTOR_PORT}`, 'blue');
      return true;
    } else {
      log(`✗ MCP Inspector returned status ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ MCP Inspector not accessible: ${error.message}`, 'red');
    log(`  Make sure it's running at http://${MCP_INSPECTOR_HOST}:${MCP_INSPECTOR_PORT}`, 'yellow');
    return false;
  }
}

/**
 * Test 2: Verify proxy server health
 */
async function testProxyHealth() {
  logTest('Proxy Server Health Check');

  try {
    const response = await makeRequest({
      hostname: PROXY_HOST,
      port: PROXY_PORT,
      path: '/health',
      method: 'GET',
      timeout: 5000
    });

    if (response.statusCode === 200 && response.data.status === 'healthy') {
      log('✓ Proxy server is healthy', 'green');
      log(`  Port: ${response.data.port}`, 'blue');
      log(`  MCP Inspector: ${response.data.mcpInspector}`, 'blue');
      return true;
    } else {
      log('✗ Proxy server health check failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Proxy server not accessible: ${error.message}`, 'red');
    log(`  Make sure it's running: node mcp-claude-proxy.js`, 'yellow');
    return false;
  }
}

/**
 * Test 3: List available MCP tools
 */
async function testListTools() {
  logTest('List Available MCP Tools');

  try {
    const response = await makeRequest({
      hostname: PROXY_HOST,
      port: PROXY_PORT,
      path: '/mcp/tools',
      method: 'GET',
      timeout: 10000
    });

    if (response.statusCode === 200 && response.data.success) {
      const tools = response.data.tools || [];
      log(`✓ Successfully retrieved ${tools.length} tools`, 'green');

      if (tools.length > 0) {
        log('\n  Available tools:', 'blue');
        tools.forEach(tool => {
          log(`    • ${tool.name}: ${tool.description}`, 'cyan');
        });
      }
      return true;
    } else {
      log('✗ Failed to list tools', 'red');
      log(`  Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`✗ Error listing tools: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 4: Execute AWS S3 list buckets command
 */
async function testAWSS3Command() {
  logTest('Execute AWS S3 List Buckets');

  try {
    const postData = JSON.stringify({
      tool: 'aws_s3_list_buckets',
      arguments: {
        profile: 'default'
      }
    });

    const response = await makeRequest({
      hostname: PROXY_HOST,
      port: PROXY_PORT,
      path: '/mcp/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    }, postData);

    if (response.statusCode === 200 && response.data.success) {
      log('✓ AWS S3 command executed successfully', 'green');
      log('  Result preview:', 'blue');

      const resultText = response.data.result?.content?.[0]?.text;
      if (resultText) {
        try {
          const parsed = JSON.parse(resultText);
          if (parsed.success) {
            log('    Command succeeded', 'green');
            if (parsed.result?.Buckets) {
              log(`    Found ${parsed.result.Buckets.length} S3 buckets`, 'cyan');
            }
          } else {
            log(`    Command failed: ${parsed.error}`, 'yellow');
          }
        } catch (e) {
          log(`    Response: ${resultText.substring(0, 200)}...`, 'cyan');
        }
      }
      return true;
    } else {
      log('✗ AWS S3 command failed', 'red');
      log(`  Status: ${response.statusCode}`, 'yellow');
      log(`  Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`✗ Error executing AWS command: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 5: Test browser-style fetch command
 */
async function testBrowserFetchCommand() {
  logTest('Browser Fetch Simulation');

  const fetchCommand = `
fetch('http://localhost:${PROXY_PORT}/health')
  .then(r => r.json())
  .then(data => console.log('Health:', data))
  .catch(err => console.error('Error:', err));

fetch('http://localhost:${PROXY_PORT}/mcp/tools')
  .then(r => r.json())
  .then(data => console.log('Tools:', data.tools.map(t => t.name)))
  .catch(err => console.error('Error:', err));

fetch('http://localhost:${PROXY_PORT}/mcp/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'aws_s3_list_buckets',
    arguments: { profile: 'default' }
  })
})
  .then(r => r.json())
  .then(data => console.log('AWS Result:', data))
  .catch(err => console.error('Error:', err));
  `.trim();

  log('✓ Browser console commands ready', 'green');
  log('\n  Copy and paste this into your browser console:', 'blue');
  log('\n' + fetchCommand, 'cyan');

  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  MCP Integration Test Suite', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  const results = {
    mcpInspector: await testMCPInspector(),
    proxyHealth: await testProxyHealth(),
    listTools: await testListTools(),
    awsCommand: await testAWSS3Command(),
    browserCommands: await testBrowserFetchCommand()
  };

  // Summary
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  Test Summary', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  const failed = total - passed;

  log(`  Total: ${total}`, 'blue');
  log(`  Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`  Failed: ${failed}`, failed === 0 ? 'blue' : 'red');

  console.log('\n  Results:');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(`    ${status} ${test}`, color);
  });

  log('═══════════════════════════════════════════════════════════', 'cyan');
  console.log('\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
