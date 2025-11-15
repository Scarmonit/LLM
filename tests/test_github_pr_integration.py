"""Tests for GitHub PR integration."""

import pytest
from unittest.mock import Mock, patch
from llm_framework.github_integration import GitHubIntegration


class TestGitHubPRIntegration:
    """Test GitHub pull request integration."""

    def setup_method(self):
        """Set up test fixtures."""
        self.github = GitHubIntegration("test-owner", "test-repo", "test-token")

    def test_create_pull_request_success(self):
        """Test successful PR creation."""
        with patch("requests.post") as mock_post:
            mock_response = Mock()
            mock_response.json.return_value = {
                "number": 123,
                "title": "Test PR",
                "html_url": "https://github.com/test/pr/123",
            }
            mock_response.raise_for_status = Mock()
            mock_post.return_value = mock_response

            result = self.github.create_pull_request(
                title="Test PR", body="Test body", head="feature", base="main"
            )

            assert result is not None
            assert result["number"] == 123
            assert result["title"] == "Test PR"

    def test_create_pull_request_no_token(self):
        """Test PR creation without token."""
        github = GitHubIntegration("owner", "repo", None)
        result = github.create_pull_request("Title", "Body", "head", "base")
        assert result is None

    def test_get_pull_request_success(self):
        """Test getting PR details."""
        with patch("requests.get") as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "number": 123,
                "title": "Test PR",
                "mergeable": True,
            }
            mock_response.raise_for_status = Mock()
            mock_get.return_value = mock_response

            result = self.github.get_pull_request(123)

            assert result is not None
            assert result["number"] == 123
            assert result["mergeable"] is True

    def test_create_review_success(self):
        """Test creating a PR review."""
        with patch("requests.post") as mock_post:
            mock_response = Mock()
            mock_response.json.return_value = {
                "id": 456,
                "body": "LGTM",
                "state": "APPROVED",
            }
            mock_response.raise_for_status = Mock()
            mock_post.return_value = mock_response

            result = self.github.create_review(123, "LGTM", "APPROVE")

            assert result is not None
            assert result["body"] == "LGTM"
            assert result["state"] == "APPROVED"

    def test_get_pr_files_success(self):
        """Test getting PR files."""
        with patch("requests.get") as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = [
                {"filename": "test.py", "status": "modified"},
                {"filename": "README.md", "status": "added"},
            ]
            mock_response.raise_for_status = Mock()
            mock_get.return_value = mock_response

            result = self.github.get_pr_files(123)

            assert result is not None
            assert len(result) == 2
            assert result[0]["filename"] == "test.py"

    def test_merge_pull_request_success(self):
        """Test merging a PR."""
        with patch("requests.put") as mock_put:
            mock_response = Mock()
            mock_response.json.return_value = {
                "sha": "abc123",
                "merged": True,
                "message": "Pull Request successfully merged",
            }
            mock_response.raise_for_status = Mock()
            mock_put.return_value = mock_response

            result = self.github.merge_pull_request(123, merge_method="squash")

            assert result is not None
            assert result["merged"] is True

    def test_get_check_runs_success(self):
        """Test getting check runs."""
        with patch("requests.get") as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "total_count": 2,
                "check_runs": [
                    {"name": "tests", "status": "completed", "conclusion": "success"},
                    {"name": "lint", "status": "completed", "conclusion": "success"},
                ],
            }
            mock_response.raise_for_status = Mock()
            mock_get.return_value = mock_response

            result = self.github.get_check_runs("abc123")

            assert result is not None
            assert result["total_count"] == 2
            assert len(result["check_runs"]) == 2

    def test_get_combined_status_success(self):
        """Test getting combined status."""
        with patch("requests.get") as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "state": "success",
                "statuses": [
                    {"state": "success", "context": "ci/test"},
                ],
            }
            mock_response.raise_for_status = Mock()
            mock_get.return_value = mock_response

            result = self.github.get_combined_status("abc123")

            assert result is not None
            assert result["state"] == "success"

    def test_create_pull_request_error(self):
        """Test PR creation with API error."""
        with patch("requests.post") as mock_post:
            import requests
            mock_post.side_effect = requests.exceptions.RequestException("API Error")

            result = self.github.create_pull_request("Title", "Body", "head", "base")

            assert result is None
