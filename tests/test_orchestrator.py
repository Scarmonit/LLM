"""Tests for LLM orchestrator."""

import pytest
from llm import Orchestrator, ValidationError, ProviderUnavailable


class TestOrchestrator:
    """Test cases for Orchestrator."""

    def test_init_auto_detect(self):
        """Test auto-detection of provider."""
        orchestrator = Orchestrator()
        # Should fall back to mock in test environment
        assert orchestrator.provider_name in ["mock", "ollama"]
        assert orchestrator.provider_instance is not None

    def test_init_mock_provider(self):
        """Test explicit mock provider initialization."""
        orchestrator = Orchestrator(provider="mock")
        assert orchestrator.provider_name == "mock"

    def test_init_with_model(self):
        """Test initialization with model."""
        orchestrator = Orchestrator(provider="mock", model="test-model")
        assert orchestrator.model == "test-model"

    def test_init_invalid_provider(self):
        """Test initialization with invalid provider."""
        with pytest.raises(ValidationError):
            Orchestrator(provider="invalid")

    def test_generate_basic(self):
        """Test basic generation."""
        orchestrator = Orchestrator(provider="mock")
        response = orchestrator.generate("Hello, world!")

        assert "provider" in response
        assert "model" in response
        assert "content" in response
        assert isinstance(response["content"], str)

    def test_generate_empty_prompt(self):
        """Test generation with empty prompt."""
        orchestrator = Orchestrator(provider="mock")
        with pytest.raises(ValidationError):
            orchestrator.generate("")

    def test_generate_whitespace_prompt(self):
        """Test generation with whitespace-only prompt."""
        orchestrator = Orchestrator(provider="mock")
        with pytest.raises(ValidationError):
            orchestrator.generate("   ")

    def test_generate_with_override(self):
        """Test generation with provider override."""
        orchestrator = Orchestrator(provider="mock")
        response = orchestrator.generate("Test", provider="mock")

        assert response["provider"] == "mock"

    @pytest.mark.asyncio
    async def test_agenerate_basic(self):
        """Test async basic generation."""
        orchestrator = Orchestrator(provider="mock")
        response = await orchestrator.agenerate("Hello, world!")

        assert "provider" in response
        assert "model" in response
        assert "content" in response

    @pytest.mark.asyncio
    async def test_agenerate_empty_prompt(self):
        """Test async generation with empty prompt."""
        orchestrator = Orchestrator(provider="mock")
        with pytest.raises(ValidationError):
            await orchestrator.agenerate("")

    def test_get_provider_info(self):
        """Test getting provider info."""
        orchestrator = Orchestrator(provider="mock", model="test-model")
        info = orchestrator.get_provider_info()

        assert info["provider"] == "mock"
        assert info["model"] == "test-model"

    def test_get_provider_info_auto(self):
        """Test getting provider info with auto-detection."""
        orchestrator = Orchestrator()
        info = orchestrator.get_provider_info()

        assert "provider" in info
        assert "model" in info

    def test_temperature_parameter(self):
        """Test temperature parameter."""
        orchestrator = Orchestrator(provider="mock", temperature=0.8)
        response = orchestrator.generate("Test", temperature=0.5)
        # Temperature is accepted but not enforced in mock
        assert "content" in response

    def test_ollama_explicit_unavailable(self):
        """Test explicit Ollama request when unavailable."""
        # This should raise ProviderUnavailable if Ollama is not running
        # In test environment, Ollama is typically not running
        try:
            orchestrator = Orchestrator(provider="ollama")
            # If we get here, Ollama is running (rare in tests)
            assert orchestrator.provider_name == "ollama"
        except ProviderUnavailable:
            # Expected when Ollama is not running
            pass
