#!/usr/bin/env python3
"""
Example: Continuous agent with GitHub Copilot integration

This demonstrates how agents can run continuously and send prompts to Copilot.
"""

import sys
import os
import time

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.continuous_agent import ContinuousAgent
from llm_framework.github_integration import GitHubIntegration, AgentGitHubBridge


def example_continuous_agent():
    """Example of running a continuous agent."""
    print("=" * 70)
    print("Example: Continuous Agent")
    print("=" * 70)
    print()
    
    # Set up orchestrator (mock provider for demo)
    orchestrator = AgentOrchestrator()
    
    # In a real scenario, you would:
    # orchestrator.setup_default_providers()
    # orchestrator.setup_default_agents()
    
    # For this demo, we'll use a mock
    from tests.test_base_provider import MockProvider
    from llm_framework.core.agent import Agent, AgentConfig
    
    config = AgentConfig(
        name="Demo Research Agent",
        system_prompt="You are a helpful research assistant",
        temperature=0.5
    )
    
    agent = Agent(config, MockProvider())
    
    # Create continuous agent
    cont_agent = ContinuousAgent(agent, interval=2, max_iterations=3)
    
    # Add some tasks
    cont_agent.add_task("What are the benefits of AI agents?")
    cont_agent.add_task("How does continuous execution work?")
    cont_agent.add_task("Explain autonomous systems")
    
    print("Starting continuous agent...")
    print(f"Tasks in queue: {len(cont_agent.task_queue)}")
    print()
    
    # Start the agent
    cont_agent.start()
    
    # Monitor progress
    for i in range(8):
        time.sleep(1)
        status = cont_agent.get_status()
        print(f"[{i+1}s] Iterations: {status['iteration_count']}, "
              f"Pending: {status['tasks_pending']}, "
              f"Results: {status['results_count']}")
    
    # Stop the agent
    cont_agent.stop()
    
    print()
    print("Continuous agent stopped.")
    print()
    print("Results:")
    print("-" * 70)
    for result in cont_agent.get_results():
        print(f"\nTask: {result['task']}")
        print(f"Result: {result['result'][:100]}...")
        print(f"Timestamp: {result['timestamp']}")


def example_github_integration():
    """Example of GitHub integration (mock)."""
    print()
    print("=" * 70)
    print("Example: GitHub Integration")
    print("=" * 70)
    print()
    
    # Create GitHub integration
    # In a real scenario, you would provide:
    # - GITHUB_TOKEN environment variable
    # - Your actual repo owner and name
    # - An issue number to post to
    
    print("Setting up GitHub integration...")
    github = GitHubIntegration("Scarmonit", "LLM")
    bridge = AgentGitHubBridge(github, issue_number=83)
    
    print("✓ GitHub integration configured")
    print()
    
    print("How it works:")
    print("1. Agent executes a task")
    print("2. Result is passed to the bridge callback")
    print("3. Bridge formats the message mentioning @copilot")
    print("4. Message is posted to GitHub issue #83")
    print()
    
    # Simulate a callback
    print("Simulating agent result callback...")
    task = "Research the latest AI developments"
    result = "AI agents are becoming increasingly autonomous..."
    
    print(f"Task: {task}")
    print(f"Result: {result}")
    print()
    
    # This would post to GitHub if GITHUB_TOKEN was set
    print("(Would post to GitHub if GITHUB_TOKEN environment variable was set)")
    print()
    
    print("Example message that would be posted:")
    print("-" * 70)
    print(f"@copilot Task completed:\n")
    print(f"**Task:** {task}\n")
    print(f"**Result:** {result}\n")
    print(f"Please review and provide feedback or next steps.")
    print()
    print("---")
    print("*Sent by Autonomous Agent*")


def main():
    """Run all examples."""
    example_continuous_agent()
    example_github_integration()
    
    print()
    print("=" * 70)
    print("Examples Complete!")
    print("=" * 70)
    print()
    print("To run with real LLM providers:")
    print("  export ANTHROPIC_API_KEY=your_key")
    print("  # or run Ollama server")
    print()
    print("To enable GitHub integration:")
    print("  export GITHUB_TOKEN=your_token")
    print("  export GITHUB_REPO_OWNER=Scarmonit")
    print("  export GITHUB_REPO_NAME=LLM")
    print()
    print("Then run:")
    print("  python run_continuous.py --agent research --issue-number 83")


if __name__ == "__main__":
    main()
