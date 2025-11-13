# Kimi K2 - Quick Reference Card

## ⚡ Fastest Start (30 seconds)

### Web Interface (No Setup)
```
https://kimi.moonshot.cn
```
Sign up → Chat → Done! (Unlimited & Free)

### API Test (2 minutes)
```bash
# Get key: https://openrouter.ai
export OPENROUTER_API_KEY="sk-or-v1-..."

curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"moonshotai/kimi-k2:free","messages":[{"role":"user","content":"Hello!"}]}'
```

---

## 📋 Essential Info

| Item | Value |
|------|-------|
| **Model ID** | `moonshotai/kimi-k2:free` |
| **Free Tier** | 100 requests/day (OpenRouter) |
| **Web Interface** | Unlimited usage |
| **Context** | 128K tokens |
| **Best At** | Reasoning, agentic tasks, code |
| **Beats** | GPT-5 & Claude on key benchmarks |

---

## 🔌 API Endpoints

### OpenRouter (Free)
```
https://openrouter.ai/api/v1
Model: moonshotai/kimi-k2:free
```

### Official Moonshot (Paid but cheap)
```
https://api.moonshot.cn/v1
Models: moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k
```

---

## 💻 Code Snippets

### Node.js
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY
});

const response = await client.chat.completions.create({
  model: 'moonshotai/kimi-k2:free',
  messages: [{ role: 'user', content: 'Your prompt' }]
});
```

### Python
```python
from openai import OpenAI

client = OpenAI(
    base_url='https://openrouter.ai/api/v1',
    api_key=os.environ['OPENROUTER_API_KEY']
)

response = client.chat.completions.create(
    model='moonshotai/kimi-k2:free',
    messages=[{'role': 'user', 'content': 'Your prompt'}]
)
```

### Bash/Curl
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2:free",
    "messages": [{"role": "user", "content": "Your prompt"}],
    "temperature": 0.7
  }'
```

---

## 🎛️ Key Parameters

```json
{
  "model": "moonshotai/kimi-k2:free",
  "messages": [...],
  "temperature": 0.7,        // 0.2-0.3 for reasoning, 0.8-0.9 for creativity
  "max_tokens": 1000,        // Response length limit
  "stream": false,           // Set true for streaming
  "top_p": 1.0,             // Nucleus sampling
  "frequency_penalty": 0,    // Reduce repetition
  "presence_penalty": 0      // Encourage topic diversity
}
```

---

## 🧪 Quick Tests

### Test 1: Simple Chat
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"moonshotai/kimi-k2:free","messages":[{"role":"user","content":"What is 2+2?"}]}'
```

### Test 2: Check Usage
```bash
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Test 3: List Models
```bash
curl https://openrouter.ai/api/v1/models | grep kimi
```

---

## 📊 Performance Benchmarks

| Benchmark | Kimi K2 | GPT-5 | Claude 4.5 |
|-----------|---------|-------|------------|
| Humanity's Last Exam | **44.9%** | 43.2% | 41.8% |
| BrowseComp | **60.2%** | 58.7% | 57.3% |
| MMLU-Pro | 87.3% | **88.1%** | 87.9% |
| GPQA Diamond | **61.2%** | 59.8% | 60.1% |

---

## 🛠️ Common Issues

### Issue: 401 Unauthorized
**Fix**: Check API key is correct and set
```bash
echo $OPENROUTER_API_KEY
```

### Issue: 429 Rate Limit
**Fix**: Wait 24hrs or use web interface
```
https://kimi.moonshot.cn (unlimited)
```

### Issue: Model Not Found
**Fix**: Use exact model ID
```
moonshotai/kimi-k2:free
```

### Issue: Slow Response
**Fix**: Enable streaming
```javascript
stream: true
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Web Chat | https://kimi.moonshot.cn |
| OpenRouter | https://openrouter.ai |
| Get API Key | https://openrouter.ai/keys |
| GitHub | https://github.com/MoonshotAI/Kimi-K2 |
| Hugging Face | https://huggingface.co/moonshotai |
| Docs | https://platform.moonshot.cn/docs |

---

## 💡 Pro Tips

1. **Start free**: Web interface = unlimited usage
2. **Use OpenRouter**: 100 free API requests/day
3. **Temperature matters**:
   - Low (0.2-0.3) = reasoning/math
   - High (0.8-0.9) = creativity/writing
4. **Enable streaming**: Better UX
5. **Monitor usage**: Check daily quota
6. **Try function calling**: Unlock agentic powers

---

## 🎯 Best For

✅ Complex reasoning
✅ Multi-step problems
✅ Agentic workflows (200+ tool calls)
✅ Code generation
✅ Research & analysis
✅ Document processing

---

## ⚠️ Not Ideal For

❌ Real-time production (use paid tier)
❌ Guaranteed uptime (use official API)
❌ Very high volume (free tier limits)
❌ Compliance needs (HIPAA/SOC2)

---

## 📁 Local Files

```
KIMI-K2-README.md          - Main README
KIMI-K2-SETUP-GUIDE.md     - Full guide (all 6 methods)
kimi-k2-quickstart.js      - Node.js examples
kimi_k2_quickstart.py      - Python examples
setup-kimi-k2.sh           - Interactive setup
KIMI-K2-QUICK-REFERENCE.md - This file
```

---

## 🚀 Next Action

**Choose one:**

1. **Casual user**: Visit https://kimi.moonshot.cn now
2. **Developer**: Get API key at https://openrouter.ai
3. **Read more**: Open `KIMI-K2-SETUP-GUIDE.md`
4. **Run examples**: `node kimi-k2-quickstart.js`

---

**Bookmark this page for quick reference!** 🔖
