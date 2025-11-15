#!/bin/bash
# Quick start script for LLM agents with Docker

set -e

echo "🚀 LLM Multi-Provider Framework - Quick Start"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys before continuing!"
    echo ""
    echo "Required variables:"
    echo "  - ANTHROPIC_API_KEY (for Claude)"
    echo "  - GITHUB_TOKEN (optional, for GitHub integration)"
    echo ""
    read -p "Press Enter after you've configured .env file..."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Start the services
echo "Starting LLM agents with Docker Compose..."
docker-compose up -d

echo ""
echo "✅ Agents are now running!"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose logs -f llm-agents"
echo "  Check status: docker-compose ps"
echo "  Stop agents:  docker-compose down"
echo "  Restart:      docker-compose restart"
echo ""
echo "The agents will automatically restart if they crash."
echo "They will also start automatically when your system boots."
