#!/usr/bin/env node
/**
 * Test harness for Selenium Grid MCP Server
 *
 * Verifies that the MCP server starts correctly, tools are registered,
 * and commands execute properly.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MCP_SERVER_PATH = join(__dirname, 'selenium-mcp-server.js');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
  console.log('\n' + '═'.repeat(70));
  log(`  ${text}`, 'cyan');
  console.log('═'.repeat(70));
}

/**
 * Send MCP request to server
 */
function sendMCPRequest(child, request) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, 30000);

    let responseData = '';

    const onData = (data) => {
      responseData += data.toString();

      // MCP responses are JSON-RPC, look for complete message
      try {
        const lines = responseData.split('\n').filter(l => l.trim());
        for (const line of lines) {
          const response = JSON.parse(line);
          if (response.id === request.id) {
            clearTimeout(timeout);
            child.stdout.off('data', onData);
            resolve(response);
            return;
          }
        }
      } catch (e) {
        // Not yet a complete JSON message, keep waiting
      }
    };

    child.stdout.on('data', onData);
    child.stdin.write(JSON.stringify(request) + '\n');
  });
}

/**
 * Test 1: Server starts successfully
 */
async function testServerStart() {
  header('Test 1: Server Startup');

  return new Promise((resolve, reject) => {
    const child = spawn('node', [MCP_SERVER_PATH], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderrData = '';
    let started = false;

    const timeout = setTimeout(() => {
      if (!started) {
        child.kill();
        reject(new Error('Server did not start within timeout'));
      }
    }, 10000);

    child.stderr.on('data', (data) => {
      stderrData += data.toString();

      if (stderrData.includes('Selenium Grid MCP Server running')) {
        started = true;
        clearTimeout(timeout);
        log('✓ Server started successfully', 'green');
        log(`  ${stderrData.split('\n')[0]}`, 'blue');
        child.kill();
        resolve(child);
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

/**
 * Test 2: List tools
 */
async function testListTools() {
  header('Test 2: List Tools');

  const child = spawn('node', [MCP_SERVER_PATH], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Wait for server to start
  await new Promise((resolve) => {
    child.stderr.on('data', (data) => {
      if (data.toString().includes('running')) {
        setTimeout(resolve, 1000);
      }
    });
  });

  try {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    };

    const response = await sendMCPRequest(child, request);

    if (response.result && response.result.tools) {
      const tools = response.result.tools;
      log(`✓ Tools registered: ${tools.length}`, 'green');

      tools.forEach(tool => {
        log(`  • ${tool.name}`, 'blue');
      });

      // Verify expected tools
      const expectedTools = [
        'selenium_screenshot',
        'selenium_scrape',
        'selenium_get_title',
        'selenium_grid_status',
        'selenium_execute_script',
        'selenium_get_page_source'
      ];

      const toolNames = tools.map(t => t.name);
      const allPresent = expectedTools.every(name => toolNames.includes(name));

      if (allPresent) {
        log('✓ All expected tools are present', 'green');
      } else {
        log('✗ Some expected tools are missing', 'red');
      }

      return tools;
    } else {
      throw new Error('Invalid response format');
    }
  } finally {
    child.kill();
  }
}

/**
 * Test 3: Grid status check
 */
async function testGridStatus() {
  header('Test 3: Grid Status Check');

  const child = spawn('node', [MCP_SERVER_PATH], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Wait for server to start
  await new Promise((resolve) => {
    child.stderr.on('data', (data) => {
      if (data.toString().includes('running')) {
        setTimeout(resolve, 1000);
      }
    });
  });

  try {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'selenium_grid_status',
        arguments: {}
      }
    };

    log('Calling selenium_grid_status...', 'blue');
    const response = await sendMCPRequest(child, request);

    if (response.result && response.result.content) {
      const text = response.result.content[0].text;
      log('✓ Grid status retrieved:', 'green');
      log(`  ${text.replace(/\n/g, '\n  ')}`, 'blue');

      if (text.includes('Ready') || text.includes('ready')) {
        log('✓ Grid is ready', 'green');
      } else {
        log('⚠ Grid may not be ready', 'yellow');
      }

      return text;
    } else {
      throw new Error('Invalid response format');
    }
  } finally {
    child.kill();
  }
}

/**
 * Test 4: Get page title
 */
async function testGetTitle() {
  header('Test 4: Get Page Title');

  const child = spawn('node', [MCP_SERVER_PATH], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Wait for server to start
  await new Promise((resolve) => {
    child.stderr.on('data', (data) => {
      if (data.toString().includes('running')) {
        setTimeout(resolve, 1000);
      }
    });
  });

  try {
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'selenium_get_title',
        arguments: {
          url: 'https://example.com'
        }
      }
    };

    log('Calling selenium_get_title for https://example.com...', 'blue');
    const response = await sendMCPRequest(child, request);

    if (response.result && response.result.content) {
      const text = response.result.content[0].text;
      log('✓ Page title retrieved:', 'green');
      log(`  "${text}"`, 'blue');

      if (text.includes('Example Domain')) {
        log('✓ Title matches expected value', 'green');
      }

      return text;
    } else if (response.result && response.result.isError) {
      log('✗ Error occurred:', 'red');
      log(`  ${response.result.content[0].text}`, 'red');
      throw new Error(response.result.content[0].text);
    } else {
      throw new Error('Invalid response format');
    }
  } finally {
    child.kill();
  }
}

/**
 * Test 5: Scrape text
 */
async function testScrape() {
  header('Test 5: Scrape Text');

  const child = spawn('node', [MCP_SERVER_PATH], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Wait for server to start
  await new Promise((resolve) => {
    child.stderr.on('data', (data) => {
      if (data.toString().includes('running')) {
        setTimeout(resolve, 1000);
      }
    });
  });

  try {
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'selenium_scrape',
        arguments: {
          url: 'https://example.com',
          selector: 'h1'
        }
      }
    };

    log('Calling selenium_scrape for https://example.com h1...', 'blue');
    const response = await sendMCPRequest(child, request);

    if (response.result && response.result.content) {
      const text = response.result.content[0].text;
      log('✓ Text scraped:', 'green');
      log(`  "${text}"`, 'blue');

      if (text.includes('Example Domain')) {
        log('✓ Scraped text matches expected content', 'green');
      }

      return text;
    } else if (response.result && response.result.isError) {
      log('✗ Error occurred:', 'red');
      log(`  ${response.result.content[0].text}`, 'red');
      throw new Error(response.result.content[0].text);
    } else {
      throw new Error('Invalid response format');
    }
  } finally {
    child.kill();
  }
}

/**
 * Main test runner
 */
async function main() {
  console.clear();

  log('\n╔════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                    ║', 'cyan');
  log('║     Selenium Grid MCP Server - Test Suite                         ║', 'cyan');
  log('║                                                                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

  const results = [];

  // Test 1: Server startup
  try {
    await testServerStart();
    results.push({ name: 'Server Startup', passed: true });
  } catch (error) {
    log(`✗ Server startup failed: ${error.message}`, 'red');
    results.push({ name: 'Server Startup', passed: false });
    // Can't continue if server won't start
    process.exit(1);
  }

  // Test 2: List tools
  try {
    await testListTools();
    results.push({ name: 'List Tools', passed: true });
  } catch (error) {
    log(`✗ List tools failed: ${error.message}`, 'red');
    results.push({ name: 'List Tools', passed: false });
  }

  // Test 3: Grid status
  try {
    await testGridStatus();
    results.push({ name: 'Grid Status', passed: true });
  } catch (error) {
    log(`✗ Grid status check failed: ${error.message}`, 'red');
    log('⚠ Make sure Selenium Grid is running:', 'yellow');
    log('  docker run -d --name selenium-grid -p 4444:4444 --shm-size="2g" selenium/standalone-chrome', 'yellow');
    results.push({ name: 'Grid Status', passed: false });
  }

  // Test 4: Get title
  try {
    await testGetTitle();
    results.push({ name: 'Get Page Title', passed: true });
  } catch (error) {
    log(`✗ Get title failed: ${error.message}`, 'red');
    results.push({ name: 'Get Page Title', passed: false });
  }

  // Test 5: Scrape
  try {
    await testScrape();
    results.push({ name: 'Scrape Text', passed: true });
  } catch (error) {
    log(`✗ Scrape failed: ${error.message}`, 'red');
    results.push({ name: 'Scrape Text', passed: false });
  }

  // Summary
  header('Test Summary');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });

  console.log('\n' + '─'.repeat(70));
  log(`\nResults: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All tests passed! MCP server is working correctly.', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Add server to Claude Desktop config', 'blue');
    log('  2. Restart Claude Desktop', 'blue');
    log('  3. Use selenium tools in conversations', 'blue');
  } else {
    log('\n⚠ Some tests failed. Review errors above.', 'yellow');
  }

  console.log('\n');
  process.exit(passed === total ? 0 : 1);
}

main().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
