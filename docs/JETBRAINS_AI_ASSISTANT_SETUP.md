# JetBrains AI Assistant - Complete Setup Guide for Windows

## Quick Start

### Step 1: Install AI Assistant Plugin

1. Open your JetBrains IDE (IntelliJ IDEA, PyCharm, WebStorm, etc.)
2. Look for the **JetBrains AI widget** in the toolbar (top-right area)
3. Click **"Let's go"** to auto-install
4. Accept the Terms of Service when prompted

**Alternative Methods:**
- **AI Chat Tool Window**: Click `Install Plugin` in the AI Chat panel
- **Marketplace**: `Settings` → `Plugins` → `Marketplace` → Search "AI Assistant"

### Step 2: Activate License

After installation, AI Assistant checks your license:

| Scenario | Result |
|----------|--------|
| New user | 30-day AI Pro trial activated automatically |
| All Products Pack owner | AI Pro included at no extra cost |
| dotUltimate owner | AI Pro included at no extra cost |
| Expired license | AI Free tier with limited quota |

---

## Windows Keyboard Shortcuts

### Core AI Actions

| Action | Shortcut |
|--------|----------|
| Open Settings | `Ctrl+Alt+S` |
| AI Chat | `Alt+Enter` (in editor) |
| Explain Code | Select code → `Right-click` → `AI Actions` → `Explain` |
| Generate Code | `Alt+Insert` → AI options |
| Code Completion (Accept) | `Tab` |
| Next Edit Suggestion (Accept) | `Tab` |
| Next Edit Suggestion (Navigate) | `Alt+]` / `Alt+[` |

### Custom Shortcuts Configuration

1. Press `Ctrl+Alt+S` to open Settings
2. Navigate to `Keymap` → `Plugins` → `JetBrains AI Assistant`
3. Right-click any action → `Add Keyboard Shortcut`

**Recommended Custom Shortcuts:**
```
AI Chat:                 Ctrl+Shift+A
Explain Selection:       Ctrl+Shift+E
Generate Documentation:  Ctrl+Shift+D
Find Problems:           Ctrl+Shift+P
Suggest Refactoring:     Ctrl+Shift+R
Generate Tests:          Ctrl+Shift+T
```

---

## Configuration Files

### .aiignore (File Exclusions)

Location: Project root or `C:\Users\<username>\.aiignore`

This file prevents AI Assistant from accessing sensitive files:

```gitignore
# Security
.env
*.pem
*.key
.aws/credentials
.ssh/

# Build output
node_modules/
target/
build/
dist/

# IDE files
.idea/

# Secrets
secrets/
credentials.json
```

### MCP Server Configuration

Location: `Settings` → `Tools` → `AI Assistant` → `Model Context Protocol (MCP)`

Or import from: `C:\Users\scarm\.jetbrains-ai-mcp-config.json`

**To import:**
1. Open Settings → Tools → AI Assistant → Model Context Protocol
2. Click `Import from Claude` OR manually add servers
3. Click `Apply` to start servers

---

## Feature Configuration

### Enable Next Edit Suggestions

1. `Settings` → `Tools` → `AI Assistant`
2. In Features section, enable **"Enable next edit suggestions"**
3. Select languages: Java, Kotlin, Python
4. Enable **"Chain suggestions"** for continuous flow
5. Click `Apply`

### Configure Response Language

1. `Settings` → `Tools` → `AI Assistant`
2. Enable **"Receive AI Assistant chat responses in a custom language"**
3. Enter your preferred language (e.g., "Spanish", "Japanese")
4. Click `Apply`

### Message Trimming Threshold

1. `Settings` → `AI Assistant`
2. Find **"Message Trimming Threshold"**
3. Set **"Trim message if it exceeds % of model context window"**
4. Recommended: 80-90%
5. Click `Apply`

### Configure Commit Message Generation

1. `Settings` → `Tools` → `AI Assistant`
2. Enable **"Suggest commit messages"**
3. Optional: Enable **"Use VCS history for commit messages"**
4. Click `Apply`

---

## Local Model Setup (Ollama)

### Step 1: Install Ollama on Windows

**Option A: Direct Download**
1. Download from https://ollama.com/download/windows
2. Run the installer
3. Open PowerShell and verify: `ollama --version`

**Option B: Using winget**
```powershell
winget install Ollama.Ollama
```

### Step 2: Pull Models

```powershell
# Recommended models for code
ollama pull codellama:7b
ollama pull deepseek-coder:6.7b
ollama pull qwen2.5-coder:7b

# For chat
ollama pull llama3.1:8b
ollama pull mistral:7b
```

### Step 3: Configure in JetBrains

1. `Settings` → `Tools` → `AI Assistant`
2. Click **"Offline Mode"** in JetBrains AI widget
3. Select **"Connect to Ollama"**
4. Choose your model from the dropdown
5. Test the connection

### Step 4: LM Studio Alternative

1. Download LM Studio from https://lmstudio.ai
2. Download a model (e.g., CodeLlama, DeepSeek Coder)
3. Start the local server in LM Studio
4. In JetBrains: Settings → AI Assistant → Custom Models
5. Add endpoint: `http://localhost:1234/v1`

---

## Available AI Models (Cloud)

| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-4.1, GPT-4 Turbo, GPT-3.5 |
| **Anthropic** | Claude 3.7 Sonnet, Claude 3 Opus |
| **Google** | Gemini 2.5 Pro, Gemini 1.5 Pro |
| **JetBrains** | Mellum (optimized for code) |

**To change model:**
1. Open AI Chat
2. Click the model selector (top of chat)
3. Choose your preferred model
4. Automatic selection is also available

---

## Disable/Restrict AI Assistant

### Disable for Current Project
1. Click JetBrains AI widget
2. Hover over **"Disable AI Assistant"**
3. Select **"Disable for This Project"**

### Disable Permanently
1. Click JetBrains AI widget
2. Hover over **"Disable AI Assistant"**
3. Select **"Disable Permanently via Plugin"**
4. Click **"Disable"** in plugin settings

### Create .noai File
Create an empty file named `.noai` in project root to completely disable AI for that project.

### Network-Level Block
Block these URLs:
- `https://api.jetbrains.ai/`
- `https://api.app.prod.grazie.aws.intellij.net/`

---

## Subscription Tiers

| Tier | Features |
|------|----------|
| **Free** | Unlimited local completions, limited cloud quota |
| **Pro** | Extended cloud quota, all features, included with All Products Pack |
| **Ultimate** | Maximum quota, priority access |
| **Enterprise** | Self-hosted LLMs, custom configurations |

---

## Use IDE as MCP Server

JetBrains IDEs 2025.2+ can act as MCP servers for external clients:

1. `Settings` → `Tools` → `MCP Server`
2. Click **"Enable MCP Server"**
3. Under **"Clients Auto-Configuration"**, click **"Auto-Configure"** for:
   - Claude Desktop
   - Claude Code
   - Cursor
   - VS Code
   - Windsurf
4. Restart the external client

### Brave Mode (No Confirmations)
1. `Settings` → `Tools` → `MCP Server`
2. Enable **"Run shell commands or run configurations without confirmation (brave mode)"**
3. Click `Apply`

---

## Troubleshooting

### AI Assistant Not Working
1. Verify IDE version is 2023.3 or later
2. Check license status in JetBrains AI widget
3. Ensure internet connectivity
4. Try: `Help` → `Restart IDE`

### MCP Server Issues
1. Check logs: `Help` → `Show Log in Explorer`
2. Navigate to `mcp` folder
3. Review server-specific logs

### Quota Exhausted
1. Check quota in JetBrains AI widget
2. Purchase Top-up AI Credits
3. Or wait for monthly reset
4. Or switch to local models

### Local Model Not Responding
1. Verify Ollama is running: `ollama serve`
2. Check model is pulled: `ollama list`
3. Test model: `ollama run <model-name>`
4. Restart IDE

---

## Quick Reference Commands

```
# AI Chat slash commands
/web        - Web search for documentation
/mcp        - Access MCP tools
/explain    - Explain selected code
/refactor   - Suggest refactoring
/test       - Generate tests
/doc        - Generate documentation
```

---

*Generated by MCP Tool Orchestration System*
*Last Updated: December 2025*
