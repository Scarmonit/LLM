"""Check PR status script."""

import argparse
import json
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from llm_framework.github_integration import GitHubIntegration
from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer


def main():
    """Check if PR is ready for merge."""
    parser = argparse.ArgumentParser(description="Check PR status for auto-merge")
    parser.add_argument("--pr-number", type=int, required=True, help="PR number")
    parser.add_argument("--repo-owner", required=True, help="Repository owner")
    parser.add_argument("--repo-name", required=True, help="Repository name")

    args = parser.parse_args()

    # Setup GitHub integration
    github = GitHubIntegration(args.repo_owner, args.repo_name)

    # Setup orchestrator for reviewer
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()

    providers = orchestrator.list_providers()
    if not providers:
        print("Error: No LLM provider available")
        sys.exit(1)

    provider = orchestrator.providers[providers[0]]
    agent = create_code_review_agent(provider)

    # Create PR reviewer
    reviewer = PRReviewer(agent, github)

    # Validate PR
    print(f"Checking PR #{args.pr_number} status...")
    validation = reviewer.validate_pr(args.pr_number)

    # Output for GitHub Actions
    ready = validation["valid"]

    # Write output to GITHUB_OUTPUT environment file (modern approach)
    github_output = os.getenv("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as f:
            f.write(f"ready={str(ready).lower()}\n")
    else:
        # Fallback for local testing
        print(f"ready={str(ready).lower()}")

    # Save validation details
    with open("pr_validation.json", "w", encoding="utf-8") as f:
        json.dump(validation, f, indent=2)

    print(f"PR ready for merge: {ready}")
    print(f"Validation details: {validation}")

    return 0 if ready else 1


if __name__ == "__main__":
    sys.exit(main())
