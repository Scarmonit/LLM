#!/usr/bin/env node
/**
 * Fully Automated OpenRouter API Key Retrieval
 * This script opens the browser and guides you through getting an API key
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Automated OpenRouter API Key Setup');
console.log('=====================================\n');

// Check if key already exists
const existingKey = process.env.OPENROUTER_API_KEY;
if (existingKey) {
    console.log('✅ OpenRouter API key already exists!');
    console.log(`   Key: ${existingKey.substring(0, 20)}...\n`);
    console.log('Testing key...');

    // Test the key
    fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { 'Authorization': `Bearer ${existingKey}` }
    })
    .then(res => {
        if (res.ok) {
            console.log('✅ API key is valid and working!\n');
            console.log('You can use it immediately:');
            console.log(`  export OPENROUTER_API_KEY="${existingKey}"\n`);
            process.exit(0);
        } else {
            console.log('⚠️  Existing key may be invalid. Getting a new one...\n');
        }
    })
    .catch(() => {
        console.log('⚠️  Could not validate key. Proceeding...\n');
    });
}

// Instructions for getting the key
console.log('📋 Quick Guide to Get Your OpenRouter API Key:\n');
console.log('Step 1: I will open OpenRouter in your browser');
console.log('Step 2: Sign in with GitHub (recommended), Google, or Email');
console.log('Step 3: Once signed in, click "Create Key"');
console.log('Step 4: Copy the key and come back here\n');

// Open browser
console.log('Opening browser in 3 seconds...\n');

setTimeout(() => {
    const url = 'https://openrouter.ai/keys';
    let command;

    // Detect OS and use appropriate command
    if (process.platform === 'win32') {
        command = `start ${url}`;
        spawn('cmd.exe', ['/c', 'start', url], { shell: true, detached: true });
    } else if (process.platform === 'darwin') {
        spawn('open', [url], { detached: true });
    } else {
        spawn('xdg-open', [url], { detached: true });
    }

    console.log('✓ Browser opened\n');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('INSTRUCTIONS:\n');
    console.log('1. In the browser window that just opened:');
    console.log('   - Click "Sign In" (top right corner)');
    console.log('   - Choose your preferred login method');
    console.log('   - After signing in, click "Create Key"');
    console.log('   - Name it something like "CLI Access"');
    console.log('   - Click "Create"');
    console.log('   - COPY the key (starts with sk-or-v1-)\n');
    console.log('2. Come back to this terminal');
    console.log('3. Paste your API key when prompted\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Wait a bit then prompt for key
    setTimeout(() => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('Paste your OpenRouter API key here: ', (apiKey) => {
            readline.close();

            if (!apiKey || apiKey.trim() === '') {
                console.log('\n❌ No key provided. Exiting.');
                console.log('   Run this script again when ready.\n');
                process.exit(1);
            }

            apiKey = apiKey.trim();

            // Validate format
            if (!apiKey.startsWith('sk-or-v1-')) {
                console.log('\n⚠️  Warning: Key format looks unusual');
                console.log(`   Expected: sk-or-v1-...`);
                console.log(`   Got: ${apiKey.substring(0, 15)}...\n`);
            }

            // Test the key
            console.log('🧪 Testing API key...');

            fetch('https://openrouter.ai/api/v1/auth/key', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            })
            .then(res => {
                if (!res.ok) {
                    console.log(`\n❌ API key validation failed (HTTP ${res.status})`);
                    console.log('   Please check your key and try again.\n');
                    process.exit(1);
                }

                console.log('✅ API key is valid!\n');

                // Save the key
                const home = process.env.HOME || process.env.USERPROFILE;
                const keyFile = path.join(home, '.openrouter-key.txt');

                fs.writeFileSync(keyFile, apiKey, 'utf8');
                console.log(`✅ Saved to: ${keyFile}`);

                // Add to bash profile
                const bashProfile = path.join(home, '.bash_profile');
                const exportLine = `\nexport OPENROUTER_API_KEY="${apiKey}"\n`;

                if (fs.existsSync(bashProfile)) {
                    const content = fs.readFileSync(bashProfile, 'utf8');
                    if (!content.includes('OPENROUTER_API_KEY')) {
                        fs.appendFileSync(bashProfile, exportLine);
                        console.log('✅ Added to ~/.bash_profile');
                    } else {
                        console.log('ℹ️  Already in ~/.bash_profile');
                    }
                } else {
                    fs.writeFileSync(bashProfile, exportLine);
                    console.log('✅ Created ~/.bash_profile with key');
                }

                console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🎉 SUCCESS! Your OpenRouter API key is ready!\n');
                console.log('To use it immediately, run:');
                console.log(`  export OPENROUTER_API_KEY="${apiKey}"\n`);
                console.log('Or restart your terminal to load from ~/.bash_profile\n');
                console.log('Free tier: 100 requests/day');
                console.log('Documentation: https://openrouter.ai/docs\n');
            })
            .catch(err => {
                console.log(`\n❌ Error testing key: ${err.message}`);
                console.log('   The key was still saved to file.\n');
            });
        });
    }, 5000); // Wait 5 seconds after opening browser

}, 3000);
