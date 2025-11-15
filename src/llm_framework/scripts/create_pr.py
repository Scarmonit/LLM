#!/usr/bin/env python3
"""CLI tool for creating pull requests."""

import argparse
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from llm_framework.github_integration import GitHubIntegration


def main():
    """Create a pull request."""
    parser = argparse.ArgumentParser(description="Create a pull request")
    parser.add_argument("--title", required=True, help="PR title")
    parser.add_argument("--body", help="PR description/body")
    parser.add_argument("--head", required=True, help="Branch with changes")
    parser.add_argument("--base", default="main", help="Base branch (default: main)")
    parser.add_argument("--draft", action="store_true", help="Create as draft PR")
    parser.add_argument("--repo-owner", help="Repository owner (default: from env)")
    parser.add_argument("--repo-name", help="Repository name (default: from env)")

    args = parser.parse_args()

    # Get repo info from args or environment
    repo_owner = args.repo_owner or os.getenv("GITHUB_REPO_OWNER")
    repo_name = args.repo_name or os.getenv("GITHUB_REPO_NAME")

    if not repo_owner or not repo_name:
        print("Error: Repository owner and name required")
        print(
            "Provide via --repo-owner/--repo-name or set GITHUB_REPO_OWNER/GITHUB_REPO_NAME"
        )
        sys.exit(1)

    # Setup GitHub integration
    github = GitHubIntegration(repo_owner, repo_name)

    # Create PR
    print(f"Creating PR: {args.title}")
    print(f"  From: {args.head}")
    print(f"  To: {args.base}")
    print(f"  Draft: {args.draft}")

    pr_result = github.create_pull_request(
        title=args.title,
        body=args.body or "",
        head=args.head,
        base=args.base,
        draft=args.draft,
    )

    if pr_result:
        pr_number = pr_result.get("number")
        pr_url = pr_result.get("html_url")
        print(f"\n✅ Pull request created successfully!")
        print(f"  PR #{pr_number}")
        print(f"  URL: {pr_url}")
        return 0

    print("\n❌ Failed to create pull request")
    print("  Check your GitHub token and repository permissions")
    return 1


if __name__ == "__main__":
    sys.exit(main())
