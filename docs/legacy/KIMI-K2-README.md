# Kimi K2 Thinking AI - Quick Start Package

This package contains everything you need to start using **Kimi K2 Thinking**, the Chinese AI model that outperforms GPT-5 and Claude Sonnet 4.5 on key benchmarks - **completely free**.

## 📦 What's Included

```
KIMI-K2-SETUP-GUIDE.md      - Comprehensive setup guide (all 6 methods)
kimi-k2-quickstart.js       - Node.js examples and demos
kimi_k2_quickstart.py       - Python examples and demos
setup-kimi-k2.sh            - Interactive setup script
KIMI-K2-README.md           - This file
```

## 🚀 Quick Start (3 Minutes)

### Option 1: Use Web Interface (Instant, No Setup)

The fastest way to try Kimi K2:

1. Visit: https://kimi.moonshot.cn
2. Sign up with Gmail
3. Start chatting immediately
4. **Unlimited usage, 100% free**

### Option 2: Use API (Best for Developers)

Get free API access via OpenRouter:

```bash
# 1. Get API key from https://openrouter.ai (takes 2 minutes)

# 2. Set environment variable
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY_HERE"

# 3. Test with curl
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2:free",
    "messages": [{"role": "user", "content": "Hello Kimi!"}]
  }'
```

**Done!** You're now using a model that beats GPT-5 on several benchmarks.

---

## 📖 Detailed Setup

### For Node.js Developers

```bash
# 1. Install OpenAI SDK
npm install openai

# 2. Set your API key
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY_HERE"

# 3. Run examples
node kimi-k2-quickstart.js
```

The quickstart script includes 7 examples:
- Simple chat
- Code generation
- Multi-turn conversations
- Streaming responses
- Complex reasoning
- Function calling
- Usage monitoring

### For Python Developers

```bash
# 1. Install OpenAI SDK
pip install openai

# 2. Set your API key
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY_HERE"

# 3. Run examples
python kimi_k2_quickstart.py
```

The Python script includes 8 examples covering all major use cases.

### Interactive Setup Script

```bash
# Run the interactive setup wizard
./setup-kimi-k2.sh
```

The script will:
- Check prerequisites (Node.js, Python)
- Help you configure API keys
- Install dependencies
- Test your connection
- Run example scripts

---

## 🎯 Why Kimi K2?

### Performance
- **44.9% on Humanity's Last Exam** (vs GPT-5: 43.2%, Claude: 41.8%)
- **60.2% on BrowseComp** (agentic tasks benchmark)
- **87.3% on MMLU-Pro** (close to GPT-5's 88.1%)

### Cost
- **100% Free** via web interface (unlimited)
- **100 requests/day free** via OpenRouter API
- **10x cheaper than GPT-5** via official API ($0.08 vs $1.25 per M tokens)

### Capabilities
- 200-300 sequential tool calls (best-in-class agentic workflows)
- 128K context window
- Extended "thinking" mode for complex reasoning
- Multimodal (text, images, documents)
- Open-source weights available

---

## 📚 Documentation

### All 6 Access Methods

Open `KIMI-K2-SETUP-GUIDE.md` for complete documentation on:

1. **Official Web Interface** - Instant, unlimited, free
2. **OpenRouter API** - Free tier, 100 req/day, perfect for dev
3. **Official Moonshot API** - Low-cost, high-volume production
4. **Hugging Face Demo** - No sign-up required
5. **Self-hosting** - Open-source weights on GitHub
6. **Third-party integrations** - ChatMaxima, Poe, LangChain, etc.

### API Examples

```javascript
// Node.js
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const response = await client.chat.completions.create({
  model: 'moonshotai/kimi-k2:free',
  messages: [{ role: 'user', content: 'Explain quantum computing' }],
});

console.log(response.choices[0].message.content);
```

```python
# Python
from openai import OpenAI

client = OpenAI(
    base_url='https://openrouter.ai/api/v1',
    api_key=os.environ['OPENROUTER_API_KEY']
)

response = client.chat.completions.create(
    model='moonshotai/kimi-k2:free',
    messages=[{'role': 'user', 'content': 'Explain quantum computing'}]
)

print(response.choices[0].message.content)
```

---

## 🔥 Best Use Cases

Kimi K2 excels at:

- ✅ **Complex reasoning** - Multi-step problem solving
- ✅ **Agentic workflows** - 200+ tool calls without human intervention
- ✅ **Code generation** - Especially Python, JavaScript, and complex algorithms
- ✅ **Research tasks** - Document analysis, literature reviews
- ✅ **Data analysis** - Statistical reasoning, trend analysis
- ✅ **Creative writing** - With high temperature settings
- ✅ **Multi-turn conversations** - Maintains context well

Less ideal for:

- ❌ Real-time production apps (use paid tier)
- ❌ HIPAA/SOC2 compliance needs
- ❌ Very high-volume applications (free tier limits)

---

## 🛠️ Troubleshooting

### API Key Not Working

```bash
# Verify your key is set correctly
echo $OPENROUTER_API_KEY

# Test with curl
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Rate Limit Exceeded

Free tier allows **100 requests per day**. Options:
- Wait 24 hours for reset
- Use web interface (unlimited)
- Upgrade to OpenRouter paid plan
- Switch to official Moonshot API (very cheap)

### Model Not Found

Make sure you use the exact model ID:
```
moonshotai/kimi-k2:free
```

### Connection Issues

```bash
# Check OpenRouter status
curl https://openrouter.ai/api/v1/models | grep kimi

# Test basic connectivity
curl https://openrouter.ai/api/v1/models
```

---

## 📊 Quick Comparison

| Feature | Web Interface | OpenRouter API | Moonshot API |
|---------|--------------|----------------|--------------|
| Cost | Free (unlimited) | Free (100/day) | ~$0.08-0.32/M |
| Setup Time | 1 minute | 5 minutes | 10 minutes |
| Use Case | Casual use | Development | Production |
| Rate Limits | None | 100 req/day | Based on plan |
| Best For | Testing, casual | Dev & testing | High volume |

---

## 🔗 Useful Links

- **Official Website**: https://kimi.moonshot.cn
- **OpenRouter**: https://openrouter.ai
- **Moonshot API**: https://platform.moonshot.cn
- **GitHub Repo**: https://github.com/MoonshotAI/Kimi-K2
- **Hugging Face**: https://huggingface.co/moonshotai
- **API Docs**: https://platform.moonshot.cn/docs

---

## 💡 Pro Tips

1. **Start with web interface** to get a feel for the model
2. **Use OpenRouter for API development** (100 free requests/day is plenty)
3. **Lower temperature (0.2-0.3) for reasoning**, higher (0.8-0.9) for creativity
4. **Enable streaming** for better UX in chat applications
5. **Use function calling** to unlock agentic capabilities
6. **Monitor usage** to stay within free tier limits

---

## 🎓 Next Steps

### Day 1: Getting Started
- [ ] Try the web interface at https://kimi.moonshot.cn
- [ ] Sign up for OpenRouter at https://openrouter.ai
- [ ] Test with curl or quickstart scripts
- [ ] Read the full setup guide

### Day 2: Integration
- [ ] Integrate into your existing project
- [ ] Test with your specific use cases
- [ ] Compare performance vs GPT/Claude
- [ ] Monitor usage and costs

### Day 3: Advanced Features
- [ ] Experiment with function calling
- [ ] Build a multi-agent workflow
- [ ] Try extended thinking mode
- [ ] Optimize prompts for best results

### Week 2: Production (Optional)
- [ ] Upgrade to paid plan if needed
- [ ] Set up monitoring and logging
- [ ] Implement error handling
- [ ] Scale your application

---

## 🤝 Support & Community

- **Issues**: https://github.com/MoonshotAI/Kimi-K2/issues
- **OpenRouter Discord**: https://discord.gg/openrouter
- **Reddit**: r/LocalLLaMA (for self-hosting)
- **Twitter**: @MoonshotAI

---

## ⚠️ Important Notes

- **Chinese-first model**: Slightly better performance in Chinese
- **Free tier limits**: 100 requests/day via OpenRouter
- **Open-source**: Weights available on GitHub/Hugging Face
- **No censorship claims verified**: Test for your use case
- **Performance varies by task**: Check benchmarks for your needs

---

## 📝 License

Kimi K2 is released under the **Modified MIT License**.

See: https://github.com/MoonshotAI/Kimi-K2/blob/main/LICENSE

---

**Last Updated**: November 9, 2025
**Kimi K2 Version**: v1.0 (Thinking)
**Package Version**: 1.0.0

---

## 🎉 You're Ready!

You now have everything needed to use a model that beats GPT-5 on key benchmarks - completely free.

**Recommended first step**: Visit https://kimi.moonshot.cn and try it out right now!

Questions? Check `KIMI-K2-SETUP-GUIDE.md` for detailed documentation.

Happy building! 🚀
