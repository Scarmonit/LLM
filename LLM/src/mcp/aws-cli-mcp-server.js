#!/usr/bin/env node

/**
 * AWS CLI MCP Server
 * Provides AWS CLI capabilities via Model Context Protocol
 *
 * Features:
 * - Execute AWS CLI commands with natural language
 * - Supports all AWS services (EC2, S3, Lambda, RDS, etc.)
 * - Credential management via AWS profiles
 * - Multi-region support
 * - Output formatting (JSON, table, text)
 *
 * @module aws-cli-mcp-server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

/**
 * AWS CLI MCP Server Class
 */
class AWSCliMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'aws-cli-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    logger.info('AWS CLI MCP Server initialized');
  }

  /**
   * Execute AWS CLI command
   */
  async executeAWSCommand(service, command, args = [], options = {}) {
    try {
      const {
        profile = 'default',
        region = process.env.AWS_REGION || 'us-east-1',
        output = 'json'
      } = options;

      // Build AWS CLI command
      const cmdParts = [
        'aws',
        service,
        command,
        ...args,
        '--profile', profile,
        '--region', region,
        '--output', output
      ];

      const cmd = cmdParts.join(' ');
      logger.info('Executing AWS CLI command', { cmd });

      const { stdout, stderr } = await execAsync(cmd, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 60000, // 60 second timeout
      });

      if (stderr && !stdout) {
        throw new Error(stderr);
      }

      // Parse JSON output if applicable
      let result = stdout.trim();
      if (output === 'json' && result) {
        try {
          result = JSON.parse(result);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }

      return {
        success: true,
        result,
        command: cmd,
        warning: stderr || null,
      };
    } catch (error) {
      logger.error('AWS CLI command failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        command: error.cmd,
      };
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
          name: 'aws_execute',
          description: 'Execute AWS CLI commands with natural language. Supports all AWS services.',
          inputSchema: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                description: 'AWS service name (e.g., ec2, s3, lambda, rds, dynamodb)',
              },
              command: {
                type: 'string',
                description: 'AWS CLI command (e.g., describe-instances, list-buckets, invoke)',
              },
              args: {
                type: 'array',
                items: { type: 'string' },
                description: 'Command arguments (e.g., ["--instance-ids", "i-1234567890abcdef0"])',
                default: [],
              },
              profile: {
                type: 'string',
                description: 'AWS profile name from ~/.aws/credentials',
                default: 'default',
              },
              region: {
                type: 'string',
                description: 'AWS region (e.g., us-east-1, eu-west-1)',
                default: 'us-east-1',
              },
              output: {
                type: 'string',
                enum: ['json', 'text', 'table'],
                description: 'Output format',
                default: 'json',
              },
            },
            required: ['service', 'command'],
          },
        },
        {
          name: 'aws_ec2_list_instances',
          description: 'List EC2 instances with optional filters',
          inputSchema: {
            type: 'object',
            properties: {
              filters: {
                type: 'array',
                items: { type: 'string' },
                description: 'EC2 filters (e.g., ["Name=instance-state-name,Values=running"])',
                default: [],
              },
              profile: { type: 'string', default: 'default' },
              region: { type: 'string', default: 'us-east-1' },
            },
          },
        },
        {
          name: 'aws_s3_list_buckets',
          description: 'List all S3 buckets',
          inputSchema: {
            type: 'object',
            properties: {
              profile: { type: 'string', default: 'default' },
            },
          },
        },
        {
          name: 'aws_lambda_list_functions',
          description: 'List Lambda functions',
          inputSchema: {
            type: 'object',
            properties: {
              profile: { type: 'string', default: 'default' },
              region: { type: 'string', default: 'us-east-1' },
            },
          },
        },
        {
          name: 'aws_rds_describe_instances',
          description: 'Describe RDS database instances',
          inputSchema: {
            type: 'object',
            properties: {
              profile: { type: 'string', default: 'default' },
              region: { type: 'string', default: 'us-east-1' },
            },
          },
        },
        {
          name: 'aws_cloudformation_list_stacks',
          description: 'List CloudFormation stacks',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'array',
                items: { type: 'string' },
                description: 'Stack status filters (e.g., CREATE_COMPLETE, UPDATE_COMPLETE)',
                default: [],
              },
              profile: { type: 'string', default: 'default' },
              region: { type: 'string', default: 'us-east-1' },
            },
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'aws_execute':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.executeAWSCommand(
                      args.service,
                      args.command,
                      args.args || [],
                      {
                        profile: args.profile,
                        region: args.region,
                        output: args.output,
                      }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'aws_ec2_list_instances': {
            const filterArgs = args.filters?.length
              ? ['--filters', ...args.filters]
              : [];
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.executeAWSCommand(
                      'ec2',
                      'describe-instances',
                      filterArgs,
                      { profile: args.profile, region: args.region }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'aws_s3_list_buckets':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.executeAWSCommand('s3api', 'list-buckets', [], {
                      profile: args.profile,
                    }),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'aws_lambda_list_functions':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.executeAWSCommand('lambda', 'list-functions', [], {
                      profile: args.profile,
                      region: args.region,
                    }),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'aws_rds_describe_instances':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.executeAWSCommand(
                      'rds',
                      'describe-db-instances',
                      [],
                      { profile: args.profile, region: args.region }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };

          case 'aws_cloudformation_list_stacks': {
            const statusArgs = args.status?.length
              ? ['--stack-status-filter', ...args.status]
              : [];
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.executeAWSCommand(
                      'cloudformation',
                      'list-stacks',
                      statusArgs,
                      { profile: args.profile, region: args.region }
                    ),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
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
    logger.info('AWS CLI MCP Server running on stdio');
  }
}

// Start the server
const server = new AWSCliMCPServer();
server.run().catch((error) => {
  logger.error('Failed to start AWS CLI MCP Server', { error: error.message });
  process.exit(1);
});
