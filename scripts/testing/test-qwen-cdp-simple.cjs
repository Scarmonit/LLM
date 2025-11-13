#!/usr/bin/env node
/**
 * Simple CDP test for Qwen
 */

const CDP = require('chrome-remote-interface');

async function test() {
    try {
        console.log('Attempting to list CDP targets on port 9222...');

        const targets = await CDP.List({ port: 9222 });

        console.log(`Found ${targets.length} target(s):`);
        targets.forEach((target, i) => {
            console.log(`\n  [${i}] ${target.type}`);
            console.log(`      Title: ${target.title}`);
            console.log(`      URL: ${target.url}`);
            console.log(`      ID: ${target.id}`);
        });

        if (targets.length > 0) {
            console.log('\n✓ CDP connection successful!');
            console.log('Qwen is ready for automation.');

            // Try to connect to first page target
            const pageTarget = targets.find(t => t.type === 'page');
            if (pageTarget) {
                console.log(`\nConnecting to page: ${pageTarget.title}...`);
                const client = await CDP({ target: pageTarget.id, port: 9222 });
                const { Runtime } = client;

                await Runtime.enable();

                const result = await Runtime.evaluate({
                    expression: 'document.title'
                });

                console.log(`Page title: ${result.result.value}`);
                console.log('\n✅ Full automation test successful!');

                await client.close();
            }
        } else {
            console.log('\n⚠ No targets found. Is Qwen fully loaded?');
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Ensure Qwen is running');
        console.log('2. Ensure it was launched with: --remote-debugging-port=9222');
        console.log('3. Wait a few more seconds for Qwen to fully start');
    }
}

test();
