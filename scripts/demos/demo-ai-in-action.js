#!/usr/bin/env node
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11435/api/v1',
  apiKey: 'local-no-key-needed',
});

console.log('🚀 AI Integration Demo - Running Multiple Tasks\n');
console.log('='.repeat(60));

// Task 1: Code Generation
console.log('\n💻 Task 1: Generate Python Function\n');
const code = await client.chat.completions.create({
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [{
    role: 'user',
    content: 'Write a Python function to calculate fibonacci numbers. Keep it short and clean.'
  }],
});
console.log(code.choices[0].message.content);

// Task 2: Explain a concept
console.log('\n\n📚 Task 2: Explain Quantum Computing\n');
const explain = await client.chat.completions.create({
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [{
    role: 'user',
    content: 'Explain quantum computing in 2 sentences for a beginner.'
  }],
});
console.log(explain.choices[0].message.content);

// Task 3: Problem Solving
console.log('\n\n🧩 Task 3: Solve a Logic Problem\n');
const logic = await client.chat.completions.create({
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [{
    role: 'user',
    content: 'If 5 machines make 5 widgets in 5 minutes, how long does it take 100 machines to make 100 widgets? Explain briefly.'
  }],
});
console.log(logic.choices[0].message.content);

// Task 4: Creative Writing
console.log('\n\n✍️  Task 4: Write a Haiku\n');
const haiku = await client.chat.completions.create({
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [{
    role: 'user',
    content: 'Write a haiku about artificial intelligence.'
  }],
});
console.log(haiku.choices[0].message.content);

// Task 5: Data Analysis
console.log('\n\n📊 Task 5: Analyze Data Pattern\n');
const data = await client.chat.completions.create({
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [{
    role: 'user',
    content: 'What is the pattern in this sequence: 2, 6, 12, 20, 30, ? Explain and give the next number.'
  }],
});
console.log(data.choices[0].message.content);

console.log('\n\n' + '='.repeat(60));
console.log('\n✅ All 5 AI tasks completed successfully!');
console.log('\n📊 Summary:');
console.log('   • Model: Llama 3.1 (8B)');
console.log('   • API: Local Ollama Bridge');
console.log('   • Cost: $0 (FREE unlimited)');
console.log('   • Speed: Local processing');
console.log('   • Privacy: All data stays local');
console.log('\n🎉 AI Integration is fully operational!\n');
