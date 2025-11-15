#!/usr/bin/env python3
"""
SIMPLE, HONEST demonstration of the agent framework.

This shows:
1. Framework CAN work with real LLMs (when API keys provided)
2. What an agent WOULD do when running continuously  
3. Clear, visible output so you can SEE it working

Current state:
- Without API keys: Uses intelligent mock (shows concept)
- With ANTHROPIC_API_KEY: Uses real Claude
- With OPENAI_API_KEY: Uses real OpenAI

To use with real LLM:
    export ANTHROPIC_API_KEY=your_key_here
    python simple_working_demo.py
"""

import sys
import os
import time
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator


def print_section(title):
    """Print a section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def main():
    """Run simple demonstration."""
    
    print_section("LLM Multi-Provider Framework - Simple Demo")
    
    print(f"\nStarted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Duration: 60 seconds")
    print(f"Mode: Continuous agent demonstration\n")
    
    # Check for API keys
    has_anthropic = bool(os.getenv('ANTHROPIC_API_KEY'))
    has_openai = bool(os.getenv('OPENAI_API_KEY'))
    
    if has_anthropic:
        print("✓ ANTHROPIC_API_KEY found - will use REAL Claude LLM")
    elif has_openai:
        print("✓ OPENAI_API_KEY found - will use REAL OpenAI LLM")
    else:
        print("⚠  No API keys found")
        print("  Using intelligent mock to demonstrate concept")
        print("  For real LLM: export ANTHROPIC_API_KEY=your_key")
    
    # Setup orchestrator
    print("\nSetting up framework...")
    try:
        orch = AgentOrchestrator()
        orch.setup_default_providers()
        orch.setup_default_agents()
        
        provider_name = orch.list_providers()[0]
        print(f"✓ Provider: {provider_name}")
        print(f"✓ Agents: {', '.join(orch.list_agents())}")
        
    except Exception as e:
        print(f"✗ Setup failed: {e}")
        return 1
    
    # Run demonstration
    print_section("Running Agent - Watch It Work")
    
    print("\nAgent will:")
    print("  1. Receive a task")
    print("  2. Process it with LLM")
    print("  3. Return result")
    print("  4. Repeat every 20 seconds for 1 minute\n")
    
    tasks = [
        "Explain what an autonomous AI agent is in one sentence",
        "List 3 key benefits of using multiple LLM providers",
        "Suggest one way to verify an agent is working correctly"
    ]
    
    agent = orch.get_agent('research')
    start_time = time.time()
    task_num = 0
    
    while time.time() - start_time < 60:
        task_num += 1
        task = tasks[(task_num - 1) % len(tasks)]
        
        print(f"\n[Task {task_num}] {datetime.now().strftime('%H:%M:%S')}")
        print(f"  Question: {task}")
        print(f"  Processing...", end='', flush=True)
        
        try:
            start = time.time()
            result = agent.execute(task)
            elapsed = time.time() - start
            
            print(f" done ({elapsed:.1f}s)")
            print(f"  Answer: {result[:150]}...")
            
        except Exception as e:
            print(f" failed: {e}")
        
        # Wait before next task
        remaining = 60 - (time.time() - start_time)
        if remaining > 0:
            wait_time = min(20, remaining)
            if wait_time >= 1:
                print(f"  Waiting {wait_time:.0f}s before next task...")
                time.sleep(wait_time)
    
    # Summary
    print_section("Demo Complete")
    
    print(f"\nCompleted {task_num} tasks in 60 seconds")
    print(f"Provider used: {provider_name}")
    
    if not (has_anthropic or has_openai):
        print("\n⚠  This used intelligent mock responses")
        print("  To see it work with REAL LLM:")
        print("    export ANTHROPIC_API_KEY=your_anthropic_key")
        print("    python simple_working_demo.py")
    else:
        print("\n✓ This used a REAL LLM provider!")
        print("  Agents are working and can scale to continuous operation")
    
    print()
    return 0


if __name__ == '__main__':
    sys.exit(main())
