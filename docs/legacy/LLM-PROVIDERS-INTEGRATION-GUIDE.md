# AI Agent Swarm - LLM Provider Integration Complete

## Current Status

✅ **Already Integrated**: All 3 providers are coded and ready
- Groq ([src/llm/providers/groq.ts](ai-agent-swarm-mcp/src/llm/providers/groq.ts))
- Hugging Face ([src/llm/providers/huggingface.ts](ai-agent-swarm-mcp/src/llm/providers/huggingface.ts))
- Together AI ([src/llm/providers/together.ts](ai-agent-swarm-mcp/src/llm/providers/together.ts))

❌ **Missing**: API Keys (environment variables)

## Quick Setup

### Option 1: Interactive Setup (Recommended)

**For PowerShell/Windows:**
```powershell
powershell.exe -ExecutionPolicy Bypass -File setup-llm-providers.ps1
```

**For Git Bash/Linux:**
```bash
./setup-llm-providers.sh
```

### Option 2: Manual Setup

#### 1. Get Your API Keys

| Provider | Where to Get | Free Tier |
|----------|-------------|-----------|
| **Groq** | [console.groq.com/keys](https://console.groq.com/keys) | 30 req/min |
| **Hugging Face** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Yes |
| **Together AI** | [api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys) | Free trial |

#### 2. Set Environment Variables

**PowerShell (Permanent):**
```powershell
[System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'your_key_here', 'User')
[System.Environment]::SetEnvironmentVariable('HUGGINGFACE_TOKEN', 'your_token_here', 'User')
[System.Environment]::SetEnvironmentVariable('TOGETHER_API_KEY', 'your_key_here', 'User')
```

**Bash Profile (Permanent):**
```bash
echo 'export GROQ_API_KEY="your_key_here"' >> ~/.bash_profile
echo 'export HUGGINGFACE_TOKEN="your_token_here"' >> ~/.bash_profile
echo 'export TOGETHER_API_KEY="your_key_here"' >> ~/.bash_profile
source ~/.bash_profile
```

**Session Only:**
```bash
export GROQ_API_KEY="your_key_here"
export HUGGINGFACE_TOKEN="your_token_here"
export TOGETHER_API_KEY="your_key_here"
```

#### 3. Restart Claude Code

After setting environment variables:
```bash
# Exit Claude Code and restart
# Or restart your terminal
```

## Verify Integration

### Check Environment Variables
```bash
echo $GROQ_API_KEY
echo $HUGGINGFACE_TOKEN
echo $TOGETHER_API_KEY
```

### Check Provider Status
From within Claude Code, ask:
```
Check the AI agent swarm status
```

You should see all 5 providers as healthy:
- ✅ Ollama
- ✅ OpenRouter
- ✅ Groq
- ✅ Hugging Face
- ✅ Together AI

## Configuration Details

### Provider Order
Defined in [src/config/index.ts](ai-agent-swarm-mcp/src/config/index.ts:5):
```typescript
providerOrder: ['ollama', 'groq', 'openrouter', 'huggingface', 'together']
```

The swarm will try providers in this order until one succeeds.

### Default Models

| Provider | Model | Use Case |
|----------|-------|----------|
| Ollama | llama3.1:8b | General tasks |
| Groq | llama-3.1-8b-instant | Fast inference |
| OpenRouter | Various | Fallback |
| Hugging Face | Mistral-7B-Instruct-v0.2 | Open source |
| Together | Mistral-7B-Instruct-v0.2 | Cloud inference |

### API Endpoints

- **Groq**: `https://api.groq.com/openai/v1`
- **Hugging Face**: `https://api-inference.huggingface.co/models`
- **Together AI**: `https://api.together.xyz/v1`

## Testing

### Test Individual Providers

```bash
# Test via swarm
node ai-agent-swarm-mcp/test-simple.js
```

### Test via Claude Code

Ask Claude:
```
Use the swarm to execute: "What is 2+2? Answer in one sentence."
```

## Troubleshooting

### Provider Shows as Unhealthy

1. **Check API key is set:**
   ```bash
   echo $GROQ_API_KEY
   ```

2. **Verify API key is valid:**
   - Log into the provider's console
   - Check if key is active and not expired

3. **Test connectivity:**
   ```bash
   curl -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
   ```

4. **Restart MCP server:**
   - Restart Claude Code
   - Or restart terminal

### Rate Limits

| Provider | Free Tier Limits |
|----------|-----------------|
| Groq | 30 requests/min |
| Hugging Face | Varies by model |
| Together AI | Free trial credits |
| Ollama | Unlimited (local) |
| OpenRouter | Depends on backend |

### Common Errors

**"No API key configured"**
- Solution: Set the environment variable and restart

**"Health check failed"**
- Check internet connection
- Verify API key is valid
- Check rate limits

**"Request timed out"**
- Provider may be slow
- Try a different provider
- Check network connectivity

## Advanced Configuration

### Custom Provider Order

Edit [src/config/index.ts](ai-agent-swarm-mcp/src/config/index.ts) and modify:
```typescript
providerOrder: ['your', 'custom', 'order']
```

### Custom Models

Set in swarm execution:
```javascript
{
  "model": "specific-model-name",
  "provider": "groq"  // Optional: force specific provider
}
```

### Environment Variables

All available configuration:
```bash
GROQ_API_KEY=            # Groq API key
HUGGINGFACE_TOKEN=       # HF token
TOGETHER_API_KEY=        # Together API key
OPENROUTER_API_KEY=      # OpenRouter key
OLLAMA_HOST=             # Ollama endpoint (default: localhost:11434)
SWARM_CONCURRENCY=       # Max concurrent tasks (default: Infinity)
TASK_TIMEOUT_MS=         # Task timeout (default: 600000)
LOG_LEVEL=               # Logging level (default: info)
UNRESTRICTED=            # Safety override (default: true)
```

## Files Created

- [.env.swarm](/.env.swarm) - Template for environment variables
- [setup-llm-providers.ps1](/setup-llm-providers.ps1) - PowerShell setup script
- [setup-llm-providers.sh](/setup-llm-providers.sh) - Bash setup script
- This guide - Integration documentation

## Next Steps

1. Run setup script to add API keys
2. Restart Claude Code/terminal
3. Verify all providers are healthy
4. Start using the swarm with 5 LLM providers!

## Support

- **AI Agent Swarm**: [ai-agent-swarm-mcp/](ai-agent-swarm-mcp/)
- **Groq Docs**: https://console.groq.com/docs
- **HF Docs**: https://huggingface.co/docs/api-inference
- **Together Docs**: https://docs.together.ai/

---

*Generated by AI Agent Swarm Sequential Thinking + Research Agent*
