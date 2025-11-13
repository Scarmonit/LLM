#!/usr/bin/env node

/**
 * Kimi K2 Test via Hugging Face Inference API
 * Uses the public inference API to test Kimi K2
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

async function queryHuggingFace(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: 'api-inference.huggingface.co',
      path: '/models/moonshotai/Kimi-K2-Instruct',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testKimiK2() {
  console.log('Testing Kimi K2 via Hugging Face Inference API...\n');

  const testPrompt = 'Write a hello world program in Python';
  console.log(`Query: "${testPrompt}"\n`);

  try {
    // Test with different formats
    const formats = [
      {
        name: 'Chat Format',
        data: {
          inputs: testPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.6,
            return_full_text: false
          }
        }
      },
      {
        name: 'Direct Text',
        data: {
          inputs: testPrompt
        }
      },
      {
        name: 'Messages Format',
        data: {
          inputs: {
            messages: [
              { role: 'user', content: testPrompt }
            ]
          },
          parameters: {
            max_new_tokens: 500,
            temperature: 0.6
          }
        }
      }
    ];

    for (const format of formats) {
      console.log(`\n=== Testing: ${format.name} ===`);

      try {
        const result = await queryHuggingFace(format.data);

        console.log(`Status: ${result.statusCode}`);
        console.log('Response:', JSON.stringify(result.data, null, 2).substring(0, 1000));

        if (result.statusCode === 200) {
          // Success! Save the result
          const results = {
            timestamp: new Date().toISOString(),
            success: true,
            method: 'Hugging Face Inference API',
            format: format.name,
            query: testPrompt,
            response: result.data,
            statusCode: result.statusCode
          };

          const resultsPath = path.join(process.cwd(), 'kimi-k2-api-results.json');
          fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
          console.log(`\n✓ Results saved to: ${resultsPath}`);

          // Extract and display the actual response text
          let responseText = '';
          if (Array.isArray(result.data)) {
            responseText = result.data[0]?.generated_text || result.data[0]?.text || JSON.stringify(result.data[0]);
          } else if (typeof result.data === 'object') {
            responseText = result.data.generated_text || result.data.text || JSON.stringify(result.data);
          } else {
            responseText = result.data;
          }

          console.log('\n=== KIMI K2 RESPONSE ===');
          console.log(responseText);
          console.log('========================\n');

          return results;
        }
      } catch (error) {
        console.log(`Error with ${format.name}:`, error.message);
      }
    }

    // If we get here, none of the formats worked
    console.log('\n⚠ All formats failed. The model may require authentication or may be loading.');
    console.log('Note: Hugging Face Inference API may show "Model is loading" for large models.');

    return {
      timestamp: new Date().toISOString(),
      success: false,
      error: 'All API formats failed',
      note: 'Model may require authentication or be in loading state'
    };

  } catch (error) {
    console.error('\n✗ Error:', error.message);

    const errorResults = {
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message,
      stack: error.stack
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'kimi-k2-api-error.json'),
      JSON.stringify(errorResults, null, 2)
    );

    throw error;
  }
}

// Run
testKimiK2()
  .then(results => {
    console.log('\n✓ Test completed');
    process.exit(results?.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  });
