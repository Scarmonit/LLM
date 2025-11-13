# 🚀 AI Integration - Quick Start Card

## ⚡ 2-Minute Setup

```bash
# 1. Get API Key (90 seconds)
powershell.exe -ExecutionPolicy Bypass -File ".\Get-OpenRouterKey.ps1"

# 2. Test Integration (30 seconds)
./test-integrated-solution.sh

# 3. Run Demo (30 seconds)
node unified-ai-client.js
```

---

## 📦 What You Got

**File:** `unified-ai-client.js` - Production-ready AI client
**Test:** `test-integrated-solution.sh` - Validation suite
**Docs:** `INTEGRATED-AI-SETUP-COMPLETE.md` - Full guide

---

## 💻 Basic Usage

```javascript
import { UnifiedAIClient } from './unified-ai-client.js';

const ai = new UnifiedAIClient();
await ai.initialize();

// Simple chat
const response = await ai.chat('Your question here');
console.log(response.content);

// Complex reasoning
const reasoning = await ai.kimiReason('Logic puzzle here');

// Code generation
const code = await ai.kimiCode('Write a function that...');

// Streaming
await ai.chatStream('Message', (chunk) => process.stdout.write(chunk));
```

---

## 🎯 Available Models

| Model | ID | Best For |
|-------|----|----|
| **Kimi K2** | `moonshotai/kimi-k2:free` | Reasoning, Code |
| GPT-4 | `openai/gpt-4` | General |
| Claude 3 | `anthropic/claude-3-opus` | Analysis |
| Llama 3 | `meta-llama/llama-3-70b-instruct` | Fast |

---

## 🆓 Free Tier

- **100 requests/day** (OpenRouter)
- **$0 cost**
- **No credit card**
- **Resets daily at midnight UTC**

---

## ❓ Troubleshooting

```bash
# API key not set?
source ~/.bash_profile

# Invalid key?
# Get new one: https://openrouter.ai/keys

# Rate limited?
# Wait 24 hours or upgrade

# Module not found?
npm install openai
```

---

## 📚 Resources

- **Full Guide:** `INTEGRATED-AI-SETUP-COMPLETE.md`
- **Summary:** `AI-INTEGRATION-SUMMARY.md`
- **Dashboard:** https://openrouter.ai
- **Docs:** https://openrouter.ai/docs

---

## ✅ Checklist

- [ ] API key obtained
- [ ] Tests passed
- [ ] Demo run successfully
- [ ] Integrated into project

---

**Ready?** Run: `powershell.exe -ExecutionPolicy Bypass -File ".\Get-OpenRouterKey.ps1"`
