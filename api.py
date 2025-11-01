"""FastAPI application for LLM orchestration."""

from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from llm import Orchestrator, ProviderUnavailable, ValidationError

app = FastAPI(
    title="LLM Multi-Provider API",
    description="API for provider-agnostic LLM orchestration",
    version="0.1.0",
)

# Initialize orchestrator with auto-detection
orchestrator = Orchestrator()


class GenerateRequest(BaseModel):
    """Request model for generate endpoint."""

    prompt: str = Field(..., description="The prompt to generate from", min_length=1)
    provider: Optional[str] = Field(
        None, description="Provider to use (mock, ollama, or None for auto)"
    )
    model: Optional[str] = Field(None, description="Model to use")
    temperature: Optional[float] = Field(None, description="Temperature parameter", ge=0.0, le=2.0)


class GenerateResponse(BaseModel):
    """Response model for generate endpoint."""

    provider: str
    model: str
    content: str
    prompt: str
    fallback: Optional[bool] = None


class ProviderInfoResponse(BaseModel):
    """Response model for provider info endpoint."""

    provider: str
    model: str


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint."""
    return {"message": "LLM Multi-Provider API", "version": "0.1.0", "status": "running"}


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/provider", response_model=ProviderInfoResponse, tags=["Provider"])
async def get_provider_info():
    """Get current provider information."""
    return orchestrator.get_provider_info()


@app.post("/generate", response_model=GenerateResponse, tags=["Generation"])
async def generate(request: GenerateRequest):
    """Generate a response for the given prompt.

    Args:
        request: GenerateRequest with prompt and optional parameters

    Returns:
        GenerateResponse with provider, model, and content

    Raises:
        HTTPException: If validation fails or provider is unavailable
    """
    try:
        kwargs = {}
        if request.temperature is not None:
            kwargs["temperature"] = request.temperature

        response = await orchestrator.agenerate(
            prompt=request.prompt, provider=request.provider, **kwargs
        )
        return response
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except ProviderUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}") from e


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
