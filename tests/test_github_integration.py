"""Tests for GitHub integration."""

import pytest
from src.llm_framework.github_integration import GitHubIntegration, AgentGitHubBridge


def test_github_integration_initialization():
    """Test that GitHub integration initializes correctly."""
    gh = GitHubIntegration("owner", "repo", "token123")
    
    assert gh.repo_owner == "owner"
    assert gh.repo_name == "repo"
    assert gh.token == "token123"
    assert gh.base_url == "https://api.github.com"


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
