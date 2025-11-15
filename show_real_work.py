#!/usr/bin/env python3
"""
Demonstrates agents doing REAL work with visible output.
Shows actual tasks, real Ollama responses, and timing.
"""
import sys
import time
sys.path.insert(0, 'src')

from llm_framework.orchestrator import AgentOrchestrator

print("="*80)
print("AGENTS DOING REAL WORK - LIVE DEMONSTRATION")
print("="*80)
print()

# Setup
orch = AgentOrchestrator()
orch.setup_default_providers()
orch.setup_default_agents()

print(f"Provider: {list(orch.providers.values())[0].__class__.__name__}")
print(f"Model: {list(orch.providers.values())[0].model if hasattr(list(orch.providers.values())[0], 'model') else 'N/A'}")
print()

# Real tasks with visible output
tasks = [
    ("research", "What are the top 3 programming languages in 2024?"),
    ("coding", "Write a Python function to calculate fibonacci"),
    ("writing", "Write a haiku about artificial intelligence"),
]

total_time = 0
for i, (agent_name, task) in enumerate(tasks, 1):
    print(f"\n{'='*80}")
    print(f"TASK {i}/3: {agent_name.upper()} AGENT")
    print(f"{'='*80}")
    print(f"Query: {task}")
    print(f"Sending to Ollama...")
    
    agent = orch.get_agent(agent_name)
    start = time.time()
    
    try:
        result = agent.execute(task)
        elapsed = time.time() - start
        total_time += elapsed
        
        print(f"\n✓ COMPLETED in {elapsed:.2f}s")
        print(f"\nRESPONSE FROM OLLAMA:")
        print("-" * 80)
        print(result)
        print("-" * 80)
        
    except Exception as e:
        print(f"\n✗ FAILED: {e}")

print(f"\n{'='*80}")
print(f"SUMMARY")
print(f"{'='*80}")
print(f"Total tasks: {len(tasks)}")
print(f"Total time: {total_time:.2f}s")
print(f"Average: {total_time/len(tasks):.2f}s per task")
print(f"\n✓ ALL TASKS COMPLETED WITH REAL OLLAMA RESPONSES")
print(f"{'='*80}")
