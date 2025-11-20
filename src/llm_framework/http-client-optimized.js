/**
 * Optimized HTTP Client
 * Layer 5: Performance Optimization
 * 
 * Features:
 * - Connection Pooling (Keep-Alive)
 * - Optimized Timeouts
 * - Automatic Retries (via axios-retry if needed, but handled by proxy mostly)
 * - Compression support
 */

import axios from 'axios';
import http from 'http';
import https from 'https';

// Create optimized agents with Keep-Alive enabled
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
});

// Create configured axios instance
const httpClient = axios.create({
  timeout: 30000, // 30s request timeout
  httpAgent,
  httpsAgent,
  headers: {
    'Accept-Encoding': 'gzip, deflate, br', // Compression
    'User-Agent': 'Enhanced-Autonomous-Framework/2.1'
  },
  // Don't throw on 4xx/5xx immediately if we want to handle status codes manually
  validateStatus: function (status) {
    return status >= 200 && status < 300; 
  },
});

export default httpClient;
export { httpAgent, httpsAgent };
