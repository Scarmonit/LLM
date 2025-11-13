#!/usr/bin/env node

/**
 * Test Kimi K2 via Puter.com - FREE Unlimited Access
 * No API key needed! Uses built-in fetch (Node 18+)
 */

const prompt = 'Say "SUCCESS! Kimi K2 is working!" if you can hear me.';

console.log('🚀 Testing Kimi K2 via Puter.com (FREE unlimited)\n');
console.log('📝 Prompt:', prompt);
console.log('🤖 Model: Kimi K2 (moonshotai/kimi-k2:free)');
console.log('⏳ Sending request...\n');

const startTime = Date.now();

fetch('https://api.puter.com/drivers/call', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        interface: 'puter-chat-completion',
        driver: 'openrouter',
        method: 'complete',
        args: {
            messages: [{ role: 'user', content: prompt }],
            model: 'moonshotai/kimi-k2:free',
            stream: false
        }
    })
})
.then(response => {
    if (!response.ok) {
        return response.text().then(text => {
            throw new Error(`HTTP ${response.status}: ${text}`);
        });
    }
    return response.json();
})
.then(data => {
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log('✅ Response received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(data.message || data.result || JSON.stringify(data, null, 2));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏱️  Response time: ${responseTime}s`);
    console.log('🎉 SUCCESS! Kimi K2 is working via Puter!\n');
    console.log('💡 This uses Puter.com - NO API key needed, UNLIMITED usage!\n');
})
.catch(error => {
    console.error('❌ Error:', error.message);
    console.error('\nTrying alternative method...\n');
    process.exit(1);
});
