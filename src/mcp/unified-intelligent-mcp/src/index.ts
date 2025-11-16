#!/usr/bin/env node

/**
 * Unified Intelligent MCP Server
 * Combines sequential thinking with omnipotent system operations
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { registerThinkingTools } from "./tools/thinking-tools.js";
import { registerSystemTools } from "./tools/system-tools.js";
import { registerIntegrationTools } from "./tools/integration-tools.js";
import { StateManager } from "./integrations/state-manager.js";
import { logInfo, logError } from "./utils/logger.js";

class UnifiedIntelligentServer {
  private server: Server;
  private stateManager: StateManager;
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: "unified-intelligent-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.stateManager = new StateManager();
    this.setupHandlers();
    this.registerAllTools();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(this.tools.values()),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logInfo(`Executing tool: ${name}`);
        await this.stateManager.trackToolExecution(name, args || {});

        const result = await this.executeTool(name, args || {});

        await this.stateManager.recordSuccess(name, result);

        return {
          content: [
            {
              type: "text",
              text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logError(`Tool execution failed: ${name}`, error);
        await this.stateManager.recordError(name, errorMessage);

        return {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private registerAllTools(): void {
    // Register thinking tools
    const thinkingTools = registerThinkingTools(this.stateManager);
    thinkingTools.forEach((tool) => this.tools.set(tool.name, tool));

    // Register system tools
    const systemTools = registerSystemTools(this.stateManager);
    systemTools.forEach((tool) => this.tools.set(tool.name, tool));

    // Register integration tools
    const integrationTools = registerIntegrationTools(this.stateManager);
    integrationTools.forEach((tool) => this.tools.set(tool.name, tool));

    logInfo(`Registered ${this.tools.size} tools`);
  }

  private async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    // Tool execution is handled by individual tool modules
    // They import their execution handlers
    const { executeThinkingTool } = await import("./tools/thinking-tools.js");
    const { executeSystemTool } = await import("./tools/system-tools.js");
    const { executeIntegrationTool } = await import("./tools/integration-tools.js");

    if (name.startsWith("thinking_") || name.startsWith("intelligent_")) {
      return executeThinkingTool(name, args, this.stateManager);
    } else if (name.startsWith("system_") || name.startsWith("process_") || name.startsWith("network_")) {
      return executeSystemTool(name, args, this.stateManager);
    } else if (name.startsWith("integration_") || name.startsWith("mcp_")) {
      return executeIntegrationTool(name, args, this.stateManager);
    }

    throw new Error(`Unknown tool category: ${name}`);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logInfo("Unified Intelligent MCP Server running on stdio");
  }
}

// Start server
const server = new UnifiedIntelligentServer();
server.run().catch((error) => {
  logError("Server failed to start", error);
  process.exit(1);
});
