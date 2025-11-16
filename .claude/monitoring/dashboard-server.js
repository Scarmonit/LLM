#!/usr/bin/env node

/**
 * Real-time Infrastructure Monitoring Server
 * Provides live data feed for the unified dashboard
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

const PORT = 65035;
const REFRESH_INTERVAL = 5000; // 5 seconds

// Store for real-time data
let systemData = {
    lastUpdate: null,
    containers: [],
    metrics: {},
    logs: [],
    health: {
        healthy: 0,
        unhealthy: 0,
        starting: 0
    }
};

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

async function getDockerContainers() {
    try {
        const { stdout } = await execPromise('docker ps --format "{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}"');
        const lines = stdout.trim().split('\n');

        const containers = lines.map(line => {
            const [name, image, status, ports] = line.split('|');
            const isHealthy = status.includes('healthy') || (!status.includes('unhealthy') && !status.includes('starting'));
            const isUnhealthy = status.includes('unhealthy');
            const isStarting = status.includes('starting');

            return {
                name: name || 'unknown',
                image: image || 'unknown',
                status: status || 'unknown',
                ports: ports || 'none',
                health: isHealthy ? 'healthy' : (isUnhealthy ? 'unhealthy' : 'starting')
            };
        });

        // Calculate health metrics
        systemData.health.healthy = containers.filter(c => c.health === 'healthy').length;
        systemData.health.unhealthy = containers.filter(c => c.health === 'unhealthy').length;
        systemData.health.starting = containers.filter(c => c.health === 'starting').length;

        return containers;
    } catch (error) {
        log(`Error fetching containers: ${error.message}`, 'red');
        return [];
    }
}

async function getSystemMetrics() {
    try {
        const containers = systemData.containers;

        // Count specific types
        const monitoringContainers = containers.filter(c =>
            c.name.includes('portainer') || c.name.includes('dozzle') ||
            c.name.includes('watchtower') || c.name.includes('health-monitor')
        ).length;

        const mcpServers = containers.filter(c =>
            c.name.includes('mcp') || c.name.includes('playwright') ||
            c.name.includes('aws-') || c.name.includes('terraform')
        ).length;

        const databases = containers.filter(c =>
            c.name.includes('postgres') || c.name.includes('mysql') ||
            c.name.includes('mongo') || c.name.includes('redis')
        ).length;

        return {
            totalContainers: containers.length,
            running: containers.length,
            monitoring: monitoringContainers,
            mcpServers: mcpServers,
            databases: databases,
            healthy: systemData.health.healthy,
            unhealthy: systemData.health.unhealthy,
            starting: systemData.health.starting
        };
    } catch (error) {
        log(`Error calculating metrics: ${error.message}`, 'red');
        return {};
    }
}

function addLogEntry(message, level = 'info') {
    const entry = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message
    };

    systemData.logs.unshift(entry);

    // Keep only last 100 entries
    if (systemData.logs.length > 100) {
        systemData.logs = systemData.logs.slice(0, 100);
    }
}

async function updateSystemData() {
    try {
        systemData.containers = await getDockerContainers();
        systemData.metrics = await getSystemMetrics();
        systemData.lastUpdate = new Date().toISOString();

        log(`Updated: ${systemData.containers.length} containers, ${systemData.health.healthy} healthy, ${systemData.health.unhealthy} unhealthy`, 'green');
    } catch (error) {
        log(`Update error: ${error.message}`, 'red');
        addLogEntry(`System update failed: ${error.message}`, 'error');
    }
}

// HTTP Server
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);

    // API Routes
    if (url.pathname === '/api/data') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(systemData));
        return;
    }

    if (url.pathname === '/api/containers') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(systemData.containers));
        return;
    }

    if (url.pathname === '/api/metrics') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(systemData.metrics));
        return;
    }

    if (url.pathname === '/api/logs') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(systemData.logs));
        return;
    }

    if (url.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }));
        return;
    }

    // Serve dashboard HTML
    if (url.pathname === '/' || url.pathname === '/dashboard') {
        const dashboardPath = path.join(__dirname, 'unified-dashboard.html');
        if (fs.existsSync(dashboardPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fs.readFileSync(dashboardPath));
        } else {
            res.writeHead(404);
            res.end('Dashboard not found');
        }
        return;
    }

    // 404
    res.writeHead(404);
    res.end('Not found');
});

// Start server - bind to localhost only (no firewall prompt)
server.listen(PORT, 'localhost', () => {
    console.log(`
${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗
║     Infrastructure Monitoring Server v1.0                 ║
║     Real-time system monitoring and data feed             ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}✓ Server started on http://localhost:${PORT}${colors.reset}
${colors.green}✓ Dashboard: http://localhost:${PORT}/dashboard${colors.reset}
${colors.green}✓ API: http://localhost:${PORT}/api/data${colors.reset}

${colors.yellow}Monitoring endpoints:${colors.reset}
  • /api/data       - Complete system data
  • /api/containers - Container list
  • /api/metrics    - System metrics
  • /api/logs       - Activity logs
  • /api/health     - Server health

${colors.cyan}Refresh interval: ${REFRESH_INTERVAL / 1000}s${colors.reset}
    `);

    log('Initial data fetch...', 'cyan');

    // Initial update
    updateSystemData();
    addLogEntry('Monitoring server started');

    // Periodic updates
    setInterval(async () => {
        await updateSystemData();
    }, REFRESH_INTERVAL);
});

// Graceful shutdown
process.on('SIGINT', () => {
    log('\nShutting down server...', 'yellow');
    server.close(() => {
        log('Server stopped', 'green');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    log('\nReceived SIGTERM, shutting down...', 'yellow');
    server.close(() => {
        log('Server stopped', 'green');
        process.exit(0);
    });
});
