"""Provider-agnostic LLM orchestrator."""

from typing import Any, Dict, Optional, Union
from .providers.mock import MockProvider
from .providers.ollama import OllamaProvider
from .exceptions import ProviderUnavailable, ValidationError


class Orchestrator:
    """Provider-agnostic LLM orchestrator with auto-detection and fallback."""

    def __init__(self, provider: Optional[str] = None, model: Optional[str] = None, **kwargs):
        """Initialize the orchestrator.

        Args:
            provider: Provider name ("mock", "ollama", or None for auto-detect)
            model: Model name (provider-specific)
            **kwargs: Additional provider-specific parameters
        """
        self.provider_name = provider
        self.model = model
        self.kwargs = kwargs
        self.provider_instance = None

        if provider is None:
            # Auto-detect: try Ollama first, fall back to mock
            self.provider_instance = self._auto_detect_provider()
        else:
            self.provider_instance = self._create_provider(provider, model, **kwargs)

    def _auto_detect_provider(self) -> Union[OllamaProvider, MockProvider]:
        """Auto-detect available provider.

        Returns:
            OllamaProvider if available, otherwise MockProvider
        """
        # Try Ollama first
        try:
            ollama = OllamaProvider(model=self.model or "llama3", **self.kwargs)
            if ollama._check_availability():
                self.provider_name = "ollama"
                return ollama
        except Exception:
            pass

        # Fall back to mock
        self.provider_name = "mock"
        return MockProvider(model=self.model or "mock", **self.kwargs)

    def _create_provider(
        self, provider: str, model: Optional[str] = None, **kwargs
    ) -> Union[OllamaProvider, MockProvider]:
        """Create a provider instance.

        Args:
            provider: Provider name
            model: Model name
            **kwargs: Additional parameters

        Returns:
            Provider instance

        Raises:
            ValidationError: If provider name is invalid
            ProviderUnavailable: If provider is explicitly requested but unavailable
        """
        if provider == "mock":
            return MockProvider(model=model or "mock", **kwargs)
        elif provider == "ollama":
            ollama = OllamaProvider(model=model or "llama3", **kwargs)
            # Check availability when explicitly requested
            if not ollama._check_availability():
                raise ProviderUnavailable(
                    "Ollama provider explicitly requested but not available. "
                    "Please ensure Ollama is running at http://localhost:11434"
                )
            return ollama
        else:
            raise ValidationError(f"Unknown provider: {provider}")

    def generate(self, prompt: str, provider: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Generate a response for the given prompt.

        Args:
            prompt: The input prompt
            provider: Override provider for this call
            **kwargs: Additional generation parameters

        Returns:
            Normalized response dict with provider, model, and content fields

        Raises:
            ValidationError: If prompt is empty or invalid
        """
        if not prompt or not prompt.strip():
            raise ValidationError("Prompt cannot be empty")

        # Use override provider if specified
        if provider:
            provider_instance = self._create_provider(
                provider, self.model, **{**self.kwargs, **kwargs}
            )
        else:
            provider_instance = self.provider_instance

        # Try to generate, fall back to mock on failure (only for auto-detected)
        try:
            return provider_instance.generate(prompt, **kwargs)
        except ProviderUnavailable:
            # Only fall back if we're in auto-detect mode
            if self.provider_name is None or provider is None:
                # Fall back to mock
                mock = MockProvider(model=self.model or "mock", **self.kwargs)
                response = mock.generate(prompt, **kwargs)
                response["fallback"] = True
                return response
            else:
                # Re-raise if provider was explicitly specified
                raise

    async def agenerate(
        self, prompt: str, provider: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Async version of generate.

        Args:
            prompt: The input prompt
            provider: Override provider for this call
            **kwargs: Additional generation parameters

        Returns:
            Normalized response dict with provider, model, and content fields

        Raises:
            ValidationError: If prompt is empty or invalid
        """
        if not prompt or not prompt.strip():
            raise ValidationError("Prompt cannot be empty")

        # Use override provider if specified
        if provider:
            provider_instance = self._create_provider(
                provider, self.model, **{**self.kwargs, **kwargs}
            )
        else:
            provider_instance = self.provider_instance

        # Try to generate, fall back to mock on failure (only for auto-detected)
        try:
            return await provider_instance.agenerate(prompt, **kwargs)
        except ProviderUnavailable:
            # Only fall back if we're in auto-detect mode
            if self.provider_name is None or provider is None:
                # Fall back to mock
                mock = MockProvider(model=self.model or "mock", **self.kwargs)
                response = await mock.agenerate(prompt, **kwargs)
                response["fallback"] = True
                return response
            else:
                # Re-raise if provider was explicitly specified
                raise

    def get_provider_info(self) -> Dict[str, str]:
        """Get information about the current provider.

        Returns:
            Dict with provider name and model
        """
        return {
            "provider": self.provider_name or "auto",
            "model": self.model or "auto",
        }
