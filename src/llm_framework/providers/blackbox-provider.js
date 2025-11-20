/**
 * Blackbox MCP Provider
 * Integrates Blackbox.ai cloud API as a provider in the Enhanced Autonomous Framework
 * Auto-discovered by the Provider Proxy (Layer 5)
 */

import axios from 'axios';

class BlackboxProvider {
  constructor(config = {}) {
    this.name = 'blackbox';
    this.url = config.url || process.env.BLACKBOX_MCP_URL || 'https://cloud.blackbox.ai/api/mcp';
    this.headers = this.parseHeaders(config.headers || process.env.BLACKBOX_MCP_HEADERS);
    this.protocol = config.protocol || process.env.BLACKBOX_MCP_PROTOCOL || 'http';
    this.timeout = config.timeout || 30000;

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0
    };
  }

  parseHeaders(headerString) {
    if (!headerString) return {};

    const headers = {};
    if (headerString.includes(':')) {
      const [key, ...valueParts] = headerString.split(':');
      headers[key.trim()] = valueParts.join(':').trim();
    }
    return headers;
  }

  /**
   * Generate response using Blackbox MCP API
   */
  async generate(prompt, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await axios.post(
        this.url,
        {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: options.model || 'gpt-3.5-turbo',
          stream: false,
          ...options
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers
          },
          timeout: this.timeout
        }
      );

      const duration = Date.now() - startTime;
      this.updateMetrics(true, duration);

      // Extract response based on API format
      const text = response.data?.choices?.[0]?.message?.content
                || response.data?.response
                || response.data?.text
                || JSON.stringify(response.data);

      return {
        text,
        model: response.data?.model || 'blackbox',
        usage: response.data?.usage,
        metadata: {
          provider: 'blackbox',
          duration,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(false, duration);

      throw new Error(`Blackbox API error: ${error.message}`);
    }
  }

  /**
   * Health check - verifies Blackbox API is accessible
   */
  async healthCheck() {
    try {
      const response = await axios.get(this.url, {
        headers: this.headers,
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept 4xx as "healthy" (auth errors are expected without valid request)
      });

      return response.status < 500;
    } catch (error) {
      // Network errors mean unhealthy
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return false;
      }
      // 4xx errors are acceptable for health check (means endpoint exists)
      return error.response?.status < 500;
    }
  }

  /**
   * Update internal metrics
   */
  updateMetrics(success, duration) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    const totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.avgResponseTime =
      (this.metrics.avgResponseTime * (totalRequests - 1) + duration) / totalRequests;
  }

  /**
   * Get provider statistics
   */
  getStats() {
    return {
      name: this.name,
      url: this.url,
      metrics: this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? this.metrics.successfulRequests / this.metrics.totalRequests
        : 0
    };
  }
}

export default BlackboxProvider;

