# Kimi K2 Thinking AI Model - Complete Setup Guide

## Overview

**Kimi K2 Thinking** is a state-of-the-art Chinese AI model developed by Moonshot AI that claims to outperform GPT-5 and Claude Sonnet 4.5 on key benchmarks. Released on November 6, 2025, it's fully open-source and available for free use.

### Key Features
- **1 trillion total parameters** (MoE architecture with 32B active parameters)
- **44.9% score on Humanity's Last Exam** (beating GPT-5 and Claude Sonnet 4.5)
- **60.2% on BrowseComp benchmark** (agentic search/browsing capabilities)
- **200-300 sequential tool calls** without human intervention
- **Open-source** with Modified MIT License
- **Multimodal capabilities** (text, images, vision)

---

## Method 1: Official Web Interface (Easiest, 100% Free)

### Access
- Website: https://kimi.moonshot.cn or https://kimi.ai
- No API key required
- Unlimited usage (no token/time limits)

### Steps
1. Visit https://kimi.moonshot.cn
2. Sign up/log in with Gmail or phone number
3. Start chatting immediately
4. **Note**: UI is in Chinese, but you can:
   - Use Google Translate extension
   - Type in English (model understands English well)
   - Right-click → Translate to English

### Capabilities Available
- Text conversations
- Image analysis
- Document processing
- Web search integration
- Extended reasoning (Thinking mode)

---

## Method 2: Free API via OpenRouter (Best for Developers)

### Why OpenRouter?
Kimi K2 is made available for **completely free** via OpenRouter by Moonshot AI - not available free anywhere else via API.

### Setup Steps

#### 1. Create OpenRouter Account
```bash
# Visit OpenRouter
open https://openrouter.ai/
```

1. Sign up with GitHub, Google, or email
2. Navigate to **Keys** section
3. Click **Create Key** and give it a name
4. Copy your API key (starts with `sk-or-v1-...`)

#### 2. Test with cURL
```bash
# Set your API key
export OPENROUTER_API_KEY="sk-or-v1-YOUR_KEY_HERE"

# Test request
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
    "model": "moonshotai/kimi-k2:free",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing in simple terms"
      }
    ]
  }'
```

#### 3. Node.js Integration
```javascript
// Install OpenAI SDK (OpenRouter is compatible)
// npm install openai

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function chat() {
  const completion = await openai.chat.completions.create({
    model: 'moonshotai/kimi-k2:free',
    messages: [
      { role: 'user', content: 'Write a Python function to calculate Fibonacci numbers' }
    ],
  });

  console.log(completion.choices[0].message.content);
}

chat();
```

#### 4. Python Integration
```python
# pip install openai

from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="YOUR_OPENROUTER_API_KEY"
)

completion = client.chat.completions.create(
    model="moonshotai/kimi-k2:free",
    messages=[
        {"role": "user", "content": "Explain machine learning in simple terms"}
    ]
)

print(completion.choices[0].message.content)
```

### Free Tier Limits
- **100 requests per day** (fair use policy)
- **~100K tokens per month**
- No credit card required
- Perfect for development/testing

---

## Method 3: Official Moonshot API (Low Cost, High Volume)

### Setup Steps

#### 1. Create Account
1. Visit https://platform.moonshot.cn
2. Sign up with Gmail or phone number
3. Verify email/phone

#### 2. Get Free Credits
- New users get **¥5 (~$0.70) voucher**
- Optional: Add $5 for extended usage

#### 3. Generate API Key
1. Go to **API Keys** section
2. Click **Create New Key**
3. Name it and copy the key (starts with `sk-...`)

#### 4. Test API
```bash
# Set your Moonshot API key
export MOONSHOT_API_KEY="sk-YOUR_KEY_HERE"

# Test request
curl https://api.moonshot.cn/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MOONSHOT_API_KEY" \
  -d '{
    "model": "moonshot-v1-128k",
    "messages": [
      {
        "role": "user",
        "content": "你好，介绍一下你自己"
      }
    ],
    "temperature": 0.7
  }'
```

### Pricing (Very Cheap)
- **Input**: ~$0.08 per million tokens
- **Output**: ~$0.32 per million tokens
- **10x cheaper than GPT-5** ($1.25/$10 per million)
- **3x cheaper than Claude Sonnet 4.5** ($0.30/$1.20 per million)

### Available Models
- `moonshot-v1-8k` - Standard context (8K tokens)
- `moonshot-v1-32k` - Extended context (32K tokens)
- `moonshot-v1-128k` - Maximum context (128K tokens)
- `kimi-k2-thinking` - Latest thinking model

---

## Method 4: Hugging Face Demo (No Sign-Up)

### Access
- Website: https://huggingface.co/spaces/moonshotai/Kimi-K2-Instruct
- No account required
- Instant access
- Great for quick tests

### Available Model Spaces
1. **Kimi-K2-Instruct**: https://huggingface.co/spaces/moonshotai/Kimi-K2-Instruct
2. **Kimi-K2-Thinking**: https://huggingface.co/spaces/moonshotai/Kimi-K2-Thinking

### Limitations
- May have queue times during peak hours
- Limited to web interface
- No API access from Spaces

---

## Method 5: Download Model Weights (Advanced Users)

### Requirements
- **Minimum**: 8x A100 GPUs (80GB each) or equivalent
- **Alternative**: H100/H200 cluster with 16 GPUs
- 2TB+ storage for model weights
- Linux environment with CUDA support

### Download Model
```bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login to Hugging Face
huggingface-cli login

# Download Kimi-K2-Instruct (FP8 quantized)
huggingface-cli download moonshotai/Kimi-K2-Instruct \
  --local-dir ./kimi-k2-instruct

# Or download Kimi-K2-Thinking
huggingface-cli download moonshotai/Kimi-K2-Thinking \
  --local-dir ./kimi-k2-thinking
```

### Deploy with vLLM
```bash
# Install vLLM
pip install vllm

# Launch server (requires 16 GPUs with Tensor Parallel)
vllm serve ./kimi-k2-instruct \
  --port 8000 \
  --served-model-name kimi-k2 \
  --trust-remote-code \
  --tensor-parallel-size 16 \
  --enable-auto-tool-choice \
  --tool-call-parser kimi_k2 \
  --max-model-len 131072
```

### Deploy with SGLang (Alternative)
```bash
# Install SGLang
pip install "sglang[all]"

# Launch server
python -m sglang.launch_server \
  --model-path ./kimi-k2-instruct \
  --port 8000 \
  --trust-remote-code \
  --tp 16
```

### GitHub Repository
- Repo: https://github.com/MoonshotAI/Kimi-K2
- License: Modified MIT License
- Documentation: https://github.com/MoonshotAI/Kimi-K2/blob/main/docs/deploy_guidance.md

---

## Method 6: Integration Tools & Platforms

### ChatMaxima Integration
1. Visit https://chatmaxima.com
2. Sign up for free account
3. Navigate to **Model Settings**
4. Select **Kimi K2** from available models
5. Start using in their interface

### Poe.com Integration
1. Visit https://poe.com
2. Search for "Kimi K2" bot
3. Subscribe (may require Poe subscription)
4. Chat with bot directly

### LangChain Integration
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="YOUR_OPENROUTER_API_KEY",
    model="moonshotai/kimi-k2:free"
)

response = llm.invoke("Explain quantum mechanics")
print(response.content)
```

---

## Quick Start Recommendation

**For most users**, I recommend starting with **Method 2 (OpenRouter)** because:
- ✅ Completely free (no credit card)
- ✅ Easy API integration
- ✅ OpenAI-compatible API
- ✅ Works with existing code
- ✅ 100 requests/day is generous for testing
- ✅ Can scale to paid plans if needed

**For casual users**: Use Method 1 (Official Web Interface) - instant access, no setup.

**For high-volume use**: Use Method 3 (Official Moonshot API) - extremely cheap pricing.

---

## Performance Comparison

| Benchmark | Kimi K2 | GPT-5 | Claude Sonnet 4.5 | Grok-4 |
|-----------|---------|-------|-------------------|--------|
| Humanity's Last Exam | **44.9%** | 43.2% | 41.8% | 42.1% |
| BrowseComp | **60.2%** | 58.7% | 57.3% | 56.9% |
| MMLU-Pro | 87.3% | **88.1%** | 87.9% | 86.4% |
| GPQA Diamond | **61.2%** | 59.8% | 60.1% | 58.7% |

*Note: Performance varies by benchmark. Kimi K2 excels at reasoning and agentic tasks.*

---

## Limitations & Considerations

### Known Limitations
- **Chinese-first model**: Slightly better performance in Chinese than English
- **Rate limits**: Free tiers have daily/monthly caps
- **Availability**: May have regional restrictions
- **Documentation**: Some docs only in Chinese

### Best Use Cases
- ✅ Complex reasoning tasks
- ✅ Multi-step problem solving
- ✅ Agentic workflows with tool use
- ✅ Research and prototyping
- ✅ Code generation
- ✅ Document analysis

### Not Ideal For
- ❌ Real-time production apps (use official API)
- ❌ Tasks requiring guaranteed uptime
- ❌ HIPAA/SOC2 compliance needs
- ❌ Very high-volume applications (free tier)

---

## Example Use Cases

### 1. Code Generation
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshotai/kimi-k2:free",
    "messages": [
      {"role": "user", "content": "Write a Python script to scrape weather data"}
    ]
  }'
```

### 2. Research Assistant
```bash
# Use the web interface at kimi.moonshot.cn
# Upload PDFs, ask questions about research papers
```

### 3. Multi-Agent Systems
```python
# Kimi K2 excels at tool calling and agentic workflows
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"]
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string"}
                }
            }
        }
    }
]

response = client.chat.completions.create(
    model="moonshotai/kimi-k2:free",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
    tool_choice="auto"
)
```

---

## Troubleshooting

### OpenRouter API Issues
```bash
# Test connection
curl https://openrouter.ai/api/v1/models | jq '.data[] | select(.id | contains("kimi"))'

# Check your quota
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Model Not Found
- Make sure you use exactly: `moonshotai/kimi-k2:free`
- Check OpenRouter status: https://status.openrouter.ai

### Rate Limiting
- Free tier: 100 requests/day
- Wait 24 hours or upgrade to paid plan
- Or use Method 1 (web interface) for unlimited access

---

## Additional Resources

- **Official Site**: https://kimi.moonshot.cn
- **API Docs**: https://platform.moonshot.cn/docs
- **GitHub**: https://github.com/MoonshotAI/Kimi-K2
- **Hugging Face**: https://huggingface.co/moonshotai
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Paper/Tech Report**: Check GitHub repo for latest research

---

## Next Steps

1. **Try the web interface** at https://kimi.moonshot.cn (instant access)
2. **Set up OpenRouter API** for programmatic access (5 minutes)
3. **Test with your use case** (code generation, research, etc.)
4. **Upgrade if needed** to Moonshot API for high volume
5. **Share feedback** with Moonshot AI team

---

**Created**: November 9, 2025
**Model Version**: Kimi K2 Thinking (v1.0)
**Last Updated**: Check GitHub repo for latest versions
