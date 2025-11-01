"""Test configuration and fixtures."""

import pytest


@pytest.fixture
def sample_prompt():
    """Sample prompt for testing."""
    return "What is the capital of France?"


@pytest.fixture
def long_prompt():
    """Long prompt for testing."""
    return "A" * 1000
