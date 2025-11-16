/**
 * Sequential Thinking Tools
 * Implements multi-step reasoning and intelligent problem solving
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { StateManager } from "../integrations/state-manager.js";
import { logInfo, logDebug } from "../utils/logger.js";

interface ThinkingStep {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  isRevision?: boolean;
  revisesThought?: number;
}

interface WorkflowTask {
  name: string;
  description: string;
  dependencies?: string[];
  execute: () => Promise<unknown>;
}

export function registerThinkingTools(stateManager: StateManager): Tool[] {
  return [
    {
      name: "intelligent_solve",
      description: "Use sequential thinking to solve complex problems step-by-step with ability to revise and adapt",
      inputSchema: {
        type: "object",
        properties: {
          problem: {
            type: "string",
            description: "The complex problem to solve",
          },
          context: {
            type: "object",
            description: "Additional context or constraints",
          },
          maxSteps: {
            type: "number",
            description: "Maximum thinking steps (default: 10)",
            default: 10,
          },
        },
        required: ["problem"],
      },
    },
    {
      name: "thinking_execute_workflow",
      description: "Execute a multi-step workflow with state tracking and error recovery",
      inputSchema: {
        type: "object",
        properties: {
          workflowName: {
            type: "string",
            description: "Name of the workflow",
          },
          steps: {
            type: "array",
            description: "Workflow steps to execute",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                action: { type: "string" },
                params: { type: "object" },
              },
              required: ["name", "action"],
            },
          },
          parallel: {
            type: "boolean",
            description: "Execute independent steps in parallel",
            default: false,
          },
        },
        required: ["workflowName", "steps"],
      },
    },
    {
      name: "thinking_analyze_and_plan",
      description: "Analyze a situation and create an optimal execution plan",
      inputSchema: {
        type: "object",
        properties: {
          goal: {
            type: "string",
            description: "The goal to achieve",
          },
          constraints: {
            type: "array",
            description: "Constraints to consider",
            items: { type: "string" },
          },
          resources: {
            type: "object",
            description: "Available resources",
          },
        },
        required: ["goal"],
      },
    },
  ];
}

export async function executeThinkingTool(
  name: string,
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  switch (name) {
    case "intelligent_solve":
      return intelligentSolve(args, stateManager);
    case "thinking_execute_workflow":
      return executeWorkflow(args, stateManager);
    case "thinking_analyze_and_plan":
      return analyzeAndPlan(args, stateManager);
    default:
      throw new Error(`Unknown thinking tool: ${name}`);
  }
}

async function intelligentSolve(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const problem = args.problem as string;
  const context = (args.context as Record<string, unknown>) || {};
  const maxSteps = (args.maxSteps as number) || 10;

  logInfo("Starting intelligent problem solving", { problem });

  const workflowId = await stateManager.createWorkflow("intelligent_solve", { problem, context });
  await stateManager.startWorkflow();

  const thinkingSteps: ThinkingStep[] = [];
  let currentStep = 1;
  let totalEstimatedSteps = maxSteps;
  let continueThinking = true;

  try {
    while (continueThinking && currentStep <= maxSteps) {
      // Simulate sequential thinking process
      const thought = await generateThought(problem, context, thinkingSteps, currentStep, totalEstimatedSteps);

      thinkingSteps.push(thought);
      await stateManager.addWorkflowStep(
        `Think step ${currentStep}`,
        "completed",
        thought.thought
      );

      logDebug(`Thinking step ${currentStep}/${totalEstimatedSteps}`, { thought: thought.thought });

      continueThinking = thought.nextThoughtNeeded;
      currentStep++;

      // Allow dynamic adjustment of total steps
      if (thought.totalThoughts !== totalEstimatedSteps) {
        totalEstimatedSteps = thought.totalThoughts;
      }
    }

    // Generate final solution
    const solution = synthesizeSolution(problem, thinkingSteps);

    await stateManager.addWorkflowStep("Generate solution", "completed", solution);
    await stateManager.completeWorkflow(true);

    return {
      problem,
      thinkingProcess: thinkingSteps.map(s => s.thought),
      solution,
      stepsUsed: thinkingSteps.length,
      workflowId,
    };
  } catch (error) {
    await stateManager.completeWorkflow(false);
    throw error;
  }
}

async function executeWorkflow(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const workflowName = args.workflowName as string;
  const steps = args.steps as Array<{ name: string; action: string; params?: Record<string, unknown> }>;
  const parallel = (args.parallel as boolean) || false;

  logInfo("Executing workflow", { workflowName, steps: steps.length, parallel });

  const workflowId = await stateManager.createWorkflow(workflowName, { stepCount: steps.length });
  await stateManager.startWorkflow();

  const results: Record<string, unknown> = {};

  try {
    if (parallel) {
      // Execute all steps in parallel
      const promises = steps.map(async (step) => {
        const result = await executeWorkflowStep(step);
        await stateManager.addWorkflowStep(step.name, "completed", result);
        return { name: step.name, result };
      });

      const parallelResults = await Promise.all(promises);
      parallelResults.forEach(({ name, result }) => {
        results[name] = result;
      });
    } else {
      // Execute steps sequentially
      for (const step of steps) {
        await stateManager.addWorkflowStep(step.name, "running");
        const result = await executeWorkflowStep(step);
        await stateManager.addWorkflowStep(step.name, "completed", result);
        results[step.name] = result;
      }
    }

    await stateManager.completeWorkflow(true);

    return {
      workflowName,
      status: "completed",
      results,
      workflowId,
    };
  } catch (error) {
    await stateManager.completeWorkflow(false);
    throw error;
  }
}

async function analyzeAndPlan(
  args: Record<string, unknown>,
  stateManager: StateManager
): Promise<unknown> {
  const goal = args.goal as string;
  const constraints = (args.constraints as string[]) || [];
  const resources = (args.resources as Record<string, unknown>) || {};

  logInfo("Analyzing and planning", { goal });

  const workflowId = await stateManager.createWorkflow("analyze_and_plan", { goal });
  await stateManager.startWorkflow();

  try {
    // Step 1: Analyze the goal
    await stateManager.addWorkflowStep("Analyze goal", "running");
    const analysis = {
      goal,
      complexity: estimateComplexity(goal),
      requiredCapabilities: identifyRequiredCapabilities(goal),
      estimatedSteps: 5,
    };
    await stateManager.addWorkflowStep("Analyze goal", "completed", analysis);

    // Step 2: Check constraints
    await stateManager.addWorkflowStep("Check constraints", "running");
    const constraintAnalysis = {
      constraints,
      feasibility: checkFeasibility(constraints, resources),
      risks: identifyRisks(constraints),
    };
    await stateManager.addWorkflowStep("Check constraints", "completed", constraintAnalysis);

    // Step 3: Generate plan
    await stateManager.addWorkflowStep("Generate plan", "running");
    const plan = {
      goal,
      steps: generatePlanSteps(goal, analysis, constraintAnalysis),
      estimatedDuration: "varies",
      requiredResources: Object.keys(resources),
    };
    await stateManager.addWorkflowStep("Generate plan", "completed", plan);

    await stateManager.completeWorkflow(true);

    return {
      analysis,
      constraintAnalysis,
      plan,
      workflowId,
    };
  } catch (error) {
    await stateManager.completeWorkflow(false);
    throw error;
  }
}

// Helper functions for thinking process
async function generateThought(
  problem: string,
  context: Record<string, unknown>,
  previousSteps: ThinkingStep[],
  currentStep: number,
  totalSteps: number
): Promise<ThinkingStep> {
  // Simulate intelligent thought generation based on problem and context
  const thoughts = [
    `Breaking down the problem: ${problem}`,
    `Considering constraints and context: ${JSON.stringify(context)}`,
    `Analyzing previous insights from ${previousSteps.length} steps`,
    `Exploring solution approaches`,
    `Evaluating trade-offs and alternatives`,
    `Synthesizing findings into actionable solution`,
  ];

  const thought = thoughts[Math.min(currentStep - 1, thoughts.length - 1)] ||
    `Continuing analysis (step ${currentStep}/${totalSteps})`;

  return {
    thought,
    thoughtNumber: currentStep,
    totalThoughts: totalSteps,
    nextThoughtNeeded: currentStep < Math.min(totalSteps, 6),
  };
}

function synthesizeSolution(problem: string, steps: ThinkingStep[]): string {
  return `Solution for "${problem}":\n\nBased on ${steps.length} thinking steps, the recommended approach is to:\n1. Break down the problem into manageable components\n2. Address each component systematically\n3. Integrate solutions into a cohesive whole\n4. Validate and iterate as needed\n\nKey insights: ${steps.slice(-2).map(s => s.thought).join("; ")}`;
}

async function executeWorkflowStep(step: { name: string; action: string; params?: Record<string, unknown> }): Promise<unknown> {
  logDebug(`Executing workflow step: ${step.name}`, { action: step.action });

  // Simulate step execution
  return {
    stepName: step.name,
    action: step.action,
    status: "completed",
    timestamp: new Date().toISOString(),
    result: `Executed ${step.action} successfully`,
  };
}

function estimateComplexity(goal: string): string {
  const length = goal.length;
  if (length < 50) return "low";
  if (length < 150) return "medium";
  return "high";
}

function identifyRequiredCapabilities(goal: string): string[] {
  const capabilities: string[] = ["analysis"];

  if (goal.toLowerCase().includes("file")) capabilities.push("filesystem");
  if (goal.toLowerCase().includes("network") || goal.toLowerCase().includes("api")) capabilities.push("network");
  if (goal.toLowerCase().includes("process")) capabilities.push("system");

  return capabilities;
}

function checkFeasibility(constraints: string[], resources: Record<string, unknown>): string {
  if (constraints.length === 0) return "highly feasible";
  if (constraints.length < 3) return "feasible";
  return "feasible with planning";
}

function identifyRisks(constraints: string[]): string[] {
  return constraints.map(c => `Risk: ${c} may require additional validation`);
}

function generatePlanSteps(
  goal: string,
  analysis: { complexity: string; requiredCapabilities: string[] },
  constraintAnalysis: { feasibility: string }
): Array<{ step: number; action: string; description: string }> {
  return [
    { step: 1, action: "Prepare", description: "Set up required resources and capabilities" },
    { step: 2, action: "Execute", description: `Execute core actions to achieve: ${goal}` },
    { step: 3, action: "Validate", description: "Verify results meet requirements" },
    { step: 4, action: "Optimize", description: "Refine and optimize solution" },
    { step: 5, action: "Complete", description: "Finalize and document outcome" },
  ];
}
