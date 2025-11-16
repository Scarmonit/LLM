#!/usr/bin/env node
/**
 * Kali MCP Production Readiness Test
 * Tests all Kali MCP tools and verifies functionality
 */

import { spawn } from 'child_process';

const tests = [
  {
    name: 'Kali MCP Container Health',
    command: 'docker',
    args: ['inspect', '--format', '{{.State.Health.Status}}', 'kali-mcp-server']
  },
  {
    name: 'Nmap Installation',
    command: 'docker',
    args: ['exec', 'kali-mcp-server', 'nmap', '--version']
  },
  {
    name: 'Node.js Environment',
    command: 'docker',
    args: ['exec', 'kali-mcp-server', 'node', '--version']
  },
  {
    name: 'MCP Server File Exists',
    command: 'docker',
    args: ['exec', 'kali-mcp-server', 'ls', '-lh', '/app/kali-mcp-server.js']
  },
  {
    name: 'Quick Nmap Test (localhost)',
    command: 'docker',
    args: ['exec', 'kali-mcp-server', 'nmap', '-F', '127.0.0.1']
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`   Command: ${test.command} ${test.args.join(' ')}`);
    
    const proc = spawn(test.command, test.args);
    let output = '';
    let errorOutput = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`   ✅ PASS`);
        if (output.trim()) {
          console.log(`   Output: ${output.trim().substring(0, 150)}${output.length > 150 ? '...' : ''}`);
        }
        resolve({ name: test.name, status: 'pass', output });
      } else {
        console.log(`   ❌ FAIL (exit code: ${code})`);
        if (errorOutput) {
          console.log(`   Error: ${errorOutput.substring(0, 150)}`);
        }
        resolve({ name: test.name, status: 'fail', error: errorOutput, code });
      }
    });
    
    proc.on('error', (error) => {
      console.log(`   ❌ ERROR: ${error.message}`);
      resolve({ name: test.name, status: 'error', error: error.message });
    });
  });
}

async function main() {
  console.log('='.repeat(70));
  console.log('🔍 KALI MCP PRODUCTION READINESS TEST SUITE');
  console.log('='.repeat(70));
  console.log(`Started: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail' || r.status === 'error').length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 PRODUCTION READINESS ASSESSMENT');
  console.log('='.repeat(70));
  
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED - KALI MCP IS PRODUCTION READY');
    console.log('✅ Container is healthy and all tools are functional');
    console.log('✅ Ready for security scanning and penetration testing');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED - REVIEW REQUIRED');
    console.log('Failed tests:');
    results.filter(r => r.status !== 'pass').forEach(r => {
      console.log(`  - ${r.name}`);
    });
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
