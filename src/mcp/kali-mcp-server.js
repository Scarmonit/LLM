#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import axios from 'axios';
import { URL } from 'url';
import { promises as dns } from 'dns';

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

    // DNS resolution and SSRF protection
    await this.resolveAndValidate(target);

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
      default:
        throw new Error(`Invalid scanType: ${scanType}`);
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
   */
  async techDetect({ url }) {
    // Validate and parse URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // DNS resolution and SSRF protection
    await this.resolveAndValidate(parsedUrl.hostname);

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 3,
        headers: {
          'User-Agent': 'Kali-MCP-Server/1.0',
        },
        validateStatus: function (status) {
          // Accept only 2xx status codes
          return status >= 200 && status < 300;
        },
        beforeRedirect: (options, responseDetails) => {
          // SSRF protection: check redirect target
          try {
            const redirectUrl = new URL(options.href || options.protocol + '//' + options.hostname + options.path);
            // Synchronously check if hostname matches private IP patterns
            if (this.isPrivateIP(redirectUrl.hostname)) {
              throw new Error('Redirect to private IP ranges is not allowed');
            }
          } catch (err) {
            throw new Error('Invalid redirect URL');
          }
        },
      });

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
      let html = '';
      if (typeof response.data === 'string') {
        html = response.data.toLowerCase();
      }

      // React detection: look for data-reactroot attribute or react script
      if (/<[^>]+data-reactroot/.test(html) || /<script[^>]+src=["'][^"']*react[^"']*["']/.test(html)) {
        technologies.push({
          name: 'React',
          category: 'JavaScript Framework',
          confidence: 'high',
        });
      }
      // Vue.js detection: look for vue script or id="app" element
      if (/<script[^>]+src=["'][^"']*vue(\.js)?[^"']*["']/.test(html) || /<div[^>]+id=["']app["']/.test(html)) {
        technologies.push({
          name: 'Vue.js',
          category: 'JavaScript Framework',
          confidence: 'high',
        });
      }
      // Angular detection: look for ng-app/ng-version attributes or angular script
      if (/<[^>]+ng-app/.test(html) || /<[^>]+ng-version/.test(html) || /<script[^>]+src=["'][^"']*angular[^"']*["']/.test(html)) {
        technologies.push({
          name: 'Angular',
          category: 'JavaScript Framework',
          confidence: 'high',
        });
      }
      // WordPress detection: look for generator meta tag or /wp-content/ URLs
      if (/<meta[^>]+name=["']generator["'][^>]+content=["']wordpress[^"']*["']/.test(html) || /\/wp-content\//.test(html)) {
        technologies.push({
          name: 'WordPress',
          category: 'CMS',
          confidence: 'medium',
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                tool: 'kali_tech_detect',
                url,
                technologies,
                timestamp: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
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
        proc.kill('SIGKILL');
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
    // IP address validation with octet range check
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = target.match(ipPattern);
    if (ipMatch) {
      const octets = ipMatch.slice(1, 5).map(Number);
      // Validate each octet is between 0-255
      if (octets.every(o => o >= 0 && o <= 255)) {
        return true;
      }
      return false;
    }
    
    // Domain pattern
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

    return domainPattern.test(target);
  }

  /**
   * Validate CIDR notation
   */
  isValidCIDR(cidr) {
    // Match and extract octets and mask
    const match = cidr.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
    if (!match) return false;
    const [_, o1, o2, o3, o4, mask] = match;
    const octets = [o1, o2, o3, o4].map(Number);
    const maskNum = Number(mask);
    // Validate octets and mask ranges
    if (octets.some(o => o < 0 || o > 255)) return false;
    if (maskNum < 0 || maskNum > 32) return false;
    return true;
  }

  /**
   * Check if IP is in private range (SSRF protection)
   */
  isPrivateIP(hostname) {
    const privateRanges = [
      /^127\./,                              // Loopback
      /^10\./,                               // Private Class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,     // Private Class B
      /^192\.168\./,                         // Private Class C
      /^169\.254\./,                         // Link-local
      /^localhost$/i,                        // Localhost
      /^::1$/,                               // IPv6 loopback
      /^fe80:/i,                             // IPv6 link-local
      /^fc00:/i,                             // IPv6 unique local
      /^fd00:/i,                             // IPv6 unique local
    ];

    return privateRanges.some((pattern) => pattern.test(hostname));
  }

  /**
   * Resolve hostname to IP and validate against private ranges (DNS rebinding protection)
   */
  async resolveAndValidate(hostname) {
    // If already an IP, validate it directly
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipPattern.test(hostname)) {
      if (this.isPrivateIP(hostname)) {
        throw new Error('Access to private IP ranges is not allowed');
      }
      return;
    }

    // Check hostname pattern first
    if (this.isPrivateIP(hostname)) {
      throw new Error('Access to private IP ranges is not allowed');
    }

    // Resolve DNS with timeout
    try {
      const addresses = await Promise.race([
        dns.lookup(hostname, { all: true }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DNS lookup timeout')), 5000)
        ),
      ]);

      // Validate all resolved IPs
      for (const addr of addresses) {
        if (this.isPrivateIP(addr.address)) {
          throw new Error(`DNS resolves to private IP: ${addr.address}`);
        }
      }
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        throw new Error(`Unable to resolve hostname: ${hostname}`);
      }
      throw error;
    }
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
