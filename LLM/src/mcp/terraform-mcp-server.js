#!/usr/bin/env node

/**
 * Terraform MCP Server
 * Provides Terraform capabilities via Model Context Protocol
 *
 * Features:
 * - Execute Terraform commands (init, plan, apply, destroy)
 * - Workspace management
 * - State inspection and manipulation
 * - Module validation
 * - Output retrieval
 * - Resource targeting
 *
 * @module terraform-mcp-server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

/**
 * Terraform MCP Server Class
 */
class TerraformMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'terraform-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    logger.info('Terraform MCP Server initialized');
  }

  /**
   * Sanitize argument to prevent command injection
   * @param {string} arg - Argument to sanitize
   * @returns {string} - Sanitized argument
   */
  sanitizeArgument(arg) {
    if (typeof arg !== 'string') {
      throw new Error('Argument must be a string');
    }
    // Reject arguments with shell metacharacters
    if (/[;&|`$(){}[\]<>\\'"!]/.test(arg)) {
      throw new Error(`Invalid argument contains shell metacharacters: ${arg}`);
    }
    return arg;
  }

  /**
   * Sanitize file path to prevent path traversal
   * @param {string} path - Path to sanitize
   * @returns {string} - Sanitized path
   */
  sanitizePath(path) {
    if (typeof path !== 'string') {
      throw new Error('Path must be a string');
    }
    // Reject paths with dangerous patterns
    if (path.includes('..') || /[;&|`$(){}[\]<>\\'"!]/.test(path)) {
      throw new Error(`Invalid path contains dangerous characters: ${path}`);
    }
    return path;
  }

  /**
   * Execute Terraform command
   */
  async executeTerraformCommand(command, args = [], options = {}) {
    try {
      const {
        workingDir = process.cwd(),
        autoApprove = false,
        varFile = null,
        vars = {},
      } = options;

      // Input validation - prevent command injection
      const safeCommand = this.sanitizeArgument(command);
      const safeWorkingDir = this.sanitizePath(workingDir);
      const safeArgs = args.map(arg => this.sanitizeArgument(String(arg)));

      // Build Terraform command with safe arguments
      const cmdParts = ['terraform', safeCommand];

      // Add variable file if specified
      if (varFile) {
        const safeVarFile = this.sanitizePath(varFile);
        cmdParts.push('-var-file', safeVarFile);
      }

      // Add inline variables (sanitize keys and values)
      Object.entries(vars).forEach(([key, value]) => {
        const safeKey = this.sanitizeArgument(String(key));
        const safeValue = this.sanitizeArgument(String(value));
        cmdParts.push('-var', `${safeKey}=${safeValue}`);
      });

      // Add auto-approve for apply/destroy
      if (autoApprove && ['apply', 'destroy'].includes(command)) {
        cmdParts.push('-auto-approve');
      }

      // Add additional arguments
      cmdParts.push(...safeArgs);

      const cmd = cmdParts.join(' ');
      logger.info('Executing Terraform command', { cmd, workingDir: safeWorkingDir });

      const { stdout, stderr } = await execAsync(cmd, {
        cwd: safeWorkingDir,
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large plans
        timeout: 300000, // 5 minute timeout
        shell: true, // Cross-platform shell (cmd.exe on Windows, /bin/sh on Linux)
        env: {
          ...process.env,
          TF_IN_AUTOMATION: '1', // Disable interactive prompts
          TF_INPUT: '0',
        },
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr?.trim() || null,
        command: cmd,
        workingDir,
      };
    } catch (error) {
      logger.error('Terraform command failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        stdout: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || '',
        command: error.cmd,
        workingDir: options.workingDir,
      };
    }
  }

  /**
   * Parse Terraform plan output
   */
  async parsePlan(planOutput) {
    try {
      const lines = planOutput.split('\n');
      const summary = {
        toAdd: 0,
        toChange: 0,
        toDestroy: 0,
        resources: [],
      };

      // Extract plan summary (e.g., "Plan: 3 to add, 2 to change, 1 to destroy")
      const summaryLine = lines.find((line) =>
        line.includes('Plan:') || line.includes('No changes')
      );

      if (summaryLine) {
        const addMatch = summaryLine.match(/(\d+) to add/);
        const changeMatch = summaryLine.match(/(\d+) to change/);
        const destroyMatch = summaryLine.match(/(\d+) to destroy/);

        if (addMatch) summary.toAdd = parseInt(addMatch[1], 10);
        if (changeMatch) summary.toChange = parseInt(changeMatch[1], 10);
        if (destroyMatch) summary.toDestroy = parseInt(destroyMatch[1], 10);
      }

      return summary;
    } catch (error) {
      logger.error('Failed to parse plan', { error: error.message });
      return null;
    }
  }

  /**
   * Setup MCP tool handlers
   */
  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'terraform_init',
          description: 'Initialize Terraform working directory',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: {
                type: 'string',
                description: 'Terraform project directory',
                default: '.',
              },
              upgrade: {
                type: 'boolean',
                description: 'Upgrade modules and providers',
                default: false,
              },
              reconfigure: {
                type: 'boolean',
                description: 'Reconfigure backend',
                default: false,
              },
            },
          },
        },
        {
          name: 'terraform_plan',
          description: 'Generate and show Terraform execution plan',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              varFile: {
                type: 'string',
                description: 'Path to variable file (e.g., terraform.tfvars)',
              },
              vars: {
                type: 'object',
                description: 'Inline variables as key-value pairs',
                default: {},
              },
              target: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific resources to target',
                default: [],
              },
              destroy: {
                type: 'boolean',
                description: 'Generate destroy plan',
                default: false,
              },
            },
          },
        },
        {
          name: 'terraform_apply',
          description: 'Apply Terraform configuration',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              varFile: { type: 'string' },
              vars: { type: 'object', default: {} },
              target: { type: 'array', items: { type: 'string' }, default: [] },
              autoApprove: {
                type: 'boolean',
                description: 'Skip interactive approval',
                default: false,
              },
            },
          },
        },
        {
          name: 'terraform_destroy',
          description: 'Destroy Terraform-managed infrastructure',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              varFile: { type: 'string' },
              vars: { type: 'object', default: {} },
              target: { type: 'array', items: { type: 'string' }, default: [] },
              autoApprove: {
                type: 'boolean',
                description: 'Skip interactive approval (DANGEROUS)',
                default: false,
              },
            },
          },
        },
        {
          name: 'terraform_output',
          description: 'Show Terraform output values',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              name: {
                type: 'string',
                description: 'Specific output name (omit for all)',
              },
              json: {
                type: 'boolean',
                description: 'Output as JSON',
                default: true,
              },
            },
          },
        },
        {
          name: 'terraform_state_list',
          description: 'List resources in Terraform state',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
            },
          },
        },
        {
          name: 'terraform_state_show',
          description: 'Show attributes of a single resource in state',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              address: {
                type: 'string',
                description: 'Resource address (e.g., aws_instance.example)',
                required: true,
              },
            },
            required: ['address'],
          },
        },
        {
          name: 'terraform_workspace_list',
          description: 'List Terraform workspaces',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
            },
          },
        },
        {
          name: 'terraform_workspace_select',
          description: 'Select or create a Terraform workspace',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              name: {
                type: 'string',
                description: 'Workspace name',
                required: true,
              },
              create: {
                type: 'boolean',
                description: 'Create workspace if it does not exist',
                default: false,
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'terraform_validate',
          description: 'Validate Terraform configuration files',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              json: {
                type: 'boolean',
                description: 'Output as JSON',
                default: true,
              },
            },
          },
        },
        {
          name: 'terraform_fmt',
          description: 'Format Terraform configuration files',
          inputSchema: {
            type: 'object',
            properties: {
              workingDir: { type: 'string', default: '.' },
              check: {
                type: 'boolean',
                description: 'Check if files are formatted (do not write)',
                default: false,
              },
              recursive: {
                type: 'boolean',
                description: 'Process subdirectories',
                default: true,
              },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        switch (name) {
          case 'terraform_init': {
            const initArgs = [];
            if (args.upgrade) initArgs.push('-upgrade');
            if (args.reconfigure) initArgs.push('-reconfigure');
            result = await this.executeTerraformCommand('init', initArgs, {
              workingDir: args.workingDir,
            });
            break;
          }

          case 'terraform_plan': {
            const planArgs = [];
            if (args.destroy) planArgs.push('-destroy');
            args.target?.forEach((t) => planArgs.push('-target', t));
            result = await this.executeTerraformCommand('plan', planArgs, {
              workingDir: args.workingDir,
              varFile: args.varFile,
              vars: args.vars,
            });
            // Parse plan summary
            if (result.success) {
              result.summary = await this.parsePlan(result.stdout);
            }
            break;
          }

          case 'terraform_apply': {
            const applyArgs = [];
            args.target?.forEach((t) => applyArgs.push('-target', t));
            result = await this.executeTerraformCommand('apply', applyArgs, {
              workingDir: args.workingDir,
              varFile: args.varFile,
              vars: args.vars,
              autoApprove: args.autoApprove,
            });
            break;
          }

          case 'terraform_destroy': {
            const destroyArgs = [];
            args.target?.forEach((t) => destroyArgs.push('-target', t));
            result = await this.executeTerraformCommand('destroy', destroyArgs, {
              workingDir: args.workingDir,
              varFile: args.varFile,
              vars: args.vars,
              autoApprove: args.autoApprove,
            });
            break;
          }

          case 'terraform_output': {
            const outputArgs = [];
            if (args.json) outputArgs.push('-json');
            if (args.name) outputArgs.push(args.name);
            result = await this.executeTerraformCommand('output', outputArgs, {
              workingDir: args.workingDir,
            });
            // Parse JSON output
            if (result.success && args.json) {
              try {
                result.outputs = JSON.parse(result.stdout);
              } catch (e) {
                // Keep as string if not valid JSON
              }
            }
            break;
          }

          case 'terraform_state_list':
            result = await this.executeTerraformCommand('state', ['list'], {
              workingDir: args.workingDir,
            });
            break;

          case 'terraform_state_show':
            result = await this.executeTerraformCommand(
              'state',
              ['show', args.address],
              { workingDir: args.workingDir }
            );
            break;

          case 'terraform_workspace_list':
            result = await this.executeTerraformCommand('workspace', ['list'], {
              workingDir: args.workingDir,
            });
            break;

          case 'terraform_workspace_select': {
            const wsArgs = args.create ? ['new', args.name] : ['select', args.name];
            result = await this.executeTerraformCommand('workspace', wsArgs, {
              workingDir: args.workingDir,
            });
            break;
          }

          case 'terraform_validate': {
            const validateArgs = [];
            if (args.json) validateArgs.push('-json');
            result = await this.executeTerraformCommand('validate', validateArgs, {
              workingDir: args.workingDir,
            });
            break;
          }

          case 'terraform_fmt': {
            const fmtArgs = [];
            if (args.check) fmtArgs.push('-check');
            if (args.recursive) fmtArgs.push('-recursive');
            result = await this.executeTerraformCommand('fmt', fmtArgs, {
              workingDir: args.workingDir,
            });
            break;
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('Tool execution failed', { name, error: error.message });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
              }),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Terraform MCP Server running on stdio');
  }
}

// Start the server
const server = new TerraformMCPServer();
server.run().catch((error) => {
  logger.error('Failed to start Terraform MCP Server', { error: error.message });
  process.exit(1);
});
