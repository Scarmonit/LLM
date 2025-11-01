#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import axios from 'axios';
import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

/**
 * Kali Linux MCP Server
 * Provides security scanning tools via Model Context Protocol
 */
class KaliMCPServer {
  // Configuration constants
  static HTTP_TIMEOUT_MS = 10000;
  static MAX_REDIRECTS = 3;
  static NMAP_SCAN_TIMEOUT_MS = 60000;
  static HOST_DISCOVERY_TIMEOUT_MS = 120000;
  static MAX_HTML_ANALYSIS_LENGTH = 1000000; // 1MB limit for HTML analysis

  constructor() {
    this.server = new Server(
      {
        name: 'kali-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Security configuration (use class constants)
    this.httpTimeoutMs = KaliMCPServer.HTTP_TIMEOUT_MS;
    this.maxRedirects = KaliMCPServer.MAX_REDIRECTS;

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'kali_nmap_scan',
          description: 'Perform Nmap port scan on target IP or domain. Supports quick, stealth, and service detection scans.',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'string',
                description: 'Target IP address or domain name',
              },
              scanType: {
                type: 'string',
                enum: ['quick', 'stealth', 'service'],
                default: 'quick',
                description: 'Scan type: quick (-F), stealth (-sS), or service (-sV)',
              },
            },
            required: ['target'],
          },
        },
        {
          name: 'kali_tech_detect',
          description: 'Detect web technologies and frameworks from a URL',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'Full URL with protocol (http:// or https://)',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'kali_host_discovery',
          description: 'Discover active hosts in a network range',
          inputSchema: {
            type: 'object',
            properties: {
              network: {
                type: 'string',
                description: 'Network range in CIDR notation (e.g., 192.168.1.0/24)',
              },
            },
            required: ['network'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'kali_nmap_scan':
            return await this.nmapScan(request.params.arguments);
          case 'kali_tech_detect':
            return await this.techDetect(request.params.arguments);
          case 'kali_host_discovery':
            return await this.hostDiscovery(request.params.arguments);
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: error.message,
                  tool: request.params.name,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Perform Nmap port scan with SSRF protection
   * SECURITY: Fixed Issue #4 - Added DNS validation for SSRF protection
   * @param {Object} params - Parameters object
   * @param {string} params.target - Target IP address or domain name
   * @param {string} [params.scanType='quick'] - Scan type (quick, stealth, service)
   * @returns {Promise<Object>} MCP response with scan results
   */
  async nmapScan({ target, scanType = 'quick' }) {
    // Input validation with strict IP/CIDR checks
    if (!this.isValidTarget(target)) {
      throw new Error('Invalid target format');
    }

    // SSRF protection: Validate DNS if target is a domain
    if (!this.isValidIPAddress(target)) {
      // It's a domain, validate DNS resolution
      await this.validateDnsResolution(target);
    } else {
      // It's an IP, validate it's not private
      if (this.isPrivateIPString(target)) {
        throw new Error('Access to private IP ranges is not allowed');
      }
    }

    // Build nmap arguments using tool registry
    const output = await this.executeNmapScan(target, scanType);
    return this.formatResponse('kali_nmap_scan', { target, scanType, output });
  }

  /**
   * Execute nmap scan with specified type
   * SECURITY: Fixed Issue #4 - Refactored switch to tool registry pattern
   * @param {string} target - Target IP or domain
   * @param {string} scanType - Scan type (quick, stealth, service)
   * @returns {Promise<string>} Nmap command output
   */
  async executeNmapScan(target, scanType) {
    const scanConfigs = {
      quick: ['-F', target],
      stealth: ['-sS', target],
      service: ['-sV', target],
    };

    const args = scanConfigs[scanType];
    if (!args) {
      throw new Error(`Invalid scan type: ${scanType}`);
    }

    return await this.executeCommand('nmap', args, KaliMCPServer.NMAP_SCAN_TIMEOUT_MS);
  }

  /**
   * Detect web technologies from URL with SSRF protection
   * SECURITY: Implements Issue #4 Action 1 (DNS validation) and Action 2 (redirect validation)
   * @param {Object} params - Parameters object
   * @param {string} params.url - Full URL with protocol (http:// or https://)
   * @returns {Promise<Object>} MCP response with detected technologies
   */
  async techDetect({ url }) {
    // Validate and parse URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol');
    }

    // Resolve and validate DNS before any request (Action 1)
    await this.validateDnsResolution(parsedUrl.hostname);

    // Perform HTTP request with manual redirect handling (Action 2)
    const maxHops = this.maxRedirects;
    let currentUrl = parsedUrl.toString();
    let hops = 0;
    const client = axios.create({
      maxRedirects: 0, // we will follow manually
      timeout: this.httpTimeoutMs,
      validateStatus: (s) => s >= 200 && s < 400, // accept 3xx for manual handling
      headers: {
        'User-Agent': 'Kali-MCP-Server/1.0',
      },
    });

    let response;
    while (hops <= maxHops) {
      try {
        response = await client.get(currentUrl);
      } catch (err) {
        // If axios threw on 3xx due to validateStatus, capture response
        if (err.response) {
          response = err.response;
        } else {
          // Sanitize error message - don't expose internal details
          throw new Error('Failed to fetch URL: Network or timeout error');
        }
      }

      // If 3xx, validate redirect target before following
      if (response.status >= 300 && response.status < 400) {
        const loc = response.headers.location;
        if (!loc) throw new Error('Redirect without Location header blocked');

        // Resolve relative URL against the current one
        const nextUrl = new URL(loc, currentUrl);

        // Validate protocol
        if (!['http:', 'https:'].includes(nextUrl.protocol)) {
          throw new Error('Blocked redirect to unsupported protocol');
        }

        // Validate DNS for the redirect target (Action 1 applied to redirect)
        await this.validateDnsResolution(nextUrl.hostname);

        currentUrl = nextUrl.toString();
        hops += 1;
        if (hops > maxHops) throw new Error('Too many redirects');
        continue;
      }

      // 2xx response, proceed to detection
      break;
    }

    const technologies = [];
    // Analyze headers
    if (response.headers.server) {
      technologies.push({
        name: response.headers.server,
        category: 'Server',
        confidence: 'high',
      });
    }
    if (response.headers['x-powered-by']) {
      technologies.push({
        name: response.headers['x-powered-by'],
        category: 'Framework',
        confidence: 'high',
      });
    }

    // Basic content analysis with size limit for performance
    let html = '';
    if (typeof response.data === 'string') {
      const truncated = response.data.length > KaliMCPServer.MAX_HTML_ANALYSIS_LENGTH
        ? response.data.substring(0, KaliMCPServer.MAX_HTML_ANALYSIS_LENGTH)
        : response.data;
      html = truncated.toLowerCase();
    }

    if (html.includes('react')) {
      technologies.push({ name: 'React', category: 'JavaScript Framework', confidence: 'medium' });
    }
    if (html.includes('vue')) {
      technologies.push({ name: 'Vue.js', category: 'JavaScript Framework', confidence: 'medium' });
    }
    if (html.includes('angular')) {
      technologies.push({ name: 'Angular', category: 'JavaScript Framework', confidence: 'medium' });
    }
    if (html.includes('wordpress')) {
      technologies.push({ name: 'WordPress', category: 'CMS', confidence: 'high' });
    }

    return this.formatResponse('kali_tech_detect', {
      url: currentUrl,
      technologies,
      security: {
        references: ['Issue #4: Action 1 (DNS validation)', 'Issue #4: Action 2 (redirect validation)'],
      },
    });
  }

  /**
   * Host discovery scan
   * Scans a network range for active hosts
   * @param {Object} params - Parameters object
   * @param {string} params.network - Network in CIDR notation (e.g., 192.168.1.0/24)
   * @returns {Promise<Object>} MCP response with discovered hosts
   */
  async hostDiscovery({ network }) {
    // Validate CIDR notation
    if (!this.isValidCIDR(network)) {
      throw new Error('Invalid CIDR notation');
    }

    const output = await this.executeCommand('nmap', ['-sn', network], KaliMCPServer.HOST_DISCOVERY_TIMEOUT_MS);
    return this.formatResponse('kali_host_discovery', { network, output });
  }

  /**
   * Format MCP response with standard structure
   * @param {string} tool - Tool name
   * @param {Object} data - Response data
   * @returns {Object} Formatted MCP response
   */
  formatResponse(tool, data) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              tool,
              ...data,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Execute command with timeout and forced termination
   * SECURITY: Fixed Issue #4 Item 7 - Use SIGKILL for timeout
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<string>} Command output
   */
  executeCommand(command, args, timeout) {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      const proc = spawn(command, args);
      const timer = setTimeout(() => {
        proc.kill('SIGKILL'); // Force kill on timeout
        reject(new Error(`Command timeout after ${timeout}ms`));
      }, timeout);
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(output);
        } else {
          // Sanitize error - don't expose internal command output
          reject(new Error(`Command exited with code ${code}`));
        }
      });
      proc.on('error', (error) => {
        clearTimeout(timer);
        // Sanitize error - don't expose system details
        reject(new Error('Failed to execute command: Command not found or permission denied'));
      });
    });
  }

  /**
   * Validate target format (IP or domain)
   * @param {string} target - Target to validate
   * @returns {boolean} True if target is valid IP or domain
   */
  isValidTarget(target) {
    return this.isValidIPAddress(target) || this.isValidDomain(target);
  }

  /**
   * Validate IPv4 address with proper octet checking
   * SECURITY: Fixed Issue #4 Item 3 - Strict IP validation
   * @param {string} ip - IPv4 address to validate
   * @returns {boolean} True if valid IPv4 address
   */
  isValidIPAddress(ip) {
    const octets = ip.split('.');
    if (octets.length !== 4) return false;
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255 && octet === num.toString();
    });
  }

  /**
   * Validate domain name format
   * @param {string} domain - Domain name to validate
   * @returns {boolean} True if valid domain format
   */
  isValidDomain(domain) {
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainPattern.test(domain);
  }

  /**
   * Validate CIDR notation with proper IP and mask validation
   * SECURITY: Fixed Issue #4 Item 4 - Strict CIDR validation
   * @param {string} cidr - CIDR notation to validate (e.g., 192.168.1.0/24)
   * @returns {boolean} True if valid CIDR notation
   */
  isValidCIDR(cidr) {
    const [ip, mask] = cidr.split('/');
    if (!mask) return false;
    const maskNum = parseInt(mask, 10);
    if (maskNum < 0 || maskNum > 32) return false;
    return this.isValidIPAddress(ip);
  }

  /**
   * Check if IPv4 is in private range (SSRF protection)
   * SECURITY: Fixed Issue #4 Item 2 - Added cloud metadata and 0.0.0.0 checks
   * @param {string} ip - IPv4 address to check
   * @returns {boolean} True if IP is private/local
   */
  isPrivateIPString(ip) {
    // Cloud metadata endpoint (AWS, GCP, Azure)
    if (ip === '169.254.169.254') return true;

    // Localhost variations
    if (ip === '0.0.0.0' || ip === '127.0.0.1') return true;

    // IPv4 private ranges
    const privateRanges = [
      /^127\./, // loopback
      /^10\./, // Class A private
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
      /^192\.168\./, // Class C private
      /^169\.254\./, // link-local
    ];
    return privateRanges.some((pattern) => pattern.test(ip));
  }

  /**
   * Check if hostname is localhost
   * @param {string} hostname - Hostname to check
   * @returns {boolean} True if hostname is localhost variant
   */
  isLocalhost(hostname) {
    return /^localhost$/i.test(hostname);
  }

  /**
   * Check if IPv6 address is private or local
   * @param {string} ip - IPv6 address
   * @returns {boolean} True if IPv6 is private/local
   */
  isPrivateIPv6(ip) {
    const lower = ip.toLowerCase();
    return (
      lower === '::1' || // loopback
      lower.startsWith('fc') || // unique local fc00::/7
      lower.startsWith('fd') || // unique local fd00::/7
      lower.startsWith('fe80:') || // link-local
      lower.startsWith('fe80::') || // link-local alternate
      lower.startsWith('ff') // multicast
    );
  }

  /**
   * Validate DNS resolution and block private/local IPs (SSRF protection)
   * Action 1: Resolve all A/AAAA records and block private/bogon ranges
   * Also blocks IPv6 localhost and RFC4193 (fc00::/7) and link-local fe80::/10
   * @param {string} hostname - Hostname to resolve and validate
   * @returns {Promise<boolean>} True if validation passes
   * @throws {Error} If DNS resolution fails or resolves to private IP
   */
  async validateDnsResolution(hostname) {
    // Block explicit localhost names early
    if (this.isLocalhost(hostname)) {
      throw new Error('Access to localhost is not allowed');
    }

    let addresses = [];
    try {
      const [a4, a6] = await Promise.allSettled([
        dns.resolve4(hostname),
        dns.resolve6(hostname),
      ]);
      if (a4.status === 'fulfilled') addresses.push(...a4.value);
      if (a6.status === 'fulfilled') addresses.push(...a6.value);
    } catch (e) {
      // ignore, handled below
    }

    if (!addresses.length) {
      // If no addresses resolved, still block if it's obvious localhost
      throw new Error('DNS resolution failed');
    }

    // Validate each IP is public
    for (const ip of addresses) {
      if (net.isIP(ip) === 6) {
        // IPv6 checks using helper method
        if (this.isPrivateIPv6(ip)) {
          throw new Error('Access to private or local IPv6 address is not allowed');
        }
      } else {
        // IPv4 checks
        if (this.isPrivateIPString(ip)) {
          throw new Error('Access to private IP ranges is not allowed');
        }
      }
    }

    // Optional: re-resolve after connection would be ideal; enforced via redirect checks too
    return true;
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kali MCP Server running on stdio');
  }
}

// Start server
const server = new KaliMCPServer();
server.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
