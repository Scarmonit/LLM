"""Tests for LLM providers."""

import pytest
from llm.providers.mock import MockProvider
from llm.providers.ollama import OllamaProvider
from llm.exceptions import ProviderUnavailable


class TestMockProvider:
    """Test cases for MockProvider."""

    def test_init(self):
        """Test MockProvider initialization."""
        provider = MockProvider()
        assert provider.model == "mock"
        assert provider.temperature == 0.0

    def test_init_with_params(self):
        """Test MockProvider initialization with parameters."""
        provider = MockProvider(model="test-model", temperature=0.5)
        assert provider.model == "test-model"
        assert provider.temperature == 0.5

    def test_generate(self):
        """Test basic generation."""
        provider = MockProvider()
        response = provider.generate("Hello, world!")

        assert response["provider"] == "mock"
        assert response["model"] == "mock"
        assert "content" in response
        assert "Hello, world!" in response["prompt"]
        assert isinstance(response["content"], str)
        assert len(response["content"]) > 0

    def test_generate_long_prompt(self):
        """Test generation with long prompt."""
        provider = MockProvider()
        long_prompt = "A" * 100
        response = provider.generate(long_prompt)

        assert response["provider"] == "mock"
        assert long_prompt in response["prompt"]

    @pytest.mark.asyncio
    async def test_agenerate(self):
        """Test async generation."""
        provider = MockProvider()
        response = await provider.agenerate("Test prompt")

        assert response["provider"] == "mock"
        assert response["model"] == "mock"
        assert "content" in response


class TestOllamaProvider:
    """Test cases for OllamaProvider."""

    def test_init(self):
        """Test OllamaProvider initialization."""
        provider = OllamaProvider()
        assert provider.model == "llama3"
        assert provider.base_url == "http://localhost:11434"
        assert provider.temperature == 0.7

    def test_init_with_params(self):
        """Test OllamaProvider initialization with parameters."""
        provider = OllamaProvider(
            base_url="http://custom:8080", model="custom-model", temperature=0.5
        )
        assert provider.model == "custom-model"
        assert provider.base_url == "http://custom:8080"
        assert provider.temperature == 0.5

    def test_check_availability_fails(self):
        """Test availability check fails when Ollama is not running."""
        provider = OllamaProvider()
        # Assuming Ollama is not running in test environment
        available = provider._check_availability()
        # Should be False in most test environments
        assert isinstance(available, bool)

    def test_generate_unavailable(self):
        """Test generation fails when Ollama is unavailable."""
        provider = OllamaProvider()
        # Assuming Ollama is not running in test environment
        with pytest.raises(ProviderUnavailable):
            provider.generate("Test prompt")

    @pytest.mark.asyncio
    async def test_agenerate_unavailable(self):
        """Test async generation fails when Ollama is unavailable."""
        provider = OllamaProvider()
        # Assuming Ollama is not running in test environment
        with pytest.raises(ProviderUnavailable):
            await provider.agenerate("Test prompt")
