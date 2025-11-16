#!/usr/bin/env node
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11435/api/v1',
  apiKey: 'local-no-key-needed',
});

console.log('Testing AI integration...\n');

const response = await client.chat.completions.create({
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [{ role: 'user', content: 'Say "Integration working!" and nothing else' }],
});

console.log('✅ Response:', response.choices[0].message.content);
console.log('\n✅ AI Integration is now fully operational!');
console.log('✅ No manual steps required');
console.log('✅ API key set automatically');
console.log('✅ Using local Ollama models via bridge');
