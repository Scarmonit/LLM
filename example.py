#!/usr/bin/env python3
"""Example usage of the LLM Multi-Provider Framework."""

import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator


def main():
    """Run example usage of the framework."""
    print("=" * 60)
    print("LLM Multi-Provider Framework - Example")
    print("=" * 60)
    print()

    # Create orchestrator
    orchestrator = AgentOrchestrator()

    # Set up default providers
    print("Setting up providers...")
    orchestrator.setup_default_providers()

    available_providers = orchestrator.list_providers()
    if not available_providers:
        print("⚠️  No providers are available.")
        print()
        print("To use Claude:")
        print("  - Set ANTHROPIC_API_KEY environment variable")
        print()
        print("To use Ollama:")
        print("  - Install and run Ollama server (https://ollama.ai)")
        print("  - Default URL: http://localhost:11434")
        print()
        return

    print(f"✓ Available providers: {', '.join(available_providers)}")
    print()

    # Set up default agents
    print("Setting up agents...")
    orchestrator.setup_default_agents()
    print(f"✓ Available agents: {', '.join(orchestrator.list_agents())}")
    print()

    # Get system status
    print("System Status:")
    print("-" * 60)
    status = orchestrator.get_system_status()

    print("\nProviders:")
    for name, info in status["providers"].items():
        status_icon = "✓" if info["available"] else "✗"
        print(f"  {status_icon} {name}: {info['name']}")

    print("\nAgents:")
    for name, info in status["agents"].items():
        provider_status = "✓" if info["provider_available"] else "✗"
        print(f"  {provider_status} {name}: {info['name']}")
        print(f"     Provider: {info['provider']}")
        print(f"     Temperature: {info['config']['temperature']}")

    print()
    print("-" * 60)

    # Example: Use the research agent
    print("\nExample: Using Research Agent")
    print("-" * 60)
    research_agent = orchestrator.get_agent("research")
    if research_agent:
        try:
            task = "What are the key benefits of autonomous AI agents?"
            print(f"Task: {task}")
            print()
            result = research_agent.execute(task)
            print("Response:")
            print(result)
        except Exception as e:
            print(f"Error executing task: {e}")

    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
