"""Ollama LLM provider."""

from typing import Any, Dict
import httpx
from ..exceptions import ProviderUnavailable


class OllamaProvider:
    """Ollama provider that connects to local Ollama instance."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3", **kwargs):
        self.base_url = base_url
        self.model = model
        self.temperature = kwargs.get("temperature", 0.7)
        self.timeout = kwargs.get("timeout", 30.0)

    def _check_availability(self) -> bool:
        """Check if Ollama endpoint is reachable."""
        try:
            response = httpx.get(f"{self.base_url}/api/tags", timeout=2.0)
            return response.status_code == 200
        except (httpx.RequestError, httpx.TimeoutException):
            return False

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate a response using Ollama.

        Args:
            prompt: The input prompt
            **kwargs: Additional parameters

        Returns:
            Dict with provider, model, and content fields

        Raises:
            ProviderUnavailable: If Ollama endpoint is not reachable
        """
        if not self._check_availability():
            raise ProviderUnavailable(
                f"Ollama endpoint at {self.base_url} is not reachable. "
                "Please ensure Ollama is running."
            )

        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": kwargs.get("temperature", self.temperature),
                },
            }

            response = httpx.post(
                f"{self.base_url}/api/generate", json=payload, timeout=self.timeout
            )
            response.raise_for_status()

            data = response.json()

            return {
                "provider": "ollama",
                "model": data.get("model", self.model),
                "content": data.get("response", ""),
                "prompt": prompt,
            }
        except httpx.HTTPError as e:
            raise ProviderUnavailable(f"Ollama request failed: {str(e)}") from e

    async def agenerate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Async version of generate.

        Args:
            prompt: The input prompt
            **kwargs: Additional parameters

        Returns:
            Dict with provider, model, and content fields

        Raises:
            ProviderUnavailable: If Ollama endpoint is not reachable
        """
        if not self._check_availability():
            raise ProviderUnavailable(
                f"Ollama endpoint at {self.base_url} is not reachable. "
                "Please ensure Ollama is running."
            )

        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": kwargs.get("temperature", self.temperature),
                },
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate", json=payload, timeout=self.timeout
                )
                response.raise_for_status()

                data = response.json()

                return {
                    "provider": "ollama",
                    "model": data.get("model", self.model),
                    "content": data.get("response", ""),
                    "prompt": prompt,
                }
        except httpx.HTTPError as e:
            raise ProviderUnavailable(f"Ollama request failed: {str(e)}") from e
