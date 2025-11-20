import json
import time
from pathlib import Path

import pytest
import responses
from typer.testing import CliRunner

from llm_framework.github_integration import GitHubIntegration
from llm_framework.scripts import cli


@pytest.fixture
def runner():
    return CliRunner()


@responses.activate
def test_github_integration_retries_and_cache(monkeypatch):
    gh = GitHubIntegration("owner", "repo", token="t", max_retries=2, backoff_factor=0)
    url = "https://api.github.com/repos/owner/repo/pulls/1"

    responses.add(responses.GET, url, json={}, status=429, headers={"Retry-After": "0"})
    responses.add(responses.GET, url, json={"number": 1}, status=200)

    start = time.time()
    data = gh.get_pull_request(1)
    assert data == {"number": 1}
    assert len(responses.calls) == 2

    cached = gh.get_pull_request(1)
    assert cached == {"number": 1}
    assert len(responses.calls) == 2  # cache prevents extra call
    assert time.time() >= start


@responses.activate
def test_cli_create_pr_dry_run(tmp_path, runner, monkeypatch):
    config_path = tmp_path / "config.yml"
    config_path.write_text("repo_owner: a\nrepo_name: b\n")

    result = runner.invoke(
        cli.app,
        [
            "create-pr",
            "--title",
            "Test",
            "--head",
            "feature",
            "--config",
            str(config_path),
            "--dry-run",
        ],
    )
    assert result.exit_code == 0
    payload = json.loads(result.stdout.split("\n", 1)[1])
    assert payload["head"] == "feature"


@responses.activate
def test_cli_batch_create_pr(tmp_path, runner):
    config_path = tmp_path / "config.yml"
    config_path.write_text(
        """
repo_owner: a
repo_name: b
pull_requests:
  - title: First
    head: feature
"""
    )

    responses.add(
        responses.POST,
        "https://api.github.com/repos/a/b/pulls",
        json={"number": 5},
        status=201,
    )

    result = runner.invoke(cli.app, ["batch-create-pr", "--config", str(config_path)])
    assert result.exit_code == 0
    assert "number" in result.stdout
