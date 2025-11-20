"""GitHub integration for agents to communicate with Copilot.

This module centralizes HTTP handling (rate limiting, retries, caching) for
GitHub API calls so the CLI tools can provide reliable automation. Public
methods intentionally return ``None`` on failure to keep callers simple; errors
are logged with context for later debugging.
"""

import logging
import os
import threading
import time
from typing import Any, Dict, Optional

import requests

logger = logging.getLogger(__name__)


class GitHubIntegration:
    """Integration with GitHub for agent communication."""

    def __init__(
        self,
        repo_owner: str,
        repo_name: str,
        token: Optional[str] = None,
        max_retries: int = 3,
        backoff_factor: float = 1.5,
        cache_ttl: int = 60,
    ):
        """
        Initialize GitHub integration.

        Args:
            repo_owner: Repository owner username
            repo_name: Repository name
            token: GitHub personal access token (or use GITHUB_TOKEN env var)
        """
        self.repo_owner = repo_owner
        self.repo_name = repo_name
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.cache_ttl = cache_ttl
        self._session = requests.Session()
        self._cache_lock = threading.Lock()
        self._cache: dict[str, tuple[float, Any]] = {}

    def _auth_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        else:
            logger.warning("Proceeding without GitHub token; may be rate limited")
        return headers

    def _cache_get(self, key: str) -> Optional[Any]:
        if not self.cache_ttl:
            return None
        with self._cache_lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            expires_at, value = entry
            if expires_at < time.time():
                self._cache.pop(key, None)
                return None
            return value

    def _cache_set(self, key: str, value: Any) -> None:
        if not self.cache_ttl:
            return
        with self._cache_lock:
            self._cache[key] = (time.time() + self.cache_ttl, value)

    def _request(self, method: str, url: str, cache_key: Optional[str] = None, **kwargs):
        if cache_key:
            cached = self._cache_get(cache_key)
            if cached is not None:
                logger.debug("Cache hit for %s", cache_key)
                return cached

        headers = kwargs.pop("headers", {})
        headers.update(self._auth_headers())

        backoff = self.backoff_factor
        request_func = getattr(requests, method.lower(), requests.request)
        for attempt in range(1, self.max_retries + 1):
            try:
                response = request_func(
                    url, headers=headers, timeout=kwargs.pop("timeout", 10), **kwargs
                )
                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    wait_time = float(retry_after) if retry_after else backoff
                    logger.warning(
                        "Rate limited on %s %s (attempt %s/%s); retrying in %.1fs",
                        method,
                        url,
                        attempt,
                        self.max_retries,
                        wait_time,
                    )
                    time.sleep(wait_time)
                    backoff *= 2
                    continue
                response.raise_for_status()
                data = response.json()
                if cache_key:
                    self._cache_set(cache_key, data)
                return data
            except requests.exceptions.RequestException as exc:
                if attempt >= self.max_retries:
                    logger.error("GitHub API request failed after retries: %s", exc)
                    return None
                logger.warning(
                    "GitHub API request error on %s %s (attempt %s/%s): %s; retrying in %.1fs",
                    method,
                    url,
                    attempt,
                    self.max_retries,
                    exc,
                    backoff,
                )
                time.sleep(backoff)
                backoff *= 2
        return None

    def create_issue(
        self, title: str, body: str, labels: Optional[list] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a GitHub issue with agent prompt.

        Args:
            title: Issue title
            body: Issue body/description
            labels: Optional list of labels

        Returns:
            Issue data if successful, None otherwise
        """
        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/issues"
        data = {"title": title, "body": body}

        if labels:
            data["labels"] = labels

        return self._request("POST", url, json=data)

    def create_comment(self, issue_number: int, comment: str) -> Optional[Dict[str, Any]]:
        """
        Create a comment on a GitHub issue.

        Args:
            issue_number: Issue number
            comment: Comment text

        Returns:
            Comment data if successful, None otherwise
        """
        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/issues/{issue_number}/comments"
        )
        data = {"body": comment}

        return self._request("POST", url, json=data)

    def send_copilot_prompt(
        self, prompt: str, agent_name: str, issue_number: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Send a prompt to Copilot via GitHub issue or comment.

        Args:
            prompt: The prompt to send to Copilot
            agent_name: Name of the agent sending the prompt
            issue_number: If provided, add as comment; otherwise create new issue

        Returns:
            Issue or comment data if successful, None otherwise
        """
        formatted_prompt = f"@copilot {prompt}\n\n---\n*Sent by {agent_name}*"

        if issue_number:
            return self.create_comment(issue_number, formatted_prompt)

        title = f"Agent Request from {agent_name}"
        return self.create_issue(
            title=title, body=formatted_prompt, labels=["agent-request", "copilot"]
        )

    def create_pull_request(
        self,
        title: str,
        body: str,
        head: str,
        base: str = "main",
        draft: bool = False,
    ) -> Optional[Dict[str, Any]]:
        """
        Create a pull request.

        Args:
            title: PR title
            body: PR description
            head: Branch name containing changes
            base: Base branch to merge into (default: main)
            draft: Create as draft PR

        Returns:
            PR data if successful, None otherwise
        """
        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/pulls"
        data = {"title": title, "body": body, "head": head, "base": base, "draft": draft}
        return self._request("POST", url, json=data)

    def get_pull_request(self, pr_number: int) -> Optional[Dict[str, Any]]:
        """
        Get pull request details.

        Args:
            pr_number: PR number

        Returns:
            PR data if successful, None otherwise
        """
        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/pulls/{pr_number}"
        return self._request("GET", url, cache_key=f"pr:{pr_number}")

    def create_review(
        self,
        pr_number: int,
        body: str,
        event: str = "COMMENT",
        comments: Optional[list] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Create a review on a pull request.

        Args:
            pr_number: PR number
            body: Review summary comment
            event: Review event type (APPROVE, REQUEST_CHANGES, COMMENT)
            comments: Optional list of line comments

        Returns:
            Review data if successful, None otherwise
        """
        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/pulls/{pr_number}/reviews"
        )
        data = {"body": body, "event": event}

        if comments:
            data["comments"] = comments

        return self._request("POST", url, json=data)

    def get_pr_files(self, pr_number: int) -> Optional[list]:
        """
        Get list of files changed in a PR.

        Args:
            pr_number: PR number

        Returns:
            List of file data if successful, None otherwise
        """
        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/pulls/{pr_number}/files"
        )
        return self._request("GET", url, cache_key=f"pr-files:{pr_number}")

    def merge_pull_request(
        self,
        pr_number: int,
        commit_title: Optional[str] = None,
        commit_message: Optional[str] = None,
        merge_method: str = "merge",
    ) -> Optional[Dict[str, Any]]:
        """
        Merge a pull request.

        Args:
            pr_number: PR number
            commit_title: Optional custom merge commit title
            commit_message: Optional custom merge commit message
            merge_method: Merge method (merge, squash, rebase)

        Returns:
            Merge data if successful, None otherwise
        """
        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/pulls/{pr_number}/merge"
        )
        data = {"merge_method": merge_method}

        if commit_title:
            data["commit_title"] = commit_title
        if commit_message:
            data["commit_message"] = commit_message
        return self._request("PUT", url, json=data)

    def get_check_runs(self, ref: str) -> Optional[Dict[str, Any]]:
        """
        Get check runs for a specific commit reference.

        Args:
            ref: Git reference (commit SHA, branch name, etc.)

        Returns:
            Check runs data if successful, None otherwise
        """
        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/commits/{ref}/check-runs"
        )
        return self._request("GET", url, cache_key=f"check-runs:{ref}")

    def get_combined_status(self, ref: str) -> Optional[Dict[str, Any]]:
        """
        Get combined status for a specific commit reference.

        Args:
            ref: Git reference (commit SHA, branch name, etc.)

        Returns:
            Combined status data if successful, None otherwise
        """
        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/commits/{ref}/status"
        )
        return self._request("GET", url, cache_key=f"combined-status:{ref}")


class AgentGitHubBridge:
    """Bridge to connect agents with GitHub for Copilot communication."""

    def __init__(self, github_integration: GitHubIntegration, issue_number: Optional[int] = None):
        """
        Initialize the bridge.

        Args:
            github_integration: GitHubIntegration instance
            issue_number: Optional issue number for threaded conversation
        """
        self.github = github_integration
        self.issue_number = issue_number

    def __call__(self, task: str, result: str):
        """
        Callback function to send agent results to Copilot.

        Args:
            task: The task that was executed
            result: The result from the agent
        """
        # Format the message
        prompt = (
            f"Task completed:\n\n"
            f"**Task:** {task}\n\n"
            f"**Result:** {result}\n\n"
            f"Please review and provide feedback or next steps."
        )

        # Send to GitHub
        agent_name = "Autonomous Agent"
        self.github.send_copilot_prompt(prompt, agent_name, self.issue_number)
