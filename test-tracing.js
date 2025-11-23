/**
 * Tracing Test Script
 * Tests the OpenTelemetry tracing functionality
 */

import { tracing, traceTool, traceRequest } from './src/utils/tracing.js';

// Initialize tracing for testing
tracing.initialize({
  serviceName: 'tracing-test',
  serviceVersion: '1.0.0',
  consoleExport: true,
});

console.log(' Starting tracing tests...\n');

async function runTests() {
  try {
    // Test 1: Simple trace
    console.log('Test 1: Simple trace operation');
    await tracing.trace('test_operation', async (span) => {
      span.setAttribute('test.id', 1);
      span.setAttribute('test.type', 'simple');
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log(' Test operation completed\n');
    });

    // Test 2: Tool trace
    console.log('Test 2: Tool execution trace');
    const result = await traceTool('test_tool', { param1: 'value1', param2: 42 }, async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(' Tool executed\n');
      return { success: true, data: 'test data' };
    });
    console.log('Tool result:', result, '\n');

    // Test 3: Request trace
    console.log('Test 3: MCP request trace');
    await traceRequest('list_tools', { requestId: 'test-123' }, async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      console.log(' Request handled\n');
      return { tools: ['tool1', 'tool2'] };
    });

    // Test 4: Error handling
    console.log('Test 4: Error handling trace');
    try {
      await tracing.trace('failing_operation', async (span) => {
        span.setAttribute('will.fail', true);
        throw new Error('Intentional test error');
      });
    } catch (error) {
      console.log(' Error caught and traced:', error.message, '\n');
    }

    // Test 5: Nested traces
    console.log('Test 5: Nested trace operations');
    await tracing.trace('parent_operation', async () => {
      console.log(' Parent operation started');
      await traceTool('nested_tool', { nested: true }, async () => {
        console.log('   Nested tool executed');
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      console.log(' Parent operation completed\n');
    });

    console.log(' All tests completed successfully!\n');
    
  } catch (error) {
    console.error(' Test failed:', error);
  } finally {
    // Shutdown and flush spans
    console.log('Shutting down tracing...');
    await tracing.shutdown();
    console.log(' Tracing shutdown complete\n');
    
    console.log('='.repeat(60));
    console.log(' TRACING TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(' 5 trace tests executed');
    console.log(' Console spans exported above');
    console.log(' If Azure configured, check Application Insights');
    console.log('='.repeat(60));
  }
}

runTests().catch(console.error);
