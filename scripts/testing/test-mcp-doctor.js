#!/usr/bin/env node
/**
 * Test MCP Doctor tools by calling them directly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, 'src/mcp/mcp-doctor-server.js');

async function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`Server exited with code ${code}\n${errorOutput}`));
      } else {
        // Parse JSON-RPC responses
        const lines = output.split('\n').filter(Boolean);
        const responses = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);

        resolve(responses);
      }
    });

    // Send tools/call request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      server.kill();
      reject(new Error('Timeout'));
    }, 10000);
  });
}

async function main() {
  console.log('🔧 Testing MCP Doctor Tools\n');

  // Test 1: Diagnose an MCP server
  console.log('1️⃣  Diagnosing aws-cli-native MCP server...');
  try {
    const responses = await callTool('diagnose_mcp', {
      server_name: 'aws-cli-native',
      server_file_path: 'C:\\Users\\scarm\\LLM\\src\\mcp\\aws-cli-mcp-server.js',
    });

    const result = responses.find(r => r.result);
    if (result?.result?.content?.[0]?.text) {
      console.log(result.result.content[0].text);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n');

  // Test 2: Validate MCP config
  console.log('2️⃣  Validating MCP configuration...');
  try {
    const responses = await callTool('validate_mcp_config', {});

    const result = responses.find(r => r.result);
    if (result?.result?.content?.[0]?.text) {
      console.log(result.result.content[0].text);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n');

  // Test 3: Generate MCP template
  console.log('3️⃣  Generating demo MCP template...');
  try {
    const responses = await callTool('generate_mcp_template', {
      server_name: 'demo-mcp',
      tools: ['hello', 'goodbye'],
      output_path: 'C:\\Users\\scarm\\demo-mcp-server.js',
    });

    const result = responses.find(r => r.result);
    if (result?.result?.content?.[0]?.text) {
      console.log(result.result.content[0].text);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✅ MCP Doctor demonstration complete!');
}

main().catch(console.error);
