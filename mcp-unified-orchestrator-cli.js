#!/usr/bin/env node

/**
 * MCP Unified Orchestrator CLI
 * Comprehensive command-line tool for managing, monitoring, and orchestrating MCP servers
 *
 * Repository: github.com/Scarmonit/mcp-unified-orchestrator
 * Author: Scarmonit@gmail.com
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for CLI output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class MCPOrchestrator {
  constructor() {
    this.configPath = path.join(homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    this.servers = new Map();
    this.monitoringEnabled = false;
  }

  // Load MCP configuration
  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configData);

      if (config.mcpServers) {
        Object.entries(config.mcpServers).forEach(([name, server]) => {
          this.servers.set(name, {
            ...server,
            status: 'stopped',
            process: null,
            stats: {
              requests: 0,
              errors: 0,
              uptime: 0,
              lastActivity: null
            }
          });
        });
      }

      this.log('success', `Loaded ${this.servers.size} MCP servers`);
      return true;
    } catch (error) {
      this.log('error', `Failed to load config: ${error.message}`);
      return false;
    }
  }

  // List all MCP servers
  async list() {
    console.log(`\n${colors.bright}${colors.cyan}📋 MCP Servers${colors.reset}\n`);

    for (const [name, server] of this.servers.entries()) {
      const statusIcon = server.status === 'running' ? '🟢' : '⚫';
      const statusColor = server.status === 'running' ? colors.green : colors.dim;

      console.log(`${statusIcon} ${colors.bright}${name}${colors.reset}`);
      console.log(`   Command: ${colors.dim}${server.command} ${server.args?.join(' ') || ''}${colors.reset}`);
      console.log(`   Status: ${statusColor}${server.status}${colors.reset}`);

      if (server.stats.requests > 0) {
        console.log(`   Requests: ${colors.cyan}${server.stats.requests}${colors.reset} | Errors: ${colors.red}${server.stats.errors}${colors.reset}`);
      }
      console.log('');
    }
  }

  // Start a specific MCP server
  async start(serverName) {
    if (!this.servers.has(serverName)) {
      this.log('error', `Server "${serverName}" not found`);
      return false;
    }

    const server = this.servers.get(serverName);

    if (server.status === 'running') {
      this.log('warning', `Server "${serverName}" is already running`);
      return false;
    }

    try {
      const proc = spawn(server.command, server.args || [], {
        cwd: server.cwd || process.cwd(),
        env: { ...process.env, ...server.env }
      });

      proc.stdout?.on('data', (data) => {
        this.log('info', `[${serverName}] ${data.toString().trim()}`);
      });

      proc.stderr?.on('data', (data) => {
        this.log('info', `[${serverName}] ${data.toString().trim()}`);
      });

      proc.on('error', (error) => {
        this.log('error', `[${serverName}] ${error.message}`);
        server.stats.errors++;
      });

      proc.on('exit', (code) => {
        this.log('warning', `[${serverName}] exited with code ${code}`);
        server.status = 'stopped';
        server.process = null;
      });

      server.process = proc;
      server.status = 'running';
      server.stats.startTime = Date.now();

      this.log('success', `Started "${serverName}"`);
      return true;
    } catch (error) {
      this.log('error', `Failed to start "${serverName}": ${error.message}`);
      return false;
    }
  }

  // Stop a specific MCP server
  async stop(serverName) {
    if (!this.servers.has(serverName)) {
      this.log('error', `Server "${serverName}" not found`);
      return false;
    }

    const server = this.servers.get(serverName);

    if (server.status !== 'running' || !server.process) {
      this.log('warning', `Server "${serverName}" is not running`);
      return false;
    }

    try {
      server.process.kill('SIGTERM');
      server.status = 'stopped';
      server.process = null;

      this.log('success', `Stopped "${serverName}"`);
      return true;
    } catch (error) {
      this.log('error', `Failed to stop "${serverName}": ${error.message}`);
      return false;
    }
  }

  // Start all MCP servers
  async startAll() {
    this.log('info', 'Starting all MCP servers...');

    for (const serverName of this.servers.keys()) {
      await this.start(serverName);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger starts
    }

    this.log('success', 'All servers started');
  }

  // Stop all MCP servers
  async stopAll() {
    this.log('info', 'Stopping all MCP servers...');

    for (const serverName of this.servers.keys()) {
      await this.stop(serverName);
    }

    this.log('success', 'All servers stopped');
  }

  // Restart a specific server
  async restart(serverName) {
    await this.stop(serverName);
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.start(serverName);
  }

  // Get server health status
  async health(serverName) {
    if (serverName && !this.servers.has(serverName)) {
      this.log('error', `Server "${serverName}" not found`);
      return;
    }

    const serversToCheck = serverName
      ? [[serverName, this.servers.get(serverName)]]
      : Array.from(this.servers.entries());

    console.log(`\n${colors.bright}${colors.cyan}🏥 Health Check${colors.reset}\n`);

    for (const [name, server] of serversToCheck) {
      const isHealthy = server.status === 'running' && server.stats.errors < 10;
      const healthIcon = isHealthy ? '✅' : '❌';

      console.log(`${healthIcon} ${colors.bright}${name}${colors.reset}`);
      console.log(`   Status: ${server.status}`);
      console.log(`   Errors: ${server.stats.errors}`);

      if (server.stats.startTime) {
        const uptime = Math.floor((Date.now() - server.stats.startTime) / 1000);
        console.log(`   Uptime: ${uptime}s`);
      }

      console.log('');
    }
  }

  // Monitor all servers (continuous)
  async monitor() {
    this.monitoringEnabled = true;

    console.log(`${colors.bright}${colors.cyan}📊 Monitoring MCP Servers (Press Ctrl+C to stop)${colors.reset}\n`);

    const refresh = async () => {
      if (!this.monitoringEnabled) return;

      console.clear();
      console.log(`${colors.bright}${colors.cyan}MCP Unified Orchestrator - Live Monitor${colors.reset}`);
      console.log(`${colors.dim}Time: ${new Date().toLocaleTimeString()}${colors.reset}\n`);

      await this.health();

      setTimeout(refresh, 2000);
    };

    refresh();
  }

  // Export monitoring metrics (for Prometheus/Grafana)
  async exportMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      servers: {}
    };

    for (const [name, server] of this.servers.entries()) {
      metrics.servers[name] = {
        status: server.status,
        uptime: server.stats.startTime ? Date.now() - server.stats.startTime : 0,
        requests: server.stats.requests,
        errors: server.stats.errors,
        error_rate: server.stats.requests > 0
          ? (server.stats.errors / server.stats.requests * 100).toFixed(2)
          : 0
      };
    }

    const metricsPath = path.join(process.cwd(), 'mcp-metrics.json');
    await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));

    this.log('success', `Metrics exported to ${metricsPath}`);
  }

  // Validate server configuration
  async validate() {
    console.log(`\n${colors.bright}${colors.cyan}🔍 Validating Configuration${colors.reset}\n`);

    let valid = true;

    for (const [name, server] of this.servers.entries()) {
      const issues = [];

      if (!server.command) {
        issues.push('Missing command');
        valid = false;
      }

      if (server.args && !Array.isArray(server.args)) {
        issues.push('Args must be an array');
        valid = false;
      }

      if (issues.length > 0) {
        console.log(`❌ ${colors.bright}${name}${colors.reset}`);
        issues.forEach(issue => console.log(`   ${colors.red}• ${issue}${colors.reset}`));
      } else {
        console.log(`✅ ${colors.bright}${name}${colors.reset}`);
      }
    }

    console.log('');
    this.log(valid ? 'success' : 'error', valid ? 'Configuration valid' : 'Configuration has errors');
  }

  // Logging utility
  log(level, message) {
    const icons = {
      info: '📘',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const levelColors = {
      info: colors.blue,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red
    };

    console.log(`${icons[level]} ${levelColors[level]}${message}${colors.reset}`);
  }
}

// CLI Interface
const orchestrator = new MCPOrchestrator();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const serverName = args[1];

  // Print help
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(`
${colors.bright}${colors.cyan}MCP Unified Orchestrator${colors.reset}
${colors.dim}Comprehensive MCP server management CLI${colors.reset}

${colors.bright}USAGE:${colors.reset}
  mcp-orchestrator <command> [server-name]

${colors.bright}COMMANDS:${colors.reset}
  ${colors.green}list${colors.reset}              List all MCP servers
  ${colors.green}start${colors.reset} <name>      Start a specific server
  ${colors.green}stop${colors.reset} <name>       Stop a specific server
  ${colors.green}restart${colors.reset} <name>    Restart a specific server
  ${colors.green}start-all${colors.reset}         Start all servers
  ${colors.green}stop-all${colors.reset}          Stop all servers
  ${colors.green}health${colors.reset} [name]     Health check (all or specific server)
  ${colors.green}monitor${colors.reset}           Live monitoring dashboard
  ${colors.green}validate${colors.reset}          Validate configuration
  ${colors.green}export-metrics${colors.reset}    Export Prometheus-compatible metrics
  ${colors.green}help${colors.reset}              Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  mcp-orchestrator list
  mcp-orchestrator start mcp-doctor
  mcp-orchestrator health
  mcp-orchestrator monitor

${colors.dim}Repository: github.com/Scarmonit/mcp-unified-orchestrator${colors.reset}
    `);
    return;
  }

  // Load configuration
  const loaded = await orchestrator.loadConfig();
  if (!loaded && command !== 'help') {
    process.exit(1);
  }

  // Execute command
  switch (command) {
    case 'list':
      await orchestrator.list();
      break;

    case 'start':
      if (!serverName) {
        orchestrator.log('error', 'Server name required');
        process.exit(1);
      }
      await orchestrator.start(serverName);
      break;

    case 'stop':
      if (!serverName) {
        orchestrator.log('error', 'Server name required');
        process.exit(1);
      }
      await orchestrator.stop(serverName);
      break;

    case 'restart':
      if (!serverName) {
        orchestrator.log('error', 'Server name required');
        process.exit(1);
      }
      await orchestrator.restart(serverName);
      break;

    case 'start-all':
      await orchestrator.startAll();
      break;

    case 'stop-all':
      await orchestrator.stopAll();
      break;

    case 'health':
      await orchestrator.health(serverName);
      break;

    case 'monitor':
      await orchestrator.monitor();
      break;

    case 'validate':
      await orchestrator.validate();
      break;

    case 'export-metrics':
      await orchestrator.exportMetrics();
      break;

    default:
      orchestrator.log('error', `Unknown command: ${command}`);
      console.log(`Run 'mcp-orchestrator help' for usage information`);
      process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
  orchestrator.monitoringEnabled = false;
  process.exit(0);
});

main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
