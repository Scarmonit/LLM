/**
 * State Manager - Integrates with memory MCP for persistent state tracking
 */

import { promises as fs } from "fs";
import { homedir } from "os";
import { join } from "path";
import { logInfo, logError, logDebug } from "../utils/logger.js";

interface WorkflowState {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  steps: WorkflowStep[];
  metadata: Record<string, unknown>;
}

interface WorkflowStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: unknown;
  error?: string;
  timestamp: string;
}

interface ToolExecution {
  tool: string;
  args: Record<string, unknown>;
  timestamp: string;
  result?: unknown;
  error?: string;
}

export class StateManager {
  private stateDir: string;
  private currentWorkflow: WorkflowState | null = null;
  private executionHistory: ToolExecution[] = [];

  constructor() {
    this.stateDir = join(homedir(), ".unified-intelligent-mcp");
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.stateDir, { recursive: true });
      await fs.mkdir(join(this.stateDir, "workflows"), { recursive: true });
      await fs.mkdir(join(this.stateDir, "executions"), { recursive: true });
      logInfo("State manager initialized", { stateDir: this.stateDir });
    } catch (error) {
      logError("Failed to initialize state directory", error);
    }
  }

  async createWorkflow(name: string, metadata: Record<string, unknown> = {}): Promise<string> {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentWorkflow = {
      id,
      name,
      status: "pending",
      startTime: new Date().toISOString(),
      steps: [],
      metadata,
    };

    await this.saveWorkflow();
    logInfo(`Created workflow: ${name}`, { id });
    return id;
  }

  async startWorkflow(): Promise<void> {
    if (!this.currentWorkflow) {
      throw new Error("No workflow to start");
    }

    this.currentWorkflow.status = "running";
    await this.saveWorkflow();
    logInfo(`Started workflow: ${this.currentWorkflow.name}`);
  }

  async addWorkflowStep(name: string, status: "running" | "completed" | "failed", result?: unknown, error?: string): Promise<void> {
    if (!this.currentWorkflow) {
      throw new Error("No active workflow");
    }

    const step: WorkflowStep = {
      name,
      status,
      timestamp: new Date().toISOString(),
      result,
      error,
    };

    this.currentWorkflow.steps.push(step);
    await this.saveWorkflow();
    logDebug(`Added workflow step: ${name}`, { status });
  }

  async completeWorkflow(success: boolean = true): Promise<void> {
    if (!this.currentWorkflow) {
      throw new Error("No workflow to complete");
    }

    this.currentWorkflow.status = success ? "completed" : "failed";
    this.currentWorkflow.endTime = new Date().toISOString();
    await this.saveWorkflow();
    logInfo(`Completed workflow: ${this.currentWorkflow.name}`, { status: this.currentWorkflow.status });
    this.currentWorkflow = null;
  }

  async trackToolExecution(tool: string, args: Record<string, unknown>): Promise<void> {
    const execution: ToolExecution = {
      tool,
      args,
      timestamp: new Date().toISOString(),
    };

    this.executionHistory.push(execution);
    await this.saveExecutionHistory();
    logDebug(`Tracked tool execution: ${tool}`);
  }

  async recordSuccess(tool: string, result: unknown): Promise<void> {
    const lastExecution = this.executionHistory[this.executionHistory.length - 1];
    if (lastExecution && lastExecution.tool === tool) {
      lastExecution.result = result;
      await this.saveExecutionHistory();
    }

    if (this.currentWorkflow) {
      await this.addWorkflowStep(tool, "completed", result);
    }
  }

  async recordError(tool: string, error: string): Promise<void> {
    const lastExecution = this.executionHistory[this.executionHistory.length - 1];
    if (lastExecution && lastExecution.tool === tool) {
      lastExecution.error = error;
      await this.saveExecutionHistory();
    }

    if (this.currentWorkflow) {
      await this.addWorkflowStep(tool, "failed", undefined, error);
    }
  }

  async getWorkflowState(): Promise<WorkflowState | null> {
    return this.currentWorkflow;
  }

  async getExecutionHistory(limit: number = 100): Promise<ToolExecution[]> {
    return this.executionHistory.slice(-limit);
  }

  private async saveWorkflow(): Promise<void> {
    if (!this.currentWorkflow) return;

    try {
      const filepath = join(this.stateDir, "workflows", `${this.currentWorkflow.id}.json`);
      await fs.writeFile(filepath, JSON.stringify(this.currentWorkflow, null, 2));
    } catch (error) {
      logError("Failed to save workflow", error);
    }
  }

  private async saveExecutionHistory(): Promise<void> {
    try {
      const filepath = join(this.stateDir, "executions", "history.jsonl");
      const lastExecution = this.executionHistory[this.executionHistory.length - 1];
      if (lastExecution) {
        await fs.appendFile(filepath, JSON.stringify(lastExecution) + "\n");
      }
    } catch (error) {
      logError("Failed to save execution history", error);
    }
  }

  // Integration with memory MCP (if available)
  async syncToMemoryMCP(): Promise<void> {
    // This would integrate with memory MCP to create entities and relations
    // For now, we'll implement file-based persistence above
    logDebug("Memory MCP sync would happen here");
  }
}
