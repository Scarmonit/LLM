#!/usr/bin/env python3
"""CLI tool for creating pull requests."""

import argparse
import json
import logging
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from llm_framework.github_integration import GitHubIntegration


def _configure_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


def main():
    """Create a pull request with validation and logging."""
    parser = argparse.ArgumentParser(description="Create a pull request")
    parser.add_argument("--title", required=True, help="PR title")
    parser.add_argument("--body", help="PR description/body")
    parser.add_argument("--head", required=True, help="Branch with changes")
    parser.add_argument("--base", default="main", help="Base branch (default: main)")
    parser.add_argument("--draft", action="store_true", help="Create as draft PR")
    parser.add_argument("--repo-owner", help="Repository owner (default: from env)")
    parser.add_argument("--repo-name", help="Repository name (default: from env)")
    parser.add_argument("--dry-run", action="store_true", help="Simulate the call without hitting GitHub")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose logging")
    parser.add_argument("--max-retries", type=int, default=3, help="Max retries for GitHub API calls")
    parser.add_argument("--backoff", type=float, default=1.5, help="Retry backoff factor")
    parser.add_argument("--cache-ttl", type=int, default=60, help="Cache TTL seconds for GET requests")

    args = parser.parse_args()
    _configure_logging(args.verbose)

    repo_owner = args.repo_owner or os.getenv("GITHUB_REPO_OWNER")
    repo_name = args.repo_name or os.getenv("GITHUB_REPO_NAME")

    if not repo_owner or not repo_name:
        logging.error("Repository owner and name required (flags or env)")
        return 1

    payload = {
        "title": args.title,
        "body": args.body or "",
        "head": args.head,
        "base": args.base,
        "draft": args.draft,
    }

    if args.dry_run:
        logging.info("Dry-run enabled; not calling GitHub")
        print(json.dumps(payload, indent=2))
        return 0

    github = GitHubIntegration(
        repo_owner,
        repo_name,
        max_retries=args.max_retries,
        backoff_factor=args.backoff,
        cache_ttl=args.cache_ttl,
    )

    logging.info(
        "Creating PR '%s' from %s to %s (draft=%s)",
        args.title,
        args.head,
        args.base,
        args.draft,
    )

    pr_result = github.create_pull_request(**payload)

    if pr_result:
        pr_number = pr_result.get("number")
        pr_url = pr_result.get("html_url")
        print(json.dumps({"number": pr_number, "url": pr_url}, indent=2))
        return 0

    logging.error("Failed to create pull request; check token and permissions")
    return 1


if __name__ == "__main__":
    sys.exit(main())
