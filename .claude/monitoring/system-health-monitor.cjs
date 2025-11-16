#!/usr/bin/env node
/**
 * System Health Monitor
 * Automated monitoring for MCP servers, LLM endpoints, and system resources
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  CHECK_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  LOG_FILE: path.join(process.env.HOME || process.env.USERPROFILE, '.claude/monitoring/health.log'),
  ALERT_THRESHOLDS: {
    MEMORY_PERCENT: 85,
    CPU_PERCENT: 90,
    DISK_PERCENT: 90,
    MCP_FAILURES: 3
  }
};

class SystemHealthMonitor {
  constructor() {
    this.mcpFailures = 0;
    this.lastCheck = null;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const dir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
      timestamp,
      level,
      message,
      data
    });

    console.log(`[${timestamp}] ${level}: ${message}`);

    fs.appendFileSync(CONFIG.LOG_FILE, logEntry + '\n');
  }

  async checkMCPServers() {
    return new Promise((resolve) => {
      exec('claude mcp list', (error, stdout) => {
        if (error) {
          this.mcpFailures++;
          this.log('ERROR', 'MCP server check failed', { error: error.message });
          resolve({ healthy: false, connected: 0, total: 0 });
          return;
        }

        const lines = stdout.split('\n');
        const connected = lines.filter(line => line.includes('✓ Connected')).length;
        const total = lines.filter(line => line.includes(':')).length;

        this.mcpFailures = 0;
        const healthy = connected === total && total > 0;

        this.log('INFO', 'MCP servers checked', { connected, total, healthy });
        resolve({ healthy, connected, total });
      });
    });
  }

  async checkSystemResources() {
    return new Promise((resolve) => {
      const isWindows = process.platform === 'win32';
      const cmd = isWindows
        ? 'wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value'
        : 'free -m | grep Mem';

      exec(cmd, (error, stdout) => {
        if (error) {
          this.log('ERROR', 'System resource check failed', { error: error.message });
          resolve({ healthy: false, memory: null });
          return;
        }

        let memoryPercent = 0;
        if (isWindows) {
          const lines = stdout.split('\n');
          const free = parseInt(lines.find(l => l.includes('FreePhysicalMemory'))?.split('=')[1] || 0);
          const total = parseInt(lines.find(l => l.includes('TotalVisibleMemorySize'))?.split('=')[1] || 1);
          memoryPercent = ((total - free) / total) * 100;
        } else {
          const parts = stdout.trim().split(/\s+/);
          memoryPercent = (parseInt(parts[2]) / parseInt(parts[1])) * 100;
        }

        const healthy = memoryPercent < CONFIG.ALERT_THRESHOLDS.MEMORY_PERCENT;
        this.log('INFO', 'System resources checked', { memoryPercent: memoryPercent.toFixed(1), healthy });

        resolve({ healthy, memory: memoryPercent });
      });
    });
  }

  async checkLLMEndpoints() {
    return new Promise((resolve) => {
      const testFile = path.join(process.env.HOME || process.env.USERPROFILE, 'llm-health-check.cjs');

      if (!fs.existsSync(testFile)) {
        this.log('WARN', 'LLM health check script not found');
        resolve({ healthy: null, providers: [] });
        return;
      }

      exec(`node "${testFile}"`, { timeout: 30000 }, (error, stdout) => {
        if (error) {
          this.log('ERROR', 'LLM endpoint check failed', { error: error.message });
          resolve({ healthy: false, providers: [] });
          return;
        }

        const healthyProviders = (stdout.match(/✅/g) || []).length;
        const healthy = healthyProviders >= 1;

        this.log('INFO', 'LLM endpoints checked', { healthyProviders, healthy });
        resolve({ healthy, providers: healthyProviders });
      });
    });
  }

  async runHealthCheck() {
    this.log('INFO', 'Starting health check cycle');

    const [mcpStatus, resourceStatus, llmStatus] = await Promise.all([
      this.checkMCPServers(),
      this.checkSystemResources(),
      this.checkLLMEndpoints()
    ]);

    const overallHealthy =
      mcpStatus.healthy &&
      resourceStatus.healthy &&
      (llmStatus.healthy === null || llmStatus.healthy);

    const report = {
      timestamp: new Date().toISOString(),
      overall: overallHealthy ? 'HEALTHY' : 'DEGRADED',
      mcp: mcpStatus,
      resources: resourceStatus,
      llm: llmStatus
    };

    if (!overallHealthy) {
      this.log('WARN', 'System health degraded', report);
    } else {
      this.log('INFO', 'System health check passed', report);
    }

    this.lastCheck = report;
    return report;
  }

  async start() {
    this.log('INFO', 'System health monitor started');

    // Run immediate check
    await this.runHealthCheck();

    // Schedule periodic checks
    setInterval(async () => {
      await this.runHealthCheck();
    }, CONFIG.CHECK_INTERVAL_MS);
  }

  getLastCheck() {
    return this.lastCheck;
  }
}

// Run if executed directly
if (require.main === module) {
  const monitor = new SystemHealthMonitor();
  monitor.start();

  // Keep process alive
  process.on('SIGINT', () => {
    monitor.log('INFO', 'Monitor shutting down');
    process.exit(0);
  });
}

module.exports = SystemHealthMonitor;
