"""Ollama provider implementation for local LLM inference."""

import os
from typing import Optional
import requests
from ..core.base_provider import BaseProvider


class OllamaProvider(BaseProvider):
    """Provider for Ollama local LLM models."""

    def __init__(
        self,
        model: str = "qwen2.5:0.5b",
        base_url: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize Ollama provider.

        Args:
            model: Ollama model name to use
            base_url: Ollama server URL (or use OLLAMA_BASE_URL env var)
            **kwargs: Additional configuration
        """
        super().__init__(None, **kwargs)
        self.model = model
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a response using Ollama.

        Args:
            prompt: The input prompt
            **kwargs: Additional generation parameters (temperature, etc.)

        Returns:
            The generated text response
        """
        if not self.is_available():
            raise RuntimeError("Ollama server is not available")

        try:
            # Extract parameters - use shorter responses for CPU-only Ollama
            temperature = kwargs.get("temperature", 0.7)
            max_tokens = kwargs.get("max_tokens", 150)  # Reduced for CPU performance

            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    }
                },
                timeout=60  # Increased for CPU
            )

            response.raise_for_status()
            result = response.json()
            return result.get("response", "")
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Error generating response from Ollama: {str(e)}") from e

    def is_available(self) -> bool:
        """
        Check if Ollama server is available.

        Returns:
            True if server is reachable, False otherwise
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False

    def get_provider_name(self) -> str:
        """
        Get the provider name.

        Returns:
            "Ollama" as the provider name
        """
        return "Ollama"
