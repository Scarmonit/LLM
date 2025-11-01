"""Tests for exceptions module."""

from llm.exceptions import ProviderUnavailable, ValidationError


def test_provider_unavailable():
    """Test ProviderUnavailable exception."""
    exc = ProviderUnavailable("Test message")
    assert str(exc) == "Test message"
    assert isinstance(exc, Exception)


def test_validation_error():
    """Test ValidationError exception."""
    exc = ValidationError("Validation failed")
    assert str(exc) == "Validation failed"
    assert isinstance(exc, Exception)
