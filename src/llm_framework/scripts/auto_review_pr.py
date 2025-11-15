"""Auto review PR script."""

import argparse
import json
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.github_integration import GitHubIntegration
from llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer


def main():
    """Run automated PR review."""
    parser = argparse.ArgumentParser(description="Automated PR review")
    parser.add_argument("--pr-number", type=int, required=True, help="PR number")
    parser.add_argument("--repo-owner", required=True, help="Repository owner")
    parser.add_argument("--repo-name", required=True, help="Repository name")
    parser.add_argument(
        "--auto-approve", action="store_true", help="Auto-approve if no issues"
    )

    args = parser.parse_args()

    # Setup orchestrator and providers
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()

    # Get available provider
    providers = orchestrator.list_providers()
    if not providers:
        print("Error: No LLM provider available")
        sys.exit(1)

    provider = orchestrator.providers[providers[0]]

    # Create code review agent
    agent = create_code_review_agent(provider)

    # Setup GitHub integration
    github = GitHubIntegration(args.repo_owner, args.repo_name)

    # Create PR reviewer
    reviewer = PRReviewer(agent, github)

    # Review the PR
    print(f"Reviewing PR #{args.pr_number}...")
    review_result = reviewer.review_pr(args.pr_number, auto_approve=args.auto_approve)

    # Save review summary
    summary = {
        "status": "completed" if review_result else "failed",
        "pr_number": args.pr_number,
        "issues": [],
        "suggestions": [],
    }

    # Extract issues and suggestions from review
    if review_result:
        review_body = review_result.get("body", "")

        # Simple parsing for demo - in production, use more sophisticated parsing
        if "issue" in review_body.lower() or "problem" in review_body.lower():
            summary["issues"].append(
                "Potential issues detected - see review for details"
            )

        if "suggest" in review_body.lower() or "recommend" in review_body.lower():
            summary["suggestions"].append(
                "Suggestions provided - see review for details"
            )

    # Write summary
    with open("review_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("Review completed!")
    if review_result:
        print(f"Review posted: {review_result.get('html_url', 'N/A')}")
    else:
        print("Failed to post review")

    return 0 if review_result else 1


if __name__ == "__main__":
    sys.exit(main())
