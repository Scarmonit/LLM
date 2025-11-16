#!/bin/bash
# Production Deployment Script for MCP Servers v3.0

set -e

echo "======================================================================"
echo "MCP SERVERS - PRODUCTION DEPLOYMENT"
echo "======================================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_warn "docker-compose not found, using 'docker compose' instead"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

log_info "Prerequisites OK"
echo ""

# Stop existing containers
log_info "Stopping existing containers..."
$COMPOSE_CMD -f docker-compose.production-final.yml down || true
echo ""

# Build images
log_info "Building production images..."
$COMPOSE_CMD -f docker-compose.production-final.yml build --no-cache
echo ""

# Start services
log_info "Starting production services..."
$COMPOSE_CMD -f docker-compose.production-final.yml up -d
echo ""

# Wait for services
log_info "Waiting for services to start..."
sleep 10
echo ""

# Check status
log_info "Checking service status..."
$COMPOSE_CMD -f docker-compose.production-final.yml ps
echo ""

# Health checks
log_info "Running health checks..."
echo ""

# Check omnipotent
if docker ps | grep -q "omnipotent-mcp-prod-v3"; then
    log_info "✓ Omnipotent MCP Server is running"
else
    log_error "✗ Omnipotent MCP Server failed to start"
fi

# Check a2a
if docker ps | grep -q "a2a-unified-mcp-prod-v3"; then
    log_info "✓ A2A Unified MCP Server is running"
else
    log_error "✗ A2A Unified MCP Server failed to start"
fi

# Check prometheus
if docker ps | grep -q "mcp-prometheus"; then
    log_info "✓ Prometheus is running"
else
    log_warn "⊘ Prometheus not running"
fi

# Check grafana
if docker ps | grep -q "mcp-grafana"; then
    log_info "✓ Grafana is running"
else
    log_warn "⊘ Grafana not running"
fi

echo ""
log_info "Deployment complete!"
echo ""

echo "======================================================================"
echo "SERVICES"
echo "======================================================================"
echo "Omnipotent MCP: docker logs omnipotent-mcp-prod-v3"
echo "A2A Unified MCP: docker logs a2a-unified-mcp-prod-v3"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin)"
echo ""

echo "======================================================================"
echo "NEXT STEPS"
echo "======================================================================"
echo "1. Run tests: python test_production_servers.py"
echo "2. Monitor logs: docker-compose -f docker-compose.production-final.yml logs -f"
echo "3. Check metrics: curl http://localhost:9090/metrics"
echo ""
