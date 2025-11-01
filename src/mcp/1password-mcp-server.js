#!/usr/bin/env node

/**
 * 1Password MCP Server
 *
 * Model Context Protocol server for secure 1Password integration.
 * Provides tools for:
 * - Secret retrieval (get_secret)
 * - Secret batch retrieval (get_secrets)
 * - Vault listing (list_vaults)
 * - Item listing (list_items)
 * - Secret creation/update (create_secret, update_secret)
 * - Auto-configuration for new services
 *
 * @module mcp/1password-mcp-server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OnePasswordClient } from '../utils/onepassword-client.js';
import { logger } from '../utils/logger.js';

// Initialize 1Password client
const opClient = new OnePasswordClient({
  serviceAccountToken: process.env.OP_SERVICE_ACCOUNT_TOKEN,
  defaultVault: process.env.OP_DEFAULT_VAULT || 'Private',
  cache: true,
  cacheTTL: parseInt(process.env.OP_CACHE_TTL || '300000', 10),
});

// MCP Server instance
const server = new Server(
  {
    name: '1password-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool Definitions
 *
 * Available tools for 1Password operations
 */
const TOOLS = [
  {
    name: 'get_secret',
    description: 'Retrieve a single secret from 1Password vault',
    inputSchema: {
      type: 'object',
      properties: {
        itemName: {
          type: 'string',
          description: 'Name of the 1Password item (e.g., "ANTHROPIC_API_KEY")',
        },
        vault: {
          type: 'string',
          description: 'Vault name (optional, uses default vault if not provided)',
        },
        field: {
          type: 'string',
          description: 'Field name to retrieve (default: "password")',
          default: 'password',
        },
      },
      required: ['itemName'],
    },
  },
  {
    name: 'get_secrets',
    description: 'Retrieve multiple secrets in parallel from 1Password',
    inputSchema: {
      type: 'object',
      properties: {
        secrets: {
          type: 'array',
          description: 'Array of secret definitions',
          items: {
            type: 'object',
            properties: {
              itemName: { type: 'string' },
              key: { type: 'string', description: 'Environment variable name' },
              vault: { type: 'string' },
              field: { type: 'string', default: 'password' },
            },
            required: ['itemName', 'key'],
          },
        },
      },
      required: ['secrets'],
    },
  },
  {
    name: 'list_vaults',
    description: 'List all accessible vaults in 1Password',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_items',
    description: 'List items in a specific vault',
    inputSchema: {
      type: 'object',
      properties: {
        vault: {
          type: 'string',
          description: 'Vault name (optional, uses default vault if not provided)',
        },
        category: {
          type: 'string',
          description: 'Filter by category (e.g., "Login", "API Credential", "Server")',
        },
      },
    },
  },
  {
    name: 'create_secret',
    description: 'Create a new secret in 1Password vault',
    inputSchema: {
      type: 'object',
      properties: {
        itemName: {
          type: 'string',
          description: 'Name for the new item',
        },
        value: {
          type: 'string',
          description: 'Secret value',
        },
        vault: {
          type: 'string',
          description: 'Vault name (optional)',
        },
        category: {
          type: 'string',
          description: 'Item category (default: "Password")',
          enum: ['Login', 'Password', 'API Credential', 'Server', 'Database'],
          default: 'Password',
        },
        notes: {
          type: 'string',
          description: 'Additional notes',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for organization',
        },
      },
      required: ['itemName', 'value'],
    },
  },
  {
    name: 'update_secret',
    description: 'Update an existing secret in 1Password',
    inputSchema: {
      type: 'object',
      properties: {
        itemName: {
          type: 'string',
          description: 'Name of the item to update',
        },
        value: {
          type: 'string',
          description: 'New secret value',
        },
        vault: {
          type: 'string',
          description: 'Vault name (optional)',
        },
        field: {
          type: 'string',
          description: 'Field to update (default: "password")',
          default: 'password',
        },
      },
      required: ['itemName', 'value'],
    },
  },
  {
    name: 'auto_configure',
    description: 'Automatically configure secrets for a new service/application',
    inputSchema: {
      type: 'object',
      properties: {
        serviceName: {
          type: 'string',
          description: 'Name of the service (e.g., "anthropic", "github", "aws")',
        },
        secrets: {
          type: 'object',
          description: 'Key-value pairs of secrets to create',
          additionalProperties: { type: 'string' },
        },
        vault: {
          type: 'string',
          description: 'Vault name (optional)',
        },
        category: {
          type: 'string',
          description: 'Category for items (default: "API Credential")',
          default: 'API Credential',
        },
      },
      required: ['serviceName', 'secrets'],
    },
  },
  {
    name: 'inject_env',
    description: 'Inject secrets as environment variables in the current process',
    inputSchema: {
      type: 'object',
      properties: {
        secrets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemName: { type: 'string' },
              envVar: { type: 'string', description: 'Environment variable name' },
              vault: { type: 'string' },
              field: { type: 'string', default: 'password' },
            },
            required: ['itemName', 'envVar'],
          },
        },
      },
      required: ['secrets'],
    },
  },
];

/**
 * List Tools Handler
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('Listing available 1Password MCP tools');
  return {
    tools: TOOLS,
  };
});

/**
 * Call Tool Handler
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info('Tool called:', { tool: name, args });

  try {
    switch (name) {
      case 'get_secret':
        return await handleGetSecret(args);

      case 'get_secrets':
        return await handleGetSecrets(args);

      case 'list_vaults':
        return await handleListVaults();

      case 'list_items':
        return await handleListItems(args);

      case 'create_secret':
        return await handleCreateSecret(args);

      case 'update_secret':
        return await handleUpdateSecret(args);

      case 'auto_configure':
        return await handleAutoConfigure(args);

      case 'inject_env':
        return await handleInjectEnv(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error('Tool execution failed:', { tool: name, error: error.message });
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Tool Handlers
 */

async function handleGetSecret(args) {
  const { itemName, vault, field = 'password' } = args;

  const secret = await opClient.getSecret(itemName, { vault, field });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          itemName,
          vault: vault || opClient.defaultVault,
          field,
          value: secret,
        }, null, 2),
      },
    ],
  };
}

async function handleGetSecrets(args) {
  const { secrets } = args;

  const secretConfigs = secrets.map((s) => ({
    name: s.itemName,
    key: s.key,
    vault: s.vault,
    field: s.field || 'password',
  }));

  const results = await opClient.getSecrets(secretConfigs);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          count: Object.keys(results).length,
          secrets: results,
        }, null, 2),
      },
    ],
  };
}

async function handleListVaults() {
  const vaults = await opClient.listVaults();

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          count: vaults.length,
          vaults: vaults.map((v) => ({
            id: v.id,
            name: v.name,
            type: v.type,
          })),
        }, null, 2),
      },
    ],
  };
}

async function handleListItems(args) {
  const { vault, category } = args;

  let items = await opClient.listItems(vault);

  // Filter by category if provided
  if (category) {
    items = items.filter((item) => item.category === category);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          vault: vault || opClient.defaultVault,
          category: category || 'all',
          count: items.length,
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            tags: item.tags || [],
          })),
        }, null, 2),
      },
    ],
  };
}

async function handleCreateSecret(args) {
  const { itemName, value, vault, category = 'Password', notes, tags = [] } = args;

  await opClient.createItem({
    name: itemName,
    value,
    vault: vault || opClient.defaultVault,
    category,
    notes,
    tags,
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Secret "${itemName}" created successfully`,
          itemName,
          vault: vault || opClient.defaultVault,
          category,
        }, null, 2),
      },
    ],
  };
}

async function handleUpdateSecret(args) {
  const { itemName, value, vault, field = 'password' } = args;

  await opClient.updateItem({
    name: itemName,
    field,
    value,
    vault: vault || opClient.defaultVault,
  });

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Secret "${itemName}" updated successfully`,
          itemName,
          vault: vault || opClient.defaultVault,
          field,
        }, null, 2),
      },
    ],
  };
}

async function handleAutoConfigure(args) {
  const { serviceName, secrets, vault, category = 'API Credential' } = args;

  const results = [];

  for (const [key, value] of Object.entries(secrets)) {
    const itemName = `${serviceName.toUpperCase()}_${key.toUpperCase()}`;

    try {
      await opClient.createItem({
        name: itemName,
        value,
        vault: vault || opClient.defaultVault,
        category,
        tags: [serviceName],
        notes: `Auto-configured for ${serviceName}`,
      });

      results.push({
        itemName,
        status: 'created',
      });
    } catch (error) {
      results.push({
        itemName,
        status: 'failed',
        error: error.message,
      });
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          serviceName,
          vault: vault || opClient.defaultVault,
          results,
        }, null, 2),
      },
    ],
  };
}

async function handleInjectEnv(args) {
  const { secrets } = args;

  const secretConfigs = secrets.map((s) => ({
    name: s.itemName,
    key: s.envVar,
    vault: s.vault,
    field: s.field || 'password',
  }));

  await opClient.injectEnv(secretConfigs);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: 'Environment variables injected successfully',
          count: secrets.length,
          variables: secrets.map((s) => s.envVar),
        }, null, 2),
      },
    ],
  };
}

/**
 * Main Server Startup
 */
async function main() {
  logger.info('Starting 1Password MCP Server...');

  // Verify 1Password CLI availability
  const available = await opClient.isAvailable();
  if (!available) {
    logger.error('1Password CLI not available. Exiting...');
    process.exit(1);
  }

  logger.info('1Password CLI verified and ready');

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  logger.info('1Password MCP Server started successfully');
  logger.info('Server name: 1password-mcp');
  logger.info('Server version: 1.0.0');
  logger.info('Default vault:', opClient.defaultVault);
}

// Error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
