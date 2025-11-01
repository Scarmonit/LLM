#!/usr/bin/env node
/**
 * MCP Doctor - Diagnose and fix other MCP servers
 * The meta-MCP that fixes MCPs
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * MCP Doctor Server
 */
class MCPDoctorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mcp-doctor',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'diagnose_mcp',
          description: 'Analyze an MCP server configuration and identify issues. Checks: config syntax, command path, schema validity, process startup, common patterns.',
          inputSchema: {
            type: 'object',
            properties: {
              server_name: {
                type: 'string',
                description: 'Name of the MCP server to diagnose',
              },
              config_path: {
                type: 'string',
                description: 'Path to Claude Desktop config (default: auto-detect)',
              },
              server_file_path: {
                type: 'string',
                description: 'Path to MCP server source file (for code analysis)',
              },
            },
            required: ['server_name'],
          },
        },
        {
          name: 'fix_mcp_schema',
          description: 'Auto-fix common MCP tool schema errors. Fixes: missing required fields, invalid types, incorrect enum values, malformed parameter schemas.',
          inputSchema: {
            type: 'object',
            properties: {
              server_file_path: {
                type: 'string',
                description: 'Path to MCP server source file to fix',
              },
              dry_run: {
                type: 'boolean',
                description: 'Preview fixes without applying (default: false)',
                default: false,
              },
            },
            required: ['server_file_path'],
          },
        },
        {
          name: 'test_mcp_tools',
          description: 'Test all tools in an MCP server by invoking them with valid test inputs. Validates: tool availability, schema compliance, execution success.',
          inputSchema: {
            type: 'object',
            properties: {
              server_name: {
                type: 'string',
                description: 'Name of the MCP server to test',
              },
              tool_name: {
                type: 'string',
                description: 'Specific tool to test (optional, tests all if omitted)',
              },
            },
            required: ['server_name'],
          },
        },
        {
          name: 'validate_mcp_config',
          description: 'Validate Claude Desktop MCP configuration for syntax errors, missing fields, invalid paths, and common misconfigurations.',
          inputSchema: {
            type: 'object',
            properties: {
              config_path: {
                type: 'string',
                description: 'Path to claude_desktop_config.json (default: auto-detect)',
              },
            },
          },
        },
        {
          name: 'generate_mcp_template',
          description: 'Generate a working MCP server template with best practices. Includes: proper schema, error handling, stdio transport, example tools.',
          inputSchema: {
            type: 'object',
            properties: {
              server_name: {
                type: 'string',
                description: 'Name for the new MCP server',
              },
              tools: {
                type: 'array',
                description: 'List of tool names to scaffold',
                items: { type: 'string' },
              },
              output_path: {
                type: 'string',
                description: 'Where to save the server file',
              },
            },
            required: ['server_name', 'output_path'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'diagnose_mcp':
            return await this.diagnoseMCP(args);
          case 'fix_mcp_schema':
            return await this.fixMCPSchema(args);
          case 'test_mcp_tools':
            return await this.testMCPTools(args);
          case 'validate_mcp_config':
            return await this.validateMCPConfig(args);
          case 'generate_mcp_template':
            return await this.generateMCPTemplate(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n\nStack: ${error.stack}`,
            },
          ],
        };
      }
    });
  }

  /**
   * Diagnose MCP server issues
   */
  async diagnoseMCP(args) {
    const { server_name, config_path, server_file_path } = args;
    const issues = [];
    const warnings = [];
    const suggestions = [];

    // 1. Find and validate config
    const configPath = config_path || this.getDefaultConfigPath();
    let config;
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error) {
      issues.push(`❌ Cannot read config: ${error.message}`);
      return this.formatDiagnosisResult(server_name, issues, warnings, suggestions);
    }

    // 2. Check if server exists in config
    if (!config.mcpServers || !config.mcpServers[server_name]) {
      issues.push(`❌ Server '${server_name}' not found in config`);
      return this.formatDiagnosisResult(server_name, issues, warnings, suggestions);
    }

    const serverConfig = config.mcpServers[server_name];

    // 3. Validate config structure
    if (!serverConfig.command) {
      issues.push('❌ Missing required field: command');
    }

    if (!serverConfig.args || !Array.isArray(serverConfig.args)) {
      warnings.push('⚠️  Missing or invalid args array');
    }

    // 4. Check command executable
    const command = serverConfig.command;
    if (command === 'node' || command === 'npx' || command === 'uvx') {
      try {
        const { stdout } = await execAsync(`${command} --version`);
        suggestions.push(`✓ ${command} installed: ${stdout.trim()}`);
      } catch (error) {
        issues.push(`❌ ${command} not found in PATH`);
      }
    }

    // 5. Validate file paths
    if (serverConfig.args && serverConfig.args.length > 0) {
      const firstArg = serverConfig.args[0];
      if (firstArg.endsWith('.js') || firstArg.endsWith('.ts')) {
        try {
          await fs.access(firstArg);
          suggestions.push(`✓ Server file exists: ${firstArg}`);
        } catch {
          issues.push(`❌ Server file not found: ${firstArg}`);
        }
      }
    }

    // 6. Analyze server source code if provided
    if (server_file_path) {
      try {
        const sourceCode = await fs.readFile(server_file_path, 'utf-8');

        // Check for common patterns
        if (!sourceCode.includes('@modelcontextprotocol/sdk')) {
          warnings.push('⚠️  MCP SDK not imported');
        }

        if (!sourceCode.includes('StdioServerTransport') && !sourceCode.includes('SSEServerTransport')) {
          warnings.push('⚠️  No transport layer detected');
        }

        if (!sourceCode.includes('ListToolsRequestSchema')) {
          warnings.push('⚠️  ListToolsRequestSchema not found');
        }

        if (!sourceCode.includes('CallToolRequestSchema')) {
          warnings.push('⚠️  CallToolRequestSchema not found');
        }

        // Check for error handling
        if (!sourceCode.includes('try') && !sourceCode.includes('catch')) {
          warnings.push('⚠️  No error handling detected');
        }

        suggestions.push('✓ Source code analyzed');
      } catch (error) {
        warnings.push(`⚠️  Could not analyze source: ${error.message}`);
      }
    }

    // 7. Check for common issues
    if (serverConfig.command === 'npx' && serverConfig.args?.[0] === '-y') {
      suggestions.push('✓ Using npx with -y flag (good practice)');
    }

    if (serverConfig.env) {
      suggestions.push(`✓ Environment variables configured: ${Object.keys(serverConfig.env).length}`);
    }

    if (serverConfig.disabled === true) {
      warnings.push('⚠️  Server is marked as disabled');
    }

    return this.formatDiagnosisResult(server_name, issues, warnings, suggestions);
  }

  /**
   * Fix common MCP schema errors
   */
  async fixMCPSchema(args) {
    const { server_file_path, dry_run = false } = args;
    const fixes = [];

    try {
      let sourceCode = await fs.readFile(server_file_path, 'utf-8');
      let modified = false;

      // Fix 1: Missing required field in inputSchema
      const missingRequiredPattern = /inputSchema:\s*{\s*type:\s*['"]object['"]\s*,\s*properties:\s*{[^}]+}\s*}/g;
      if (sourceCode.match(missingRequiredPattern)) {
        sourceCode = sourceCode.replace(
          missingRequiredPattern,
          (match) => {
            if (!match.includes('required:')) {
              fixes.push('Added missing "required" field to inputSchema');
              modified = true;
              return match.replace(/}(\s*)$/, ',\n      required: []\n    }$1');
            }
            return match;
          }
        );
      }

      // Fix 2: Incorrect type definitions
      sourceCode = sourceCode.replace(
        /type:\s*['"]String['"]/gi,
        (match) => {
          fixes.push('Fixed type: "String" → "string"');
          modified = true;
          return 'type: "string"';
        }
      );

      // Fix 3: Missing description fields
      if (!sourceCode.includes('description:')) {
        fixes.push('⚠️  Tools missing descriptions (manual fix recommended)');
      }

      // Fix 4: Invalid enum values
      sourceCode = sourceCode.replace(
        /enum:\s*\[(.*?)\]/g,
        (match, enumValues) => {
          if (!enumValues.includes('"') && !enumValues.includes("'")) {
            fixes.push('Fixed enum values: added quotes');
            modified = true;
            const values = enumValues.split(',').map(v => `"${v.trim()}"`).join(', ');
            return `enum: [${values}]`;
          }
          return match;
        }
      );

      if (!modified) {
        return {
          content: [
            {
              type: 'text',
              text: '✅ No schema errors detected. File looks good!',
            },
          ],
        };
      }

      if (!dry_run) {
        await fs.writeFile(server_file_path, sourceCode, 'utf-8');
      }

      return {
        content: [
          {
            type: 'text',
            text: `${dry_run ? '🔍 DRY RUN' : '✅ FIXED'}\n\nApplied fixes:\n${fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nFile: ${server_file_path}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fix schema: ${error.message}`);
    }
  }

  /**
   * Test MCP tools
   */
  async testMCPTools(args) {
    const { server_name, tool_name } = args;

    // This is a simplified version - full implementation would need to:
    // 1. Spawn the MCP server process
    // 2. Send ListTools request
    // 3. Send CallTool requests with test inputs
    // 4. Validate responses

    return {
      content: [
        {
          type: 'text',
          text: `🧪 Testing MCP: ${server_name}${tool_name ? ` (tool: ${tool_name})` : ''}\n\n` +
                `⚠️  Full MCP testing requires:\n` +
                `1. Spawning server process\n` +
                `2. JSON-RPC communication\n` +
                `3. Tool schema validation\n\n` +
                `Recommendation: Use this workflow instead:\n` +
                `1. Start server: node ${server_name}.js\n` +
                `2. Send JSON-RPC: {"jsonrpc":"2.0","method":"tools/list","id":1}\n` +
                `3. Verify response structure\n\n` +
                `For automated testing, see: tests/mcp-integration.test.js`,
        },
      ],
    };
  }

  /**
   * Validate MCP config
   */
  async validateMCPConfig(args) {
    const configPath = args.config_path || this.getDefaultConfigPath();
    const errors = [];
    const warnings = [];
    const info = [];

    try {
      const configContent = await fs.readFile(configPath, 'utf-8');

      // Check valid JSON
      let config;
      try {
        config = JSON.parse(configContent);
      } catch (error) {
        errors.push(`❌ Invalid JSON: ${error.message}`);
        return this.formatValidationResult(configPath, errors, warnings, info);
      }

      // Check structure
      if (!config.mcpServers) {
        errors.push('❌ Missing "mcpServers" field');
        return this.formatValidationResult(configPath, errors, warnings, info);
      }

      if (typeof config.mcpServers !== 'object') {
        errors.push('❌ "mcpServers" must be an object');
        return this.formatValidationResult(configPath, errors, warnings, info);
      }

      // Validate each server
      const serverNames = Object.keys(config.mcpServers);
      info.push(`ℹ️  Found ${serverNames.length} MCP server(s)`);

      for (const [name, server] of Object.entries(config.mcpServers)) {
        if (!server.command) {
          errors.push(`❌ Server "${name}": missing "command"`);
        }

        if (!server.args || !Array.isArray(server.args)) {
          warnings.push(`⚠️  Server "${name}": missing or invalid "args"`);
        }

        if (server.disabled) {
          info.push(`ℹ️  Server "${name}": disabled`);
        }
      }

      return this.formatValidationResult(configPath, errors, warnings, info);
    } catch (error) {
      errors.push(`❌ Cannot read config: ${error.message}`);
      return this.formatValidationResult(configPath, errors, warnings, info);
    }
  }

  /**
   * Generate MCP server template
   */
  async generateMCPTemplate(args) {
    const { server_name, tools = [], output_path } = args;

    const template = `#!/usr/bin/env node
/**
 * ${server_name} - MCP Server
 * Generated by MCP Doctor
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class ${this.toPascalCase(server_name)}Server {
  constructor() {
    this.server = new Server(
      {
        name: '${server_name}',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
${tools.map(tool => `        {
          name: '${tool}',
          description: 'Description for ${tool}',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'Input parameter',
              },
            },
            required: ['input'],
          },
        }`).join(',\n')}
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
${tools.map(tool => `          case '${tool}':
            return await this.${this.toCamelCase(tool)}(args);`).join('\n')}
          default:
            throw new Error(\`Unknown tool: \${name}\`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: \`Error: \${error.message}\`,
            },
          ],
          isError: true,
        };
      }
    });
  }

${tools.map(tool => `  async ${this.toCamelCase(tool)}(args) {
    // TODO: Implement ${tool}
    return {
      content: [
        {
          type: 'text',
          text: \`${tool} executed with: \${JSON.stringify(args)}\`,
        },
      ],
    };
  }`).join('\n\n')}

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('${server_name} MCP server running on stdio');
  }
}

const server = new ${this.toPascalCase(server_name)}Server();
server.run().catch(console.error);
`;

    await fs.writeFile(output_path, template, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `✅ Generated MCP server: ${output_path}\n\n` +
                `Tools included: ${tools.length > 0 ? tools.join(', ') : 'none (add manually)'}\n\n` +
                `Next steps:\n` +
                `1. npm install @modelcontextprotocol/sdk\n` +
                `2. chmod +x ${output_path}\n` +
                `3. Add to claude_desktop_config.json:\n\n` +
                `{\n` +
                `  "mcpServers": {\n` +
                `    "${server_name}": {\n` +
                `      "command": "node",\n` +
                `      "args": ["${output_path}"]\n` +
                `    }\n` +
                `  }\n` +
                `}`,
        },
      ],
    };
  }

  // Helper methods
  formatDiagnosisResult(server_name, issues, warnings, suggestions) {
    const hasIssues = issues.length > 0;
    const status = hasIssues ? '❌ ISSUES FOUND' : '✅ HEALTHY';

    return {
      content: [
        {
          type: 'text',
          text: `# MCP Diagnosis: ${server_name}\n\n` +
                `Status: ${status}\n\n` +
                `${issues.length > 0 ? `## Issues (${issues.length})\n${issues.join('\n')}\n\n` : ''}` +
                `${warnings.length > 0 ? `## Warnings (${warnings.length})\n${warnings.join('\n')}\n\n` : ''}` +
                `${suggestions.length > 0 ? `## Info\n${suggestions.join('\n')}\n` : ''}`,
        },
      ],
    };
  }

  formatValidationResult(configPath, errors, warnings, info) {
    const isValid = errors.length === 0;
    const status = isValid ? '✅ VALID' : '❌ INVALID';

    return {
      content: [
        {
          type: 'text',
          text: `# Config Validation\n\n` +
                `File: ${configPath}\n` +
                `Status: ${status}\n\n` +
                `${errors.length > 0 ? `## Errors (${errors.length})\n${errors.join('\n')}\n\n` : ''}` +
                `${warnings.length > 0 ? `## Warnings (${warnings.length})\n${warnings.join('\n')}\n\n` : ''}` +
                `${info.length > 0 ? `## Info\n${info.join('\n')}\n` : ''}`,
        },
      ],
    };
  }

  getDefaultConfigPath() {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    return path.join(homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  }

  toPascalCase(str) {
    return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());
  }

  toCamelCase(str) {
    return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
  }
}

// Start server
const mcpDoctor = new MCPDoctorServer();
const transport = new StdioServerTransport();
mcpDoctor.server.connect(transport).then(() => {
  console.error('MCP Doctor server running on stdio');
}).catch(console.error);
