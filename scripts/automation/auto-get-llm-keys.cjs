#!/usr/bin/env node
/**
 * Automated LLM API Key Retrieval System
 * Uses AI Agent Swarm + Browser Automation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 AI Agent Swarm - Automated LLM Key Setup');
console.log('=' .repeat(60));
console.log('');

// Helper to set Windows environment variable
function setEnvVar(name, value) {
    try {
        execSync(`powershell.exe -Command "[System.Environment]::SetEnvironmentVariable('${name}', '${value}', 'User')"`, {
            stdio: 'pipe'
        });
        console.log(`✅ ${name} set successfully`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to set ${name}:`, err.message);
        return false;
    }
}

// Helper to get environment variable
function getEnvVar(name) {
    try {
        const result = execSync(`powershell.exe -Command "[System.Environment]::GetEnvironmentVariable('${name}', 'User')"`, {
            encoding: 'utf8',
            stdio: 'pipe'
        }).trim();
        return result || null;
    } catch {
        return null;
    }
}

// Check existing keys
console.log('📋 Checking existing keys...');
const groqKey = getEnvVar('GROQ_API_KEY');
const hfToken = getEnvVar('HUGGINGFACE_TOKEN');
const togetherKey = getEnvVar('TOGETHER_API_KEY');

console.log('  GROQ_API_KEY:', groqKey ? '✓ Set' : '✗ Not set');
console.log('  HUGGINGFACE_TOKEN:', hfToken ? '✓ Set' : '✗ Not set');
console.log('  TOGETHER_API_KEY:', togetherKey ? '✓ Set' : '✗ Not set');
console.log('');

// Strategy: Use browser automation to guide user through getting keys
console.log('🌐 Strategy: Browser-Assisted Key Retrieval');
console.log('');
console.log('This will open browser windows to help you get free API keys.');
console.log('The process is semi-automated - you\'ll need to:');
console.log('  1. Sign in (we\'ll open the pages)');
console.log('  2. Copy the generated keys');
console.log('  3. Paste them when prompted');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function openBrowserAndGetKey(provider, url) {
    console.log(`\n📍 ${provider}`);
    console.log(`   URL: ${url}`);
    
    // Check if key already exists
    const envVar = provider === 'Groq' ? 'GROQ_API_KEY' :
                   provider === 'Hugging Face' ? 'HUGGINGFACE_TOKEN' :
                   'TOGETHER_API_KEY';
    
    if (getEnvVar(envVar)) {
        console.log(`   ✓ Already configured`);
        return true;
    }
    
    const answer = await askQuestion(`   Open browser for ${provider}? (y/n): `);
    
    if (answer.toLowerCase() === 'y') {
        // Open browser
        try {
            execSync(`powershell.exe -Command "Start-Process '${url}'"`, { stdio: 'ignore' });
            console.log(`   ✓ Browser opened`);
        } catch (err) {
            console.log(`   ⚠ Please manually open: ${url}`);
        }
        
        console.log('');
        console.log(`   Instructions for ${provider}:`);
        if (provider === 'Groq') {
            console.log('   1. Sign in with Google/GitHub');
            console.log('   2. Click "Create API Key"');
            console.log('   3. Copy the key that appears');
        } else if (provider === 'Hugging Face') {
            console.log('   1. Sign up/Login');
            console.log('   2. Click "New token"');
            console.log('   3. Name: "ai-agent-swarm", Role: "Read"');
            console.log('   4. Copy the token');
        } else if (provider === 'Together AI') {
            console.log('   1. Sign up for free account');
            console.log('   2. Go to API Keys section');
            console.log('   3. Create new key');
            console.log('   4. Copy the key');
        }
        console.log('');
        
        const key = await askQuestion(`   Paste your ${provider} key (or Enter to skip): `);
        
        if (key && key.trim()) {
            if (setEnvVar(envVar, key.trim())) {
                console.log(`   ✅ ${provider} key saved!`);
                return true;
            }
        } else {
            console.log(`   ⏭ Skipped ${provider}`);
        }
    }
    
    return false;
}

async function main() {
    const results = {
        groq: false,
        hf: false,
        together: false
    };
    
    // Get keys for each provider
    results.groq = await openBrowserAndGetKey('Groq', 'https://console.groq.com/keys');
    results.hf = await openBrowserAndGetKey('Hugging Face', 'https://huggingface.co/settings/tokens');
    results.together = await openBrowserAndGetKey('Together AI', 'https://api.together.xyz/settings/api-keys');
    
    console.log('');
    console.log('=' .repeat(60));
    console.log('📊 Setup Summary');
    console.log('=' .repeat(60));
    console.log('Groq:        ', results.groq || groqKey ? '✅ Configured' : '❌ Not configured');
    console.log('Hugging Face:', results.hf || hfToken ? '✅ Configured' : '❌ Not configured');
    console.log('Together AI: ', results.together || togetherKey ? '✅ Configured' : '❌ Not configured');
    console.log('');
    
    if (results.groq || results.hf || results.together) {
        console.log('⚠️  IMPORTANT: Restart Claude Code for changes to take effect!');
        console.log('');
        console.log('After restarting, verify with:');
        console.log('  Ask Claude: "Check the AI agent swarm status"');
        console.log('');
    }
    
    rl.close();
}

main().catch(err => {
    console.error('Error:', err);
    rl.close();
    process.exit(1);
});
