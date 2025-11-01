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
    command: 'list_items'
  },
  {
    name: 'Desktop Automation',
    path: join(__dirname, 'desktop-automation-mcp-server.js'),
    command: 'list_applications'
  },
  {
    name: 'Kali',
    path: join(__dirname, 'kali-mcp-server.js'),
    command: 'list_tools'
  },
  {
    name: 'iPhone',
    path: join(__dirname, 'iphone-mcp-server.js'),
    command: 'list_apps'
  },
  {
    name: 'YouTube',
    path: join(__dirname, 'youtube-mcp-server.js'),
    command: 'search_videos'
  },
  {
    name: 'MCP Doctor',
    path: join(__dirname, 'mcp-doctor-server.js'),
    command: 'diagnose'
  },
  {
    name: 'AWS CLI',
    path: join(__dirname, 'aws-cli-mcp-server.js'),
    command: 'list_ec2_instances'
  },
  {
    name: 'Terraform',
    path: join(__dirname, 'terraform-mcp-server.js'),
    command: 'list_resources'
  }
];

let wss;
let connectedClients = new Set();
let healthData = { servers: [] };

/**
 * Check health of a single MCP server
 * @param {Object} server - Server configuration
 * @returns {Promise<Object>} Health status
 */
async function checkServerHealth(server) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        name: server.name,
        command: server.command,
        status: 'unhealthy',
        responseTime: null,
        lastCheck: new Date().toISOString(),
        error: 'Health check timeout (>5000ms)'
      });
    }, 5000);

    const child = spawn('node', [server.path], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let hasResponded = false;

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      if (!hasResponded) {
        hasResponded = true;
        clearTimeout(timeout);
        resolve({
          name: server.name,
          command: server.command,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastCheck: new Date().toISOString(),
          error: `Failed to start: ${error.message}`
        });
      }
    });

    child.on('close', (code) => {
      if (!hasResponded) {
        hasResponded = true;
        clearTimeout(timeout);
        
        const responseTime = Date.now() - startTime;
        
        // Try to parse JSON response
        try {
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const response = JSON.parse(jsonMatch[0]);
            resolve({
              name: server.name,
              command: server.command,
              status: 'healthy',
              responseTime,
              lastCheck: new Date().toISOString()
            });
          } else {
            resolve({
              name: server.name,
              command: server.command,
              status: 'unhealthy',
              responseTime,
              lastCheck: new Date().toISOString(),
              error: 'No valid JSON response'
            });
          }
        } catch (parseError) {
          resolve({
            name: server.name,
            command: server.command,
            status: 'unhealthy',
            responseTime,
            lastCheck: new Date().toISOString(),
            error: `JSON parse error: ${parseError.message}`
          });
        }
      }
    });

    // Send initialization and command
    setTimeout(() => {
      try {
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {},
          id: 1
        }) + '\n');
        
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          params: {},
          id: 2
        }) + '\n');
        
        child.stdin.end();
      } catch (err) {
        console.error(`Error writing to ${server.name}:`, err);
      }
    }, 100);
  });
}

/**
 * Check health of all MCP servers
 */
async function checkAllServers() {
  console.log('\n=== Starting health check ===');
  const results = await Promise.all(
    MCP_SERVERS.map(server => checkServerHealth(server))
  );
  
  healthData = { servers: results };
  
  // Log summary
  const healthy = results.filter(r => r.status === 'healthy').length;
  const unhealthy = results.filter(r => r.status === 'unhealthy').length;
  console.log(`Health Check Complete: ${healthy} healthy, ${unhealthy} unhealthy`);
  
  // Broadcast to all connected clients
  broadcastHealthData();
}

/**
 * Broadcast health data to all connected WebSocket clients
 */
function broadcastHealthData() {
  const data = JSON.stringify(healthData);
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(data);
      } catch (err) {
        console.error('Error sending to client:', err);
      }
    }
  });
}

/**
 * Initialize WebSocket Server
 */
function initWebSocketServer() {
  wss = new WebSocketServer({ port: WS_PORT });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    connectedClients.add(ws);
    
    // Send current health data immediately
    if (healthData.servers.length > 0) {
      ws.send(JSON.stringify(healthData));
    }
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      connectedClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });
  
  console.log(`WebSocket server listening on port ${WS_PORT}`);
}

/**
 * Initialize HTTP Server for dashboard
 */
async function initHttpServer() {
  const server = createServer(async (req, res) => {
    if (req.url === '/' || req.url === '/dashboard') {
      try {
        const dashboardPath = join(__dirname, 'mcp-dashboard.html');
        const html = await readFile(dashboardPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch (err) {
        console.error('Error serving dashboard:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading dashboard');
      }
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(healthData));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
  server.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening on port ${HTTP_PORT}`);
    console.log(`Dashboard: http://localhost:${HTTP_PORT}/`);
  });
}

/**
 * Main startup function
 */
async function main() {
  console.log('🚀 Starting MCP Dashboard Server...');
  console.log(`Monitoring ${MCP_SERVERS.length} MCP servers`);
  
  // Initialize servers
  initWebSocketServer();
  await initHttpServer();
  
  // Run initial health check
  await checkAllServers();
  
  // Schedule periodic health checks
  setInterval(checkAllServers, HEALTH_CHECK_INTERVAL);
  
  console.log(`\n✅ Dashboard ready!`);
  console.log(`📊 Dashboard: http://localhost:${HTTP_PORT}/`);
  console.log(`🔌 WebSocket: ws://localhost:${WS_PORT}`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down MCP Dashboard Server...');
  if (wss) {
    wss.close();
  }
  process.exit(0);
});

// Start the server
main().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
