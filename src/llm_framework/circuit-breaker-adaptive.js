export default class AdaptiveCircuitBreaker {
  constructor(options = {}) {
    this.baseThreshold = options.threshold || 5;
    this.timeout = options.timeout || 60000;
    this.failureWindow = options.failureWindow || 60000; // 1 minute window
    this.minRequests = options.minRequests || 10; // Minimum requests before circuit can open
    
    this.failures = [];
    this.lastFailureTime = null;
    this.state = 'CLOSED';
    this.requestCount = 0;
    this.eventListeners = {};
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  get adaptiveThreshold() {
    const now = Date.now();
    const recentFailures = this.failures.filter(f => now - f.timestamp < this.failureWindow);
    const recentRequests = this.requestCount;
    
    // Don't open circuit if minimum requests not met
    if (recentRequests < this.minRequests) return Infinity;
    
    // Adapt threshold based on recent failure rate
    const failureRate = recentFailures.length / recentRequests;
    
    // More aggressive for high-failure providers
    if (failureRate > 0.5) return Math.max(2, this.baseThreshold - 2);
    if (failureRate > 0.3) return this.baseThreshold;
    if (failureRate > 0.1) return this.baseThreshold + 1;
    return this.baseThreshold + 2;
  }

  async execute(operation) {
    this.requestCount++;
    
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.requestCount = 0; // Reset request count
        this.failures.length = 0; // Clear old failures
      } else {
        throw new Error(`Circuit breaker is OPEN (${this.failures.length}/${this.adaptiveThreshold} failures)`);
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
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures.length = 0; // Clear failure history
      this.requestCount = 0;
      // console.log('✅ Circuit breaker: ADAPTED - Reset to CLOSED'); // Reduce noise
    }
  }

  onFailure() {
    const now = Date.now();
    this.failures.push({ timestamp: now });
    
    // Keep only recent failures
    this.failures = this.failures.filter(f => now - f.timestamp < this.failureWindow);
    
    this.lastFailureTime = now;
    
    const currentThreshold = this.adaptiveThreshold;

    if (this.failures.length >= currentThreshold && this.state !== 'OPEN') {
      this.state = 'OPEN';
      console.log(`⚠️ Circuit breaker: ADAPTED - OPEN (${this.failures.length}/${currentThreshold} failures)`);
      this.emit('circuitBreakerAdapted', {
        state: 'OPEN',
        failures: this.failures.length,
        threshold: currentThreshold,
        failureRate: this.failures.length / Math.max(this.requestCount, 1)
      });
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures.length,
      adaptiveThreshold: this.adaptiveThreshold,
      failureRate: this.failures.length / Math.max(this.requestCount, 1),
      lastFailureTime: this.lastFailureTime,
      requestCount: this.requestCount
    };
  }
}
