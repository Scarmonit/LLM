"""Tests for GitHub integration."""

import json
import subprocess
from unittest.mock import patch, MagicMock
from src.llm_framework.github_integration import GitHubIntegration, AgentGitHubBridge


def test_github_integration_initialization():
    """Test that GitHub integration initializes correctly."""
    gh = GitHubIntegration("owner", "repo", "token123")

    assert gh.repo_owner == "owner"
    assert gh.repo_name == "repo"
    assert gh.token == "token123"
    assert gh.base_url == "https://api.github.com"
    assert gh.prefer_cli is False


def test_github_integration_prefer_cli():
    """Test GitHub integration with prefer_cli option."""
    gh = GitHubIntegration("owner", "repo", "token123", prefer_cli=True)

    assert gh.prefer_cli is True


def test_github_integration_no_token():
    """Test GitHub integration without token."""
    gh = GitHubIntegration("owner", "repo")

    # Should return None when no token
    result = gh.create_issue("Test", "Body")
    assert result is None


def test_agent_github_bridge_initialization():
    """Test that AgentGitHubBridge initializes correctly."""
    gh = GitHubIntegration("owner", "repo", "token")
    bridge = AgentGitHubBridge(gh, issue_number=42)

    assert bridge.github == gh
    assert bridge.issue_number == 42


def test_agent_github_bridge_callback():
    """Test that bridge callback formats messages correctly."""
    gh = GitHubIntegration("owner", "repo")
    bridge = AgentGitHubBridge(gh)

    # This should not raise even without token
    # (it will just return None from the GitHub API call)
    bridge("Test task", "Test result")


# Tests for gh CLI detection and execution
def test_is_gh_available_not_installed():
    """Test _is_gh_available when gh is not installed."""
    gh = GitHubIntegration("owner", "repo")

    with patch("shutil.which", return_value=None):
        assert gh._is_gh_available() is False


def test_is_gh_available_not_authenticated():
    """Test _is_gh_available when gh is installed but not authenticated."""
    gh = GitHubIntegration("owner", "repo")

    mock_result = MagicMock()
    mock_result.returncode = 1

    with patch("shutil.which", return_value="/usr/bin/gh"):
        with patch("subprocess.run", return_value=mock_result):
            assert gh._is_gh_available() is False


def test_is_gh_available_authenticated():
    """Test _is_gh_available when gh is installed and authenticated."""
    gh = GitHubIntegration("owner", "repo")

    mock_result = MagicMock()
    mock_result.returncode = 0

    with patch("shutil.which", return_value="/usr/bin/gh"):
        with patch("subprocess.run", return_value=mock_result):
            assert gh._is_gh_available() is True


def test_execute_gh_command_success():
    """Test _execute_gh_command with successful execution."""
    gh = GitHubIntegration("owner", "repo")

    test_data = {"number": 123, "title": "Test PR"}
    mock_result = MagicMock()
    mock_result.stdout = json.dumps(test_data)

    with patch("subprocess.run", return_value=mock_result):
        result = gh._execute_gh_command(["pr", "view", "123"])
        assert result == test_data


def test_execute_gh_command_failure():
    """Test _execute_gh_command with failed execution."""
    gh = GitHubIntegration("owner", "repo")

    with patch(
        "subprocess.run", side_effect=subprocess.SubprocessError("Command failed")
    ):
        result = gh._execute_gh_command(["pr", "view", "123"])
        assert result is None


def test_execute_gh_command_empty_output():
    """Test _execute_gh_command with empty output."""
    gh = GitHubIntegration("owner", "repo")

    mock_result = MagicMock()
    mock_result.stdout = ""

    with patch("subprocess.run", return_value=mock_result):
        result = gh._execute_gh_command(["pr", "merge", "123"])
        assert result == {}


# Tests for create_pull_request with gh CLI fallback
def test_create_pr_with_gh_cli_preferred():
    """Test create_pull_request using gh CLI when preferred."""
    gh = GitHubIntegration("owner", "repo", "token123", prefer_cli=True)

    test_pr = {"number": 123, "url": "https://github.com/owner/repo/pull/123"}

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(gh, "_execute_gh_command", return_value=test_pr):
            result = gh.create_pull_request(
                title="Test PR", body="Test body", head="feature", base="main"
            )
            assert result == test_pr


def test_create_pr_with_gh_cli_no_token():
    """Test create_pull_request using gh CLI when no token available."""
    gh = GitHubIntegration("owner", "repo")  # No token

    test_pr = {"number": 123, "url": "https://github.com/owner/repo/pull/123"}

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(gh, "_execute_gh_command", return_value=test_pr):
            result = gh.create_pull_request(
                title="Test PR", body="Test body", head="feature", base="main"
            )
            assert result == test_pr


def test_create_pr_fallback_to_api():
    """Test create_pull_request falls back to API when gh CLI fails."""
    gh = GitHubIntegration("owner", "repo", "token123", prefer_cli=True)

    test_pr = {"number": 123, "url": "https://github.com/owner/repo/pull/123"}

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(gh, "_execute_gh_command", return_value=None):
            with patch("requests.post") as mock_post:
                mock_response = MagicMock()
                mock_response.json.return_value = test_pr
                mock_post.return_value = mock_response

                result = gh.create_pull_request(
                    title="Test PR", body="Test body", head="feature", base="main"
                )
                assert result == test_pr


def test_create_pr_no_cli_no_token():
    """Test create_pull_request returns None when no gh CLI and no token."""
    gh = GitHubIntegration("owner", "repo")  # No token

    with patch.object(gh, "_is_gh_available", return_value=False):
        result = gh.create_pull_request(
            title="Test PR", body="Test body", head="feature", base="main"
        )
        assert result is None


# Tests for get_pull_request with gh CLI fallback
def test_get_pr_with_gh_cli():
    """Test get_pull_request using gh CLI."""
    gh = GitHubIntegration("owner", "repo", prefer_cli=True)

    test_pr = {"number": 123, "title": "Test PR", "state": "open"}

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(gh, "_execute_gh_command", return_value=test_pr):
            result = gh.get_pull_request(123)
            assert result == test_pr


# Tests for merge_pull_request with gh CLI fallback
def test_merge_pr_with_gh_cli_squash():
    """Test merge_pull_request using gh CLI with squash method."""
    gh = GitHubIntegration("owner", "repo", prefer_cli=True)

    merge_result = {"merged": True}

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(
            gh, "_execute_gh_command", return_value=merge_result
        ) as mock_cmd:
            result = gh.merge_pull_request(123, merge_method="squash")
            assert result == merge_result
            # Verify squash flag was passed
            args = mock_cmd.call_args[0][0]
            assert "--squash" in args


def test_merge_pr_with_gh_cli_rebase():
    """Test merge_pull_request using gh CLI with rebase method."""
    gh = GitHubIntegration("owner", "repo", prefer_cli=True)

    merge_result = {"merged": True}

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(
            gh, "_execute_gh_command", return_value=merge_result
        ) as mock_cmd:
            result = gh.merge_pull_request(123, merge_method="rebase")
            assert result == merge_result
            # Verify rebase flag was passed
            args = mock_cmd.call_args[0][0]
            assert "--rebase" in args


# Tests for list_pull_requests
def test_list_prs_with_gh_cli():
    """Test list_pull_requests using gh CLI."""
    gh = GitHubIntegration("owner", "repo", prefer_cli=True)

    test_prs = [
        {"number": 123, "title": "PR 1", "state": "open"},
        {"number": 124, "title": "PR 2", "state": "open"},
    ]

    with patch.object(gh, "_is_gh_available", return_value=True):
        with patch.object(gh, "_execute_gh_command", return_value=test_prs):
            result = gh.list_pull_requests(state="open", limit=30)
            assert result == test_prs


def test_list_prs_with_api():
    """Test list_pull_requests using API."""
    gh = GitHubIntegration("owner", "repo", "token123")

    test_prs = [
        {"number": 123, "title": "PR 1", "state": "open"},
        {"number": 124, "title": "PR 2", "state": "open"},
    ]

    with patch.object(gh, "_is_gh_available", return_value=False):
        with patch("requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.json.return_value = test_prs
            mock_get.return_value = mock_response

            result = gh.list_pull_requests(state="open", limit=30)
            assert result == test_prs


def test_list_prs_no_cli_no_token():
    """Test list_pull_requests returns None when no gh CLI and no token."""
    gh = GitHubIntegration("owner", "repo")  # No token

    with patch.object(gh, "_is_gh_available", return_value=False):
        result = gh.list_pull_requests()
        assert result is None
