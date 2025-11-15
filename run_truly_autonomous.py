#!/usr/bin/env python3
"""
Run truly autonomous agents that monitor and work on the repository.
These agents find their own work and execute it without human intervention.
"""
import sys
import os
import time
import signal
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.autonomous_agent import (
    CodeAnalysisAgent,
    TestMonitorAgent,
    DocumentationAgent,
    IssueMonitorAgent
)


def signal_handler(sig, frame):
    """Handle shutdown gracefully."""
    print("\n\nShutting down autonomous agents...")
    sys.exit(0)


def main():
    """Run autonomous agents."""
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("="*80)
    print("TRULY AUTONOMOUS AGENTS")
    print("="*80)
    print(f"Started: {datetime.now().isoformat()}")
    print(f"Mode: Autonomous repository monitoring")
    print(f"Repo: {os.getcwd()}")
    print()
    
    # Setup orchestrator
    orch = AgentOrchestrator()
    orch.setup_default_providers()
    orch.setup_default_agents()
    
    print("Providers:", orch.list_providers())
    print("Base agents:", orch.list_agents())
    print()
    
    # Create autonomous agents
    repo_path = os.getcwd()
    
    autonomous_agents = [
        CodeAnalysisAgent(orch.get_agent('coding'), repo_path),
        TestMonitorAgent(orch.get_agent('research'), repo_path),
        DocumentationAgent(orch.get_agent('writing'), repo_path),
        IssueMonitorAgent(orch.get_agent('research'), repo_path),
    ]
    
    print("Autonomous Agents:")
    for agent in autonomous_agents:
        print(f"  - {agent.name}")
    print()
    print("Agents are now monitoring the repository and finding work autonomously...")
    print("Work logs: /tmp/autonomous_*_log.json")
    print("Press Ctrl+C to stop")
    print("="*80)
    print()
    
    # Main loop
    cycle = 0
    while True:
        cycle += 1
        print(f"\n[Cycle {cycle}] {datetime.now().strftime('%H:%M:%S')}")
        
        work_done = False
        for agent in autonomous_agents:
            if agent.run_cycle():
                work_done = True
                
        if not work_done:
            print("  No work found this cycle")
            
        # Wait between cycles
        time.sleep(30)  # 30 second cycles


if __name__ == '__main__':
    main()
