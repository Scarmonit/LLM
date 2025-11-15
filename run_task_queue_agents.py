#!/usr/bin/env python3
"""
Agents that process tasks from a queue YOU control.
No auto-generated busywork - only processes tasks you submit.
"""
import sys
import os
import time
import signal
import logging
from datetime import datetime

sys.path.insert(0, 'src')

from llm_framework.orchestrator import AgentOrchestrator
from task_queue import get_next_task, complete_task, load_queue

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/task_queue_agents.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

shutdown_requested = False

def signal_handler(sig, frame):
    global shutdown_requested
    logger.info("Shutdown requested...")
    shutdown_requested = True

def main():
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("="*80)
    logger.info("TASK QUEUE AGENTS - Processing YOUR Tasks")
    logger.info("="*80)
    logger.info(f"Started at: {datetime.now()}")
    logger.info(f"PID: {os.getpid()}")
    logger.info("")
    logger.info("Submit tasks with: python task_queue.py add <agent> <task>")
    logger.info("View results with: python task_queue.py results")
    logger.info("")
    
    # Setup
    logger.info("Setting up orchestrator...")
    orch = AgentOrchestrator()
    orch.setup_default_providers()
    orch.setup_default_agents()
    
    provider = list(orch.providers.values())[0]
    logger.info(f"Provider: {provider.__class__.__name__}")
    if hasattr(provider, 'model'):
        logger.info(f"Model: {provider.model}")
    logger.info("")
    
    agents = {
        'research': orch.get_agent('research'),
        'coding': orch.get_agent('coding'),
        'writing': orch.get_agent('writing')
    }
    
    logger.info("Agents ready. Waiting for tasks...")
    logger.info("")
    
    check_interval = 5  # Check for new tasks every 5 seconds
    last_queue_check = time.time()
    
    while not shutdown_requested:
        current_time = time.time()
        
        # Check for tasks periodically
        if current_time - last_queue_check >= check_interval:
            last_queue_check = current_time
            
            # Check each agent type
            for agent_type, agent in agents.items():
                task_entry = get_next_task(agent_type)
                
                if task_entry:
                    task_id = task_entry['id']
                    task = task_entry['task']
                    
                    logger.info(f"{'='*80}")
                    logger.info(f"Processing Task #{task_id}")
                    logger.info(f"Agent: {agent_type}")
                    logger.info(f"Task: {task}")
                    logger.info(f"{'='*80}")
                    
                    try:
                        result = agent.execute(task)
                        complete_task(task_id, result)
                        
                        logger.info(f"\n✓ Task #{task_id} COMPLETED")
                        logger.info(f"Result ({len(result)} chars):")
                        logger.info(f"{result[:500]}...")
                        logger.info(f"{'='*80}\n")
                        
                    except Exception as e:
                        error_msg = f"Error: {str(e)}"
                        complete_task(task_id, error_msg)
                        logger.error(f"✗ Task #{task_id} FAILED: {error_msg}\n")
        
        time.sleep(1)
    
    logger.info("Shutdown complete")

if __name__ == '__main__':
    main()
