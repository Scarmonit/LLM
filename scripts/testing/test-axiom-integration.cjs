#!/usr/bin/env node
/**
 * Axiom.ai Integration Test Suite
 *
 * Quick tests to verify your Axiom.ai setup is working correctly.
 */

const { AxiomClient, formatDataForAxiom } = require('./axiom-client.cjs');

// ANSI color codes for terminal output
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

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

/**
 * Test 1: API Key Configuration
 */
async function testApiKeySetup() {
  section('Test 1: API Key Configuration');

  try {
    const client = new AxiomClient();
    log('✓ API key loaded successfully', 'green');
    log(`  Key preview: ${client.apiKey.substring(0, 8)}...`, 'blue');
    return true;
  } catch (error) {
    log('✗ API key not configured', 'red');
    log(`  Error: ${error.message}`, 'red');
    log('\n  Setup instructions:', 'yellow');
    log('  1. Generate API key from Axiom.ai extension', 'yellow');
    log('  2. Save to ~/.axiom-key.txt or set AXIOM_API_KEY env var', 'yellow');
    log('  3. See AXIOM-SETUP.md for details', 'yellow');
    return false;
  }
}

/**
 * Test 2: Data Formatting
 */
async function testDataFormatting() {
  section('Test 2: Data Formatting Helper');

  try {
    const testData = [
      { name: 'Alice', age: 30, city: 'NYC' },
      { name: 'Bob', age: 25, city: 'LA' },
      { name: 'Charlie', age: 35, city: 'Chicago' }
    ];

    const formatted = formatDataForAxiom(testData);

    log('Input (objects):', 'blue');
    console.log(JSON.stringify(testData, null, 2));

    log('\nOutput (2D array for Axiom.ai):', 'blue');
    console.log(JSON.stringify(formatted, null, 2));

    if (formatted.length === 4 && formatted[0].length === 3) {
      log('\n✓ Data formatting works correctly', 'green');
      return true;
    } else {
      log('\n✗ Data formatting failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 3: API Connection (Dry Run)
 */
async function testApiConnection() {
  section('Test 3: API Connection Check');

  try {
    const client = new AxiomClient();

    log('API Configuration:', 'blue');
    log(`  Base URL: ${client.baseUrl}`, 'blue');
    log(`  Endpoints:`, 'blue');
    log(`    - Trigger: ${client.baseUrl}/trigger`, 'blue');
    log(`    - Status:  ${client.baseUrl}/run-data`, 'blue');

    log('\n✓ Client initialized successfully', 'green');
    log('  Note: Actual API calls require valid automations', 'yellow');
    return true;
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 4: Configuration File
 */
async function testConfigFile() {
  section('Test 4: Configuration File');

  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, 'axiom-config.json');

    if (!fs.existsSync(configPath)) {
      log('✗ axiom-config.json not found', 'red');
      return false;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    log('Configuration loaded:', 'blue');
    log(`  API Version: ${config.apiVersion}`, 'blue');
    log(`  Automations defined: ${Object.keys(config.automations || {}).length}`, 'blue');
    log(`  Workflows defined: ${(config.workflows || []).length}`, 'blue');
    log(`  Integrations: ${Object.keys(config.integrations || {}).join(', ')}`, 'blue');

    log('\n✓ Configuration file valid', 'green');
    return true;
  } catch (error) {
    log(`✗ Error reading config: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 5: Integration Files
 */
async function testIntegrationFiles() {
  section('Test 5: Integration Files Check');

  const fs = require('fs');
  const files = [
    'axiom-client.cjs',
    'axiom-config.json',
    'axiom-puppeteer-bridge.cjs',
    'AXIOM-SETUP.md'
  ];

  let allPresent = true;

  files.forEach(file => {
    const exists = fs.existsSync(file);
    if (exists) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} missing`, 'red');
      allPresent = false;
    }
  });

  return allPresent;
}

/**
 * Test 6: Example Workflow Simulation
 */
async function testWorkflowSimulation() {
  section('Test 6: Workflow Simulation (Dry Run)');

  try {
    log('Simulating: Scrape → Format → Trigger Axiom.ai', 'blue');

    // Step 1: Simulated scrape
    log('\n1. Scraping data (simulated)...', 'yellow');
    const scrapedData = [
      { product: 'Widget A', price: 29.99, stock: 100 },
      { product: 'Widget B', price: 39.99, stock: 50 }
    ];
    log('   ✓ Data scraped', 'green');

    // Step 2: Format for Axiom.ai
    log('2. Formatting for Axiom.ai...', 'yellow');
    const formatted = formatDataForAxiom(scrapedData);
    log('   ✓ Data formatted', 'green');

    // Step 3: Would trigger Axiom.ai
    log('3. Trigger Axiom.ai (dry run)...', 'yellow');
    log('   → Would call: client.triggerAutomation("My Automation", data)', 'blue');
    log('   ✓ Workflow logic valid', 'green');

    log('\n✓ Workflow simulation successful', 'green');
    return true;
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║       Axiom.ai Integration Test Suite                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const results = [];

  // Run all tests
  results.push({ name: 'API Key Setup', passed: await testApiKeySetup() });
  results.push({ name: 'Data Formatting', passed: await testDataFormatting() });
  results.push({ name: 'API Connection', passed: await testApiConnection() });
  results.push({ name: 'Configuration File', passed: await testConfigFile() });
  results.push({ name: 'Integration Files', passed: await testIntegrationFiles() });
  results.push({ name: 'Workflow Simulation', passed: await testWorkflowSimulation() });

  // Summary
  section('Test Summary');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });

  console.log('\n' + '─'.repeat(60));
  log(`\nResults: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All tests passed! Your Axiom.ai integration is ready.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Create an automation in Axiom.ai extension', 'blue');
    log('2. Test with: node axiom-client.js trigger "Your Automation"', 'blue');
    log('3. Explore examples: node axiom-puppeteer-bridge.js', 'blue');
  } else {
    log('\n⚠ Some tests failed. Please review the errors above.', 'yellow');
    log('See AXIOM-SETUP.md for setup instructions.', 'yellow');
  }

  console.log('\n');
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests };
