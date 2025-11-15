#!/usr/bin/env python3
"""
Production-ready continuous agent runner with auto-restart and monitoring.
This version ensures agents are always running.
"""

import sys
import os
import signal
import argparse
import time
import logging
from datetime import datetime

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.continuous_agent import ContinuousAgent
from llm_framework.github_integration import GitHubIntegration, AgentGitHubBridge

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/llm_agents.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class PersistentAgentRunner:
    """Manages agents with automatic restart and monitoring."""
    
    def __init__(self, args):
        self.args = args
        self.continuous_agents = []
        self.running = True
        self.restart_count = 0
        self.max_restarts = 100
        
    def setup_agents(self):
        """Set up agents and providers."""
        logger.info("Setting up orchestrator...")
        orchestrator = AgentOrchestrator()
        
        # Set up all available providers (includes mock as fallback)
        orchestrator.setup_default_providers()
        
        logger.info(f"Available providers: {orchestrator.list_providers()}")
        
        # Set up default agents using available providers
        orchestrator.setup_default_agents()
            
        logger.info(f"Available agents: {orchestrator.list_agents()}")
        
        # Set up GitHub integration if configured
        github_bridge = None
        repo_owner = self.args.repo_owner or os.getenv("GITHUB_REPO_OWNER")
        repo_name = self.args.repo_name or os.getenv("GITHUB_REPO_NAME")
        
        if repo_owner and repo_name:
            logger.info(f"Setting up GitHub integration for {repo_owner}/{repo_name}")
            github = GitHubIntegration(repo_owner, repo_name)
            github_bridge = AgentGitHubBridge(github, self.args.issue_number)
        
        # Determine which agents to run
        if self.args.agent == "all":
            agent_names = orchestrator.list_agents()
        else:
            agent_names = [self.args.agent]
        
        # Create continuous agents
        for name in agent_names:
            agent = orchestrator.get_agent(name)
            if agent:
                cont_agent = ContinuousAgent(
                    agent=agent,
                    interval=self.args.interval,
                    max_iterations=self.args.max_iterations
                )
                
                # Set up GitHub callback if available
                if github_bridge:
                    cont_agent.on_result_callback = github_bridge
                
                # Add demo tasks for testing
                cont_agent.add_task(f"Analyze the current state of {name} capabilities")
                cont_agent.add_task(f"List best practices for {name} tasks")
                
                self.continuous_agents.append((name, cont_agent))
        
        return len(self.continuous_agents) > 0
    
    def start_agents(self):
        """Start all continuous agents."""
        logger.info(f"Starting {len(self.continuous_agents)} continuous agent(s)...")
        
        for name, cont_agent in self.continuous_agents:
            cont_agent.start()
            logger.info(f"✓ Started {name} agent")
    
    def monitor_agents(self):
        """Monitor agents and restart if needed."""
        logger.info("Monitoring agents. Press Ctrl+C to stop.")
        
        last_status_time = time.time()
        status_interval = 60  # Log status every 60 seconds
        
        while self.running:
            try:
                # Check agent status periodically
                current_time = time.time()
                if current_time - last_status_time >= status_interval:
                    self.log_status()
                    last_status_time = current_time
                
                # Check if any agent has stopped unexpectedly
                for name, cont_agent in self.continuous_agents:
                    if not cont_agent.is_running and self.running:
                        logger.warning(f"Agent {name} stopped unexpectedly. Restarting...")
                        self.restart_agent(name, cont_agent)
                
                time.sleep(5)  # Check every 5 seconds
                
            except KeyboardInterrupt:
                logger.info("Received shutdown signal...")
                self.running = False
                break
    
    def restart_agent(self, name, cont_agent):
        """Restart a stopped agent."""
        if self.restart_count >= self.max_restarts:
            logger.error(f"Max restart limit ({self.max_restarts}) reached. Stopping.")
            self.running = False
            return
        
        self.restart_count += 1
        logger.info(f"Restarting {name} agent (attempt {self.restart_count})...")
        
        try:
            cont_agent.start()
            logger.info(f"✓ Restarted {name} agent successfully")
        except Exception as e:
            logger.error(f"Failed to restart {name} agent: {e}")
    
    def log_status(self):
        """Log current status of all agents."""
        logger.info("=== Agent Status ===")
        for name, cont_agent in self.continuous_agents:
            status = cont_agent.get_status()
            logger.info(f"{name}: Running={status['is_running']}, "
                       f"Iterations={status['iteration_count']}, "
                       f"Pending={status['tasks_pending']}, "
                       f"Results={status['results_count']}")
    
    def stop_agents(self):
        """Stop all agents gracefully."""
        logger.info("Stopping all agents...")
        for name, cont_agent in self.continuous_agents:
            try:
                cont_agent.stop()
                logger.info(f"✓ Stopped {name} agent")
            except Exception as e:
                logger.error(f"Error stopping {name} agent: {e}")
    
    def run(self):
        """Main run loop."""
        try:
            # Set up signal handlers
            signal.signal(signal.SIGINT, lambda s, f: self.shutdown())
            signal.signal(signal.SIGTERM, lambda s, f: self.shutdown())
            
            # Set up and start agents
            if not self.setup_agents():
                logger.error("Failed to set up agents")
                return 1
            
            self.start_agents()
            
            # Monitor agents
            self.monitor_agents()
            
        except Exception as e:
            logger.error(f"Fatal error: {e}", exc_info=True)
            return 1
        finally:
            self.stop_agents()
        
        logger.info("Shutdown complete")
        return 0
    
    def shutdown(self):
        """Handle shutdown signal."""
        logger.info("Shutdown requested...")
        self.running = False


def main():
    """Entry point."""
    parser = argparse.ArgumentParser(
        description="Production-ready LLM agent runner with auto-restart"
    )
    parser.add_argument(
        "--agent",
        choices=["research", "coding", "writing", "all"],
        default="all",
        help="Which agent(s) to run continuously"
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=60,
        help="Time between task checks in seconds (default: 60)"
    )
    parser.add_argument(
        "--repo-owner",
        type=str,
        help="GitHub repository owner"
    )
    parser.add_argument(
        "--repo-name",
        type=str,
        help="GitHub repository name"
    )
    parser.add_argument(
        "--issue-number",
        type=int,
        help="GitHub issue number for threaded conversation"
    )
    parser.add_argument(
        "--max-iterations",
        type=int,
        help="Maximum iterations before stopping (default: unlimited)"
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 70)
    logger.info("LLM Multi-Provider Framework - Production Runner")
    logger.info("=" * 70)
    logger.info(f"Started at: {datetime.now()}")
    logger.info(f"PID: {os.getpid()}")
    
    runner = PersistentAgentRunner(args)
    sys.exit(runner.run())


if __name__ == "__main__":
    main()
