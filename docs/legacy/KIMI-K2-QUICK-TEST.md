# Kimi K2 Quick Test Guide

## Pre-Flight Check

Run the validation script to ensure everything is ready:

```bash
bash validate-kimi-setup.sh
```

This checks:
- Node.js and Python installations
- Required packages (openai for both)
- All quickstart files exist and are executable
- Code syntax is valid

## Get Your Free API Key

1. Go to https://openrouter.ai
2. Sign up (free)
3. Navigate to "Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

## Set Your API Key

### Bash/Git Bash (Windows/Linux/Mac)
```bash
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY_HERE"
```

### Windows Command Prompt
```cmd
set OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
```

### PowerShell
```powershell
$env:OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY_HERE"
```

## Quick Tests (Run These First!)

### Node.js Minimal Test
```bash
node kimi-k2-test.js
```

Expected output:
```
🔑 API key found
🌐 Connecting to OpenRouter...

🤖 Testing Kimi K2...

✅ SUCCESS!

Response: Hello! Kimi K2 is working!

Time: ~1000ms
Model: moonshotai/kimi-k2:free
Tokens used: ~15

🎉 Kimi K2 is ready to use!
```

### Python Minimal Test
```bash
python kimi-k2-test.py
```

Expected output is similar to Node.js version.

## Full Examples

### Node.js Complete Demo
```bash
node kimi-k2-quickstart.js
```

This runs 7 examples:
1. Simple chat
2. Code generation
3. Multi-turn conversation
4. Streaming response
5. Complex reasoning (Kimi K2's strength)
6. Function calling (agentic capabilities)
7. API usage check

### Python Complete Demo
```bash
python kimi_k2_quickstart.py
```

This runs 8 examples (same as Node.js plus data analysis and creative writing).

## One-Command Full Test

Once you have your API key set, run this single command to test everything:

### Node.js
```bash
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY" && node kimi-k2-test.js
```

### Python
```bash
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY" && python kimi-k2-test.py
```

## Common Issues

### API Key Not Set
```
❌ OPENROUTER_API_KEY not set
```
**Solution:** Set the environment variable as shown above.

### Invalid API Key
```
🔑 Invalid API key. Get one at https://openrouter.ai
```
**Solution:** Double-check your API key. It should start with `sk-or-v1-`.

### Rate Limited
```
⏳ Rate limited. Wait a bit and try again.
```
**Solution:** Free tier allows 100 requests/day. Wait or upgrade.

### Module Not Found
```
Error: Cannot find module 'openai'
```
**Solution:**
- Node.js: `npm install openai`
- Python: `pip install openai`

## Files Overview

| File | Purpose | Language |
|------|---------|----------|
| `validate-kimi-setup.sh` | Pre-flight validation | Bash |
| `kimi-k2-test.js` | Minimal test (1 request) | Node.js |
| `kimi-k2-test.py` | Minimal test (1 request) | Python |
| `kimi-k2-quickstart.js` | Full examples (7 examples) | Node.js |
| `kimi_k2_quickstart.py` | Full examples (8 examples) | Python |

## Success Criteria

✅ **You're ready when:**
- `validate-kimi-setup.sh` shows "All checks passed"
- `kimi-k2-test.js` returns "SUCCESS!"
- `kimi-k2-test.py` returns "SUCCESS!"

## Next Steps After Success

1. Modify the examples to test your own use cases
2. Check the full guide: `KIMI-K2-SETUP-GUIDE.md`
3. Explore OpenRouter docs: https://openrouter.ai/docs
4. Join OpenRouter Discord for community support

## Quick Reference

### Model Name
```
moonshotai/kimi-k2:free
```

### API Endpoint
```
https://openrouter.ai/api/v1
```

### Free Tier Limits
- 100 requests per day
- Standard rate limits apply
- No credit card required

### Kimi K2 Strengths
- Complex reasoning and multi-step problem solving
- Long context window (128K tokens)
- Function calling and tool use
- Code generation and analysis
- Mathematical and logical reasoning
