"""Tests for the base provider interface."""

import pytest
from src.llm_framework.core.base_provider import BaseProvider


class MockProvider(BaseProvider):
    """Mock provider for testing."""

    def generate(self, prompt: str, **kwargs) -> str:
        return f"Mock response to: {prompt}"

    def is_available(self) -> bool:
        return True

    def get_provider_name(self) -> str:
        return "Mock"


def test_base_provider_initialization():
    """Test that base provider initializes correctly."""
    provider = MockProvider(api_key="test_key", custom_param="value")
    assert provider.api_key == "test_key"
    assert provider.config["custom_param"] == "value"


def test_base_provider_generate():
    """Test that provider can generate responses."""
    provider = MockProvider()
    response = provider.generate("test prompt")
    assert "test prompt" in response


def test_base_provider_is_available():
    """Test that provider availability check works."""
    provider = MockProvider()
    assert provider.is_available() is True


def test_base_provider_get_name():
    """Test that provider name is returned."""
    provider = MockProvider()
    assert provider.get_provider_name() == "Mock"
