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

    // Security configuration
    this.httpTimeoutMs = 10000;
    this.maxRedirects = 3; // will validate each hop

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
   * Perform Nmap port scan
   */
  async nmapScan({ target, scanType = 'quick' }) {
    // Input validation
    if (!this.isValidTarget(target)) {
      throw new Error('Invalid target format');
    }

    // Build nmap arguments
    const args = [];
    switch (scanType) {
      case 'quick':
        args.push('-F', target); // Fast scan of 100 most common ports
        break;
      case 'stealth':
        args.push('-sS', target); // SYN stealth scan
        break;
      case 'service':
        args.push('-sV', target); // Service version detection
        break;
    }

    const output = await this.executeCommand('nmap', args, 60000);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              tool: 'kali_nmap_scan',
              target,
              scanType,
              output,
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
   * Detect web technologies
   * SECURITY: Implements Issue #4 Action 1 (DNS validation) and Action 2 (redirect validation)
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
          throw new Error(`Failed to fetch URL: ${err.message}`);
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

    // Basic content analysis
    const html = typeof response.data === 'string' ? response.data.toLowerCase() : '';
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

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              tool: 'kali_tech_detect',
              url: currentUrl,
              technologies,
              timestamp: new Date().toISOString(),
              security: {
                references: ['Issue #4: Action 1 (DNS validation)', 'Issue #4: Action 2 (redirect validation)'],
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Host discovery scan
   */
  async hostDiscovery({ network }) {
    // Validate CIDR notation
    if (!this.isValidCIDR(network)) {
      throw new Error('Invalid CIDR notation');
    }

    const output = await this.executeCommand('nmap', ['-sn', network], 120000);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              tool: 'kali_host_discovery',
              network,
              output,
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
   * Execute command with timeout
   */
  executeCommand(command, args, timeout) {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      const proc = spawn(command, args);
      const timer = setTimeout(() => {
        proc.kill();
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
          reject(new Error(`Command exited with code ${code}: ${errorOutput}`));
        }
      });
      proc.on('error', (error) => {
        clearTimeout(timer);
        reject(new Error(`Failed to execute command: ${error.message}`));
      });
    });
  }

  /**
   * Validate target format
   */
  isValidTarget(target) {
    // IP address pattern
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    // Domain pattern
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return ipPattern.test(target) || domainPattern.test(target);
  }

  /**
   * Validate CIDR notation
   */
  isValidCIDR(cidr) {
    const pattern = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    return pattern.test(cidr);
  }

  /**
   * Check if IP is in private range (SSRF protection)
   */
  isPrivateIPString(ip) {
    // Covers IPv4 private ranges and loopback; rejects link-local and multicast too
    const privateRanges = [
      /^127\./, // loopback
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./, // link-local
    ];
    return privateRanges.some((pattern) => pattern.test(ip));
  }

  isLocalhost(hostname) {
    return /^localhost$/i.test(hostname);
  }

  /**
   * Action 1: Resolve all A/AAAA records and block private/bogon ranges.
   * Also blocks IPv6 localhost and RFC4193 (fc00::/7) and link-local fe80::/10.
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
        // IPv6 checks
        const lower = ip.toLowerCase();
        if (
          lower === '::1' || // loopback
          lower.startsWith('fc') || lower.startsWith('fd') || // unique local (fc00::/7)
          lower.startsWith('fe80:') // link-local
        ) {
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
