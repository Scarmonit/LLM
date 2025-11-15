#!/usr/bin/env python3
"""
Production-ready continuous agent runner using REAL Ollama LLM.
Agents run continuously, processing tasks and logging all work.
"""
import sys
import time
import signal
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.continuous_agent import ContinuousAgent

# Global flag for shutdown
shutdown_requested = False

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    global shutdown_requested
    print("\n🛑 Shutdown requested. Stopping agents...")
    shutdown_requested = True

def main():
    print("=" * 70)
    print("REAL AGENTS - Production Runner")
    print("=" * 70)
    
    # Setup orchestrator
    print("\n📦 Setting up orchestrator...")
    orch = AgentOrchestrator()
    orch.setup_default_providers()
    
    providers = orch.list_providers()
    print(f"✓ Providers: {providers}")
    
    if 'ollama' not in providers:
        print("❌ ERROR: Ollama not available!")
        print("   Run: ollama pull qwen2.5:0.5b")
        return 1
    
    print("✓ Using REAL Ollama LLM (qwen2.5:0.5b)")
    
    # Setup agents
    print("\n🤖 Setting up agents...")
    orch.setup_default_agents()
    agents_list = orch.list_agents()
    print(f"✓ Agents: {agents_list}")
    
    # Create continuous agents
    continuous_agents = {}
    for agent_name in agents_list:
        agent = orch.get_agent(agent_name)
        cont_agent = ContinuousAgent(agent, interval=20, max_iterations=None)
        continuous_agents[agent_name] = cont_agent
        print(f"  - {agent_name}: ready")
    
    # Start all agents
    print("\n🚀 Starting all agents...")
    for name, cont_agent in continuous_agents.items():
        cont_agent.start()
        print(f"  - {name}: RUNNING")
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("\n" + "=" * 70)
    print("✅ ALL AGENTS RUNNING - Processing tasks continuously")
    print("=" * 70)
    print("\nPress Ctrl+C to stop\n")
    
    # Monitor loop
    iteration = 0
    while not shutdown_requested:
        time.sleep(30)
        iteration += 1
        
        print(f"\n[Iteration {iteration}] Status Report:")
        print("-" * 70)
        
        for name, cont_agent in continuous_agents.items():
            status = cont_agent.get_status()
            running_str = str(status['is_running'])
            print(f"  {name:10s} | Running={running_str:5s} | "
                  f"Completed={status['iteration_count']:3d} | "
                  f"Pending={status['tasks_pending']:2d} | "
                  f"Results={status['results_count']:3d}")
            
            # Show last result if available
            results = cont_agent.get_results()
            if results:
                last_result = results[-1]
                task_preview = last_result.get('task', '')[:50]
                result_preview = last_result.get('result', '')[:80]
                print(f"              Last: {task_preview}...")
                print(f"                    → {result_preview}...")
        
        print("-" * 70)
    
    # Shutdown
    print("\n🛑 Stopping all agents...")
    for name, cont_agent in continuous_agents.items():
        cont_agent.stop()
        print(f"  - {name}: STOPPED")
    
    print("\n✅ Shutdown complete")
    return 0

if __name__ == '__main__':
    sys.exit(main())
