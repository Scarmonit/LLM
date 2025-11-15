#!/usr/bin/env python3
"""
Production runner that shows ACTUAL WORK being done.
Logs every task and response so you can SEE what agents are doing.
"""
import sys
import os
import time
import signal
import argparse
import logging
from datetime import datetime

sys.path.insert(0, 'src')

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.continuous_agent import ContinuousAgent

# Setup detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/llm_visible_work.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Global shutdown flag
shutdown_requested = False

def signal_handler(sig, frame):
    global shutdown_requested
    logger.info("Shutdown requested...")
    shutdown_requested = True

def log_task_and_result(task, result):
    """Log each task and its result so it's visible"""
    logger.info("="*80)
    logger.info(f"TASK: {task}")
    logger.info(f"RESULT ({len(result)} chars):")
    logger.info(result[:300] + ("..." if len(result) > 300 else ""))
    logger.info("="*80)
    
    # Also write to a separate results file
    with open('/tmp/llm_task_results.txt', 'a') as f:
        f.write(f"\n{'='*80}\n")
        f.write(f"Time: {datetime.now().isoformat()}\n")
        f.write(f"Task: {task}\n")
        f.write(f"Result:\n{result}\n")
        f.write(f"{'='*80}\n\n")

def main():
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    parser = argparse.ArgumentParser(description='Run LLM agents with visible output')
    parser.add_argument('--agent', default='all', help='Agent to run (research/coding/writing/all)')
    parser.add_argument('--interval', type=int, default=20, help='Interval between tasks in seconds')
    args = parser.parse_args()
    
    logger.info("="*80)
    logger.info("LLM Multi-Provider Framework - VISIBLE WORK MODE")
    logger.info("="*80)
    logger.info(f"Started at: {datetime.now()}")
    logger.info(f"PID: {os.getpid()}")
    logger.info(f"View task results: tail -f /tmp/llm_task_results.txt")
    logger.info("")
    
    # Clear previous results
    open('/tmp/llm_task_results.txt', 'w').close()
    
    # Setup
    logger.info("Setting up orchestrator...")
    orch = AgentOrchestrator()
    orch.setup_default_providers()
    orch.setup_default_agents()
    
    provider_info = list(orch.providers.values())[0]
    logger.info(f"Provider: {provider_info.__class__.__name__}")
    if hasattr(provider_info, 'model'):
        logger.info(f"Model: {provider_info.model}")
    
    logger.info(f"Available agents: {orch.list_agents()}")
    logger.info("")
    
    # Setup continuous agents with visible callbacks
    continuous_agents = {}
    agents_to_run = orch.list_agents() if args.agent == 'all' else [args.agent]
    
    for agent_name in agents_to_run:
        agent = orch.get_agent(agent_name)
        cont = ContinuousAgent(agent, interval=args.interval)
        
        # Add callback to log every task/result
        def make_callback(name):
            def callback(task, result):
                logger.info(f"[{name.upper()}] Completed task")
                log_task_and_result(task, result)
            return callback
        
        cont.on_result_callback = make_callback(agent_name)
        continuous_agents[agent_name] = cont
        
    # Start all agents
    logger.info(f"Starting {len(continuous_agents)} agent(s)...")
    for name, cont in continuous_agents.items():
        cont.start()
        logger.info(f"✓ Started {name} agent")
    
    logger.info("")
    logger.info("AGENTS ARE NOW WORKING - Watch the output above to see tasks and results")
    logger.info("Press Ctrl+C to stop")
    logger.info("")
    
    # Monitor
    while not shutdown_requested:
        time.sleep(60)
        logger.info("")
        logger.info("=== Agent Status ===")
        for name, cont in continuous_agents.items():
            status = cont.get_status()
            logger.info(f"{name}: Running={status['running']}, "
                       f"Iterations={status['iteration_count']}, "
                       f"Pending={len(status['task_queue'])}, "
                       f"Results={len(status['results_history'])}")
    
    # Cleanup
    logger.info("")
    logger.info("Stopping agents...")
    for name, cont in continuous_agents.items():
        cont.stop()
        logger.info(f"✓ Stopped {name} agent")
    
    logger.info("Shutdown complete")

if __name__ == '__main__':
    main()
