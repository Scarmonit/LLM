#!/usr/bin/env node

/**
 * MCP Proxy Authentication Integration
 *
 * Bridges MCP Inspector (localhost:6274) with custom MCP Dashboard Server (localhost:65031)
 * Features:
 * - Proxy authentication token validation
 * - Bidirectional data sync between Inspector and Dashboard
 * - Resource mapping and translation
 * - Real-time updates via WebSocket
 *
 * @module mcp/mcp-proxy-auth-integration
 */

import { createServer } from 'http';
import { WebSocket } from 'ws';
import { readFile } from 'fs/promises';

const INSPECTOR_URL = 'http://localhost:6274';
const DASHBOARD_WS_URL = 'ws://localhost:65030';
const DASHBOARD_API_URL = 'http://localhost:65031';
const PROXY_AUTH_TOKEN = '8da7833da35869ec27ce9eb13a1b4926d98a6802303e60cfb6185780ba6eb74c';
const INTEGRATION_PORT = 65032;

/**
 * MCP Proxy Integration Class
 */
class MCPProxyIntegration {
  constructor() {
    this.dashboardWs = null;
    this.resourceMap = new Map();
    this.connected = false;
  }

  /**
   * Connect to MCP Dashboard WebSocket
   */
  async connectToDashboard() {
    return new Promise((resolve, reject) => {
      console.log('[MCP Proxy] Connecting to dashboard WebSocket...');

      this.dashboardWs = new WebSocket(DASHBOARD_WS_URL);

      this.dashboardWs.on('open', () => {
        console.log('[MCP Proxy] Connected to dashboard WebSocket');
        this.connected = true;
        resolve();
      });

      this.dashboardWs.on('message', (data) => {
        this.handleDashboardMessage(data);
      });

      this.dashboardWs.on('error', (error) => {
        console.error('[MCP Proxy] WebSocket error:', error.message);
        this.connected = false;
        reject(error);
      });

      this.dashboardWs.on('close', () => {
        console.log('[MCP Proxy] Disconnected from dashboard WebSocket');
        this.connected = false;
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connectToDashboard().catch(console.error), 5000);
      });
    });
  }

  /**
   * Handle messages from dashboard WebSocket
   */
  handleDashboardMessage(data) {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'health-update') {
        this.updateResourceMap(message.data);
      } else if (message.type === 'alert') {
        console.log(`[MCP Proxy] Alert: ${message.data.message}`);
      } else if (message.type === 'restart') {
        console.log(`[MCP Proxy] Restart: ${message.data.server}`);
      }
    } catch (error) {
      console.error('[MCP Proxy] Failed to parse dashboard message:', error.message);
    }
  }

  /**
   * Update resource map from health data
   */
  updateResourceMap(healthData) {
    if (!healthData.servers) return;

    healthData.servers.forEach(server => {
      this.resourceMap.set(server.name, {
        status: server.status,
        responseTime: server.responseTime,
        lastChecked: server.lastChecked,
        tools: server.toolsTested || [],
        error: server.error || null,
      });
    });

    console.log(`[MCP Proxy] Resource map updated: ${this.resourceMap.size} servers`);
  }

  /**
   * Get current dashboard health data
   */
  async getDashboardHealth() {
    try {
      const response = await fetch(`${DASHBOARD_API_URL}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('[MCP Proxy] Failed to fetch dashboard health:', error.message);
      return null;
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      const response = await fetch(`${DASHBOARD_API_URL}/api/metrics`);
      return await response.json();
    } catch (error) {
      console.error('[MCP Proxy] Failed to fetch dashboard metrics:', error.message);
      return null;
    }
  }

  /**
   * Get server logs
   */
  async getServerLogs(serverName) {
    try {
      const response = await fetch(`${DASHBOARD_API_URL}/api/logs/${encodeURIComponent(serverName)}`);
      return await response.json();
    } catch (error) {
      console.error('[MCP Proxy] Failed to fetch server logs:', error.message);
      return null;
    }
  }

  /**
   * Restart server
   */
  async restartServer(serverName) {
    try {
      const response = await fetch(`${DASHBOARD_API_URL}/api/restart/${encodeURIComponent(serverName)}`);
      return await response.json();
    } catch (error) {
      console.error('[MCP Proxy] Failed to restart server:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate proxy auth token
   */
  validateAuthToken(token) {
    return token === PROXY_AUTH_TOKEN;
  }

  /**
   * Start integration server
   */
  async startServer() {
    console.log('[MCP Proxy] Starting MCP Proxy Integration Server...');

    // Connect to dashboard WebSocket
    await this.connectToDashboard();

    // Create HTTP server for proxy endpoints
    const server = createServer(async (req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Extract auth token from query or header
      const url = new URL(req.url, `http://localhost:${INTEGRATION_PORT}`);
      const token = url.searchParams.get('MCP_PROXY_AUTH_TOKEN') || req.headers['authorization']?.replace('Bearer ', '');

      // Validate auth token
      if (!this.validateAuthToken(token)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid authentication token' }));
        return;
      }

      // Route handling
      if (url.pathname === '/api/health') {
        const health = await this.getDashboardHealth();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
      } else if (url.pathname === '/api/metrics') {
        const metrics = await this.getDashboardMetrics();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(metrics));
      } else if (url.pathname === '/api/resources') {
        // Map resources for MCP Inspector
        const resources = Array.from(this.resourceMap.entries()).map(([name, data]) => ({
          uri: `mcp://${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          mimeType: 'application/json',
          description: `MCP Server: ${name}`,
          status: data.status,
          metadata: {
            responseTime: data.responseTime,
            lastChecked: data.lastChecked,
            tools: data.tools,
            error: data.error,
          },
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ resources }));
      } else if (url.pathname.startsWith('/api/logs/')) {
        const serverName = decodeURIComponent(url.pathname.split('/api/logs/')[1]);
        const logs = await this.getServerLogs(serverName);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(logs));
      } else if (url.pathname.startsWith('/api/restart/')) {
        const serverName = decodeURIComponent(url.pathname.split('/api/restart/')[1]);
        const result = await this.restartServer(serverName);
        res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } else if (url.pathname === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'running',
          connected: this.connected,
          resources: this.resourceMap.size,
          dashboardUrl: DASHBOARD_API_URL,
          inspectorUrl: INSPECTOR_URL,
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    server.listen(INTEGRATION_PORT, () => {
      console.log(`[MCP Proxy] Integration server running on http://localhost:${INTEGRATION_PORT}`);
      console.log(`[MCP Proxy] Auth token: ${PROXY_AUTH_TOKEN}`);
      console.log(`[MCP Proxy] Connected to dashboard: ${this.connected}`);
      console.log('[MCP Proxy] Endpoints:');
      console.log(`  - GET  /api/health?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      console.log(`  - GET  /api/metrics?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      console.log(`  - GET  /api/resources?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      console.log(`  - GET  /api/logs/{server}?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      console.log(`  - GET  /api/restart/{server}?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      console.log(`  - GET  /api/status?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
    });
  }

  /**
   * Stop integration server
   */
  stop() {
    if (this.dashboardWs) {
      this.dashboardWs.close();
    }
    console.log('[MCP Proxy] Integration server stopped');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('mcp-proxy-auth-integration.js')) {
  const integration = new MCPProxyIntegration();
  integration.startServer().catch((error) => {
    console.error('[MCP Proxy] Failed to start:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[MCP Proxy] Shutting down...');
    integration.stop();
    process.exit(0);
  });
}

export { MCPProxyIntegration };
