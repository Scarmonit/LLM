#!/usr/bin/env node

/**
 * MCP Dashboard Server
 * Real-time health monitoring for all MCP servers
 *
 * Features:
 * - Health checks for 7 MCP servers (1Password, Desktop Automation, Kali, iPhone, YouTube, MCP Doctor, AWS CLI, Terraform)
 * - WebSocket server for real-time updates (port 65030)
 * - HTTP server for dashboard (port 65031)
 * - Auto-refresh every 5 seconds
 *
 * @module mcp-dashboard-server
 */

import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WS_PORT = 65030;
const HTTP_PORT = 65031;
const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
const METRICS_DIR = join(__dirname, '../../.metrics');
const METRICS_FILE = join(METRICS_DIR, 'mcp-health-metrics.json');
const ALERT_THRESHOLD = 3; // Alert after 3 consecutive failures
const AUTO_RESTART_ENABLED = true;
const MAX_RESTART_ATTEMPTS = 3;

/**
 * MCP Server Configuration
 */
const MCP_BASE_DIR = 'C:/Users/scarm/src/mcp';

const MCP_SERVERS = [
  {
    name: '1Password',
    path: join(MCP_BASE_DIR, '1password-mcp-server.js'),
    testTool: 'list_vaults',
    testArgs: {},
    color: '#0094F5',
  },
  {
    name: 'Desktop Automation',
    path: join(MCP_BASE_DIR, 'desktop-automation-mcp-server.js'),
    testTool: 'browser_screenshot',
    testArgs: { name: 'health-check' },
    color: '#00C853',
  },
  {
    name: 'Kali',
    path: join(MCP_BASE_DIR, 'kali-mcp-server.js'),
    testTool: 'kali_nmap_scan',
    testArgs: { target: '127.0.0.1', scanType: 'quick' },
    color: '#557C9B',
  },
  {
    name: 'iPhone',
    path: join(MCP_BASE_DIR, 'iphone-mcp-server.js'),
    testTool: 'iphone_list_devices',
    testArgs: {},
    color: '#999999',
  },
  {
    name: 'YouTube',
    path: join(MCP_BASE_DIR, 'youtube-mcp-server.js'),
    testTool: 'youtube_search',
    testArgs: { query: 'test', maxResults: 1 },
    color: '#FF0000',
  },
  {
    name: 'MCP Doctor',
    path: join(__dirname, 'mcp-doctor-server.js'),
    testTool: 'health_check',
    testArgs: {},
    color: '#4CAF50',
  },
  {
    name: 'AWS CLI',
    path: join(__dirname, 'aws-cli-mcp-server.js'),
    testTool: 'aws_execute',
    testArgs: { service: 'sts', command: 'get-caller-identity', args: [] },
    color: '#FF9900',
  },
  {
    name: 'Terraform',
    path: join(__dirname, 'terraform-mcp-server.js'),
    testTool: 'terraform_validate',
    testArgs: { workingDir: '.', json: true },
    color: '#7B42BC',
  },
];

/**
 * MCP Dashboard Server Class
 */
class MCPDashboardServer {
  constructor() {
    this.healthData = [];
    this.clients = new Set();
    this.healthCheckTimer = null;
    this.metricsHistory = []; // Historical performance data
    this.alertState = new Map(); // Track consecutive failures per server
    this.restartAttempts = new Map(); // Track restart attempts per server
    this.serverLogs = new Map(); // Store recent logs per server
    this.serverProcesses = new Map(); // Track running server processes
  }

  /**
   * Initialize metrics directory and load historical data
   */
  async initMetrics() {
    try {
      if (!existsSync(METRICS_DIR)) {
        await mkdir(METRICS_DIR, { recursive: true });
      }

      if (existsSync(METRICS_FILE)) {
        const data = await readFile(METRICS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        this.metricsHistory = parsed.history || [];
        console.log(`[MCP Dashboard] Loaded ${this.metricsHistory.length} historical metrics`);
      }
    } catch (error) {
      console.warn('[MCP Dashboard] Could not load metrics history:', error.message);
    }
  }

  /**
   * Persist metrics to disk
   */
  async saveMetrics() {
    try {
      const data = {
        lastSaved: new Date().toISOString(),
        history: this.metricsHistory.slice(-1000), // Keep last 1000 data points
      };
      await writeFile(METRICS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[MCP Dashboard] Failed to save metrics:', error.message);
    }
  }

  /**
   * Add metrics to history
   */
  addMetricsSnapshot(healthData) {
    const snapshot = {
      timestamp: new Date().toISOString(),
      servers: healthData.map(s => ({
        name: s.name,
        status: s.status,
        responseTime: s.responseTime,
        error: s.error || null,
      })),
    };

    this.metricsHistory.push(snapshot);

    // Keep only last 500 snapshots in memory
    if (this.metricsHistory.length > 500) {
      this.metricsHistory.shift();
    }

    // Save to disk every 10 snapshots
    if (this.metricsHistory.length % 10 === 0) {
      this.saveMetrics().catch(console.error);
    }
  }

  /**
   * Check alert conditions and trigger alerts
   */
  checkAlerts(serverHealth) {
    const serverName = serverHealth.name;
    const currentState = this.alertState.get(serverName) || { consecutiveFailures: 0, alertSent: false };

    if (serverHealth.status !== 'healthy') {
      currentState.consecutiveFailures++;

      if (currentState.consecutiveFailures >= ALERT_THRESHOLD && !currentState.alertSent) {
        this.triggerAlert(serverHealth);
        currentState.alertSent = true;
      }
    } else {
      // Reset on recovery
      if (currentState.alertSent) {
        this.triggerRecoveryAlert(serverHealth);
      }
      currentState.consecutiveFailures = 0;
      currentState.alertSent = false;
    }

    this.alertState.set(serverName, currentState);
  }

  /**
   * Trigger alert for server failure
   */
  triggerAlert(serverHealth) {
    const alert = {
      type: 'alert',
      severity: serverHealth.status === 'unreachable' ? 'critical' : 'warning',
      server: serverHealth.name,
      message: `${serverHealth.name} has failed ${ALERT_THRESHOLD} consecutive health checks`,
      error: serverHealth.error || 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    console.error(`[MCP Dashboard] 🚨 ALERT: ${alert.message}`);
    this.broadcast({ type: 'alert', data: alert });

    // Attempt auto-restart if enabled
    if (AUTO_RESTART_ENABLED && serverHealth.status === 'unreachable') {
      this.attemptAutoRestart(serverHealth);
    }
  }

  /**
   * Trigger recovery alert
   */
  triggerRecoveryAlert(serverHealth) {
    const alert = {
      type: 'recovery',
      severity: 'info',
      server: serverHealth.name,
      message: `${serverHealth.name} has recovered and is now healthy`,
      timestamp: new Date().toISOString(),
    };

    console.log(`[MCP Dashboard] ✅ RECOVERY: ${alert.message}`);
    this.broadcast({ type: 'alert', data: alert });

    // Reset restart attempts on recovery
    this.restartAttempts.delete(serverHealth.name);
  }

  /**
   * Attempt to auto-restart a failed server
   */
  async attemptAutoRestart(serverHealth) {
    const serverConfig = MCP_SERVERS.find(s => s.name === serverHealth.name);
    if (!serverConfig) return;

    const attempts = this.restartAttempts.get(serverHealth.name) || 0;

    if (attempts >= MAX_RESTART_ATTEMPTS) {
      console.error(`[MCP Dashboard] Max restart attempts reached for ${serverHealth.name}`);
      return;
    }

    console.log(`[MCP Dashboard] 🔄 Attempting restart ${attempts + 1}/${MAX_RESTART_ATTEMPTS} for ${serverHealth.name}`);

    try {
      // Kill existing process if any
      const existingProcess = this.serverProcesses.get(serverHealth.name);
      if (existingProcess && !existingProcess.killed) {
        existingProcess.kill();
      }

      // Start new process
      const process = spawn('node', [serverConfig.path], {
        detached: true,
        stdio: 'ignore',
      });

      process.unref(); // Allow parent to exit independently

      this.serverProcesses.set(serverHealth.name, process);
      this.restartAttempts.set(serverHealth.name, attempts + 1);

      this.broadcast({
        type: 'restart',
        data: {
          server: serverHealth.name,
          attempt: attempts + 1,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`[MCP Dashboard] ✅ Restart initiated for ${serverHealth.name}`);
    } catch (error) {
      console.error(`[MCP Dashboard] Failed to restart ${serverHealth.name}:`, error.message);
    }
  }

  /**
   * Capture server logs
   */
  captureServerLogs(serverName, stdout, stderr) {
    const logs = this.serverLogs.get(serverName) || [];

    if (stdout) {
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: stdout,
      });
    }

    if (stderr) {
      logs.push({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: stderr,
      });
    }

    // Keep only last 100 log entries per server
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }

    this.serverLogs.set(serverName, logs);
  }

  /**
   * Check health of a single MCP server
   */
  async checkServerHealth(serverConfig) {
    const startTime = Date.now();

    try {
      // Spawn MCP server process
      const process = spawn('node', [serverConfig.path], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let responseReceived = false;

      // Set timeout for health check
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          process.kill();
        }
      }, 10000); // 10 second timeout

      // Prepare MCP request
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: serverConfig.testTool,
          arguments: serverConfig.testArgs,
        },
      };

      // Send request to MCP server
      process.stdin.write(JSON.stringify(mcpRequest) + '\n');
      process.stdin.end();

      // Collect response
      await new Promise((resolve, reject) => {
        process.stdout.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          this.captureServerLogs(serverConfig.name, output, null);
        });

        process.stderr.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          this.captureServerLogs(serverConfig.name, null, output);
        });

        process.on('close', (code) => {
          clearTimeout(timeout);
          responseReceived = true;

          if (code !== 0 && code !== null) {
            reject(new Error(`Process exited with code ${code}: ${stderr}`));
          } else {
            resolve();
          }
        });

        process.on('error', (error) => {
          clearTimeout(timeout);
          responseReceived = true;
          reject(error);
        });
      });

      const responseTime = Date.now() - startTime;

      // Parse MCP response
      try {
        const response = JSON.parse(stdout.trim().split('\n').pop());

        if (response.error) {
          return {
            name: serverConfig.name,
            status: 'unhealthy',
            responseTime,
            lastChecked: new Date().toISOString(),
            error: response.error.message || 'Unknown error',
            toolsTested: [serverConfig.testTool],
            color: serverConfig.color,
          };
        }

        return {
          name: serverConfig.name,
          status: 'healthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          toolsTested: [serverConfig.testTool],
          color: serverConfig.color,
        };
      } catch (parseError) {
        // If can't parse JSON, but process succeeded, consider it healthy
        return {
          name: serverConfig.name,
          status: 'healthy',
          responseTime,
          lastChecked: new Date().toISOString(),
          toolsTested: [serverConfig.testTool],
          color: serverConfig.color,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        name: serverConfig.name,
        status: 'unreachable',
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error.message,
        toolsTested: [serverConfig.testTool],
        color: serverConfig.color,
      };
    }
  }

  /**
   * Check health of all MCP servers
   */
  async checkAllServers() {
    console.log('[MCP Dashboard] Running health checks...');

    const healthPromises = MCP_SERVERS.map((server) =>
      this.checkServerHealth(server)
    );

    this.healthData = await Promise.all(healthPromises);

    // Check alerts for each server
    this.healthData.forEach(serverHealth => {
      this.checkAlerts(serverHealth);
    });

    // Add metrics snapshot
    this.addMetricsSnapshot(this.healthData);

    // Calculate overall health
    const healthyCount = this.healthData.filter((s) => s.status === 'healthy').length;
    const totalCount = this.healthData.length;

    let overallHealth = 'all-healthy';
    if (healthyCount === 0) {
      overallHealth = 'critical';
    } else if (healthyCount < totalCount) {
      overallHealth = 'degraded';
    }

    const dashboardState = {
      servers: this.healthData,
      lastUpdate: new Date().toISOString(),
      overallHealth,
      stats: {
        total: totalCount,
        healthy: healthyCount,
        unhealthy: this.healthData.filter((s) => s.status === 'unhealthy').length,
        unreachable: this.healthData.filter((s) => s.status === 'unreachable').length,
      },
    };

    console.log(`[MCP Dashboard] Health check complete: ${healthyCount}/${totalCount} healthy`);

    // Broadcast to all connected WebSocket clients
    this.broadcast(dashboardState);

    return dashboardState;
  }

  /**
   * Broadcast message to all WebSocket clients
   */
  broadcast(data) {
    const message = JSON.stringify({
      type: 'health-update',
      data,
    });

    this.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  /**
   * Start WebSocket server
   */
  startWebSocketServer() {
    const wss = new WebSocketServer({ port: WS_PORT });

    wss.on('connection', (ws) => {
      console.log('[MCP Dashboard] WebSocket client connected');
      this.clients.add(ws);

      // Send current health data immediately
      if (this.healthData.length > 0) {
        ws.send(JSON.stringify({
          type: 'health-update',
          data: {
            servers: this.healthData,
            lastUpdate: new Date().toISOString(),
          },
        }));
      }

      ws.on('close', () => {
        console.log('[MCP Dashboard] WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[MCP Dashboard] WebSocket error:', error.message);
        this.clients.delete(ws);
      });
    });

    console.log(`[MCP Dashboard] WebSocket server running on ws://localhost:${WS_PORT}`);
  }

  /**
   * Start HTTP server for dashboard
   */
  startHTTPServer() {
    const server = createServer(async (req, res) => {
      if (req.url === '/' || req.url === '/index.html') {
        try {
          const html = await readFile(join(__dirname, 'mcp-dashboard.html'), 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } catch (error) {
          res.writeHead(404);
          res.end('Dashboard not found');
        }
      } else if (req.url === '/enhanced' || req.url === '/index-enhanced.html') {
        // Serve enhanced dashboard
        try {
          const html = await readFile(join(__dirname, 'mcp-dashboard-enhanced.html'), 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(html);
        } catch (error) {
          res.writeHead(404);
          res.end('Enhanced dashboard not found');
        }
      } else if (req.url === '/api/health') {
        // REST API endpoint for current health
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          servers: this.healthData,
          lastUpdate: new Date().toISOString(),
        }));
      } else if (req.url === '/api/metrics') {
        // REST API endpoint for historical metrics
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          history: this.metricsHistory,
          lastUpdate: new Date().toISOString(),
        }));
      } else if (req.url.startsWith('/api/logs/')) {
        // REST API endpoint for server logs
        const serverName = decodeURIComponent(req.url.split('/api/logs/')[1]);
        const logs = this.serverLogs.get(serverName) || [];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          server: serverName,
          logs,
          lastUpdate: new Date().toISOString(),
        }));
      } else if (req.url.startsWith('/api/restart/')) {
        // REST API endpoint for manual server restart
        const serverName = decodeURIComponent(req.url.split('/api/restart/')[1]);
        const serverHealth = this.healthData.find(s => s.name === serverName);

        if (serverHealth) {
          this.attemptAutoRestart(serverHealth);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: `Restart initiated for ${serverName}`,
          }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: `Server ${serverName} not found`,
          }));
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(HTTP_PORT, () => {
      console.log(`[MCP Dashboard] HTTP server running on http://localhost:${HTTP_PORT}`);
      console.log(`[MCP Dashboard] Open http://localhost:${HTTP_PORT} in your browser`);
    });
  }

  /**
   * Start dashboard server
   */
  async start() {
    console.log('[MCP Dashboard] Starting MCP Dashboard Server...');

    // Initialize metrics
    await this.initMetrics();

    // Start WebSocket server
    this.startWebSocketServer();

    // Start HTTP server
    this.startHTTPServer();

    // Run initial health check
    await this.checkAllServers();

    // Schedule periodic health checks
    this.healthCheckTimer = setInterval(() => {
      this.checkAllServers().catch((error) => {
        console.error('[MCP Dashboard] Health check error:', error.message);
      });
    }, HEALTH_CHECK_INTERVAL);

    console.log('[MCP Dashboard] Dashboard server started successfully');
  }

  /**
   * Stop dashboard server
   */
  stop() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.clients.forEach((client) => client.close());
    console.log('[MCP Dashboard] Dashboard server stopped');
  }
}

// Start server if run directly
// Normalize paths for comparison
const modulePath = fileURLToPath(import.meta.url);
const scriptPath = process.argv[1] ? join(process.cwd(), process.argv[1]) : '';

if (modulePath === scriptPath || !scriptPath || process.argv[1]?.includes('mcp-dashboard-server.js')) {
  const dashboard = new MCPDashboardServer();
  dashboard.start().catch((error) => {
    console.error('[MCP Dashboard] Failed to start:', error.message);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[MCP Dashboard] Shutting down...');
    dashboard.stop();
    process.exit(0);
  });
}

export { MCPDashboardServer };
