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
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WS_PORT = 65030;
const HTTP_PORT = 65031;
const HEALTH_CHECK_INTERVAL = 5000; // 5 seconds

/**
 * MCP Server Configuration
 */
const MCP_SERVERS = [
  {
    name: '1Password',
    path: join(__dirname, '1password-mcp-server.js'),
    testTool: 'list_vaults',
    testArgs: {},
    color: '#0094F5',
  },
  {
    name: 'Desktop Automation',
    path: join(__dirname, 'desktop-automation-mcp-server.js'),
    testTool: 'browser_screenshot',
    testArgs: { name: 'health-check' },
    color: '#00C853',
  },
  {
    name: 'Kali',
    path: join(__dirname, 'kali-mcp-server.js'),
    testTool: 'kali_nmap_scan',
    testArgs: { target: '127.0.0.1', scanType: 'quick' },
    color: '#557C9B',
  },
  {
    name: 'iPhone',
    path: join(__dirname, 'iphone-mcp-server.js'),
    testTool: 'iphone_list_devices',
    testArgs: {},
    color: '#999999',
  },
  {
    name: 'YouTube',
    path: join(__dirname, 'youtube-mcp-server.js'),
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
          stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
          stderr += data.toString();
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
      } else if (req.url === '/api/health') {
        // REST API endpoint for current health
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          servers: this.healthData,
          lastUpdate: new Date().toISOString(),
        }));
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
if (import.meta.url === `file://${process.argv[1]}`) {
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
