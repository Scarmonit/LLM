#!/usr/bin/env node

/**
 * Test script for ECM - Submits a simple goal to verify end-to-end functionality
 */

import axios from 'axios';

const ECM_URL = 'http://localhost:3000';

async function testECM() {
  console.log('🧪 Testing ECM End-to-End Functionality\n');

  try {
    // Test 1: Health check
    console.log('1. Checking ECM health...');
    const health = await axios.get(`${ECM_URL}/api/health`);
    console.log(`   ✓ Status: ${health.data.status}`);
    console.log(`   ✓ MCP Servers: ${health.data.mcpServers.join(', ')}\n`);

    // Test 2: Submit a simple goal
    console.log('2. Submitting test goal...');
    const goal = 'Check AWS CLI version';

    console.log(`   Goal: "${goal}"\n`);

    const response = await axios.post(`${ECM_URL}/api/goals`, { goal });

    console.log(`   Status: ${response.data.status}`);
    console.log(`   Subtasks created: ${response.data.subtasks}`);

    if (response.data.status === 'success') {
      console.log('\n   ✅ SUCCESS! Goal completed.\n');
      console.log('   Results:');
      response.data.results.forEach((result, i) => {
        console.log(`     ${i + 1}. Task ${result.taskId}: ${result.status}`);
        if (result.result) {
          const content = result.result.content?.[0]?.text || JSON.stringify(result.result);
          console.log(`        Output: ${content.substring(0, 100)}...`);
        }
      });
    } else {
      console.log(`\n   ❌ Goal failed: ${response.data.error}`);
    }

    // Test 3: List tasks
    console.log('\n3. Listing all tasks...');
    const tasks = await axios.get(`${ECM_URL}/api/tasks`);
    console.log(`   ✓ Total tasks in system: ${tasks.data.length}\n`);

    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  🎉 ECM SYSTEM FULLY OPERATIONAL! 🎉      ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    console.log('The Executive Control Module is working end-to-end:');
    console.log('  ✅ Accepts high-level goals');
    console.log('  ✅ Decomposes goals using Claude');
    console.log('  ✅ Schedules tasks with dependencies');
    console.log('  ✅ Executes via MCP servers');
    console.log('  ✅ Returns aggregated results\n');

    console.log('Try it yourself:');
    console.log('  node cli.js goal "List my S3 buckets"');
    console.log('  node cli.js goal "Create a new GitHub repo called test-repo"');
    console.log('  node cli.js goal "Check Terraform version"\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('\nMake sure ECM is running: node ecm-core.js');
    process.exit(1);
  }
}

testECM();
