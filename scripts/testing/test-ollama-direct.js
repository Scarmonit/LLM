#!/usr/bin/env node

/**
 * Direct Ollama Testing - Bypass Docker Gateway
 * Tests multiple Ollama models for parallel Claude Code usage
 */

const models = [
  'llama3.1:8b',
  'mistral:7b',
  'phi3:mini',
  'qwen2.5:7b',
  'deepseek-coder:latest'
];

const testPrompt = 'Write a function to reverse a string. Be very concise.';

async function testModel(model) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: testPrompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const duration = Date.now() - startTime;

    console.log(`✅ ${model} (${duration}ms)`);
    console.log(`   Response: ${data.response.substring(0, 100)}...`);
    return { success: true, model, duration };
    
  } catch (error) {
    console.log(`❌ ${model} - ${error.message}`);
    return { success: false, model, error: error.message };
  }
}

async function testParallel() {
  console.log('🚀 Testing Multiple Ollama Models in Parallel\n');
  
  const startTime = Date.now();
  const results = await Promise.all(models.map(testModel));
  const totalTime = Date.now() - startTime;
  
  console.log(`\n📊 Results:`);
  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Successful: ${results.filter(r => r.success).length}/${results.length}`);
  console.log(`   Average: ${Math.round(totalTime / results.length)}ms per model`);
  
  console.log(`\n💡 Usage for Claude Code:`);
  console.log(`   Terminal 1: OLLAMA_MODEL=llama3.1:8b claude "task 1"`);
  console.log(`   Terminal 2: OLLAMA_MODEL=mistral:7b claude "task 2"`);
  console.log(`   Terminal 3: OLLAMA_MODEL=phi3:mini claude "task 3"`);
  
  return results;
}

testParallel().then(results => {
  const allSuccess = results.every(r => r.success);
  process.exit(allSuccess ? 0 : 1);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
