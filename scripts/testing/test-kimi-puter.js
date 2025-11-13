#!/usr/bin/env node

/**
 * Test Kimi K2 via Puter.com - FREE Unlimited Access
 * No API key needed!
 */

import fetch from 'node-fetch';

console.log('🚀 Testing Kimi K2 via Puter.com (FREE unlimited)\n');

const prompt = 'Say "SUCCESS! Kimi K2 is working via Puter!" if you can hear me.';

console.log('📝 Prompt:', prompt);
console.log('🤖 Model: Kimi K2 (moonshotai/kimi-k2:free)');
console.log('⏳ Sending request...\n');

const startTime = Date.now();

try {
    // Using Puter's public API endpoint
    const response = await fetch('https://api.puter.com/drivers/call', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            interface: 'puter-chat-completion',
            driver: 'openrouter',
            method: 'complete',
            args: {
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'moonshotai/kimi-k2:free',
                stream: false
            }
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log('✅ Response received!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(data.message || data.result || JSON.stringify(data, null, 2));
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`⏱️  Response time: ${responseTime}s`);
    console.log('🎉 SUCCESS! Kimi K2 is working via Puter!\n');
    console.log('💡 Next: Try asking complex questions or use for coding tasks!\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
}
