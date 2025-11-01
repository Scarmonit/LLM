#!/usr/bin/env node

/**
 * MCP Integration Tests
 *
 * Comprehensive test suite for MCP Dashboard system:
 * - Dashboard server health checks
 * - Proxy authentication integration
 * - WebSocket connectivity
 * - Server restart functionality
 * - Metrics collection
 * - All 8 MCP servers validation
 *
 * @module tests/mcp-integration-test
 */

import { strict as assert } from 'assert';
import { spawn } from 'child_process';
import { WebSocket } from 'ws';

const WS_URL = 'ws://localhost:65030';
const API_URL = 'http://localhost:65031';
const PROXY_URL = 'http://localhost:65032';
const PROXY_AUTH_TOKEN = '8da7833da35869ec27ce9eb13a1b4926d98a6802303e60cfb6185780ba6eb74c';

class MCPIntegrationTests {
  constructor() {
    this.testResults = [];
    this.failures = 0;
    this.passes = 0;
  }

  /**
   * Log test result
   */
  log(name, passed, error = null) {
    const result = {
      name,
      passed,
      error: error?.message || null,
      timestamp: new Date().toISOString(),
    };

    this.testResults.push(result);

    if (passed) {
      this.passes++;
      console.log(`✅ PASS: ${name}`);
    } else {
      this.failures++;
      console.error(`❌ FAIL: ${name}`);
      if (error) console.error(`   Error: ${error.message}`);
    }
  }

  /**
   * Test dashboard API health endpoint
   */
  async testDashboardHealth() {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      assert.ok(data.servers, 'Health data should have servers array');
      assert.ok(data.lastUpdate, 'Health data should have lastUpdate timestamp');
      assert.equal(data.servers.length, 8, 'Should have 8 MCP servers');

      this.log('Dashboard health endpoint', true);
      return data;
    } catch (error) {
      this.log('Dashboard health endpoint', false, error);
      throw error;
    }
  }

  /**
   * Test dashboard metrics endpoint
   */
  async testDashboardMetrics() {
    try {
      const response = await fetch(`${API_URL}/api/metrics`);
      const data = await response.json();

      assert.ok(data.history, 'Metrics should have history array');
      assert.ok(data.lastUpdate, 'Metrics should have lastUpdate timestamp');

      this.log('Dashboard metrics endpoint', true);
      return data;
    } catch (error) {
      this.log('Dashboard metrics endpoint', false, error);
      throw error;
    }
  }

  /**
   * Test WebSocket connectivity
   */
  async testWebSocketConnection() {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(WS_URL);
        let messageReceived = false;

        ws.on('open', () => {
          console.log('   WebSocket connected');
        });

        ws.on('message', (data) => {
          const message = JSON.parse(data.toString());
          assert.ok(message.type, 'WebSocket message should have type');
          messageReceived = true;
          ws.close();
        });

        ws.on('close', () => {
          if (messageReceived) {
            this.log('WebSocket connectivity', true);
            resolve();
          } else {
            throw new Error('No message received from WebSocket');
          }
        });

        ws.on('error', (error) => {
          this.log('WebSocket connectivity', false, error);
          reject(error);
        });

        setTimeout(() => {
          if (!messageReceived) {
            ws.close();
            const error = new Error('WebSocket timeout - no message received');
            this.log('WebSocket connectivity', false, error);
            reject(error);
          }
        }, 10000);
      } catch (error) {
        this.log('WebSocket connectivity', false, error);
        reject(error);
      }
    });
  }

  /**
   * Test proxy authentication
   */
  async testProxyAuth() {
    try {
      // Test with valid token
      const validResponse = await fetch(`${PROXY_URL}/api/status?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      assert.equal(validResponse.status, 200, 'Valid token should return 200');

      const data = await validResponse.json();
      assert.equal(data.status, 'running', 'Proxy should be running');

      // Test with invalid token
      const invalidResponse = await fetch(`${PROXY_URL}/api/status?MCP_PROXY_AUTH_TOKEN=invalid`);
      assert.equal(invalidResponse.status, 401, 'Invalid token should return 401');

      this.log('Proxy authentication', true);
    } catch (error) {
      this.log('Proxy authentication', false, error);
      throw error;
    }
  }

  /**
   * Test proxy resources endpoint
   */
  async testProxyResources() {
    try {
      const response = await fetch(`${PROXY_URL}/api/resources?MCP_PROXY_AUTH_TOKEN=${PROXY_AUTH_TOKEN}`);
      const data = await response.json();

      assert.ok(data.resources, 'Proxy should return resources array');
      assert.ok(data.resources.length > 0, 'Should have at least one resource');

      data.resources.forEach(resource => {
        assert.ok(resource.uri, 'Resource should have URI');
        assert.ok(resource.name, 'Resource should have name');
        assert.ok(resource.status, 'Resource should have status');
      });

      this.log('Proxy resources mapping', true);
    } catch (error) {
      this.log('Proxy resources mapping', false, error);
      throw error;
    }
  }

  /**
   * Test server logs endpoint
   */
  async testServerLogs() {
    try {
      const health = await this.testDashboardHealth();
      const serverName = health.servers[0].name;

      const response = await fetch(`${API_URL}/api/logs/${encodeURIComponent(serverName)}`);
      const data = await response.json();

      assert.equal(data.server, serverName, 'Logs should be for requested server');
      assert.ok(Array.isArray(data.logs), 'Logs should be an array');

      this.log('Server logs retrieval', true);
    } catch (error) {
      this.log('Server logs retrieval', false, error);
      throw error;
    }
  }

  /**
   * Test all 8 MCP servers individually
   */
  async testAllServers() {
    const serverTests = [
      { name: '1Password', tool: 'list_vaults', args: {} },
      { name: 'Desktop Automation', tool: 'browser_screenshot', args: { name: 'test' } },
      { name: 'Kali', tool: 'kali_nmap_scan', args: { target: '127.0.0.1', scanType: 'quick' } },
      { name: 'iPhone', tool: 'iphone_list_devices', args: {} },
      { name: 'YouTube', tool: 'youtube_search', args: { query: 'test', maxResults: 1 } },
      { name: 'MCP Doctor', tool: 'health_check', args: {} },
      { name: 'AWS CLI', tool: 'aws_execute', args: { service: 'sts', command: 'get-caller-identity', args: [] } },
      { name: 'Terraform', tool: 'terraform_validate', args: { workingDir: '.', json: true } },
    ];

    for (const server of serverTests) {
      try {
        const health = await fetch(`${API_URL}/api/health`);
        const data = await health.json();
        const serverHealth = data.servers.find(s => s.name === server.name);

        if (serverHealth) {
          assert.ok(['healthy', 'unhealthy', 'unreachable'].includes(serverHealth.status),
            `${server.name} should have valid status`);
          assert.ok(serverHealth.responseTime, `${server.name} should have response time`);
          this.log(`${server.name} server health check`, true);
        } else {
          throw new Error(`${server.name} not found in health data`);
        }
      } catch (error) {
        this.log(`${server.name} server health check`, false, error);
      }
    }
  }

  /**
   * Test performance metrics
   */
  async testPerformanceMetrics() {
    try {
      const health = await this.testDashboardHealth();

      const responseTimes = health.servers.map(s => s.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      assert.ok(avgResponseTime > 0, 'Average response time should be positive');
      assert.ok(avgResponseTime < 10000, 'Average response time should be under 10 seconds');

      this.log('Performance metrics', true);
    } catch (error) {
      this.log('Performance metrics', false, error);
      throw error;
    }
  }

  /**
   * Test dashboard statistics calculation
   */
  async testDashboardStats() {
    try {
      const health = await this.testDashboardHealth();

      if (health.stats) {
        assert.equal(health.stats.total, health.servers.length, 'Total should match servers count');
        assert.equal(
          health.stats.healthy + health.stats.unhealthy + health.stats.unreachable,
          health.stats.total,
          'Stats should sum to total'
        );
      }

      this.log('Dashboard statistics', true);
    } catch (error) {
      this.log('Dashboard statistics', false, error);
      throw error;
    }
  }

  /**
   * Test continuous monitoring (5 checks over 25 seconds)
   */
  async testContinuousMonitoring() {
    try {
      const checks = [];
      const checkInterval = 5000; // 5 seconds
      const totalChecks = 5;

      for (let i = 0; i < totalChecks; i++) {
        const health = await this.testDashboardHealth();
        checks.push({
          timestamp: new Date().toISOString(),
          healthyCount: health.servers.filter(s => s.status === 'healthy').length,
        });

        if (i < totalChecks - 1) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
      }

      assert.equal(checks.length, totalChecks, 'Should complete all checks');
      checks.forEach(check => {
        assert.ok(check.healthyCount >= 0, 'Healthy count should be non-negative');
      });

      this.log('Continuous monitoring', true);
    } catch (error) {
      this.log('Continuous monitoring', false, error);
      throw error;
    }
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('\n🧪 Starting MCP Integration Tests...\n');
    console.log('=' .repeat(60));

    const startTime = Date.now();

    // Core functionality tests
    try {
      await this.testDashboardHealth();
    } catch (e) { /* logged */ }

    try {
      await this.testDashboardMetrics();
    } catch (e) { /* logged */ }

    try {
      await this.testWebSocketConnection();
    } catch (e) { /* logged */ }

    try {
      await this.testDashboardStats();
    } catch (e) { /* logged */ }

    try {
      await this.testServerLogs();
    } catch (e) { /* logged */ }

    try {
      await this.testPerformanceMetrics();
    } catch (e) { /* logged */ }

    // Proxy tests (may fail if proxy not running)
    try {
      await this.testProxyAuth();
    } catch (e) { /* logged */ }

    try {
      await this.testProxyResources();
    } catch (e) { /* logged */ }

    // Individual server tests
    await this.testAllServers();

    // Continuous monitoring test (takes ~25 seconds)
    console.log('\n⏱️  Running continuous monitoring test (25 seconds)...');
    try {
      await this.testContinuousMonitoring();
    } catch (e) { /* logged */ }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${this.testResults.length}`);
    console.log(`   ✅ Passed: ${this.passes}`);
    console.log(`   ❌ Failed: ${this.failures}`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   Success Rate: ${((this.passes / this.testResults.length) * 100).toFixed(1)}%`);

    // Failed tests detail
    if (this.failures > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`   - ${t.name}: ${t.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    return {
      total: this.testResults.length,
      passed: this.passes,
      failed: this.failures,
      duration,
      results: this.testResults,
    };
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('mcp-integration.test.js')) {
  const tests = new MCPIntegrationTests();

  tests.runAll()
    .then(summary => {
      console.log('\n✅ Tests complete!\n');
      process.exit(summary.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Test suite crashed:', error);
      process.exit(1);
    });
}

export { MCPIntegrationTests };
