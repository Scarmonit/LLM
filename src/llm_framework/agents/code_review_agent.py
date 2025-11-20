"""Code review agent for automated PR reviews."""

from typing import Optional, Dict, Any, List
from ..core.agent import Agent, AgentConfig


def create_code_review_agent(provider) -> Agent:
    """
    Create a specialized code review agent.

    Args:
        provider: LLM provider instance

    Returns:
        Configured code review agent
    """
    config = AgentConfig(
        name="code_review",
        description="Automated code review and analysis",
        system_prompt=(
            "You are an expert code reviewer. Analyze code changes and provide "
            "constructive feedback. Focus on:\n"
            "- Code quality and best practices\n"
            "- Potential bugs or issues\n"
            "- Security concerns\n"
            "- Performance implications\n"
            "- Maintainability and readability\n"
            "- Test coverage\n"
            "Provide specific, actionable feedback."
        ),
        temperature=0.3,  # More deterministic for consistent reviews
        additional_params={"max_tokens": 500},  # Longer responses for detailed reviews
    )

    return Agent(config, provider)


class PRReviewer:
    """Automated PR review using LLM agent."""

    def __init__(self, agent: Agent, github_integration):
        """
        Initialize PR reviewer.

        Args:
            agent: Code review agent instance
            github_integration: GitHubIntegration instance
        """
        self.agent = agent
        self.github = github_integration

    def review_pr(
        self, pr_number: int, auto_approve: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Review a pull request and post review.

        Args:
            pr_number: PR number to review
            auto_approve: If True, approve PR if no issues found

        Returns:
            Review data if successful, None otherwise
        """
        # Get PR details
        pr_data = self.github.get_pull_request(pr_number)
        if not pr_data:
            return None

        # Get changed files
        files = self.github.get_pr_files(pr_number)
        if not files:
            return None

        # Analyze changes
        review_comments = []
        issues_found = False

        for file_data in files:
            filename = file_data.get("filename", "")
            patch = file_data.get("patch", "")
            status = file_data.get("status", "")

            # Skip deleted files
            if status == "removed":
                continue

            # Create review prompt
            prompt = (
                f"Review the following code changes in file: {filename}\n\n"
                f"Changes:\n```\n{patch}\n```\n\n"
                f"Provide a brief review focusing on potential issues, "
                f"best practices, and improvements."
            )

            # Get review from agent
            review = self.agent.execute(prompt)

            # Check if review indicates issues
            if any(
                keyword in review.lower()
                for keyword in ["issue", "problem", "bug", "error", "concern", "fix"]
            ):
                issues_found = True

            review_comments.append({"file": filename, "review": review})

        # Format overall review
        review_body = self._format_review(pr_data, review_comments)

        # Determine review event
        if issues_found:
            event = "COMMENT"
        elif auto_approve:
            event = "APPROVE"
        else:
            event = "COMMENT"

        # Post review
        return self.github.create_review(pr_number, review_body, event)

    def _format_review(
        self, pr_data: Dict[str, Any], review_comments: List[Dict[str, str]]
    ) -> str:
        """
        Format review comments into a cohesive review body.

        Args:
            pr_data: PR data from GitHub
            review_comments: List of review comments per file

        Returns:
            Formatted review body
        """
        title = pr_data.get("title", "")
        body = pr_data.get("body", "")

        review_body = "## Automated Code Review\n\n"
        review_body += f"**PR Title:** {title}\n\n"

        if body:
            review_body += f"**Description:** {body[:200]}...\n\n"

        review_body += "### File Reviews\n\n"

        for comment in review_comments:
            filename = comment["file"]
            review = comment["review"]
            review_body += f"#### `{filename}`\n\n{review}\n\n"

        review_body += (
            "\n---\n*This review was generated automatically by the "
            "LLM Code Review Agent*"
        )

        return review_body

    def validate_pr(self, pr_number: int) -> Dict[str, Any]:
        """
        Validate PR status and checks.

        Args:
            pr_number: PR number to validate

        Returns:
            Validation status dictionary
        """
        pr_data = self.github.get_pull_request(pr_number)
        if not pr_data:
            return {"valid": False, "reason": "PR not found"}

        # Check if PR is mergeable
        mergeable = pr_data.get("mergeable", False)
        mergeable_state = pr_data.get("mergeable_state", "")

        # Get check runs
        head_sha = pr_data.get("head", {}).get("sha", "")
        check_runs = self.github.get_check_runs(head_sha)

        # Get combined status (for future use - tracking both check types)
        _ = self.github.get_combined_status(head_sha)

        # Analyze checks
        all_checks_passed = True
        check_details = []

        if check_runs:
            for run in check_runs.get("check_runs", []):
                conclusion = run.get("conclusion", "")
                status = run.get("status", "")
                name = run.get("name", "")

                if status == "completed" and conclusion != "success":
                    all_checks_passed = False

                check_details.append(
                    {"name": name, "status": status, "conclusion": conclusion}
                )

        # Build validation result
        validation = {
            "valid": mergeable and all_checks_passed,
            "mergeable": mergeable,
            "mergeable_state": mergeable_state,
            "checks_passed": all_checks_passed,
            "check_details": check_details,
        }

        return validation

    def auto_merge_if_ready(
        self, pr_number: int, merge_method: str = "merge"
    ) -> Optional[Dict[str, Any]]:
        """
        Auto-merge PR if all checks pass and it's approved.

        Args:
            pr_number: PR number to merge
            merge_method: Merge method (merge, squash, rebase)

        Returns:
            Merge data if successful, None otherwise
        """
        # Validate PR
        validation = self.validate_pr(pr_number)

        if not validation["valid"]:
            return {
                "merged": False,
                "reason": "Validation failed",
                "validation": validation,
            }

        # Attempt merge
        merge_result = self.github.merge_pull_request(
            pr_number, merge_method=merge_method
        )

        if merge_result:
            return {"merged": True, "merge_data": merge_result}

        return {"merged": False, "reason": "Merge API call failed"}
