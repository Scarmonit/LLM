"""Mock LLM provider for testing and offline use."""

from typing import Any, Dict


class MockProvider:
    """Mock provider that returns deterministic responses without network calls."""

    def __init__(self, model: str = "mock", **kwargs):
        self.model = model
        self.temperature = kwargs.get("temperature", 0.0)  # Interface parameter, unused

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate a mock response for the given prompt.

        Args:
            prompt: The input prompt
            **kwargs: Additional parameters (ignored in mock)

        Returns:
            Dict with provider, model, and content fields
        """
        # Deterministic mock response
        response_content = f"Mock response to: {prompt[:50]}..."

        return {
            "provider": "mock",
            "model": self.model,
            "content": response_content,
            "prompt": prompt,
        }

    async def agenerate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Async version of generate for compatibility."""
        return self.generate(prompt, **kwargs)
