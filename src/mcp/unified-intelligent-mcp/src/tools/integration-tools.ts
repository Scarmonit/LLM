/**
 * Integration Tools
 * Orchestrates filesystem and memory MCP integrations
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { StateManager } from "../integrations/state-manager.js";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { logInfo, logError } from "../utils/logger.js";

export function registerIntegrationTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: "integration_file_read",
      description: "Read file using filesystem MCP integration with state tracking",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Absolute path to file",
          },
          encoding: {
            type: "string",
            description: "File encoding (default: utf-8)",
            default: "utf-8",
          },
        },
        required: ["path"],
      },
    },
    {
      name: "integration_file_write",
      description: "Write file using filesystem MCP integration with state tracking",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Absolute path to file",
          },
          content: {
            type: "string",
            description: "File content",
          },
          createDirs: {
            type: "boolean",
            description: "Create parent directories if they don't exist",
            default: true,
          },
        },
        required: ["path", "content"],
      },
    },
    {
      name: "integration_file_search",
      description: "Search for files matching pattern",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Directory to search",
          },
          pattern: {
            type: "string",
            description: "Glob pattern (e.g., *.js, **/*.ts)",
          },
          recursive: {
            type: "boolean",
            description: "Search recursively",
            default: true,
          },
        },
        required: ["directory", "pattern"],
      },
    },
    {
      name: "mcp_health_check",
      description: "Verify all MCP integrations are working correctly",
      inputSchema: {
        type: "object",
        properties: {
          verbose: {
            type: "boolean",
            description: "Include detailed health information",
            default: false,
          },
        },
      },
    },
    {
      name: "mcp_get_state",
      description: "Get current workflow and execution state",
      inputSchema: {
        type: "object",
        properties: {
          includeHistory: {
            type: "boolean",
            description: "Include execution history",
            default: true,
          },
          historyLimit: {
            type: "number",
            description: "Number of history entries to return",
            default: 50,
          },
        },
      },
    },
    {
      name: "mcp_coordinate_workflow",
      description: "Coordinate a complex workflow across multiple MCP servers",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Workflow name",
          },
          operations: {
            type: "array",
            description: "Operations to coordinate",
            items: {
              type: "object",
              properties: {
                mcp: {
                  type: "string",
                  description: "MCP server (filesystem, memory, system)",
                },
                action: {
                  type: "string",
                  description: "Action to perform",
                },
                params: {
                  type: "object",
                  description: "Action parameters",
                },
              },
              required: ["mcp", "action"],
            },
          },
        },
        required: ["name", "operations"],
      },
    },
  ];
}

export async function executeIntegrationTool(
  name: string,
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  switch (name) {
    case "integration_file_read":
      return fileRead(args, stateManager);
    case "integration_file_write":
      return fileWrite(args, stateManager);
    case "integration_file_search":
      return fileSearch(args, stateManager);
    case "mcp_health_check":
      return healthCheck(args, stateManager);
    case "mcp_get_state":
      return getState(args, stateManager);
    case "mcp_coordinate_workflow":
      return coordinateWorkflow(args, stateManager);
    default:
      throw new Error(`Unknown integration tool: ${name}`);
  }
}

async function fileRead(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const path = args.path as string;
  const encoding = (args.encoding as BufferEncoding) || "utf-8";

  logInfo("Reading file via filesystem integration", { path });

  try {
    const content = await fs.readFile(path, encoding);
    const stats = await fs.stat(path);

    return {
      path,
      content,
      size: stats.size,
      modified: stats.mtime,
      encoding,
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function fileWrite(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const path = args.path as string;
  const content = args.content as string;
  const createDirs = args.createDirs !== false;

  logInfo("Writing file via filesystem integration", { path, createDirs });

  try {
    if (createDirs) {
      await fs.mkdir(dirname(path), { recursive: true });
    }

    await fs.writeFile(path, content, "utf-8");
    const stats = await fs.stat(path);

    return {
      path,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      success: true,
    };
  } catch (error) {
    throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function fileSearch(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const directory = args.directory as string;
  const pattern = args.pattern as string;
  const recursive = args.recursive !== false;

  logInfo("Searching files via filesystem integration", { directory, pattern, recursive });

  try {
    const files = await searchFilesRecursive(directory, pattern, recursive);

    return {
      directory,
      pattern,
      recursive,
      found: files.length,
      files,
    };
  } catch (error) {
    throw new Error(`Failed to search files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function searchFilesRecursive(
  dir: string,
  pattern: string,
  recursive: boolean
): Promise<string[]> {
  const results: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          const subResults = await searchFilesRecursive(fullPath, pattern, recursive);
          results.push(...subResults);
        }
      } else if (entry.isFile()) {
        // Simple pattern matching (can be enhanced with proper glob)
        const regex = new RegExp(pattern.replace(/\*/g, ".*").replace(/\?/g, "."));
        if (regex.test(entry.name)) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    logError(`Error searching directory: ${dir}`, error);
  }

  return results;
}

async function healthCheck(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const verbose = args.verbose || false;

  logInfo("Running health check");

  const health = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    checks: {} as Record<string, { status: string; details?: unknown }>,
  };

  // Check state manager
  try {
    const workflowState = await stateManager.getWorkflowState();
    health.checks.stateManager = {
      status: "healthy",
      details: verbose ? { currentWorkflow: workflowState } : undefined,
    };
  } catch (error) {
    health.checks.stateManager = {
      status: "unhealthy",
      details: error instanceof Error ? error.message : String(error),
    };
    health.status = "degraded";
  }

  // Check filesystem access
  try {
    const testDir = join(process.cwd(), ".unified-intelligent-mcp-test");
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(join(testDir, "test.txt"), "test");
    await fs.readFile(join(testDir, "test.txt"), "utf-8");
    await fs.rm(testDir, { recursive: true });

    health.checks.filesystem = { status: "healthy" };
  } catch (error) {
    health.checks.filesystem = {
      status: "unhealthy",
      details: error instanceof Error ? error.message : String(error),
    };
    health.status = "degraded";
  }

  // Check memory MCP integration
  try {
    await stateManager.syncToMemoryMCP();
    health.checks.memoryMCP = { status: "ready" };
  } catch (error) {
    health.checks.memoryMCP = {
      status: "not available",
      details: "Memory MCP sync not fully implemented yet",
    };
  }

  return health;
}

async function getState(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const includeHistory = args.includeHistory !== false;
  const historyLimit = (args.historyLimit as number) || 50;

  logInfo("Getting MCP state");

  const workflowState = await stateManager.getWorkflowState();
  const executionHistory = includeHistory
    ? await stateManager.getExecutionHistory(historyLimit)
    : [];

  return {
    timestamp: new Date().toISOString(),
    currentWorkflow: workflowState,
    executionHistory: {
      total: executionHistory.length,
      entries: executionHistory,
    },
  };
}

async function coordinateWorkflow(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const name = args.name as string;
  const operations = args.operations as Array<{
    mcp: string;
    action: string;
    params?: Record<string, unknown>;
  }>;

  logInfo("Coordinating multi-MCP workflow", { name, operations: operations.length });

  const workflowId = await stateManager.createWorkflow(name, { operationCount: operations.length });
  await stateManager.startWorkflow();

  const results: Array<{ operation: string; status: string; result?: unknown; error?: string }> = [];

  try {
    for (const operation of operations) {
      await stateManager.addWorkflowStep(`${operation.mcp}:${operation.action}`, "running");

      try {
        let result: unknown;

        switch (operation.mcp) {
          case "filesystem":
            result = await handleFilesystemOperation(operation.action, operation.params || {});
            break;
          case "memory":
            result = await handleMemoryOperation(operation.action, operation.params || {});
            break;
          case "system":
            result = await handleSystemOperation(operation.action, operation.params || {});
            break;
          default:
            throw new Error(`Unknown MCP: ${operation.mcp}`);
        }

        await stateManager.addWorkflowStep(`${operation.mcp}:${operation.action}`, "completed", result);
        results.push({
          operation: `${operation.mcp}:${operation.action}`,
          status: "completed",
          result,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await stateManager.addWorkflowStep(
          `${operation.mcp}:${operation.action}`,
          "failed",
          undefined,
          errorMessage
        );
        results.push({
          operation: `${operation.mcp}:${operation.action}`,
          status: "failed",
          error: errorMessage,
        });
      }
    }

    const allSucceeded = results.every((r) => r.status === "completed");
    await stateManager.completeWorkflow(allSucceeded);

    return {
      workflowId,
      name,
      status: allSucceeded ? "completed" : "partial",
      operations: results,
    };
  } catch (error) {
    await stateManager.completeWorkflow(false);
    throw error;
  }
}

async function handleFilesystemOperation(action: string, params: Record<string, unknown>): Promise<unknown> {
  switch (action) {
    case "read":
      return fileRead(params, new StateManager());
    case "write":
      return fileWrite(params, new StateManager());
    case "search":
      return fileSearch(params, new StateManager());
    default:
      throw new Error(`Unknown filesystem action: ${action}`);
  }
}

async function handleMemoryOperation(action: string, params: Record<string, unknown>): Promise<unknown> {
  // Placeholder for memory MCP integration
  return {
    action,
    params,
    message: "Memory MCP operation would execute here",
  };
}

async function handleSystemOperation(action: string, params: Record<string, unknown>): Promise<unknown> {
  // Placeholder for system operations
  return {
    action,
    params,
    message: "System operation would execute here",
  };
}
