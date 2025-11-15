#!/bin/bash
# Installation script for LLM Framework systemd service

set -e

echo "Installing LLM Multi-Provider Framework as systemd service..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Create service user
if ! id -u llm-agent &>/dev/null; then
    echo "Creating llm-agent user..."
    useradd -r -s /bin/false llm-agent
fi

# Create directories
echo "Creating directories..."
mkdir -p /opt/llm-framework
mkdir -p /etc/llm-framework

# Copy files
echo "Copying files..."
cp -r . /opt/llm-framework/
chown -R llm-agent:llm-agent /opt/llm-framework

# Install Python dependencies
echo "Installing Python dependencies..."
cd /opt/llm-framework
pip install -r requirements.txt

# Copy environment config template
if [ ! -f /etc/llm-framework/env.conf ]; then
    echo "Creating environment config..."
    cp deployment/systemd/env.conf.example /etc/llm-framework/env.conf
    chmod 600 /etc/llm-framework/env.conf
    echo "⚠️  IMPORTANT: Edit /etc/llm-framework/env.conf with your API keys and settings"
fi

# Install systemd service
echo "Installing systemd service..."
cp deployment/systemd/llm-agents.service /etc/systemd/system/
systemctl daemon-reload

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit /etc/llm-framework/env.conf with your configuration"
echo "2. Enable the service: sudo systemctl enable llm-agents"
echo "3. Start the service: sudo systemctl start llm-agents"
echo "4. Check status: sudo systemctl status llm-agents"
echo "5. View logs: sudo journalctl -u llm-agents -f"
