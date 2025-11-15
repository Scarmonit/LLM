"""GitHub integration for agents to communicate with Copilot."""

import os
from typing import Optional, Dict, Any
import requests


class GitHubIntegration:
    """Integration with GitHub for agent communication."""

    def __init__(self, repo_owner: str, repo_name: str, token: Optional[str] = None):
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
        if not self.token:
            return None

        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/issues"
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        data = {"title": title, "body": body}

        if labels:
            data["labels"] = labels

        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

    def create_comment(self, issue_number: int, comment: str) -> Optional[Dict[str, Any]]:
        """
        Create a comment on a GitHub issue.

        Args:
            issue_number: Issue number
            comment: Comment text

        Returns:
            Comment data if successful, None otherwise
        """
        if not self.token:
            return None

        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/issues/{issue_number}/comments"
        )
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        data = {"body": comment}

        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

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
        if not self.token:
            return None

        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/pulls"
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        data = {"title": title, "body": body, "head": head, "base": base, "draft": draft}

        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

    def get_pull_request(self, pr_number: int) -> Optional[Dict[str, Any]]:
        """
        Get pull request details.

        Args:
            pr_number: PR number

        Returns:
            PR data if successful, None otherwise
        """
        if not self.token:
            return None

        url = f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}/pulls/{pr_number}"
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

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
        if not self.token:
            return None

        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/pulls/{pr_number}/reviews"
        )
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        data = {"body": body, "event": event}

        if comments:
            data["comments"] = comments

        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

    def get_pr_files(self, pr_number: int) -> Optional[list]:
        """
        Get list of files changed in a PR.

        Args:
            pr_number: PR number

        Returns:
            List of file data if successful, None otherwise
        """
        if not self.token:
            return None

        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/pulls/{pr_number}/files"
        )
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

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
        if not self.token:
            return None

        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/pulls/{pr_number}/merge"
        )
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        data = {"merge_method": merge_method}

        if commit_title:
            data["commit_title"] = commit_title
        if commit_message:
            data["commit_message"] = commit_message

        try:
            response = requests.put(url, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

    def get_check_runs(self, ref: str) -> Optional[Dict[str, Any]]:
        """
        Get check runs for a specific commit reference.

        Args:
            ref: Git reference (commit SHA, branch name, etc.)

        Returns:
            Check runs data if successful, None otherwise
        """
        if not self.token:
            return None

        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/commits/{ref}/check-runs"
        )
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

    def get_combined_status(self, ref: str) -> Optional[Dict[str, Any]]:
        """
        Get combined status for a specific commit reference.

        Args:
            ref: Git reference (commit SHA, branch name, etc.)

        Returns:
            Combined status data if successful, None otherwise
        """
        if not self.token:
            return None

        url = (
            f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
            f"/commits/{ref}/status"
        )
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None


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
