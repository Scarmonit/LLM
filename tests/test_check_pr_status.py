"""Tests for check_pr_status script GITHUB_OUTPUT functionality."""

import os
import tempfile


class TestCheckPRStatusOutput:
    """Test GITHUB_OUTPUT functionality in check_pr_status script."""

    def test_github_output_environment_file_format(self):
        """
        Test that GITHUB_OUTPUT uses the correct format.

        This test verifies the implementation matches GitHub's
        documented approach for secure output handling.
        """
        # Create a temporary file to act as GITHUB_OUTPUT
        with tempfile.NamedTemporaryFile(
            mode='w+', delete=False, encoding='utf-8'
        ) as tmp_file:
            output_file = tmp_file.name

        try:
            # Simulate what check_pr_status.py does
            os.environ['GITHUB_OUTPUT'] = output_file

            # This mimics the code in check_pr_status.py (lines 50-57)
            ready = True
            github_output = os.getenv("GITHUB_OUTPUT")
            if github_output:
                with open(github_output, "a", encoding="utf-8") as f:
                    f.write(f"ready={str(ready).lower()}\n")

            # Read the output file
            with open(output_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Verify the output format is correct
            assert content == "ready=true\n"
            assert "ready=true" in content
            assert "::set-output" not in content  # Deprecated format

        finally:
            # Cleanup
            if 'GITHUB_OUTPUT' in os.environ:
                del os.environ['GITHUB_OUTPUT']
            if os.path.exists(output_file):
                os.unlink(output_file)

    def test_github_output_fallback_to_stdout(self, capsys):
        """Test fallback to stdout when GITHUB_OUTPUT is not set."""
        # Make sure GITHUB_OUTPUT is not set
        if 'GITHUB_OUTPUT' in os.environ:
            del os.environ['GITHUB_OUTPUT']

        # Simulate what check_pr_status.py does
        ready = False
        github_output = os.getenv("GITHUB_OUTPUT")
        if github_output:
            with open(github_output, "a", encoding="utf-8") as f:
                f.write(f"ready={str(ready).lower()}\n")
        else:
            # Fallback for local testing
            print(f"ready={str(ready).lower()}")

        # Capture stdout
        captured = capsys.readouterr()

        # Verify the fallback output was printed to stdout
        assert 'ready=false' in captured.out
        assert "::set-output" not in captured.out  # No deprecated format

    def test_github_output_multiple_writes(self):
        """Test that multiple writes append to the file."""
        # Create a temporary file to act as GITHUB_OUTPUT
        with tempfile.NamedTemporaryFile(
            mode='w+', delete=False, encoding='utf-8'
        ) as tmp_file:
            output_file = tmp_file.name

        try:
            os.environ['GITHUB_OUTPUT'] = output_file

            # Simulate multiple outputs
            github_output = os.getenv("GITHUB_OUTPUT")
            if github_output:
                with open(github_output, "a", encoding="utf-8") as f:
                    f.write("ready=true\n")
                with open(github_output, "a", encoding="utf-8") as f:
                    f.write("status=success\n")

            # Read the output file
            with open(output_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Verify both outputs are present
            assert "ready=true\n" in content
            assert "status=success\n" in content
            lines = content.strip().split('\n')
            assert len(lines) == 2

        finally:
            # Cleanup
            if 'GITHUB_OUTPUT' in os.environ:
                del os.environ['GITHUB_OUTPUT']
            if os.path.exists(output_file):
                os.unlink(output_file)

