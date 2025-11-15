#!/usr/bin/env python3
"""Continuous agent runner with GitHub Copilot integration."""

import sys
import os
import signal
import argparse

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.continuous_agent import ContinuousAgent
from llm_framework.github_integration import GitHubIntegration, AgentGitHubBridge


def main():
    """Run continuous agents with GitHub integration."""
    parser = argparse.ArgumentParser(
        description="Run LLM agents continuously with GitHub Copilot integration"
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
        help="GitHub repository owner (default: from GITHUB_REPO_OWNER env)"
    )
    parser.add_argument(
        "--repo-name",
        type=str,
        help="GitHub repository name (default: from GITHUB_REPO_NAME env)"
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

    print("=" * 70)
    print("LLM Multi-Provider Framework - Continuous Agent Runner")
    print("=" * 70)
    print()

    # Set up orchestrator
    print("Setting up orchestrator...")
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()

    if not orchestrator.list_providers():
        print("⚠️  No providers available. Configure Claude or Ollama first.")
        print()
        print("For Claude: export ANTHROPIC_API_KEY=your_key")
        print("For Ollama: Install and run Ollama server")
        return

    orchestrator.setup_default_agents()
    print(f"✓ Providers: {', '.join(orchestrator.list_providers())}")
    print(f"✓ Agents: {', '.join(orchestrator.list_agents())}")
    print()

    # Set up GitHub integration
    repo_owner = args.repo_owner or os.getenv("GITHUB_REPO_OWNER")
    repo_name = args.repo_name or os.getenv("GITHUB_REPO_NAME")
    
    github_bridge = None
    if repo_owner and repo_name:
        print(f"Setting up GitHub integration for {repo_owner}/{repo_name}...")
        github = GitHubIntegration(repo_owner, repo_name)
        github_bridge = AgentGitHubBridge(github, args.issue_number)
        print("✓ GitHub integration enabled")
    else:
        print("ℹ️  GitHub integration disabled (set GITHUB_REPO_OWNER/GITHUB_REPO_NAME)")
    print()

    # Determine which agents to run
    if args.agent == "all":
        agent_names = orchestrator.list_agents()
    else:
        agent_names = [args.agent]

    # Create continuous agents
    continuous_agents = []
    for name in agent_names:
        agent = orchestrator.get_agent(name)
        if agent:
            cont_agent = ContinuousAgent(
                agent=agent,
                interval=args.interval,
                max_iterations=args.max_iterations
            )
            
            # Set up GitHub callback if available
            if github_bridge:
                cont_agent.on_result_callback = github_bridge
            
            continuous_agents.append((name, cont_agent))

    print(f"Starting {len(continuous_agents)} continuous agent(s)...")
    print(f"Interval: {args.interval} seconds")
    if args.max_iterations:
        print(f"Max iterations: {args.max_iterations}")
    else:
        print("Max iterations: unlimited")
    print()
    print("Press Ctrl+C to stop")
    print("-" * 70)
    print()

    # Start all agents
    for name, cont_agent in continuous_agents:
        cont_agent.start()
        print(f"✓ Started {name} agent")

    # Handle shutdown gracefully
    def signal_handler(sig, frame):
        print("\n\nShutting down agents...")
        for name, cont_agent in continuous_agents:
            cont_agent.stop()
            print(f"✓ Stopped {name} agent")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Add some example tasks
    print("\nAdding example tasks to demonstrate continuous operation...")
    for name, cont_agent in continuous_agents:
        if name == "research":
            cont_agent.add_task("Research the latest developments in AI agents")
        elif name == "coding":
            cont_agent.add_task("Write a Python function to calculate fibonacci numbers")
        elif name == "writing":
            cont_agent.add_task("Write a short introduction to autonomous AI systems")

    # Keep the main thread alive
    print("\nAgents are running. Monitoring status every 30 seconds...")
    print("Add tasks to the queue by modifying the code or via API (future feature)")
    print()

    try:
        import time
        while True:
            time.sleep(30)
            print("\n--- Status Update ---")
            for name, cont_agent in continuous_agents:
                status = cont_agent.get_status()
                print(f"{name}: Iterations={status['iteration_count']}, "
                      f"Pending={status['tasks_pending']}, "
                      f"Results={status['results_count']}")
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)


if __name__ == "__main__":
    main()
