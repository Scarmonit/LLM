"""Tests for CLI."""

import pytest
import sys
from io import StringIO
from cli import main


class TestCLI:
    """Test cases for CLI."""

    def test_main_with_prompt(self, monkeypatch):
        """Test CLI with prompt."""
        monkeypatch.setattr(sys, "argv", ["llm", "Hello, world!"])
        exit_code = main()
        assert exit_code == 0

    def test_main_with_provider(self, monkeypatch):
        """Test CLI with provider."""
        monkeypatch.setattr(sys, "argv", ["llm", "--provider", "mock", "Test"])
        exit_code = main()
        assert exit_code == 0

    def test_main_with_json(self, monkeypatch, capsys):
        """Test CLI with JSON output."""
        monkeypatch.setattr(sys, "argv", ["llm", "--json", "Test"])
        exit_code = main()
        assert exit_code == 0

        captured = capsys.readouterr()
        # Should output valid JSON
        import json

        data = json.loads(captured.out)
        assert "provider" in data
        assert "content" in data

    def test_main_info(self, monkeypatch):
        """Test CLI with info flag."""
        monkeypatch.setattr(sys, "argv", ["llm", "--info"])
        exit_code = main()
        assert exit_code == 0

    def test_main_info_json(self, monkeypatch, capsys):
        """Test CLI with info and JSON."""
        monkeypatch.setattr(sys, "argv", ["llm", "--info", "--json"])
        exit_code = main()
        assert exit_code == 0

        captured = capsys.readouterr()
        import json

        data = json.loads(captured.out)
        assert "provider" in data
        assert "model" in data

    def test_main_no_prompt(self, monkeypatch):
        """Test CLI without prompt."""
        monkeypatch.setattr(sys, "argv", ["llm"])
        exit_code = main()
        assert exit_code == 1

    def test_main_with_temperature(self, monkeypatch):
        """Test CLI with temperature."""
        monkeypatch.setattr(sys, "argv", ["llm", "--temperature", "0.8", "Test"])
        exit_code = main()
        assert exit_code == 0

    def test_main_with_model(self, monkeypatch):
        """Test CLI with model."""
        monkeypatch.setattr(sys, "argv", ["llm", "--model", "test-model", "Test"])
        exit_code = main()
        assert exit_code == 0
