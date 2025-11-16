#!/usr/bin/env node

/**
 * Visual ECM Test - Actually submits a goal and shows the results
 */

const http = require('http');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║           ECM VISUAL DEMONSTRATION TEST                   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Test 1: Health Check
console.log('📡 Step 1: Checking if ECM is running...\n');

const healthCheck = new Promise((resolve, reject) => {
  const req = http.get('http://localhost:3000/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✅ ECM is ALIVE!\n');
      console.log('Response:', JSON.parse(data));
      console.log('\n' + '─'.repeat(60) + '\n');
      resolve(JSON.parse(data));
    });
  });
  req.on('error', (err) => {
    console.log('❌ ECM is NOT running!');
    console.log('Error:', err.message);
    console.log('\nPlease run: START-ECM.bat\n');
    reject(err);
  });
});

// Test 2: Submit a simple goal
healthCheck.then(() => {
  console.log('🎯 Step 2: Submitting a REAL goal to ECM...\n');
  console.log('Goal: "Create a text file called HELLO.txt with the content Hello from ECM"');
  console.log('\nWatching ECM think and work...\n');

  const postData = JSON.stringify({
    goal: 'Create a text file called HELLO.txt in C:/Users/scarm with the content "Hello from ECM! This proves I am working."'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/goals',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('✅ ECM FINISHED PROCESSING!\n');
      console.log('Result:', JSON.stringify(JSON.parse(data), null, 2));
      console.log('\n' + '─'.repeat(60) + '\n');
      console.log('🔍 Now check if C:\\Users\\scarm\\HELLO.txt exists!\n');
      console.log('Run this command: cat C:\\Users\\scarm\\HELLO.txt\n');
    });
  });

  req.on('error', (err) => {
    console.log('❌ Failed to submit goal:', err.message);
  });

  req.write(postData);
  req.end();

}).catch(() => {
  console.log('\nTest aborted - ECM not running.\n');
});
