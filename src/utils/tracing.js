/**
 * Simple Tracing Module for MCP Servers
 * Provides console-based tracing for debugging and performance monitoring
 * 
 * @module tracing
 */

import { logger } from './logger.js';

/**
 * Tracing configuration class
 */
class TracingConfig {
  constructor() {
    this.isInitialized = false;
    this.serviceName = 'mcp-server';
    this.traces = [];
  }

  /**
   * Initialize tracing
   * @param {Object} config - Configuration options
   * @param {string} config.serviceName - Name of the service
   * @param {string} config.serviceVersion - Version of the service
   */
  initialize(config = {}) {
    if (this.isInitialized) {
      logger.warn('Tracing already initialized');
      return;
    }

    this.serviceName = config.serviceName || 'mcp-server';
    this.serviceVersion = config.serviceVersion || '1.0.0';
    this.isInitialized = true;

    logger.info(`✅ Tracing initialized for service: ${this.serviceName}@${this.serviceVersion}`);
  }

  /**
   * Create a span for an operation
   * @param {string} name - Span name
   * @param {Function} fn - Function to execute within span
   * @param {Object} attributes - Span attributes
   * @returns {Promise<*>} Result of the function
   */
  async trace(name, fn, attributes = {}) {
    const spanId = Math.random().toString(36).substring(7);
    const startTime = Date.now();

    logger.info(`▶️  [${spanId}] START: ${name}`, attributes);

    try {
      const result = await fn({ setAttribute: (k, v) => attributes[k] = v });
      const duration = Date.now() - startTime;

      logger.info(`✅ [${spanId}] SUCCESS: ${name} (${duration}ms)`, attributes);

      this.traces.push({
        spanId,
        name,
        status: 'OK',
        duration,
        attributes,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`❌ [${spanId}] ERROR: ${name} (${duration}ms)`, {
        error: error.message,
        ...attributes
      });

      this.traces.push({
        spanId,
        name,
        status: 'ERROR',
        duration,
        error: error.message,
        attributes,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Trace a tool execution
   * @param {string} toolName - Name of the tool
   * @param {Object} params - Tool parameters
   * @param {Function} fn - Tool execution function
   * @returns {Promise<*>} Tool execution result
   */
  async traceTool(toolName, params, fn) {
    return this.trace(
      `tool.${toolName}`,
      async (span) => {
        span.setAttribute('mcp.tool.name', toolName);
        span.setAttribute('mcp.tool.params', JSON.stringify(params));

        const result = await fn();

        span.setAttribute('mcp.tool.status', 'success');
        return result;
      },
      {
        'mcp.component': 'tool',
        'mcp.tool.name': toolName,
      }
    );
  }

  /**
   * Trace an MCP request
   * @param {string} requestType - Type of request
   * @param {Object} details - Request details
   * @param {Function} fn - Request handler function
   * @returns {Promise<*>} Request result
   */
  async traceRequest(requestType, details, fn) {
    return this.trace(
      `mcp.request.${requestType}`,
      async (span) => {
        span.setAttribute('mcp.request.type', requestType);
        if (details) {
          Object.entries(details).forEach(([key, value]) => {
            span.setAttribute(`mcp.request.${key}`,
              typeof value === 'object' ? JSON.stringify(value) : String(value));
          });
        }

        return await fn();
      },
      {
        'mcp.component': 'request',
        'mcp.request.type': requestType,
      }
    );
  }

  /**
   * Get trace summary
   */
  getSummary() {
    const total = this.traces.length;
    const successful = this.traces.filter(t => t.status === 'OK').length;
    const failed = this.traces.filter(t => t.status === 'ERROR').length;
    const avgDuration = total > 0
      ? this.traces.reduce((sum, t) => sum + t.duration, 0) / total
      : 0;

    return {
      total,
      successful,
      failed,
      avgDuration: Math.round(avgDuration),
      traces: this.traces
    };
  }

  /**
   * Shutdown tracing
   */
  async shutdown() {
    if (this.isInitialized) {
      const summary = this.getSummary();
      logger.info('📊 Tracing Summary:', summary);
      logger.info('✅ Tracing shutdown complete');
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const tracing = new TracingConfig();

// Export convenience functions
export const createTrace = (name, fn, attributes) => tracing.trace(name, fn, attributes);
export const traceTool = (toolName, params, fn) => tracing.traceTool(toolName, params, fn);
export const traceRequest = (requestType, details, fn) => tracing.traceRequest(requestType, details, fn);
