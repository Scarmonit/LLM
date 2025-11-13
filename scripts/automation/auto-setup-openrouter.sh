#!/bin/bash

# Fully Guided OpenRouter Setup - Maximum Automation
# This script does everything except the OAuth login (requires human)

set -e

echo ""
echo "🤖 AUTOMATED OpenRouter Setup"
echo "=============================="
echo ""
echo "⚡ This will take exactly 60 seconds"
echo ""

# Check if we already have a key
if [ -n "$OPENROUTER_API_KEY" ]; then
    echo "✅ API key already exists!"
    echo "   Testing it now..."

    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $OPENROUTER_API_KEY" \
        https://openrouter.ai/api/v1/auth/key)

    if [ "$response" = "200" ]; then
        echo "✅ Key is valid! You're all set."
        exit 0
    else
        echo "⚠️  Existing key is invalid. Getting a new one..."
    fi
fi

echo "📱 STEP 1: Opening browser to OpenRouter..."
echo ""

# Open browser (works on Windows Git Bash)
start "https://openrouter.ai/keys" 2>/dev/null || \
    cmd.exe /c start "https://openrouter.ai/keys" 2>/dev/null || \
    powershell.exe -Command "Start-Process 'https://openrouter.ai/keys'" 2>/dev/null

echo "✓ Browser opened to: https://openrouter.ai/keys"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 IN THE BROWSER (30 seconds):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Click 'Sign In' (top right)"
echo "   → Choose GitHub (fastest) or Google or Email"
echo ""
echo "2. After login, click 'Create Key'"
echo "   → Name: 'Claude Code'"
echo "   → Click 'Create'"
echo ""
echo "3. COPY the key (starts with sk-or-v1-...)"
echo "   → Use Ctrl+C to copy"
echo ""
echo "4. Come back here and PASTE below"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Countdown timer
echo -n "⏱  Starting in: "
for i in 5 4 3 2 1; do
    echo -n "$i..."
    sleep 1
done
echo "NOW!"
echo ""

# Prompt for key with timeout
echo -n "🔑 Paste your API key here: "
read -r api_key

# Validate input
if [ -z "$api_key" ]; then
    echo ""
    echo "❌ No key provided"
    echo "   Run this script again when ready"
    exit 1
fi

# Remove whitespace
api_key=$(echo "$api_key" | xargs)

# Validate format
if [[ ! "$api_key" =~ ^sk-or-v1- ]]; then
    echo ""
    echo "⚠️  WARNING: Key format looks wrong"
    echo "   Expected: sk-or-v1-..."
    echo "   Got: ${api_key:0:15}..."
    echo ""
    echo -n "Continue anyway? (y/n): "
    read -r confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🧪 Testing API key..."

# Test the key
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $api_key" \
    https://openrouter.ai/api/v1/auth/key)

http_code=$(echo "$response" | tail -n1)

if [ "$http_code" != "200" ]; then
    echo "❌ API key validation failed (HTTP $http_code)"
    echo "   Please check your key and try again"
    exit 1
fi

echo "✅ API key is VALID!"
echo ""
echo "💾 Saving permanently..."

# Save to file
echo "$api_key" > ~/.openrouter-key.txt
chmod 600 ~/.openrouter-key.txt
echo "✅ Saved to ~/.openrouter-key.txt"

# Save to bash profile
if ! grep -q "OPENROUTER_API_KEY" ~/.bash_profile 2>/dev/null; then
    echo "" >> ~/.bash_profile
    echo "# OpenRouter API Key" >> ~/.bash_profile
    echo "export OPENROUTER_API_KEY=\"$api_key\"" >> ~/.bash_profile
    echo "✅ Added to ~/.bash_profile"
else
    # Update existing line
    sed -i "s|export OPENROUTER_API_KEY=.*|export OPENROUTER_API_KEY=\"$api_key\"|" ~/.bash_profile
    echo "✅ Updated in ~/.bash_profile"
fi

# Set for current session
export OPENROUTER_API_KEY="$api_key"
echo "✅ Set for current session"

# Save to Windows User Environment (if on Windows)
if command -v powershell.exe &> /dev/null; then
    powershell.exe -Command "[System.Environment]::SetEnvironmentVariable('OPENROUTER_API_KEY', '$api_key', 'User')" 2>/dev/null
    echo "✅ Saved to Windows User Environment"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 SUCCESS! OpenRouter is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ What was set up:"
echo "   • API key validated and working"
echo "   • Saved to ~/.openrouter-key.txt"
echo "   • Added to ~/.bash_profile"
echo "   • Set in current session"
echo "   • Windows User Environment updated"
echo ""
echo "🚀 Next steps:"
echo ""
echo "   1. Test the integration:"
echo "      ./test-integrated-solution.sh"
echo ""
echo "   2. Run the demo:"
echo "      node unified-ai-client.js"
echo ""
echo "   3. Try Kimi K2:"
echo "      node kimi-k2-quickstart.js"
echo ""
echo "📊 Free tier: 100 requests/day"
echo "📚 Docs: https://openrouter.ai/docs"
echo ""
