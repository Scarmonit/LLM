#!/bin/bash

# Unified Intelligent MCP - Deployment Script

set -e

echo "🚀 Deploying Unified Intelligent MCP Server"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd "$PROJECT_DIR"
npm install

echo -e "${BLUE}🔨 Building TypeScript...${NC}"
npm run build

echo -e "${BLUE}⚙️  Configuring Claude Code integration...${NC}"

# Detect Claude Code settings location
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash/MSYS)
    CLAUDE_SETTINGS="$HOME/.claude/settings.json"
else
    # Linux/Mac
    CLAUDE_SETTINGS="$HOME/.claude/settings.json"
fi

# Create .claude directory if it doesn't exist
mkdir -p "$(dirname "$CLAUDE_SETTINGS")"

# Check if settings.json exists
if [ ! -f "$CLAUDE_SETTINGS" ]; then
    echo -e "${YELLOW}⚠️  Creating new settings.json${NC}"
    echo '{"mcpServers":{}}' > "$CLAUDE_SETTINGS"
fi

# Backup existing settings
cp "$CLAUDE_SETTINGS" "${CLAUDE_SETTINGS}.backup-$(date +%Y%m%d-%H%M%S)"

# Add or update MCP server configuration
echo -e "${BLUE}📝 Updating MCP server configuration...${NC}"

# Use Node.js to update JSON (cross-platform)
node -e "
const fs = require('fs');
const path = require('path');

const settingsPath = '$CLAUDE_SETTINGS';
const projectDir = '$PROJECT_DIR';

let settings = {};
try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
    console.log('Creating new settings file');
}

if (!settings.mcpServers) {
    settings.mcpServers = {};
}

settings.mcpServers['unified-intelligent'] = {
    command: 'node',
    args: [path.join(projectDir, 'dist', 'index.js')],
    env: {
        DEBUG: '0'
    }
};

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
console.log('✅ Configuration updated');
"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code if it's running"
echo "2. Run 'npm run verify' to test the installation"
echo "3. Check available tools with: mcp_health_check"
echo ""
echo "Configuration location: $CLAUDE_SETTINGS"
