"""Tests for code review agent."""

import pytest
from unittest.mock import Mock, patch
from src.llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer
from src.llm_framework.providers.intelligent_mock_provider import IntelligentMockProvider


class TestCodeReviewAgent:
    """Test code review agent functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.provider = IntelligentMockProvider()
        self.agent = create_code_review_agent(self.provider)

    def test_create_code_review_agent(self):
        """Test creating code review agent."""
        assert self.agent is not None
        assert self.agent.config.name == "code_review"
        assert self.agent.config.temperature == 0.3
        assert self.agent.config.additional_params.get("max_tokens") == 500

    def test_agent_reviews_code(self):
        """Test agent can review code."""
        code = "def test():\n    pass"
        result = self.agent.execute(f"Review this code:\n{code}")
        assert result is not None
        assert isinstance(result, str)


class TestPRReviewer:
    """Test PR reviewer functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.provider = IntelligentMockProvider()
        self.agent = create_code_review_agent(self.provider)
        self.github = Mock()
        self.reviewer = PRReviewer(self.agent, self.github)

    def test_pr_reviewer_initialization(self):
        """Test PR reviewer initialization."""
        assert self.reviewer.agent is not None
        assert self.reviewer.github is not None

    def test_review_pr_success(self):
        """Test successful PR review."""
        # Mock PR data
        self.github.get_pull_request.return_value = {
            "number": 123,
            "title": "Test PR",
            "body": "Test description",
        }

        # Mock files
        self.github.get_pr_files.return_value = [
            {
                "filename": "test.py",
                "status": "modified",
                "patch": "@@ -1,1 +1,2 @@\n def test():\n+    pass",
            }
        ]

        # Mock review creation
        self.github.create_review.return_value = {"id": 456, "body": "Review posted"}

        result = self.reviewer.review_pr(123)

        assert result is not None
        assert self.github.get_pull_request.called
        assert self.github.get_pr_files.called
        assert self.github.create_review.called

    def test_review_pr_no_pr_data(self):
        """Test review when PR not found."""
        self.github.get_pull_request.return_value = None

        result = self.reviewer.review_pr(123)

        assert result is None

    def test_review_pr_no_files(self):
        """Test review when files not found."""
        self.github.get_pull_request.return_value = {"number": 123, "title": "Test"}
        self.github.get_pr_files.return_value = None

        result = self.reviewer.review_pr(123)

        assert result is None

    def test_review_pr_skips_deleted_files(self):
        """Test that deleted files are skipped."""
        self.github.get_pull_request.return_value = {
            "number": 123,
            "title": "Test",
            "body": "",
        }

        self.github.get_pr_files.return_value = [
            {"filename": "deleted.py", "status": "removed", "patch": ""}
        ]

        self.github.create_review.return_value = {"id": 456}

        result = self.reviewer.review_pr(123)

        # Should still create review even with only deleted files
        assert self.github.create_review.called

    def test_validate_pr_success(self):
        """Test PR validation."""
        self.github.get_pull_request.return_value = {
            "number": 123,
            "mergeable": True,
            "mergeable_state": "clean",
            "head": {"sha": "abc123"},
        }

        self.github.get_check_runs.return_value = {
            "check_runs": [
                {"name": "test", "status": "completed", "conclusion": "success"}
            ]
        }

        self.github.get_combined_status.return_value = {"state": "success"}

        validation = self.reviewer.validate_pr(123)

        assert validation["valid"] is True
        assert validation["mergeable"] is True
        assert validation["checks_passed"] is True

    def test_validate_pr_failed_checks(self):
        """Test validation with failed checks."""
        self.github.get_pull_request.return_value = {
            "number": 123,
            "mergeable": True,
            "mergeable_state": "unstable",
            "head": {"sha": "abc123"},
        }

        self.github.get_check_runs.return_value = {
            "check_runs": [
                {"name": "test", "status": "completed", "conclusion": "failure"}
            ]
        }

        self.github.get_combined_status.return_value = {"state": "failure"}

        validation = self.reviewer.validate_pr(123)

        assert validation["valid"] is False
        assert validation["checks_passed"] is False

    def test_validate_pr_not_mergeable(self):
        """Test validation when PR not mergeable."""
        self.github.get_pull_request.return_value = {
            "number": 123,
            "mergeable": False,
            "mergeable_state": "dirty",
            "head": {"sha": "abc123"},
        }

        self.github.get_check_runs.return_value = {"check_runs": []}
        self.github.get_combined_status.return_value = {"state": "success"}

        validation = self.reviewer.validate_pr(123)

        assert validation["valid"] is False
        assert validation["mergeable"] is False

    def test_auto_merge_if_ready_success(self):
        """Test auto-merge when PR is ready."""
        # Mock validation success
        self.github.get_pull_request.return_value = {
            "number": 123,
            "mergeable": True,
            "mergeable_state": "clean",
            "head": {"sha": "abc123"},
        }

        self.github.get_check_runs.return_value = {
            "check_runs": [
                {"name": "test", "status": "completed", "conclusion": "success"}
            ]
        }

        self.github.get_combined_status.return_value = {"state": "success"}

        # Mock merge success
        self.github.merge_pull_request.return_value = {
            "sha": "abc123",
            "merged": True,
        }

        result = self.reviewer.auto_merge_if_ready(123)

        assert result["merged"] is True
        assert self.github.merge_pull_request.called

    def test_auto_merge_if_ready_validation_failed(self):
        """Test auto-merge when validation fails."""
        self.github.get_pull_request.return_value = {
            "number": 123,
            "mergeable": False,
            "head": {"sha": "abc123"},
        }

        self.github.get_check_runs.return_value = {"check_runs": []}
        self.github.get_combined_status.return_value = {"state": "failure"}

        result = self.reviewer.auto_merge_if_ready(123)

        assert result["merged"] is False
        assert "validation" in result["reason"].lower()

    def test_auto_merge_if_ready_merge_failed(self):
        """Test auto-merge when merge API fails."""
        # Mock validation success
        self.github.get_pull_request.return_value = {
            "number": 123,
            "mergeable": True,
            "mergeable_state": "clean",
            "head": {"sha": "abc123"},
        }

        self.github.get_check_runs.return_value = {
            "check_runs": [
                {"name": "test", "status": "completed", "conclusion": "success"}
            ]
        }

        self.github.get_combined_status.return_value = {"state": "success"}

        # Mock merge failure
        self.github.merge_pull_request.return_value = None

        result = self.reviewer.auto_merge_if_ready(123)

        assert result["merged"] is False
        assert "api" in result["reason"].lower()
