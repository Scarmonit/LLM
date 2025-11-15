"""Claude provider implementation using Anthropic API."""

import os
from typing import Optional
from ..core.base_provider import BaseProvider


class ClaudeProvider(BaseProvider):
    """Provider for Claude AI models via Anthropic API."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-3-sonnet-20240229",
        **kwargs
    ):
        """
        Initialize Claude provider.

        Args:
            api_key: Anthropic API key (or use ANTHROPIC_API_KEY env var)
            model: Claude model to use
            **kwargs: Additional configuration
        """
        super().__init__(api_key or os.getenv("ANTHROPIC_API_KEY"), **kwargs)
        self.model = model
        self._client = None

    def _get_client(self):
        """Get or create Anthropic client."""
        if self._client is None and self.api_key:
            try:
                import anthropic
                self._client = anthropic.Anthropic(api_key=self.api_key)
            except ImportError as exc:
                raise ImportError(
                    "anthropic package is required for Claude provider. "
                    "Install it with: pip install anthropic"
                ) from exc
        return self._client

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a response using Claude.

        Args:
            prompt: The input prompt
            **kwargs: Additional generation parameters (temperature, max_tokens, etc.)

        Returns:
            The generated text response
        """
        client = self._get_client()
        if not client:
            raise RuntimeError("Claude provider is not properly configured with an API key")

        try:
            # Extract parameters
            temperature = kwargs.get("temperature", 0.7)
            max_tokens = kwargs.get("max_tokens", 1024)

            response = client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            return response.content[0].text
        except Exception as e:
            raise RuntimeError(f"Error generating response from Claude: {str(e)}") from e

    def is_available(self) -> bool:
        """
        Check if Claude provider is available.

        Returns:
            True if API key is configured, False otherwise
        """
        try:
            client = self._get_client()
            return client is not None
        except Exception:
            return False

    def get_provider_name(self) -> str:
        """
        Get the provider name.

        Returns:
            "Claude" as the provider name
        """
        return "Claude"
