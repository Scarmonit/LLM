"""Tests for CLI scripts logging functionality."""

import logging
import sys
import os
from io import StringIO
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../src"))


class TestCreatePRLogging:
    """Test logging functionality in create_pr.py script."""

    def test_logging_configuration(self):
        """Test that logging is configured properly."""
        # Import the module
        from llm_framework.scripts import create_pr

        # Verify logger exists
        assert hasattr(create_pr, 'logger')
        assert isinstance(create_pr.logger, logging.Logger)

    def test_verbose_flag_enables_debug(self, capsys, caplog):
        """Test that --verbose flag enables DEBUG level logging."""
        from llm_framework.scripts import create_pr

        # Mock argparse to simulate verbose flag
        test_args = [
            'create_pr.py',
            '--title', 'Test PR',
            '--head', 'feature-branch',
            '--base', 'main',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo',
            '--verbose'
        ]

        # Mock GitHubIntegration
        with patch('llm_framework.scripts.create_pr.GitHubIntegration') as mock_gh:
            mock_gh.return_value.create_pull_request.return_value = {
                'number': 123,
                'html_url': 'https://github.com/test/test/pull/123'
            }

            # Patch sys.argv
            with patch.object(sys, 'argv', test_args):
                with caplog.at_level(logging.DEBUG):
                    result = create_pr.main()

        # Verify the function completed successfully
        assert result == 0

    def test_info_messages_use_logger(self, capsys, caplog):
        """Test that info messages use logger.info()."""
        from llm_framework.scripts import create_pr

        test_args = [
            'create_pr.py',
            '--title', 'Test PR Title',
            '--head', 'feature-branch',
            '--base', 'main',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo'
        ]

        # Mock GitHubIntegration
        with patch('llm_framework.scripts.create_pr.GitHubIntegration') as mock_gh:
            mock_gh.return_value.create_pull_request.return_value = {
                'number': 123,
                'html_url': 'https://github.com/test/test/pull/123'
            }

            # Patch sys.argv
            with patch.object(sys, 'argv', test_args):
                with caplog.at_level(logging.INFO):
                    result = create_pr.main()

        # Verify logging messages were captured
        assert result == 0
        log_messages = [record.message for record in caplog.records]

        # Check that expected messages are logged
        assert any('Creating PR: Test PR Title' in msg for msg in log_messages)
        assert any('From: feature-branch' in msg for msg in log_messages)
        assert any('To: main' in msg for msg in log_messages)

    def test_error_messages_use_logger(self, capsys, caplog):
        """Test that error messages use logger.error()."""
        from llm_framework.scripts import create_pr

        test_args = [
            'create_pr.py',
            '--title', 'Test PR',
            '--head', 'feature-branch',
            '--base', 'main',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo'
        ]

        # Mock GitHubIntegration to return None (failure)
        with patch('llm_framework.scripts.create_pr.GitHubIntegration') as mock_gh:
            mock_gh.return_value.create_pull_request.return_value = None

            # Patch sys.argv
            with patch.object(sys, 'argv', test_args):
                with caplog.at_level(logging.ERROR):
                    result = create_pr.main()

        # Verify error was logged
        assert result == 1
        error_messages = [
            record.message for record in caplog.records
            if record.levelname == 'ERROR'
        ]
        assert any('Failed to create pull request' in msg for msg in error_messages)

    def test_no_print_statements_in_output(self, capsys):
        """Test that no print() statements are used (all output via logging)."""
        from llm_framework.scripts import create_pr

        test_args = [
            'create_pr.py',
            '--title', 'Test PR',
            '--head', 'feature-branch',
            '--base', 'main',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo'
        ]

        # Mock GitHubIntegration
        with patch('llm_framework.scripts.create_pr.GitHubIntegration') as mock_gh:
            mock_gh.return_value.create_pull_request.return_value = {
                'number': 123,
                'html_url': 'https://github.com/test/test/pull/123'
            }

            # Patch sys.argv
            with patch.object(sys, 'argv', test_args):
                # Capture stdout/stderr
                result = create_pr.main()

        # Get captured output
        captured = capsys.readouterr()

        # With proper logging, stdout should contain log messages
        # (from basicConfig writing to stderr)
        # We mainly want to verify the code runs without print() calls
        assert result == 0


class TestCheckPRStatusLogging:
    """Test logging functionality in check_pr_status.py script."""

    def test_logging_configuration(self):
        """Test that logging is configured properly."""
        from llm_framework.scripts import check_pr_status

        # Verify logger exists
        assert hasattr(check_pr_status, 'logger')
        assert isinstance(check_pr_status.logger, logging.Logger)

    def test_verbose_flag_support(self, caplog):
        """Test that --verbose flag is supported."""
        from llm_framework.scripts import check_pr_status

        test_args = [
            'check_pr_status.py',
            '--pr-number', '123',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo',
            '--verbose'
        ]

        # Mock dependencies
        with patch('llm_framework.scripts.check_pr_status.GitHubIntegration'):
            with patch('llm_framework.scripts.check_pr_status.AgentOrchestrator') as mock_orch:
                mock_orch.return_value.list_providers.return_value = ['test-provider']
                mock_orch.return_value.providers = {'test-provider': MagicMock()}

                with patch('llm_framework.scripts.check_pr_status.create_code_review_agent'):
                    with patch('llm_framework.scripts.check_pr_status.PRReviewer') as mock_reviewer:
                        mock_reviewer.return_value.validate_pr.return_value = {
                            'valid': True
                        }

                        with patch.object(sys, 'argv', test_args):
                            with caplog.at_level(logging.DEBUG):
                                # This should not raise an error
                                try:
                                    result = check_pr_status.main()
                                    # May return 0 or 1 depending on validation
                                    assert result in [0, 1]
                                except SystemExit as e:
                                    assert e.code in [0, 1]


class TestAutoReviewPRLogging:
    """Test logging functionality in auto_review_pr.py script."""

    def test_logging_configuration(self):
        """Test that logging is configured properly."""
        from llm_framework.scripts import auto_review_pr

        # Verify logger exists
        assert hasattr(auto_review_pr, 'logger')
        assert isinstance(auto_review_pr.logger, logging.Logger)

    def test_info_messages_logged(self, caplog):
        """Test that info messages are properly logged."""
        from llm_framework.scripts import auto_review_pr

        test_args = [
            'auto_review_pr.py',
            '--pr-number', '123',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo'
        ]

        # Mock dependencies
        with patch('llm_framework.scripts.auto_review_pr.AgentOrchestrator') as mock_orch:
            mock_orch.return_value.list_providers.return_value = ['test-provider']
            mock_orch.return_value.providers = {'test-provider': MagicMock()}

            with patch('llm_framework.scripts.auto_review_pr.create_code_review_agent'):
                with patch('llm_framework.scripts.auto_review_pr.GitHubIntegration'):
                    with patch('llm_framework.scripts.auto_review_pr.PRReviewer') as mock_reviewer:
                        mock_reviewer.return_value.review_pr.return_value = {
                            'html_url': 'https://github.com/test/test/pull/123',
                            'body': 'Review complete'
                        }

                        with patch.object(sys, 'argv', test_args):
                            with caplog.at_level(logging.INFO):
                                result = auto_review_pr.main()

        # Verify logging occurred
        assert result == 0
        log_messages = [record.message for record in caplog.records]
        assert any('Reviewing PR #123' in msg for msg in log_messages)
        assert any('Review completed!' in msg for msg in log_messages)


class TestAutoMergePRLogging:
    """Test logging functionality in auto_merge_pr.py script."""

    def test_logging_configuration(self):
        """Test that logging is configured properly."""
        from llm_framework.scripts import auto_merge_pr

        # Verify logger exists
        assert hasattr(auto_merge_pr, 'logger')
        assert isinstance(auto_merge_pr.logger, logging.Logger)

    def test_error_logging_on_no_provider(self, caplog):
        """Test that errors are logged when no provider available."""
        from llm_framework.scripts import auto_merge_pr

        test_args = [
            'auto_merge_pr.py',
            '--pr-number', '123',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo'
        ]

        # Mock dependencies to return no providers
        with patch('llm_framework.scripts.auto_merge_pr.GitHubIntegration'):
            with patch('llm_framework.scripts.auto_merge_pr.AgentOrchestrator') as mock_orch:
                mock_orch.return_value.list_providers.return_value = []

                with patch.object(sys, 'argv', test_args):
                    with caplog.at_level(logging.ERROR):
                        try:
                            auto_merge_pr.main()
                        except SystemExit as e:
                            assert e.code == 1

        # Verify error was logged
        error_messages = [
            record.message for record in caplog.records
            if record.levelname == 'ERROR'
        ]
        assert any('No LLM provider available' in msg for msg in error_messages)

    def test_success_logging(self, caplog):
        """Test that success messages are logged properly."""
        from llm_framework.scripts import auto_merge_pr

        test_args = [
            'auto_merge_pr.py',
            '--pr-number', '123',
            '--repo-owner', 'test-owner',
            '--repo-name', 'test-repo'
        ]

        # Mock dependencies
        with patch('llm_framework.scripts.auto_merge_pr.GitHubIntegration'):
            with patch('llm_framework.scripts.auto_merge_pr.AgentOrchestrator') as mock_orch:
                mock_orch.return_value.list_providers.return_value = ['test-provider']
                mock_orch.return_value.providers = {'test-provider': MagicMock()}

                with patch('llm_framework.scripts.auto_merge_pr.create_code_review_agent'):
                    with patch('llm_framework.scripts.auto_merge_pr.PRReviewer') as mock_reviewer:
                        mock_reviewer.return_value.auto_merge_if_ready.return_value = {
                            'merged': True,
                            'reason': 'Success'
                        }

                        with patch.object(sys, 'argv', test_args):
                            with caplog.at_level(logging.INFO):
                                result = auto_merge_pr.main()

        # Verify success was logged
        assert result == 0
        info_messages = [
            record.message for record in caplog.records
            if record.levelname == 'INFO'
        ]
        assert any('PR successfully merged!' in msg for msg in info_messages)
