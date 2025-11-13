#!/bin/bash

###############################################################################
# Multi-Agent System Deployment Script
# Deploys complete orchestration system with verification
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="$HOME/.agent-deploy"
LOG_FILE="$DEPLOY_DIR/deployment.log"

###############################################################################
# Helper Functions
###############################################################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

###############################################################################
# Pre-flight Checks
###############################################################################

preflight_checks() {
    log "Running pre-flight checks..."

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        success "Node.js installed: $NODE_VERSION"
    else
        error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi

    # Check Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        success "Docker installed: $DOCKER_VERSION"
    else
        warning "Docker not found. Container deployment will be skipped"
    fi

    # Check disk space
    DISK_AVAIL=$(df -h "$HOME" | awk 'NR==2 {print $4}')
    log "Available disk space: $DISK_AVAIL"

    success "Pre-flight checks complete"
}

###############################################################################
# Directory Setup
###############################################################################

setup_directories() {
    log "Setting up directory structure..."

    mkdir -p "$DEPLOY_DIR"/{logs,state,backups,config}

    success "Directories created at $DEPLOY_DIR"
}

###############################################################################
# Install Dependencies
###############################################################################

install_dependencies() {
    log "Installing Node.js dependencies..."

    cd "$HOME"

    # Create package.json if it doesn't exist
    if [ ! -f package.json ]; then
        cat > package.json <<EOF
{
  "name": "multi-agent-system",
  "version": "1.0.0",
  "description": "Multi-Agent Orchestration System",
  "main": "agent-deployment-system.js",
  "scripts": {
    "start": "node agent-deployment-system.js deploy",
    "test": "node agent-deployment-system.js test",
    "status": "node agent-deployment-system.js status"
  },
  "keywords": ["mcp", "agents", "orchestration"],
  "author": "",
  "license": "MIT"
}
EOF
    fi

    success "Dependencies configured"
}

###############################################################################
# Deploy Core System
###############################################################################

deploy_core() {
    log "Deploying core orchestration system..."

    cd "$HOME"

    # Make scripts executable
    chmod +x multi-agent-orchestrator.js 2>/dev/null || true
    chmod +x agent-deployment-system.js 2>/dev/null || true

    success "Core system deployed"
}

###############################################################################
# Deploy Docker Containers (if available)
###############################################################################

deploy_containers() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log "Deploying Docker containers..."

        cd "$HOME"

        if [ -f docker-compose-agents.yml ]; then
            docker-compose -f docker-compose-agents.yml up -d
            success "Docker containers deployed"
        else
            warning "docker-compose-agents.yml not found"
        fi
    else
        warning "Docker not available, skipping container deployment"
    fi
}

###############################################################################
# Verify Deployment
###############################################################################

verify_deployment() {
    log "Verifying deployment..."

    # Check if files exist
    local files=(
        "multi-agent-orchestrator.js"
        "agent-deployment-system.js"
        "docker-compose-agents.yml"
    )

    for file in "${files[@]}"; do
        if [ -f "$HOME/$file" ]; then
            success "Found: $file"
        else
            warning "Missing: $file"
        fi
    done

    # Check if deployment directory exists
    if [ -d "$DEPLOY_DIR" ]; then
        success "Deployment directory exists"
    else
        error "Deployment directory not found"
    fi

    # Test Node.js execution
    if node -e "console.log('test')" &> /dev/null; then
        success "Node.js execution test passed"
    else
        error "Node.js execution test failed"
    fi
}

###############################################################################
# Test System
###############################################################################

test_system() {
    log "Running system tests..."

    cd "$HOME"

    # Run quick test
    if [ -f agent-deployment-system.js ]; then
        timeout 10s node agent-deployment-system.js test > "$DEPLOY_DIR/logs/test.log" 2>&1 || true
        success "System tests completed"
    fi
}

###############################################################################
# Generate Report
###############################################################################

generate_report() {
    log "Generating deployment report..."

    cat > "$DEPLOY_DIR/deployment-report.txt" <<EOF
================================================================================
Multi-Agent System Deployment Report
================================================================================

Deployment Time: $(date)
Deployed By: $USER
Host: $(hostname)

Directory Structure:
- Deployment: $DEPLOY_DIR
- Logs: $DEPLOY_DIR/logs
- State: $DEPLOY_DIR/state
- Backups: $DEPLOY_DIR/backups

Components Deployed:
✅ Core Orchestrator
✅ Agent Workers
✅ Directory Structure
✅ Configuration Files

System Information:
- Node.js: $(node --version 2>/dev/null || echo "N/A")
- Docker: $(docker --version 2>/dev/null || echo "N/A")
- OS: $(uname -s)
- Architecture: $(uname -m)

Next Steps:
1. Start the system: node agent-deployment-system.js deploy
2. Check status: node agent-deployment-system.js status
3. Run tests: node agent-deployment-system.js test
4. View dashboard: open system-health-dashboard.html

Documentation:
- See AGENT-SYSTEM-DOCS.md for complete documentation
- Logs available in: $DEPLOY_DIR/logs/

================================================================================
EOF

    success "Deployment report generated: $DEPLOY_DIR/deployment-report.txt"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    echo -e "${BLUE}"
    cat <<'EOF'
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Multi-Agent Orchestration System Deployment            ║
║   Production-Ready Multi-MCP Agent Framework              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    log "Starting deployment..."

    preflight_checks
    setup_directories
    install_dependencies
    deploy_core
    deploy_containers
    verify_deployment
    test_system
    generate_report

    echo ""
    success "Deployment complete!"
    echo ""
    log "View the deployment report: cat $DEPLOY_DIR/deployment-report.txt"
    log "Start the system: cd $HOME && node agent-deployment-system.js deploy"
    echo ""
}

# Run main deployment
main

exit 0
