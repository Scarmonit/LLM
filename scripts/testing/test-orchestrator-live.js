#!/usr/bin/env node

/**
 * Live Orchestrator Test - Actually runs the system
 */

import { ProductionOrchestrator } from './agent-deployment-system.js';

console.log('🚀 Starting Multi-Agent Orchestrator Test...\n');

const orchestrator = new ProductionOrchestrator();

// Deploy and test
async function runLiveTest() {
    try {
        // Deploy the system
        await orchestrator.deploy();

        // Submit test tasks
        console.log('\n🧪 Submitting test tasks...\n');

        const taskId1 = await orchestrator.submitTask({
            type: 'mcp:memory:create',
            data: { name: 'test-entity', type: 'system' }
        });

        const taskId2 = await orchestrator.submitTask({
            type: 'mcp:omnipotent:execute',
            data: { command: 'system_info' }
        });

        // Wait for results
        await orchestrator.waitForTask(taskId1);
        await orchestrator.waitForTask(taskId2);

        const result1 = orchestrator.results.get(taskId1);
        const result2 = orchestrator.results.get(taskId2);

        console.log('✅ Task 1 result:', JSON.stringify(result1, null, 2));
        console.log('✅ Task 2 result:', JSON.stringify(result2, null, 2));

        // Get status
        const status = orchestrator.getSystemStatus();
        console.log('\n📊 System Status:');
        console.log(JSON.stringify(status, null, 2));

        // Export logs
        await orchestrator.exportLogs();

        console.log('\n✨ Test completed successfully!');

        // Shutdown
        await orchestrator.shutdown();
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

runLiveTest();
