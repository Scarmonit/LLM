#!/bin/bash
################################################################################
# Qwen Programmatic Access - Quick Start Demo
# Demonstrates all three methods for working with Qwen models
################################################################################

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║         QWEN PROGRAMMATIC ACCESS - QUICK START DEMO                  ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
DEMO_PROMPT="What is the capital of France? Answer in one short sentence."

################################################################################
# METHOD 1: Local Ollama (Free, Private, Offline)
################################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "METHOD 1: Local Ollama Inference"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Description: Run Qwen2.5:7b locally using Ollama"
echo "Pros: Free, private, no API keys, works offline"
echo "Cons: Requires 4.7GB download, slower than cloud API"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not installed"
    echo ""
    echo "To install Ollama:"
    echo "  Windows/Mac: Download from https://ollama.com"
    echo "  Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
else
    echo "✓ Ollama installed"

    # Check if model is available
    if ollama list | grep -q "qwen2.5:7b"; then
        echo "✓ Qwen2.5:7b model available"
        echo ""
        echo "Running query: \"$DEMO_PROMPT\""
        echo ""
        echo "Response:"
        echo "────────────────────────────────────────────────────────────────────"

        # Use API for speed
        curl -s -X POST http://localhost:11434/api/generate \
            -H "Content-Type: application/json" \
            -d "{
                \"model\": \"qwen2.5:7b\",
                \"prompt\": \"$DEMO_PROMPT\",
                \"stream\": false
            }" | grep -o '"response":"[^"]*"' | sed 's/"response":"\(.*\)"/\1/' | sed 's/\\n/\n/g'

        echo ""
        echo "────────────────────────────────────────────────────────────────────"
        echo "✅ Method 1: SUCCESS"
    else
        echo "⚠ Model not found. Download with:"
        echo "  ollama pull qwen2.5:7b"
    fi
fi

echo ""
echo ""

################################################################################
# METHOD 2: Alibaba Cloud DashScope API (Cloud, Powerful)
################################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "METHOD 2: DashScope Cloud API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Description: Access Qwen models via Alibaba Cloud API (OpenAI-compatible)"
echo "Pros: Latest models, fast, scalable, no local resources"
echo "Cons: Requires API key, costs money, needs internet"
echo ""

if [ -z "$DASHSCOPE_API_KEY" ]; then
    echo "⚠ DASHSCOPE_API_KEY not set"
    echo ""
    echo "To get an API key:"
    echo "  1. Visit https://qwen.ai/apiplatform"
    echo "  2. Register/login with Alibaba Cloud account"
    echo "  3. Create API key in console"
    echo "  4. Export: export DASHSCOPE_API_KEY='your-key'"
    echo ""
    echo "⏭  Skipping Method 2"
else
    echo "✓ API key found"
    echo ""

    # Check if Python OpenAI library is available
    if python3 -c "import openai" 2>/dev/null; then
        echo "✓ OpenAI Python library installed"
        echo ""
        echo "Running query: \"$DEMO_PROMPT\""
        echo ""
        echo "Response:"
        echo "────────────────────────────────────────────────────────────────────"

        python3 -c "
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv('DASHSCOPE_API_KEY'),
    base_url='https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
)

response = client.chat.completions.create(
    model='qwen-turbo-latest',
    messages=[{'role': 'user', 'content': '$DEMO_PROMPT'}],
    max_tokens=100
)

print(response.choices[0].message.content)
"

        echo ""
        echo "────────────────────────────────────────────────────────────────────"
        echo "✅ Method 2: SUCCESS"
    else
        echo "⚠ OpenAI library not installed. Install with:"
        echo "  pip install openai"
        echo ""
        echo "⏭  Skipping Method 2"
    fi
fi

echo ""
echo ""

################################################################################
# METHOD 3: Qwen Electron App Automation (Desktop Control)
################################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "METHOD 3: Electron App Automation via CDP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Description: Control Qwen desktop app via Chrome DevTools Protocol"
echo "Pros: Access to MCP tools, full GUI control, screenshots"
echo "Cons: Requires Qwen app running with debug flag, complex setup"
echo ""

QWEN_EXE="C:\\Program Files\\Qwen\\Qwen.exe"

if [ ! -f "$QWEN_EXE" ]; then
    echo "⚠ Qwen desktop app not found at: $QWEN_EXE"
    echo ""
    echo "Download from: https://qwen.ai"
    echo ""
    echo "⏭  Skipping Method 3"
else
    echo "✓ Qwen desktop app installed"

    # Check if Node.js and dependencies are available
    if ! command -v node &> /dev/null; then
        echo "⚠ Node.js not installed"
        echo ""
        echo "⏭  Skipping Method 3"
    elif [ ! -f "qwen-electron-automation.js" ]; then
        echo "⚠ Automation script not found: qwen-electron-automation.js"
        echo ""
        echo "⏭  Skipping Method 3"
    else
        echo "✓ Node.js available"
        echo ""
        echo "Note: This method requires:"
        echo "  1. Close current Qwen instance"
        echo "  2. Relaunch with: \"$QWEN_EXE\" --remote-debugging-port=9222"
        echo "  3. Run: node qwen-electron-automation.js demo"
        echo ""
        echo "Example output:"
        echo "────────────────────────────────────────────────────────────────────"
        echo "  Connecting to Qwen on port 9222..."
        echo "  ✓ Connected to Qwen via CDP"
        echo "  App Version: 1.0.3"
        echo "  MCP Servers: ['fetch', 'sequential-thinking']"
        echo "  ✓ Screenshot saved: qwen-demo.png"
        echo "────────────────────────────────────────────────────────────────────"
        echo ""
        echo "⏭  Method 3 requires manual setup (see above)"
    fi
fi

echo ""
echo ""

################################################################################
# Summary
################################################################################
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                            SUMMARY                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Three ways to use Qwen programmatically:"
echo ""
echo "1. 🏠 LOCAL (Ollama)"
echo "   ✓ Free, private, offline"
echo "   ✗ Requires 4.7GB download"
echo "   📝 ollama pull qwen2.5:7b && ollama run qwen2.5:7b"
echo ""
echo "2. ☁️  CLOUD (DashScope API)"
echo "   ✓ Latest models, fast, scalable"
echo "   ✗ Requires API key and costs money"
echo "   📝 python qwen-api-client.py"
echo ""
echo "3. 🖥️  DESKTOP (Electron Automation)"
echo "   ✓ Full GUI control, MCP tools access"
echo "   ✗ Complex setup, requires debug mode"
echo "   📝 node qwen-electron-automation.js demo"
echo ""
echo "For more details, see:"
echo "  • QWEN-PROGRAMMATIC-ACCESS-SOLUTIONS.md"
echo "  • QWEN-INTEGRATION-GUIDE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Demo complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
