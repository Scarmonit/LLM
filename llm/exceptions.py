"""LLM exceptions module."""


class ProviderUnavailable(Exception):
    """Raised when a provider is unavailable or unreachable."""


class ValidationError(Exception):
    """Raised when input validation fails."""
