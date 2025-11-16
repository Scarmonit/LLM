#!/bin/bash

# Unified Intelligent MCP - Verification Script

set -e

echo "🔍 Verifying Unified Intelligent MCP Installation"
echo "================================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

PASS_COUNT=0
FAIL_COUNT=0

check() {
    local name=$1
    local command=$2

    echo -ne "${BLUE}Checking $name...${NC} "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo ""
echo "System Checks:"
echo "-------------"

check "Node.js installed" "node --version"
check "npm installed" "npm --version"
check "TypeScript installed" "npx tsc --version"

echo ""
echo "Project Checks:"
echo "--------------"

cd "$PROJECT_DIR"

check "package.json exists" "test -f package.json"
check "Dependencies installed" "test -d node_modules"
check "Build output exists" "test -f dist/index.js"
check "State directory writable" "mkdir -p ~/.unified-intelligent-mcp && touch ~/.unified-intelligent-mcp/test && rm ~/.unified-intelligent-mcp/test"

echo ""
echo "Configuration Checks:"
echo "-------------------"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    CLAUDE_SETTINGS="$HOME/.claude/settings.json"
else
    CLAUDE_SETTINGS="$HOME/.claude/settings.json"
fi

check "Claude settings exists" "test -f $CLAUDE_SETTINGS"

if [ -f "$CLAUDE_SETTINGS" ]; then
    if grep -q "unified-intelligent" "$CLAUDE_SETTINGS"; then
        echo -e "${BLUE}Checking MCP configuration...${NC} ${GREEN}✓${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${BLUE}Checking MCP configuration...${NC} ${YELLOW}⚠${NC} (not configured)"
        echo "  Run 'npm run deploy' to configure"
    fi
fi

echo ""
echo "Functional Tests:"
echo "----------------"

# Test if server can start
echo -ne "${BLUE}Testing server startup...${NC} "
timeout 5 node dist/index.js < /dev/null > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    ((PASS_COUNT++))
    kill $SERVER_PID 2>/dev/null || true
else
    echo -e "${RED}✗${NC}"
    ((FAIL_COUNT++))
fi

echo ""
echo "Summary:"
echo "-------"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo ""
    echo "Your Unified Intelligent MCP server is ready to use."
    echo "Restart Claude Code to load the new MCP server."
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed${NC}"
    echo ""
    echo "Please address the issues above and run verify again."
    exit 1
fi
