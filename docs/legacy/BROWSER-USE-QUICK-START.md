# Browser-Use CLI - Quick Start Guide

**Version:** 0.9.5
**Installed:** 2025-11-13 12:25 PM EST
**Status:** ✅ READY TO USE

---

## ✅ Installation Complete

```powershell
# Already installed! ✅
browser-use --version  # Output: 0.9.5
```

---

## 🚀 Quick Start

### 1. Interactive Mode (Recommended for First Use)

```powershell
browser-use
```

This launches an interactive TUI (Text User Interface) where you can:
- Configure settings
- Select LLM model
- Start automation tasks
- View real-time progress

### 2. Generate Template

Create a starter script:

```powershell
# Default template
browser-use --template default

# Advanced template
browser-use --template advanced -o my_automation.py

# With tools
browser-use --template tools -o advanced_tools.py
```

### 3. Run with Specific Model

```powershell
# Use Ollama (already running!)
browser-use --model ollama/llama3.1:8b

# Use Claude
browser-use --model claude-4-sonnet

# Use GPT
browser-use --model gpt-5-mini

# Use Gemini
browser-use --model gemini-2.5-flash

# Use Groq (you have API key!)
browser-use --model groq/llama3.1-70b
```

---

## 📋 Available Commands

### `browser-use auth`
Authenticate with Browser Use Cloud to sync your runs

```powershell
browser-use auth
```

### `browser-use init`
Generate a browser-use template file

```powershell
browser-use init
# OR
browser-use --template default
```

### `browser-use install`
Install Chromium browser with system dependencies

```powershell
browser-use install
```

---

## 🎯 Common Use Cases

### 1. Simple Web Automation

```powershell
# Interactive mode - just describe what you want
browser-use --model ollama/llama3.1:8b
# Then type: "Search for AI news on Hacker News"
```

### 2. Headless Automation

```powershell
browser-use --headless --model ollama/llama3.1:8b
```

### 3. Custom Browser Window

```powershell
browser-use --window-width 1920 --window-height 1080
```

### 4. Use Existing Chrome Profile

```powershell
# Windows
browser-use --user-data-dir "C:\Users\scarm\AppData\Local\Google\Chrome\User Data" --profile-directory "Default"
```

### 5. Connect to Running Chrome

```powershell
# First, start Chrome with remote debugging:
# chrome.exe --remote-debugging-port=9222

# Then connect:
browser-use --cdp-url http://localhost:9222
```

### 6. Debug Mode

```powershell
browser-use --debug --model ollama/llama3.1:8b
```

---

## 🤖 LLM Model Options

### Using Ollama (Local - Already Running!)

```powershell
browser-use --model ollama/llama3.1:8b
browser-use --model ollama/mistral:7b
browser-use --model ollama/phi3:mini
browser-use --model ollama/qwen2.5:7b
```

### Using Groq (You Have API Key!)

```powershell
# Set API key if not in environment
export GROQ_API_KEY="your_key"

browser-use --model groq/llama3.1-70b
browser-use --model groq/mixtral-8x7b
```

### Using OpenRouter (You Have API Key!)

```powershell
# Set API key if not in environment
export OPENROUTER_API_KEY="your_key"

browser-use --model openrouter/anthropic/claude-3.5-sonnet
```

### Using Claude (Anthropic)

```powershell
# Requires ANTHROPIC_API_KEY
browser-use --model claude-4-sonnet
browser-use --model claude-4-opus
```

### Using OpenAI

```powershell
# Requires OPENAI_API_KEY
browser-use --model gpt-5-mini
browser-use --model gpt-5
```

### Using Google Gemini

```powershell
# Requires GOOGLE_API_KEY
browser-use --model gemini-2.5-flash
browser-use --model gemini-2.5-pro
```

---

## 📝 Template Examples

### Default Template

```powershell
browser-use --template default -o my_script.py
```

Creates a basic script with:
- Browser initialization
- Task execution
- Error handling

### Advanced Template

```powershell
browser-use --template advanced -o advanced.py
```

Includes:
- Custom controllers
- State management
- Advanced error handling
- Logging

### Tools Template

```powershell
browser-use --template tools -o tools_demo.py
```

Demonstrates:
- Custom tool integration
- Tool chaining
- Complex workflows

---

## 🔧 Options Reference

| Option | Description | Example |
|--------|-------------|---------|
| `--version` | Show version | `browser-use --version` |
| `--template` | Generate template | `--template default` |
| `-o, --output` | Output file path | `-o my_script.py` |
| `-f, --force` | Overwrite without asking | `--force` |
| `--model` | LLM model to use | `--model ollama/llama3.1:8b` |
| `--debug` | Verbose logging | `--debug` |
| `--headless` | Run without GUI | `--headless` |
| `--window-width` | Browser width | `--window-width 1920` |
| `--window-height` | Browser height | `--window-height 1080` |
| `--user-data-dir` | Chrome user data | `--user-data-dir "C:\Users\..."` |
| `--profile-directory` | Chrome profile | `--profile-directory "Default"` |
| `--cdp-url` | Connect to Chrome | `--cdp-url http://localhost:9222` |
| `--proxy-url` | Proxy server | `--proxy-url http://proxy:8080` |

---

## 🎬 Example Workflows

### Example 1: Research Task

```powershell
# Generate template
browser-use --template default -o research.py

# Edit research.py to add your task
# Then run:
python research.py
```

### Example 2: Data Extraction

```powershell
browser-use --model ollama/llama3.1:8b --headless
# Describe: "Extract product prices from example.com"
```

### Example 3: Form Filling

```powershell
browser-use --model groq/llama3.1-70b
# Describe: "Fill out the contact form on website.com"
```

### Example 4: Screenshot Capture

```powershell
browser-use --model ollama/mistral:7b
# Describe: "Take screenshots of the top 5 results for 'AI news'"
```

---

## 🔗 Integration with AI Swarm MCP

You can combine browser-use with the AI Agent Swarm MCP for powerful automation:

### From AI Swarm MCP

```python
# In your AI Swarm task
{
  "task": "Research competitor websites",
  "tools": ["system_command"],
  "commands": [
    "browser-use --model ollama/llama3.1:8b --headless"
  ]
}
```

### Python Integration

```python
import subprocess
from ai_agent_swarm import SwarmOrchestrator

# Use swarm to orchestrate browser-use tasks
def run_browser_automation(task_description):
    result = subprocess.run([
        'browser-use',
        '--model', 'ollama/llama3.1:8b',
        '--headless'
    ], input=task_description, capture_output=True, text=True)
    return result.stdout
```

---

## 🐛 Troubleshooting

### Issue: Command not found

**Solution:**
```powershell
# Use full path
"C:\Program Files\Python313\Scripts\browser-use.exe" --version

# Or add to PATH
$env:Path += ";C:\Program Files\Python313\Scripts"
```

### Issue: Chromium not installed

**Solution:**
```powershell
browser-use install
```

### Issue: Model not working

**Solution:**
```powershell
# Check Ollama is running
curl http://localhost:11434/api/tags

# Try different model
browser-use --model ollama/mistral:7b
```

### Issue: Permission errors

**Solution:**
Run PowerShell as Administrator

---

## 📚 Resources

**Help Command:**
```powershell
browser-use --help
```

**Version:**
```powershell
browser-use --version  # 0.9.5
```

**Package Info:**
```powershell
python -m pip show browser-use
```

**Test Import:**
```powershell
python -c "import browser_use; print('OK')"
```

---

## ✨ Next Steps

1. **Try Interactive Mode**
   ```powershell
   browser-use
   ```

2. **Generate Your First Script**
   ```powershell
   browser-use --template default -o my_first_automation.py
   ```

3. **Test with Ollama**
   ```powershell
   browser-use --model ollama/llama3.1:8b
   ```

4. **Explore Templates**
   ```powershell
   browser-use --template advanced -o advanced.py
   browser-use --template tools -o tools.py
   ```

5. **Build Your Automation**
   - Edit the generated templates
   - Add your specific tasks
   - Run and iterate

---

## 🎉 You're Ready!

✅ **browser-use v0.9.5 is installed and ready**
✅ **Multiple LLM providers available**
✅ **Ollama already running for local inference**
✅ **Groq and OpenRouter API keys configured**
✅ **Compatible with AI Swarm MCP**

**Start automating:** `browser-use`

---

**Last Updated:** 2025-11-13 12:30 PM EST

