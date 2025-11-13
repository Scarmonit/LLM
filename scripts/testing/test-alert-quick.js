/**
 * Quick standalone test for AlertHandler fixes
 */
import { AlertHandler } from './src/monitoring/alert-handler.js';

async function testAlertHandler() {
  console.log('=== Alert Handler Quick Test ===\n');

  // Test 1: Dynamic port allocation
  console.log('Test 1: Dynamic port allocation');
  const handler = new AlertHandler({ port: 0 });
  const serverInfo = await handler.start();
  console.log(`✓ Server started on port ${serverInfo.port} (expected > 0)`);

  // Test 2: Webhook validation
  console.log('\nTest 2: Webhook validation (invalid payload)');
  const response1 = await fetch(`http://localhost:${serverInfo.port}/webhooks/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'firing' }) // Missing alerts array
  });
  const data1 = await response1.json();
  console.log(`Status: ${response1.status} (expected 400)`);
  console.log(`Error: ${data1.error}`);

  // Test 3: Valid webhook
  console.log('\nTest 3: Valid webhook processing');
  const response2 = await fetch(`http://localhost:${serverInfo.port}/webhooks/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alerts: [{
        labels: { alertname: 'TestAlert', severity: 'critical' },
        status: 'firing'
      }]
    })
  });
  const data2 = await response2.json();
  console.log(`Status: ${response2.status} (expected 200)`);
  console.log(`Processed: ${data2.processedAlerts} alerts`);
  console.log(`Active alerts: ${handler.alerts.active.length} (expected 1)`);

  // Test 4: Reset functionality
  console.log('\nTest 4: Reset functionality');
  handler.reset();
  console.log(`Active alerts after reset: ${handler.alerts.active.length} (expected 0)`);

  // Cleanup
  await handler.stop();
  console.log('\n✓ All quick tests completed');
}

testAlertHandler().catch(error => {
  console.error('✗ Test failed:', error.message);
  process.exit(1);
});
