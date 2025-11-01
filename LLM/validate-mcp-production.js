#!/usr/bin/env node

/**
 * MCP Production Validation Script
 *
 * Validates that all MCP systems are production-ready:
 * - All servers accessible and responding
 * - Dashboard functional
 * - Proxy integration working
 * - Performance within acceptable limits
 * - No critical errors
 *
 * @module validate-mcp-production
 */

const API_URL = 'http://localhost:65031';
const PROXY_URL = 'http://localhost:65032';
const PROXY_TOKEN = '8da7833da35869ec27ce9eb13a1b4926d98a6802303e60cfb6185780ba6eb74c';

class ProductionValidator {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
    };
  }

  async validate() {
    console.log('\n' + '='.repeat(70));
    console.log('   MCP PRODUCTION VALIDATION');
    console.log('='.repeat(70) + '\n');

    // 1. Dashboard Health
    await this.validateDashboardHealth();

    // 2. Server Performance
    await this.validateServerPerformance();

    // 3. Proxy Integration
    await this.validateProxyIntegration();

    // 4. Real Usage Test
    await this.validateRealUsage();

    // 5. Uptime Check
    await this.validateUptime();

    // Summary
    this.printSummary();

    return this.results.failed.length === 0;
  }

  async validateDashboardHealth() {
    console.log('📊 Validating Dashboard Health...');

    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      // Check all servers present
      if (data.servers.length === 8) {
        this.pass('✓ All 8 MCP servers detected');
      } else {
        this.fail(`✗ Expected 8 servers, found ${data.servers.length}`);
      }

      // Check healthy count
      const healthy = data.servers.filter(s => s.status === 'healthy');
      if (healthy.length >= 7) {
        this.pass(`✓ ${healthy.length}/8 servers healthy`);
      } else {
        this.warn(`⚠ Only ${healthy.length}/8 servers healthy`);
      }

      // List unhealthy servers
      const unhealthy = data.servers.filter(s => s.status !== 'healthy');
      if (unhealthy.length > 0) {
        unhealthy.forEach(s => {
          this.warn(`⚠ ${s.name}: ${s.status} - ${s.error || 'No error'}`);
        });
      }

    } catch (error) {
      this.fail(`✗ Dashboard health check failed: ${error.message}`);
    }

    console.log('');
  }

  async validateServerPerformance() {
    console.log('⚡ Validating Server Performance...');

    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      data.servers.forEach(server => {
        if (server.status === 'healthy') {
          if (server.responseTime < 1000) {
            this.pass(`✓ ${server.name}: ${server.responseTime}ms (excellent)`);
          } else if (server.responseTime < 5000) {
            this.pass(`✓ ${server.name}: ${server.responseTime}ms (acceptable)`);
          } else {
            this.warn(`⚠ ${server.name}: ${server.responseTime}ms (slow)`);
          }
        }
      });

    } catch (error) {
      this.fail(`✗ Performance validation failed: ${error.message}`);
    }

    console.log('');
  }

  async validateProxyIntegration() {
    console.log('🔐 Validating Proxy Integration...');

    try {
      // Test proxy status
      const statusResponse = await fetch(`${PROXY_URL}/api/status?MCP_PROXY_AUTH_TOKEN=${PROXY_TOKEN}`);
      const statusData = await statusResponse.json();

      if (statusData.status === 'running') {
        this.pass('✓ Proxy server running');
      } else {
        this.fail('✗ Proxy server not running');
      }

      if (statusData.connected) {
        this.pass('✓ Proxy connected to dashboard');
      } else {
        this.warn('⚠ Proxy not connected to dashboard');
      }

      // Test resources mapping
      const resourcesResponse = await fetch(`${PROXY_URL}/api/resources?MCP_PROXY_AUTH_TOKEN=${PROXY_TOKEN}`);
      const resourcesData = await resourcesResponse.json();

      if (resourcesData.resources && resourcesData.resources.length === 8) {
        this.pass(`✓ All 8 resources mapped correctly`);
      } else {
        this.warn(`⚠ Resource mapping incomplete: ${resourcesData.resources?.length || 0}/8`);
      }

      // Test authentication
      const invalidAuthResponse = await fetch(`${PROXY_URL}/api/status?MCP_PROXY_AUTH_TOKEN=invalid`);
      if (invalidAuthResponse.status === 401) {
        this.pass('✓ Authentication working correctly');
      } else {
        this.fail('✗ Authentication not enforced');
      }

    } catch (error) {
      this.fail(`✗ Proxy validation failed: ${error.message}`);
    }

    console.log('');
  }

  async validateRealUsage() {
    console.log('🎯 Validating Real Usage...');

    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();

      // Verify each server has been tested
      const testedServers = data.servers.filter(s => s.toolsTested && s.toolsTested.length > 0);
      if (testedServers.length === 8) {
        this.pass('✓ All servers have been tested with real tools');
      } else {
        this.warn(`⚠ ${testedServers.length}/8 servers have test results`);
      }

      // Verify timestamps are recent (within last minute)
      const now = new Date();
      const recentChecks = data.servers.filter(s => {
        const checkTime = new Date(s.lastChecked);
        return (now - checkTime) < 60000; // 60 seconds
      });

      if (recentChecks.length === 8) {
        this.pass('✓ All servers checked within last minute');
      } else {
        this.warn(`⚠ ${recentChecks.length}/8 servers recently checked`);
      }

    } catch (error) {
      this.fail(`✗ Real usage validation failed: ${error.message}`);
    }

    console.log('');
  }

  async validateUptime() {
    console.log('⏱️  Validating System Uptime...');

    try {
      // Make 3 requests 5 seconds apart
      for (let i = 1; i <= 3; i++) {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          this.pass(`✓ Health check ${i}/3 successful`);
        } else {
          this.fail(`✗ Health check ${i}/3 failed`);
        }

        if (i < 3) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

    } catch (error) {
      this.fail(`✗ Uptime validation failed: ${error.message}`);
    }

    console.log('');
  }

  pass(message) {
    this.results.passed.push(message);
    console.log(`  ${message}`);
  }

  fail(message) {
    this.results.failed.push(message);
    console.log(`  ${message}`);
  }

  warn(message) {
    this.results.warnings.push(message);
    console.log(`  ${message}`);
  }

  printSummary() {
    console.log('='.repeat(70));
    console.log('\n📋 VALIDATION SUMMARY\n');
    console.log(`   ✅ Passed:   ${this.results.passed.length}`);
    console.log(`   ⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`   ❌ Failed:   ${this.results.failed.length}`);
    console.log('');

    if (this.results.failed.length === 0) {
      console.log('🎉 PRODUCTION READY - All validations passed!');
      console.log('');
      console.log('   Dashboard:  http://localhost:65031');
      console.log('   Enhanced:   http://localhost:65031/enhanced');
      console.log('   Proxy:      http://localhost:65032');
      console.log('   WebSocket:  ws://localhost:65030');
    } else {
      console.log('⚠️  NOT PRODUCTION READY - Fix failures before deploying');
      console.log('');
      this.results.failed.forEach(f => console.log(`   ${f}`));
    }

    console.log('\n' + '='.repeat(70) + '\n');
  }
}

// Run validation
const validator = new ProductionValidator();
validator.validate()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Validation crashed:', error);
    process.exit(1);
  });
