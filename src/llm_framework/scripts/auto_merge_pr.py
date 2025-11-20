"""Auto merge PR script."""

import argparse
import json
import logging
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from llm_framework.github_integration import GitHubIntegration
from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer

# Configure logging
logging.basicConfig(
    format='%(levelname)s: %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def main():
    """Auto-merge PR if ready."""
    parser = argparse.ArgumentParser(description="Auto-merge PR")
    parser.add_argument("--pr-number", type=int, required=True, help="PR number")
    parser.add_argument("--repo-owner", required=True, help="Repository owner")
    parser.add_argument("--repo-name", required=True, help="Repository name")
    parser.add_argument(
        "--merge-method",
        default="merge",
        choices=["merge", "squash", "rebase"],
        help="Merge method",
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output")

    args = parser.parse_args()

    # Set log level based on verbose flag
    if args.verbose:
        logger.setLevel(logging.DEBUG)
        logging.getLogger().setLevel(logging.DEBUG)

    # Setup GitHub integration
    github = GitHubIntegration(args.repo_owner, args.repo_name)

    # Setup orchestrator
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()

    providers = orchestrator.list_providers()
    if not providers:
        logger.error("No LLM provider available")
        sys.exit(1)

    provider = orchestrator.providers[providers[0]]
    agent = create_code_review_agent(provider)

    # Create PR reviewer
    reviewer = PRReviewer(agent, github)

    # Attempt auto-merge
    logger.info("Attempting to merge PR #%s...", args.pr_number)
    merge_result = reviewer.auto_merge_if_ready(args.pr_number, args.merge_method)

    # Save merge status
    status = {
        "merged": merge_result.get("merged", False),
        "reason": merge_result.get("reason", "Unknown"),
        "merge_method": args.merge_method,
        "validation": merge_result.get("validation", {}),
    }

    with open("merge_status.json", "w", encoding="utf-8") as f:
        json.dump(status, f, indent=2)

    if status["merged"]:
        logger.info("✅ PR successfully merged!")
        return 0

    logger.error("Unable to merge: %s", status['reason'])
    return 1


if __name__ == "__main__":
    sys.exit(main())
