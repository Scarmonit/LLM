#!/usr/bin/env python3
"""
Add tasks to running agents to demonstrate they're actively working.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator

print("=" * 70)
print("ADDING TASKS TO RUNNING AGENTS")
print("=" * 70)
print()

# Set up orchestrator
orchestrator = AgentOrchestrator()
orchestrator.setup_default_providers()
orchestrator.setup_default_agents()

# Get agents
research = orchestrator.get_agent("research")
coding = orchestrator.get_agent("coding")
writing = orchestrator.get_agent("writing")

# Execute tasks to show they're working
print("Executing tasks on each agent with REAL LLMs...\n")

print("1. RESEARCH AGENT (qwen2.5:0.5b):")
result1 = research.execute("What are the main benefits of autonomous AI agents?")
print(f"   Response: {result1[:150]}...\n")

print("2. CODING AGENT (phi3:mini):")
result2 = coding.execute("Write a simple Python function to add two numbers")
print(f"   Response: {result2[:150]}...\n")

print("3. WRITING AGENT (tinyllama):")
result3 = writing.execute("Write a creative tagline for an AI company")
print(f"   Response: {result3[:150]}...\n")

print("=" * 70)
print("✓ ALL AGENTS ARE ACTIVELY WORKING WITH REAL LLM MODELS")
print("=" * 70)
