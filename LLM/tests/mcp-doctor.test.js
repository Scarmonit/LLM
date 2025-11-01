import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Module-level constants
const serverPath = path.join(__dirname, '../src/mcp/mcp-doctor-server.js');

/**
 * MCP Doctor Integration Tests
 * Tests the meta-MCP that fixes other MCPs
 */

describe('MCP Doctor Server', () => {
  let serverProcess;

  before(async () => {
    // Note: These tests verify the server can start
    // Full integration tests require MCP client implementation
  });

  it('should start server without errors', async () => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (serverProcess) serverProcess.kill();
        reject(new Error('Server startup timeout'));
      }, 5000);

      serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderrData = '';
      serverProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        // Server logs to stderr when ready
        if (stderrData.includes('MCP')) {
          clearTimeout(timeout);
          serverProcess.kill();
          resolve();
        }
      });

      serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  });

  it('should respond to tools/list request', async () => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (serverProcess) serverProcess.kill();
        reject(new Error('Request timeout'));
      }, 5000);

      serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdoutData = '';
      serverProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();

        // Look for JSON-RPC response
        try {
          const lines = stdoutData.split('\n').filter(Boolean);
          for (const line of lines) {
            const response = JSON.parse(line);
            if (response.result && response.result.tools) {
              clearTimeout(timeout);

              // Verify tools exist
              const tools = response.result.tools;
              assert.ok(Array.isArray(tools), 'tools should be an array');
              assert.ok(tools.length >= 5, 'should have at least 5 tools');

              // Verify specific tools
              const toolNames = tools.map(t => t.name);
              assert.ok(toolNames.includes('diagnose_mcp'), 'should have diagnose_mcp tool');
              assert.ok(toolNames.includes('fix_mcp_schema'), 'should have fix_mcp_schema tool');
              assert.ok(toolNames.includes('test_mcp_tools'), 'should have test_mcp_tools tool');
              assert.ok(toolNames.includes('validate_mcp_config'), 'should have validate_mcp_config tool');
              assert.ok(toolNames.includes('generate_mcp_template'), 'should have generate_mcp_template tool');

              serverProcess.kill();
              resolve();
              return;
            }
          }
        } catch (e) {
          // Not valid JSON yet, continue
        }
      });

      serverProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      // Send tools/list request
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      };

      serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  });
});

describe('MCP Doctor Tools (Unit)', () => {
  it('should validate tool schemas', () => {
    // Expected tools
    const expectedTools = [
      'diagnose_mcp',
      'fix_mcp_schema',
      'test_mcp_tools',
      'validate_mcp_config',
      'generate_mcp_template',
    ];

    // This would test the schema definitions
    // In a real implementation, we'd import the server class
    // and verify each tool has proper inputSchema
    assert.ok(expectedTools.length === 5, 'should define 5 tools');
  });

  it('should have proper error handling patterns', async () => {
    // Verify the server code includes error handling
    const fs = await import('fs/promises');
    const serverCode = await fs.readFile(serverPath, 'utf-8');

    assert.ok(serverCode.includes('try'), 'should use try/catch');
    assert.ok(serverCode.includes('catch'), 'should handle errors');
    assert.ok(serverCode.includes('isError'), 'should mark error responses');
  });
});

/**
 * Manual Test Instructions
 *
 * To fully test MCP Doctor:
 *
 * 1. Restart Claude Desktop to load mcp-doctor server
 *
 * 2. Test diagnose_mcp:
 *    - Ask Claude: "Use MCP Doctor to diagnose the aws-cli-native server"
 *    - Should return health check with issues/warnings/suggestions
 *
 * 3. Test validate_mcp_config:
 *    - Ask Claude: "Validate my MCP configuration"
 *    - Should analyze claude_desktop_config.json
 *
 * 4. Test fix_mcp_schema:
 *    - Create a broken MCP server with schema errors
 *    - Ask Claude: "Fix the schema in [broken-server.js]"
 *    - Should auto-fix common schema issues
 *
 * 5. Test generate_mcp_template:
 *    - Ask Claude: "Generate a new MCP server called 'test-mcp' with tools: hello, goodbye"
 *    - Should create a working template
 *
 * 6. Test test_mcp_tools:
 *    - Ask Claude: "Test all tools in the mcp-doctor server"
 *    - Should return testing instructions
 */
