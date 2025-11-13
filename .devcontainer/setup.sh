#!/bin/bash
# Devcontainer post-create setup script

echo "🚀 Setting up development environment..."

# Install common Python packages if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install --user -r requirements.txt
fi

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Configure Git
git config --global init.defaultBranch main
git config --global pull.rebase false

echo "✓ Development environment ready!"
