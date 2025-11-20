/**
 * Enhanced Provider Proxy with Advanced Features
 * Layer 5: Self-Failing-Over + Performance Monitoring + Circuit Breaker Pattern
 *
 * Features:
 * - Circuit breaker pattern for fault tolerance
 * - Performance metrics and monitoring
 * - Intelligent failover with health scoring
 * - Automatic retry with exponential backoff
 * - Event-driven architecture for observability
 */

import {performance} from 'perf_hooks';
import {EventEmitter} from 'events';

import AdaptiveCircuitBreaker from './circuit-breaker-adaptive.js';
import { EnhancedHealthScoring } from './health-scoring-enhanced.js';

// Configuration with circuit breaker
const CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 60000,
  HEALTH_CHECK_INTERVAL: 30000,
  PERFORMANCE_THRESHOLD: 5000, // 5 seconds
  METRICS_RETENTION: 3600000 // 1 hour
};

// Simple logger
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} ${msg}`),
  warn: (msg) => console.log(`[WARN] ${new Date().toISOString()} ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} ${msg}`),
  debug: (msg) => console.log(`[DEBUG] ${new Date().toISOString()} ${msg}`)
};

/**
 * CircuitBreaker class - Prevents cascading failures
 */
    // Remove old simple CircuitBreaker class
    /*
class CircuitBreaker {
  constructor(threshold, timeout) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        logger.info('Circuit breaker: attempting recovery');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
    logger.info('Circuit breaker: reset to CLOSED');
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker: OPEN after ${this.failures} failures`);
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}
*/

/**
 * ProviderMetrics class - Tracks performance and health metrics
 */
class ProviderMetrics {
  constructor(retentionTime) {
    this.retentionTime = retentionTime;
    this.metrics = new Map();
    this.healthChecks = new Map();
  }

  recordRequest(provider, duration, success, error = null) {
    const metric = {
      timestamp: Date.now(),
      duration,
      success,
      error: error?.message
    };

    if (!this.metrics.has(provider)) {
      this.metrics.set(provider, []);
    }

    this.metrics.get(provider).push(metric);
    this.cleanupOldMetrics(provider);
  }

  recordHealthCheck(provider, isHealthy, responseTime) {
    this.healthChecks.set(provider, {
      timestamp: Date.now(),
      isHealthy,
      responseTime
    });
  }

  getProviderStats(provider) {
    const metrics = this.metrics.get(provider) || [];
    if (metrics.length === 0) {
      return null;
    }

    const successful = metrics.filter(m => m.success);
    const failed = metrics.filter(m => !m.success);

    return {
      totalRequests: metrics.length,
      successRate: successful.length / metrics.length,
      avgResponseTime: successful.length > 0
        ? successful.reduce((sum, m) => sum + m.duration, 0) / successful.length
        : 0,
      lastRequest: Math.max(...metrics.map(m => m.timestamp)),
      recentFailures: failed.slice(-5).map(m => m.error),
      recentResponseTimes: successful.slice(-10).map(m => m.duration)
    };
  }

  cleanupOldMetrics(provider) {
    const cutoff = Date.now() - this.retentionTime;
    const metrics = this.metrics.get(provider) || [];

    this.metrics.set(
      provider,
      metrics.filter(m => m.timestamp > cutoff)
    );
  }

  getHealthStatus() {
    const status = {};

    for (const [provider, check] of this.healthChecks) {
      const age = Date.now() - check.timestamp;
      const isStale = age > CONFIG.HEALTH_CHECK_INTERVAL * 2;

      status[provider] = {
        ...check,
        isStale,
        age
      };
    }

    return status;
  }
}

/**
 * RetryManager class - Handles retry logic with exponential backoff
 */
class RetryManager {
  constructor(maxAttempts, baseDelay) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
  }

  async execute(operation, context = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        logger.debug(`Attempt ${attempt}/${this.maxAttempts} for ${context.provider}`);
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxAttempts) {
          logger.error(`Max retries exceeded for ${context.provider}: ${error.message}`);
          throw new Error(`Max retries exceeded: ${error.message}`);
        }

        const delay = this.calculateDelay(attempt);
        logger.warn(`Attempt ${attempt} failed for ${context.provider}, retrying in ${delay}ms: ${error.message}`);

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  calculateDelay(attempt) {
    return this.baseDelay * Math.pow(2, attempt - 1);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ProviderProxy class - Main orchestrator with advanced features
 */
class ProviderProxy extends EventEmitter {
  constructor(config = CONFIG) {
    super();
    this.config = config;
    this.providers = new Map();
    this.circuitBreakers = new Map();
    this.metrics = new ProviderMetrics(config.METRICS_RETENTION);
    this.retryManager = new RetryManager(config.RETRY_ATTEMPTS, config.RETRY_DELAY);
    this.healthScoring = new EnhancedHealthScoring();
    this.healthCheckInterval = null;
  }

  /**
   * Register a provider with the proxy
   */
  registerProvider(name, provider) {
    this.providers.set(name, provider);
    this.circuitBreakers.set(name, new AdaptiveCircuitBreaker({
      threshold: this.config.CIRCUIT_BREAKER_THRESHOLD,
      timeout: this.config.CIRCUIT_BREAKER_TIMEOUT
    }));

    logger.info(`Provider registered: ${name}`);
    this.emit('providerRegistered', {name, provider});
  }

  /**
   * Enhanced request method with all autonomous features
   */
  async request(providerName, prompt, options = {}) {
    const startTime = performance.now();
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }

    const circuitBreaker = this.circuitBreakers.get(providerName);

    try {
      const result = await circuitBreaker.execute(async () => {
        return await this.retryManager.execute(async () => {
          logger.info(`Processing request with ${providerName}`);

          // Add timeout protection
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), this.config.TIMEOUT)
          );

          const requestPromise = provider.generate
            ? provider.generate(prompt, options)
            : provider(prompt, options);

          const result = await Promise.race([requestPromise, timeoutPromise]);

          return result;
        }, {provider: providerName});
      });

      const duration = performance.now() - startTime;
      this.metrics.recordRequest(providerName, duration, true);

      logger.info(`Request completed successfully with ${providerName} in ${duration.toFixed(2)}ms`);
      this.emit('requestSuccess', {provider: providerName, duration, result});

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.recordRequest(providerName, duration, false, error);

      logger.error(`Request failed with ${providerName}: ${error.message}`);
      this.emit('requestFailed', {
        provider: providerName,
        duration,
        error: error.message,
        attempts: this.retryManager.maxAttempts
      });

      // Attempt failover to next provider
      return await this.failover(providerName, prompt, options);
    }
  }

  /**
   * Failover mechanism with intelligent provider selection
   */
  async failover(failedProvider, prompt, options) {
    logger.warn(`Attempting failover from ${failedProvider}`);

    const availableProviders = Array.from(this.providers.keys())
      .filter(name => name !== failedProvider);

    if (availableProviders.length === 0) {
      throw new Error('No failover providers available');
    }

    // Sort by health score
    const healthyProviders = availableProviders
      .map(name => ({
        name,
        stats: this.metrics.getProviderStats(name),
        health: this.metrics.healthChecks.get(name)
      }))
      .sort((a, b) => {
        const aScore = this.calculateHealthScore(a, a.name);
        const bScore = this.calculateHealthScore(b, b.name);
        return bScore - aScore;
      });

    // Try each provider in order of health
    for (const {name} of healthyProviders) {
      try {
        logger.info(`Trying failover provider: ${name}`);
        return await this.request(name, prompt, options);
      } catch (error) {
        logger.warn(`Failover to ${name} also failed: ${error.message}`);
        continue;
      }
    }

    throw new Error('All failover providers failed');
  }

  calculateHealthScore(providerInfo, providerName) {
    const {stats, health} = providerInfo;
    const scoreResult = this.healthScoring.calculateScore({
      successRate: stats ? stats.successRate : 1.0,
      avgResponseTime: stats ? stats.avgResponseTime : 0,
      totalRequests: stats ? stats.totalRequests : 0,
      lastCheck: health ? health.timestamp : Date.now(),
      recentResponseTimes: stats ? stats.recentResponseTimes : []
    }, { provider: providerName });
    return scoreResult.score;
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      return; // Already running
    }

    logger.info('Starting health monitoring');

    this.healthCheckInterval = setInterval(async () => {
      const checkPromises = [];
      
      // Limit concurrency: split providers into chunks or just use Promise.all if list is small
      // For enterprise scale (dozens of providers), we might want a concurrency limit.
      // Assuming manageable list for now, we run checks in parallel.
      
      for (const [name, provider] of this.providers) {
        checkPromises.push(
          (async () => {
            try {
              const startTime = performance.now();
              
              if (provider.healthCheck) {
                await provider.healthCheck();
              }
              
              const responseTime = performance.now() - startTime;
              this.metrics.recordHealthCheck(name, true, responseTime);
              // logger.debug(`Health check passed for ${name} in ${responseTime.toFixed(2)}ms`); // Too noisy
            } catch (error) {
              this.metrics.recordHealthCheck(name, false, null);
              logger.warn(`Health check failed for ${name}: ${error.message}`);
            }
          })()
        );
      }
      
      await Promise.all(checkPromises);
      
    }, this.config.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Get provider performance report
   */
  getPerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      providers: {},
      system: {
        totalProviders: this.providers.size,
        healthyProviders: 0,
        strugglingProviders: 0
      }
    };

    for (const name of this.providers.keys()) {
      const stats = this.metrics.getProviderStats(name);
      const health = this.metrics.healthChecks.get(name);
      const score = this.calculateHealthScore({stats, health}, name);

      report.providers[name] = {
        healthScore: score,
        stats,
        health,
        circuitBreakerState: this.circuitBreakers.get(name)?.getState() || {state: 'UNKNOWN'}
      };

      if (score >= 70) {
        report.system.healthyProviders++;
      } else if (score < 50) {
        report.system.strugglingProviders++;
      }
    }

    return report;
  }

  getMetricsSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      providers: {}
    };

    for (const [name, breaker] of this.circuitBreakers) {
      const stats = this.metrics.getProviderStats(name);
      const state = breaker.getState();
      
      snapshot.providers[name] = {
        circuit_state: state.state === 'OPEN' ? 0 : 1, // 1=Healthy(Closed/Half), 0=Unhealthy(Open)
        failures: state.failures,
        success_rate: stats ? stats.successRate : 1,
        avg_latency: stats ? stats.avgResponseTime : 0,
        total_requests: stats ? stats.totalRequests : 0
      };
    }
    return snapshot;
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info('Shutting down provider proxy');
    this.stopHealthMonitoring();
    this.removeAllListeners();
  }
}

// Enhanced retry logic with exponential backoff
async function enhancedRetry(fn, options = {}) {
  const {
    maxAttempts = CONFIG.RETRY_ATTEMPTS,
    delay = CONFIG.RETRY_DELAY,
    backoff = 2,
    onRetry = () => {
    }
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      const retryDelay = delay * Math.pow(backoff, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${retryDelay}ms: ${error.message}`);

      onRetry(attempt, error, retryDelay);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError;
}

export default ProviderProxy;
export {
  enhancedRetry,
  ProviderMetrics,
  AdaptiveCircuitBreaker as CircuitBreaker,
  RetryManager,
  CONFIG
};

