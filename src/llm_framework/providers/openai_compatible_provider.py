"""OpenAI-compatible provider for local and cloud LLM APIs."""

import os
from typing import Optional
import requests
from ..core.base_provider import BaseProvider


class OpenAICompatibleProvider(BaseProvider):
    """
    Provider for OpenAI-compatible APIs (OpenAI, LocalAI, Text Generation WebUI, etc.)
    Works with any service that implements the OpenAI API format.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: str = "gpt-3.5-turbo",
        **kwargs
    ):
        """
        Initialize OpenAI-compatible provider.

        Args:
            api_key: API key (or use OPENAI_API_KEY env var)
            base_url: API base URL (or use OPENAI_BASE_URL env var)
            model: Model name to use
            **kwargs: Additional configuration
        """
        super().__init__(api_key or os.getenv("OPENAI_API_KEY"), **kwargs)
        self.base_url = (base_url or 
                        os.getenv("OPENAI_BASE_URL") or 
                        "https://api.openai.com/v1")
        self.model = model

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a response using OpenAI-compatible API.

        Args:
            prompt: The input prompt
            **kwargs: Additional generation parameters (temperature, max_tokens, etc.)

        Returns:
            The generated text response
        """
        if not self.is_available():
            raise RuntimeError("OpenAI-compatible provider is not properly configured")

        try:
            # Extract parameters
            temperature = kwargs.get("temperature", 0.7)
            max_tokens = kwargs.get("max_tokens", 1024)

            headers = {
                "Content-Type": "application/json"
            }
            
            # Add auth header if API key is available
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            data = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens
            }

            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )

            response.raise_for_status()
            result = response.json()
            
            return result["choices"][0]["message"]["content"]
            
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Error generating response: {str(e)}") from e

    def is_available(self) -> bool:
        """
        Check if the provider is available.

        Returns:
            True if base URL is configured, False otherwise
        """
        if not self.base_url:
            return False
            
        try:
            # Try to reach the API
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
                
            response = requests.get(
                f"{self.base_url}/models",
                headers=headers,
                timeout=5
            )
            return response.status_code in [200, 401]  # 401 means auth required but API is up
        except Exception:
            return False

    def get_provider_name(self) -> str:
        """
        Get the provider name.

        Returns:
            Provider name
        """
        return "OpenAI-Compatible"
