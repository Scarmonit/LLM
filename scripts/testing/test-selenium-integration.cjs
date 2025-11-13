#!/usr/bin/env node
/**
 * Selenium WebDriver Integration Test Suite
 *
 * Tests the complete client library with REAL API calls to Selenium Grid.
 * NO MOCKS - All tests make actual HTTP requests and automate real browsers.
 */

const { SeleniumClient } = require('./selenium-client.cjs');

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function print(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function header(text) {
  console.log('\n' + '═'.repeat(70));
  print(`  ${text}`, 'cyan');
  console.log('═'.repeat(70));
}

function success(text) {
  print(`✓ ${text}`, 'green');
}

function error(text) {
  print(`✗ ${text}`, 'red');
}

function info(text) {
  print(`ℹ ${text}`, 'blue');
}

/**
 * Test 1: Grid Status
 */
async function testGridStatus() {
  header('Test 1: Selenium Grid Status (Real API Call)');

  try {
    const client = new SeleniumClient();
    const status = await client.getGridStatus();

    if (status.value && status.value.ready) {
      success('Grid is ready and accessible');
      info(`  Nodes: ${status.value.nodes?.length || 0}`);
      info(`  Message: ${status.value.message}`);
      return true;
    } else {
      error('Grid not ready');
      return false;
    }
  } catch (err) {
    error(`Failed to connect to Grid: ${err.message}`);
    info('  Make sure Selenium Grid is running:');
    info('  docker run -d --name selenium-grid -p 4444:4444 --shm-size="2g" selenium/standalone-chrome');
    return false;
  }
}

/**
 * Test 2: Create Session
 */
async function testCreateSession() {
  header('Test 2: Create Browser Session (Real Browser Launch)');

  const client = new SeleniumClient();

  try {
    const sessionId = await client.createSession();
    success('Session created successfully');
    info(`  Session ID: ${sessionId}`);

    await client.deleteSession();
    success('Session deleted successfully');
    return true;
  } catch (err) {
    error(`Failed to create session: ${err.message}`);
    return false;
  }
}

/**
 * Test 3: Navigation
 */
async function testNavigation() {
  header('Test 3: Page Navigation (Real HTTP Request)');

  const client = new SeleniumClient();

  try {
    await client.createSession();
    info('  Navigating to https://example.com...');

    await client.navigateTo('https://example.com');
    success('Navigation successful');

    const url = await client.getCurrentUrl();
    info(`  Current URL: ${url}`);

    const title = await client.getTitle();
    success(`Page Title: "${title}"`);

    await client.deleteSession();

    if (title === 'Example Domain') {
      success('Title matches expected value');
      return true;
    } else {
      error('Title does not match');
      return false;
    }
  } catch (err) {
    error(`Navigation failed: ${err.message}`);
    try { await client.deleteSession(); } catch {}
    return false;
  }
}

/**
 * Test 4: Element Interaction
 */
async function testElementInteraction() {
  header('Test 4: Find and Interact with Elements (Real DOM Query)');

  const client = new SeleniumClient();

  try {
    await client.createSession();
    await client.navigateTo('https://example.com');

    info('  Finding <h1> element...');
    const h1Id = await client.findElement('css selector', 'h1');
    success(`Element found: ${h1Id}`);

    const text = await client.getElementText(h1Id);
    success(`Element text: "${text}"`);

    info('  Finding all <p> elements...');
    const paragraphs = await client.findElements('css selector', 'p');
    success(`Found ${paragraphs.length} paragraph(s)`);

    await client.deleteSession();

    if (text.includes('Example')) {
      success('Element interaction working correctly');
      return true;
    } else {
      error('Unexpected element text');
      return false;
    }
  } catch (err) {
    error(`Element interaction failed: ${err.message}`);
    try { await client.deleteSession(); } catch {}
    return false;
  }
}

/**
 * Test 5: JavaScript Execution
 */
async function testJavaScriptExecution() {
  header('Test 5: Execute JavaScript (Real Script Execution)');

  const client = new SeleniumClient();

  try {
    await client.createSession();
    await client.navigateTo('https://example.com');

    info('  Executing: document.title');
    const title = await client.executeScript('return document.title');
    success(`Script returned: "${title}"`);

    info('  Executing: document.body.innerText.length');
    const textLength = await client.executeScript('return document.body.innerText.length');
    success(`Page text length: ${textLength} characters`);

    await client.deleteSession();
    return true;
  } catch (err) {
    error(`JavaScript execution failed: ${err.message}`);
    try { await client.deleteSession(); } catch {}
    return false;
  }
}

/**
 * Test 6: Screenshot
 */
async function testScreenshot() {
  header('Test 6: Take Screenshot (Real Image Capture)');

  const client = new SeleniumClient();

  try {
    await client.createSession();
    await client.navigateTo('https://example.com');

    info('  Capturing screenshot...');
    const base64Image = await client.takeScreenshot();
    success('Screenshot captured');
    info(`  Image size: ${(base64Image.length / 1024).toFixed(2)} KB (base64)`);

    // Verify it's valid base64 PNG
    if (base64Image.startsWith('iVBOR')) {
      success('Valid PNG image (base64)');
    } else {
      error('Invalid image format');
    }

    await client.deleteSession();
    return base64Image.length > 1000;
  } catch (err) {
    error(`Screenshot failed: ${err.message}`);
    try { await client.deleteSession(); } catch {}
    return false;
  }
}

/**
 * Test 7: Page Source
 */
async function testPageSource() {
  header('Test 7: Get Page Source (Real HTML Retrieval)');

  const client = new SeleniumClient();

  try {
    await client.createSession();
    await client.navigateTo('https://example.com');

    info('  Retrieving page source...');
    const source = await client.getPageSource();
    success('Page source retrieved');
    info(`  HTML length: ${source.length} characters`);

    if (source.includes('<html') && source.includes('Example Domain')) {
      success('Valid HTML source with expected content');
    } else {
      error('Unexpected page source');
    }

    await client.deleteSession();
    return source.length > 100;
  } catch (err) {
    error(`Page source retrieval failed: ${err.message}`);
    try { await client.deleteSession(); } catch {}
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.clear();

  print('\n╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  print('║                                                                   ║', 'cyan');
  print('║      Selenium WebDriver Integration Test Suite                   ║', 'cyan');
  print('║      100% Real API Calls - Zero Mocks                            ║', 'cyan');
  print('║                                                                   ║', 'cyan');
  print('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');

  info('\nAll tests make REAL HTTP requests to Selenium Grid');
  info('Each test launches an actual Chrome browser and automates it\n');

  const results = [];

  // Run all tests
  results.push({ name: 'Grid Status', passed: await testGridStatus() });

  // Only continue if Grid is accessible
  if (!results[0].passed) {
    print('\n⚠ Cannot continue without Selenium Grid running', 'yellow');
    print('\nStart Selenium Grid with:', 'cyan');
    print('  docker run -d --name selenium-grid -p 4444:4444 --shm-size="2g" selenium/standalone-chrome\n', 'yellow');
    process.exit(1);
  }

  results.push({ name: 'Create Session', passed: await testCreateSession() });
  results.push({ name: 'Navigation', passed: await testNavigation() });
  results.push({ name: 'Element Interaction', passed: await testElementInteraction() });
  results.push({ name: 'JavaScript Execution', passed: await testJavaScriptExecution() });
  results.push({ name: 'Screenshot', passed: await testScreenshot() });
  results.push({ name: 'Page Source', passed: await testPageSource() });

  // Summary
  header('Test Summary');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    print(`${icon} ${result.name}`, color);
  });

  console.log('\n' + '─'.repeat(70));
  print(`\nResults: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    print('\n🎉 All tests passed! Selenium integration is working perfectly.', 'green');
    print('\nYour free browser automation is ready to use!', 'cyan');
    print('\nFeatures verified:', 'cyan');
    print('  ✓ Browser sessions', 'green');
    print('  ✓ Page navigation', 'green');
    print('  ✓ Element finding and interaction', 'green');
    print('  ✓ JavaScript execution', 'green');
    print('  ✓ Screenshots', 'green');
    print('  ✓ HTML retrieval', 'green');
  } else {
    print('\n⚠ Some tests failed. Review the errors above.', 'yellow');
  }

  console.log('\n');
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch(err => {
    error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runTests };
