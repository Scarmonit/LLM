/**
 * System Operations Tools
 * Implements omnipotent system-level operations
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { StateManager } from "../integrations/state-manager.js";
import * as si from "systeminformation";
import { logInfo, logDebug } from "../utils/logger.js";

export function registerSystemTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: "system_get_info",
      description: "Get comprehensive system information including OS, CPU, memory, disk, network",
      inputSchema: {
        type: "object",
        properties: {
          categories: {
            type: "array",
            description: "Specific categories to retrieve (default: all)",
            items: {
              type: "string",
              enum: ["system", "cpu", "memory", "disk", "network", "os"],
            },
          },
        },
      },
    },
    {
      name: "process_list",
      description: "List all running processes with optional filtering",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            description: "Filter processes by name or command",
          },
          limit: {
            type: "number",
            description: "Maximum number of processes to return",
            default: 100,
          },
        },
      },
    },
    {
      name: "process_info",
      description: "Get detailed information about a specific process",
      inputSchema: {
        type: "object",
        properties: {
          pid: {
            type: "number",
            description: "Process ID",
          },
        },
        required: ["pid"],
      },
    },
    {
      name: "network_connections",
      description: "Get all active network connections",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            description: "Filter by protocol (tcp, udp)",
          },
        },
      },
    },
    {
      name: "system_monitor",
      description: "Get real-time system monitoring data",
      inputSchema: {
        type: "object",
        properties: {
          duration: {
            type: "number",
            description: "Monitoring duration in seconds",
            default: 5,
          },
          interval: {
            type: "number",
            description: "Sampling interval in seconds",
            default: 1,
          },
        },
      },
    },
  ];
}

export async function executeSystemTool(
  name: string,
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  switch (name) {
    case "system_get_info":
      return getSystemInfo(args);
    case "process_list":
      return listProcesses(args);
    case "process_info":
      return getProcessInfo(args);
    case "network_connections":
      return getNetworkConnections(args);
    case "system_monitor":
      return monitorSystem(args);
    default:
      throw new Error(`Unknown system tool: ${name}`);
  }
}

async function getSystemInfo(args: Record<string, unknown>): Promise<unknown> {
  const categories = (args.categories as string[]) || ["system", "cpu", "memory", "disk", "network", "os"];

  logInfo("Getting system information", { categories });

  const info: Record<string, unknown> = {};

  try {
    if (categories.includes("system")) {
      info.system = await si.system();
    }
    if (categories.includes("cpu")) {
      info.cpu = await si.cpu();
      info.cpuLoad = await si.currentLoad();
    }
    if (categories.includes("memory")) {
      info.memory = await si.mem();
    }
    if (categories.includes("disk")) {
      info.disk = await si.fsSize();
    }
    if (categories.includes("network")) {
      info.network = await si.networkInterfaces();
    }
    if (categories.includes("os")) {
      info.os = await si.osInfo();
    }

    return {
      timestamp: new Date().toISOString(),
      categories,
      data: info,
    };
  } catch (error) {
    throw new Error(`Failed to get system info: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function listProcesses(args: Record<string, unknown>): Promise<unknown> {
  const filter = args.filter as string | undefined;
  const limit = (args.limit as number) || 100;

  logInfo("Listing processes", { filter, limit });

  try {
    const processes = await si.processes();

    let filteredProcesses = processes.list;

    if (filter) {
      const filterLower = filter.toLowerCase();
      filteredProcesses = filteredProcesses.filter(
        (proc) =>
          proc.name.toLowerCase().includes(filterLower) ||
          proc.command.toLowerCase().includes(filterLower)
      );
    }

    // Sort by CPU usage
    filteredProcesses.sort((a, b) => (b.cpu || 0) - (a.cpu || 0));

    // Limit results
    filteredProcesses = filteredProcesses.slice(0, limit);

    return {
      total: processes.all,
      running: processes.running,
      blocked: processes.blocked,
      sleeping: processes.sleeping,
      filtered: filteredProcesses.length,
      processes: filteredProcesses.map((proc) => ({
        pid: proc.pid,
        name: proc.name,
        cpu: proc.cpu,
        memory: proc.mem,
        state: proc.state,
        started: proc.started,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to list processes: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getProcessInfo(args: Record<string, unknown>): Promise<unknown> {
  const pid = args.pid as number;

  logInfo("Getting process info", { pid });

  try {
    const processes = await si.processes();
    const process = processes.list.find((p) => p.pid === pid);

    if (!process) {
      throw new Error(`Process not found: ${pid}`);
    }

    return {
      pid: process.pid,
      name: process.name,
      command: process.command,
      cpu: process.cpu,
      memory: process.mem,
      state: process.state,
      started: process.started,
      path: process.path,
      params: process.params,
    };
  } catch (error) {
    throw new Error(`Failed to get process info: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getNetworkConnections(args: Record<string, unknown>): Promise<unknown> {
  const filter = args.filter as string | undefined;

  logInfo("Getting network connections", { filter });

  try {
    const connections = await si.networkConnections();

    let filtered = connections;

    if (filter) {
      filtered = connections.filter((conn) => conn.protocol === filter);
    }

    return {
      total: connections.length,
      filtered: filtered.length,
      connections: filtered.map((conn) => ({
        protocol: conn.protocol,
        localAddress: conn.localAddress,
        localPort: conn.localPort,
        peerAddress: conn.peerAddress,
        peerPort: conn.peerPort,
        state: conn.state,
        pid: conn.pid,
        process: conn.process,
      })),
    };
  } catch (error) {
    throw new Error(`Failed to get network connections: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function monitorSystem(args: Record<string, unknown>): Promise<unknown> {
  const duration = (args.duration as number) || 5;
  const interval = (args.interval as number) || 1;

  logInfo("Monitoring system", { duration, interval });

  const samples: Array<{
    timestamp: string;
    cpu: number;
    memory: { used: number; total: number; percentage: number };
  }> = [];

  const startTime = Date.now();
  const endTime = startTime + duration * 1000;

  try {
    while (Date.now() < endTime) {
      const cpuLoad = await si.currentLoad();
      const memory = await si.mem();

      samples.push({
        timestamp: new Date().toISOString(),
        cpu: cpuLoad.currentLoad,
        memory: {
          used: memory.used,
          total: memory.total,
          percentage: (memory.used / memory.total) * 100,
        },
      });

      if (Date.now() + interval * 1000 < endTime) {
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
      } else {
        break;
      }
    }

    // Calculate statistics
    const cpuAvg = samples.reduce((sum, s) => sum + s.cpu, 0) / samples.length;
    const cpuMax = Math.max(...samples.map((s) => s.cpu));
    const cpuMin = Math.min(...samples.map((s) => s.cpu));

    const memAvg = samples.reduce((sum, s) => sum + s.memory.percentage, 0) / samples.length;
    const memMax = Math.max(...samples.map((s) => s.memory.percentage));
    const memMin = Math.min(...samples.map((s) => s.memory.percentage));

    return {
      duration,
      interval,
      samples: samples.length,
      statistics: {
        cpu: {
          average: cpuAvg.toFixed(2),
          max: cpuMax.toFixed(2),
          min: cpuMin.toFixed(2),
        },
        memory: {
          average: memAvg.toFixed(2),
          max: memMax.toFixed(2),
          min: memMin.toFixed(2),
        },
      },
      data: samples,
    };
  } catch (error) {
    throw new Error(`Failed to monitor system: ${error instanceof Error ? error.message : String(error)}`);
  }
}
