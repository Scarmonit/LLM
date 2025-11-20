"""Unified CLI entry point built with Typer.

The CLI wraps the individual helper scripts and adds:
- Centralized logging with ``--verbose``
- Config file support (YAML/JSON)
- Dry-run mode
- Batch operations for PR creation
- Async helpers for parallel operations
- Optional webhook listener for event-driven automation
"""

import asyncio
import json
import logging
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import typer
import yaml
from tqdm.asyncio import tqdm_asyncio

# Add parent directory to path for local imports when executed directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from llm_framework.github_integration import GitHubIntegration

app = typer.Typer(help="Automation utilities for GitHub workflows.")


def configure_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%H:%M:%S",
    )


def _load_config_file(config_path: Optional[Path]) -> Dict[str, Any]:
    if not config_path:
        return {}
    if not config_path.exists():
        raise typer.BadParameter(f"Config file not found: {config_path}")

    with config_path.open("r", encoding="utf-8") as fh:
        if config_path.suffix.lower() in {".yml", ".yaml"}:
            return yaml.safe_load(fh) or {}
        if config_path.suffix.lower() == ".json":
            return json.load(fh)
        raise typer.BadParameter("Config file must be YAML or JSON")


def _env_default(key: str, fallback: Optional[str] = None) -> Optional[str]:
    return os.getenv(key, fallback)


@dataclass
class RepoSettings:
    owner: str
    name: str
    token: Optional[str]


def _resolve_repo_settings(config: Dict[str, Any]) -> RepoSettings:
    owner = config.get("repo_owner") or _env_default("GITHUB_REPO_OWNER")
    name = config.get("repo_name") or _env_default("GITHUB_REPO_NAME")
    token = config.get("token") or _env_default("GITHUB_TOKEN")
    if not owner or not name:
        raise typer.BadParameter(
            "Repository owner and name are required. Provide via config, command-line, or environment."
        )
    return RepoSettings(owner=owner, name=name, token=token)


def _build_integration(repo: RepoSettings, cache_ttl: int, max_retries: int, backoff: float) -> GitHubIntegration:
    return GitHubIntegration(
        repo_owner=repo.owner,
        repo_name=repo.name,
        token=repo.token,
        cache_ttl=cache_ttl,
        max_retries=max_retries,
        backoff_factor=backoff,
    )


def _dry_run(message: str, payload: Dict[str, Any]) -> None:
    typer.echo(f"[dry-run] {message}\n{json.dumps(payload, indent=2)}")


@app.command("create-pr")
def create_pr(
    title: str = typer.Option(..., help="PR title"),
    head: str = typer.Option(..., help="Branch with changes"),
    base: str = typer.Option("main", help="Base branch"),
    body: str = typer.Option("", help="PR description"),
    draft: bool = typer.Option(False, help="Create as draft"),
    config: Optional[Path] = typer.Option(None, help="Path to YAML/JSON config"),
    dry_run: bool = typer.Option(False, help="Simulate without API calls"),
    cache_ttl: int = typer.Option(60, help="Cache TTL for GET requests"),
    max_retries: int = typer.Option(3, help="Max GitHub API retries"),
    backoff: float = typer.Option(1.5, help="Retry backoff factor"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable debug logging"),
) -> None:
    """Create a pull request with validation and retry handling."""

    configure_logging(verbose)
    cfg = _load_config_file(config)
    repo = _resolve_repo_settings(cfg)
    payload = {"title": title, "body": body, "head": head, "base": base, "draft": draft}
    if dry_run:
        _dry_run("Would create pull request", payload | {"repo": repo.__dict__})
        return

    gh = _build_integration(repo, cache_ttl, max_retries, backoff)
    result = gh.create_pull_request(**payload)
    if not result:
        typer.echo("Failed to create pull request", err=True)
        raise typer.Exit(code=1)
    typer.echo(json.dumps({"number": result.get("number"), "url": result.get("html_url")}, indent=2))


@app.command("batch-create-pr")
def batch_create_pr(
    config: Path = typer.Option(..., help="Config file with PR batch definitions"),
    dry_run: bool = typer.Option(False, help="Simulate without API calls"),
    cache_ttl: int = typer.Option(60, help="Cache TTL for GET requests"),
    max_retries: int = typer.Option(3, help="Max GitHub API retries"),
    backoff: float = typer.Option(1.5, help="Retry backoff factor"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable debug logging"),
) -> None:
    """Create multiple pull requests in parallel using asyncio."""

    configure_logging(verbose)
    cfg = _load_config_file(config)
    repo = _resolve_repo_settings(cfg)
    pr_defs: List[Dict[str, Any]] = cfg.get("pull_requests", [])
    if not pr_defs:
        raise typer.BadParameter("Config must define a 'pull_requests' list")

    gh = _build_integration(repo, cache_ttl, max_retries, backoff)

    async def _create_one(pr_def: Dict[str, Any]) -> Dict[str, Any]:
        if dry_run:
            _dry_run("Would create pull request", pr_def | {"repo": repo.__dict__})
            return {"status": "dry-run", "title": pr_def.get("title")}
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: gh.create_pull_request(
                title=pr_def["title"],
                body=pr_def.get("body", ""),
                head=pr_def["head"],
                base=pr_def.get("base", "main"),
                draft=pr_def.get("draft", False),
            ),
        )
        if not result:
            return {"status": "failed", "title": pr_def.get("title")}
        return {"status": "created", "title": pr_def.get("title"), "number": result.get("number")}

    async def _run_all():
        coros = [_create_one(pr_def) for pr_def in pr_defs]
        return await tqdm_asyncio.gather(*coros, desc="Creating PRs")

    results = asyncio.run(_run_all())
    typer.echo(json.dumps(results, indent=2))


@app.command("check-status")
def check_status(
    pr_number: int = typer.Argument(..., help="Pull request number"),
    config: Optional[Path] = typer.Option(None, help="Path to YAML/JSON config"),
    cache_ttl: int = typer.Option(60, help="Cache TTL for GET requests"),
    max_retries: int = typer.Option(3, help="Max GitHub API retries"),
    backoff: float = typer.Option(1.5, help="Retry backoff factor"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable debug logging"),
) -> None:
    """Validate whether a PR is ready to merge."""

    configure_logging(verbose)
    cfg = _load_config_file(config)
    repo = _resolve_repo_settings(cfg)
    gh = _build_integration(repo, cache_ttl, max_retries, backoff)
    pr_data = gh.get_pull_request(pr_number)
    if not pr_data:
        typer.echo("Unable to fetch PR", err=True)
        raise typer.Exit(code=1)
    status = gh.get_combined_status(pr_data.get("head", {}).get("sha", ""))
    checks = gh.get_check_runs(pr_data.get("head", {}).get("sha", ""))
    typer.echo(json.dumps({"pr": pr_data, "status": status, "checks": checks}, indent=2))


@app.command("merge-pr")
def merge_pr(
    pr_number: int = typer.Argument(..., help="Pull request number"),
    method: str = typer.Option("merge", help="Merge method: merge|squash|rebase"),
    commit_title: Optional[str] = typer.Option(None, help="Optional merge commit title"),
    commit_message: Optional[str] = typer.Option(None, help="Optional merge commit message"),
    config: Optional[Path] = typer.Option(None, help="Path to YAML/JSON config"),
    dry_run: bool = typer.Option(False, help="Simulate without API calls"),
    cache_ttl: int = typer.Option(60, help="Cache TTL for GET requests"),
    max_retries: int = typer.Option(3, help="Max GitHub API retries"),
    backoff: float = typer.Option(1.5, help="Retry backoff factor"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Enable debug logging"),
) -> None:
    """Merge a pull request after validation."""

    configure_logging(verbose)
    cfg = _load_config_file(config)
    repo = _resolve_repo_settings(cfg)
    payload = {
        "pr_number": pr_number,
        "commit_title": commit_title,
        "commit_message": commit_message,
        "merge_method": method,
    }

    if dry_run:
        _dry_run("Would merge pull request", payload | {"repo": repo.__dict__})
        return

    gh = _build_integration(repo, cache_ttl, max_retries, backoff)
    result = gh.merge_pull_request(**payload)
    if not result:
        typer.echo("Merge failed", err=True)
        raise typer.Exit(code=1)
    typer.echo(json.dumps(result, indent=2))


@app.command("webhook")
def webhook(
    host: str = typer.Option("0.0.0.0", help="Host to bind webhook server"),
    port: int = typer.Option(8080, help="Port to bind webhook server"),
) -> None:
    """Simple webhook listener that prints payloads for automation hooks."""

    import http.server
    import socketserver

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_POST(self):
            length = int(self.headers.get("content-length", 0))
            payload = self.rfile.read(length).decode("utf-8")
            logging.info("Webhook payload received: %s", payload)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")

        def log_message(self, fmt: str, *args: Any) -> None:  # noqa: D401
            logging.debug(fmt, *args)

    with socketserver.TCPServer((host, port), Handler) as httpd:
        typer.echo(f"Webhook listener running on {host}:{port}. Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            typer.echo("Stopping webhook listener")


def main():
    app()


if __name__ == "__main__":
    main()
