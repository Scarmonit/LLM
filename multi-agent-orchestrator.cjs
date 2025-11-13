#!/usr/bin/env node

/**
 * Multi-Agent Orchestrator System
 * Enables Claude to deploy multiple agents that work in parallel
 * Each agent can spawn sub-agents recursively
 * All agents have access to all MCPs and tools
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    maxAgents: 20,
    maxDepth: 5,
    agentTimeout: 300000, // 5 minutes
    heartbeatInterval: 5000,
    workDir: path.join(process.env.HOME || process.env.USERPROFILE, '.multi-agent'),
    mcpServers: [
        'sequential-thinking',
        'memory',
        'filesystem',
        'omnipotent',
        'playwright',
        'everything',
        'a2a-unified',
        'claude-code',
        'github'
    ]
};

// Ensure work directory exists
async function ensureWorkDir() {
    try {
        await fs.mkdir(CONFIG.workDir, { recursive: true });
    } catch (error) {
        console.error('Failed to create work directory:', error);
    }
}

/**
 * Shared Memory Manager using Memory MCP
 */
class SharedMemory extends EventEmitter {
    constructor() {
        super();
        this.entities = new Map();
        this.taskQueue = [];
        this.results = new Map();
    }

    async createEntity(name, type, observations) {
        const entity = { name, type, observations, timestamp: Date.now() };
        this.entities.set(name, entity);
        this.emit('entity:created', entity);
        return entity;
    }

    async addObservation(entityName, observation) {
        if (this.entities.has(entityName)) {
            this.entities.get(entityName).observations.push(observation);
            this.emit('observation:added', { entityName, observation });
        }
    }

    async createRelation(from, to, type) {
        const relation = { from, to, type, timestamp: Date.now() };
        this.emit('relation:created', relation);
        return relation;
    }

    async queueTask(task) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const taskData = { id: taskId, ...task, status: 'queued', created: Date.now() };
        this.taskQueue.push(taskData);
        this.emit('task:queued', taskData);
        return taskId;
    }

    async updateTaskStatus(taskId, status, result = null) {
        const task = this.taskQueue.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            task.updated = Date.now();
            if (result) {
                task.result = result;
                this.results.set(taskId, result);
            }
            this.emit('task:updated', task);
        }
    }

    async getNextTask() {
        const task = this.taskQueue.find(t => t.status === 'queued');
        if (task) {
            task.status = 'assigned';
            task.assigned = Date.now();
            return task;
        }
        return null;
    }

    getStats() {
        return {
            entities: this.entities.size,
            tasks: {
                total: this.taskQueue.length,
                queued: this.taskQueue.filter(t => t.status === 'queued').length,
                assigned: this.taskQueue.filter(t => t.status === 'assigned').length,
                completed: this.taskQueue.filter(t => t.status === 'completed').length,
                failed: this.taskQueue.filter(t => t.status === 'failed').length
            },
            results: this.results.size
        };
    }
}

/**
 * Agent Worker - Individual agent with full MCP access
 */
class AgentWorker extends EventEmitter {
    constructor(id, parentId, depth, memory, mcpAccess) {
        super();
        this.id = id;
        this.parentId = parentId;
        this.depth = depth;
        this.memory = memory;
        this.mcpAccess = mcpAccess;
        this.status = 'idle';
        this.currentTask = null;
        this.subAgents = [];
        this.startTime = Date.now();
        this.completedTasks = 0;
    }

    async initialize() {
        this.status = 'ready';
        await this.memory.createEntity(
            `agent_${this.id}`,
            'agent',
            [`Created at depth ${this.depth}`, `Parent: ${this.parentId || 'root'}`]
        );
        this.emit('initialized');
    }

    async spawnSubAgent() {
        if (this.depth >= CONFIG.maxDepth) {
            throw new Error('Maximum agent depth reached');
        }

        const subAgentId = `${this.id}_sub_${this.subAgents.length}`;
        const subAgent = new AgentWorker(
            subAgentId,
            this.id,
            this.depth + 1,
            this.memory,
            this.mcpAccess
        );

        await subAgent.initialize();
        this.subAgents.push(subAgent);

        await this.memory.createRelation(
            `agent_${this.id}`,
            `agent_${subAgentId}`,
            'spawned'
        );

        this.emit('subagent:spawned', subAgent);
        return subAgent;
    }

    async executeTask(task) {
        this.status = 'working';
        this.currentTask = task;

        try {
            await this.memory.updateTaskStatus(task.id, 'in_progress');

            // Simulate task execution with MCP access
            const result = await this.processTask(task);

            await this.memory.updateTaskStatus(task.id, 'completed', result);
            this.completedTasks++;
            this.status = 'ready';
            this.currentTask = null;

            this.emit('task:completed', { task, result });
            return result;
        } catch (error) {
            await this.memory.updateTaskStatus(task.id, 'failed', { error: error.message });
            this.status = 'ready';
            this.currentTask = null;
            this.emit('task:failed', { task, error });
            throw error;
        }
    }

    async processTask(task) {
        // This is where the agent would use various MCPs
        const startTime = Date.now();

        // Simulate different task types
        switch (task.type) {
            case 'analyze':
                return await this.analyzeWithMCPs(task);
            case 'execute':
                return await this.executeWithMCPs(task);
            case 'research':
                return await this.researchWithMCPs(task);
            case 'parallel':
                return await this.parallelExecuteWithSubAgents(task);
            default:
                return { success: true, duration: Date.now() - startTime };
        }
    }

    async analyzeWithMCPs(task) {
        // Use sequential-thinking MCP for analysis
        await this.memory.addObservation(
            `agent_${this.id}`,
            `Analyzing: ${task.description}`
        );

        return {
            success: true,
            type: 'analysis',
            findings: task.data || {},
            agent: this.id,
            timestamp: Date.now()
        };
    }

    async executeWithMCPs(task) {
        // Use omnipotent/filesystem MCPs for execution
        await this.memory.addObservation(
            `agent_${this.id}`,
            `Executing: ${task.description}`
        );

        return {
            success: true,
            type: 'execution',
            output: 'Task executed successfully',
            agent: this.id,
            timestamp: Date.now()
        };
    }

    async researchWithMCPs(task) {
        // Use a2a-unified MCP for research
        await this.memory.addObservation(
            `agent_${this.id}`,
            `Researching: ${task.description}`
        );

        return {
            success: true,
            type: 'research',
            findings: 'Research completed',
            agent: this.id,
            timestamp: Date.now()
        };
    }

    async parallelExecuteWithSubAgents(task) {
        // Spawn sub-agents for parallel execution
        const subtasks = task.subtasks || [];
        const subAgents = [];

        for (let i = 0; i < Math.min(subtasks.length, 5); i++) {
            const subAgent = await this.spawnSubAgent();
            subAgents.push(subAgent);
        }

        const results = await Promise.all(
            subtasks.map((subtask, i) => {
                const agent = subAgents[i % subAgents.length];
                return agent.executeTask({
                    id: `${task.id}_sub_${i}`,
                    ...subtask
                });
            })
        );

        return {
            success: true,
            type: 'parallel',
            results,
            subAgentCount: subAgents.length,
            agent: this.id,
            timestamp: Date.now()
        };
    }

    getStatus() {
        return {
            id: this.id,
            parentId: this.parentId,
            depth: this.depth,
            status: this.status,
            currentTask: this.currentTask?.id || null,
            completedTasks: this.completedTasks,
            subAgents: this.subAgents.length,
            uptime: Date.now() - this.startTime
        };
    }

    async shutdown() {
        this.status = 'shutdown';
        for (const subAgent of this.subAgents) {
            await subAgent.shutdown();
        }
        this.emit('shutdown');
    }
}

/**
 * Master Orchestrator - Manages all agents and workflow
 */
class AgentOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.memory = new SharedMemory();
        this.agents = new Map();
        this.healthMonitor = null;
        this.isRunning = false;
        this.stats = {
            tasksProcessed: 0,
            agentsSpawned: 0,
            errors: 0
        };
    }

    async initialize() {
        await ensureWorkDir();

        // Create master entity in memory
        await this.memory.createEntity(
            'orchestrator',
            'system',
            ['Master orchestrator initialized', `Max agents: ${CONFIG.maxAgents}`]
        );

        // Set up event listeners
        this.setupEventListeners();

        // Start health monitoring
        this.startHealthMonitor();

        this.isRunning = true;
        this.emit('initialized');

        console.log('🚀 Multi-Agent Orchestrator initialized');
        console.log(`📊 Max agents: ${CONFIG.maxAgents}, Max depth: ${CONFIG.maxDepth}`);
    }

    setupEventListeners() {
        this.memory.on('task:queued', (task) => {
            console.log(`📝 Task queued: ${task.id}`);
        });

        this.memory.on('task:updated', (task) => {
            if (task.status === 'completed') {
                this.stats.tasksProcessed++;
                console.log(`✅ Task completed: ${task.id}`);
            }
        });

        this.memory.on('entity:created', (entity) => {
            if (entity.type === 'agent') {
                this.stats.agentsSpawned++;
            }
        });
    }

    async spawnAgent(parentId = null, depth = 0) {
        if (this.agents.size >= CONFIG.maxAgents) {
            throw new Error('Maximum agent limit reached');
        }

        const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const agent = new AgentWorker(
            agentId,
            parentId,
            depth,
            this.memory,
            CONFIG.mcpServers
        );

        await agent.initialize();
        this.agents.set(agentId, agent);

        agent.on('subagent:spawned', (subAgent) => {
            this.agents.set(subAgent.id, subAgent);
        });

        this.emit('agent:spawned', agent);
        console.log(`🤖 Agent spawned: ${agentId} (depth: ${depth})`);

        return agent;
    }

    async submitTask(task) {
        const taskId = await this.memory.queueTask(task);
        console.log(`📋 Task submitted: ${taskId} - ${task.description}`);
        return taskId;
    }

    async submitParallelTasks(tasks) {
        const taskIds = await Promise.all(
            tasks.map(task => this.memory.queueTask(task))
        );
        console.log(`📋 ${tasks.length} parallel tasks submitted`);
        return taskIds;
    }

    async processWorkflow(workflow) {
        console.log(`\n🔄 Processing workflow: ${workflow.name}`);

        // Spawn initial agents
        const agentPool = [];
        for (let i = 0; i < Math.min(workflow.parallelism || 3, CONFIG.maxAgents); i++) {
            const agent = await this.spawnAgent();
            agentPool.push(agent);
        }

        // Process tasks
        const results = [];
        for (const task of workflow.tasks) {
            const agent = agentPool[results.length % agentPool.length];
            const result = await agent.executeTask({
                id: `${workflow.name}_task_${results.length}`,
                ...task
            });
            results.push(result);
        }

        console.log(`✅ Workflow completed: ${workflow.name}`);
        return results;
    }

    startHealthMonitor() {
        this.healthMonitor = setInterval(() => {
            const memoryStats = this.memory.getStats();
            const agentStats = Array.from(this.agents.values()).map(a => a.getStatus());

            console.log(`\n💓 Health Check - ${new Date().toLocaleTimeString()}`);
            console.log(`   Agents: ${this.agents.size}/${CONFIG.maxAgents}`);
            console.log(`   Tasks: ${memoryStats.tasks.total} (${memoryStats.tasks.completed} completed)`);
            console.log(`   Errors: ${this.stats.errors}`);
        }, CONFIG.heartbeatInterval);
    }

    async getFullStatus() {
        const memoryStats = this.memory.getStats();
        const agentStats = Array.from(this.agents.values()).map(a => a.getStatus());

        return {
            orchestrator: {
                running: this.isRunning,
                uptime: Date.now() - this.startTime,
                stats: this.stats
            },
            memory: memoryStats,
            agents: {
                total: this.agents.size,
                byStatus: {
                    ready: agentStats.filter(a => a.status === 'ready').length,
                    working: agentStats.filter(a => a.status === 'working').length,
                    idle: agentStats.filter(a => a.status === 'idle').length
                },
                details: agentStats
            }
        };
    }

    async exportState() {
        const state = await this.getFullStatus();
        const exportPath = path.join(CONFIG.workDir, `state_${Date.now()}.json`);
        await fs.writeFile(exportPath, JSON.stringify(state, null, 2));
        console.log(`💾 State exported to: ${exportPath}`);
        return exportPath;
    }

    async shutdown() {
        console.log('\n🛑 Shutting down orchestrator...');

        this.isRunning = false;

        if (this.healthMonitor) {
            clearInterval(this.healthMonitor);
        }

        for (const agent of this.agents.values()) {
            await agent.shutdown();
        }

        await this.exportState();

        console.log('✅ Orchestrator shutdown complete');
        this.emit('shutdown');
    }
}

/**
 * Example Workflows
 */
const EXAMPLE_WORKFLOWS = {
    parallel_analysis: {
        name: 'Parallel System Analysis',
        parallelism: 5,
        tasks: [
            { type: 'analyze', description: 'Analyze CPU metrics', data: {} },
            { type: 'analyze', description: 'Analyze memory usage', data: {} },
            { type: 'analyze', description: 'Analyze disk I/O', data: {} },
            { type: 'analyze', description: 'Analyze network traffic', data: {} },
            { type: 'analyze', description: 'Analyze process tree', data: {} }
        ]
    },
    recursive_research: {
        name: 'Recursive Research Workflow',
        parallelism: 3,
        tasks: [
            {
                type: 'parallel',
                description: 'Multi-layer research',
                subtasks: [
                    { type: 'research', description: 'Research MCP architecture' },
                    { type: 'research', description: 'Research agent patterns' },
                    { type: 'research', description: 'Research orchestration methods' }
                ]
            }
        ]
    },
    full_deployment: {
        name: 'Full System Deployment',
        parallelism: 4,
        tasks: [
            { type: 'analyze', description: 'Pre-deployment checks' },
            { type: 'execute', description: 'Deploy services' },
            { type: 'execute', description: 'Configure networking' },
            { type: 'analyze', description: 'Verify deployment' },
            { type: 'execute', description: 'Run health checks' }
        ]
    }
};

/**
 * CLI Interface
 */
async function main() {
    const orchestrator = new AgentOrchestrator();
    orchestrator.startTime = Date.now();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        await orchestrator.shutdown();
        process.exit(0);
    });

    try {
        await orchestrator.initialize();

        console.log('\n🎯 Running example workflows...\n');

        // Run workflows
        for (const [key, workflow] of Object.entries(EXAMPLE_WORKFLOWS)) {
            await orchestrator.processWorkflow(workflow);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n📊 Final Status:');
        const status = await orchestrator.getFullStatus();
        console.log(JSON.stringify(status, null, 2));

        // Keep running for monitoring
        console.log('\n✨ System running. Press Ctrl+C to shutdown.\n');

    } catch (error) {
        console.error('❌ Orchestrator error:', error);
        await orchestrator.shutdown();
        process.exit(1);
    }
}

// Export for use as module
module.exports = {
    AgentOrchestrator,
    AgentWorker,
    SharedMemory,
    CONFIG
};

// Run if called directly
if (require.main === module) {
    main();
}
