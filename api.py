"""FastAPI application for LLM orchestration."""

import os
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any

import httpx
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
    """Request model for generate/chat endpoints."""

    prompt: str = Field(..., description="The prompt to generate from", min_length=1)
    provider: Optional[str] = Field(
        None, description="Provider to use (mock, ollama, or None for auto)"
    )
    model: Optional[str] = Field(None, description="Model to use")
    temperature: Optional[float] = Field(
        None, description="Temperature parameter", ge=0.0, le=2.0
    )


class GenerateResponse(BaseModel):
    """Response model for generate/chat endpoints."""

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
async def root() -> Dict[str, Any]:
    """Root endpoint."""
    return {"message": "LLM Multi-Provider API", "version": "0.1.0", "status": "running"}


@app.get("/health", tags=["Health"])
async def health() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/provider", response_model=ProviderInfoResponse, tags=["Provider"])
async def get_provider_info():
    """Get current provider information."""
    return orchestrator.get_provider_info()


async def _handle_generate(request: GenerateRequest) -> GenerateResponse:
    try:
        kwargs = {}
        if request.temperature is not None:
            kwargs["temperature"] = request.temperature

        response = await orchestrator.agenerate(
            prompt=request.prompt, provider=request.provider, **kwargs
        )
        return response  # type: ignore[return-value]
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except ProviderUnavailable as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}") from e


@app.post("/generate", response_model=GenerateResponse, tags=["Generation"])
async def generate(request: GenerateRequest):
    """Generate a response for the given prompt (alias of /chat)."""
    return await _handle_generate(request)


@app.post("/chat", response_model=GenerateResponse, tags=["Generation"])
async def chat(request: GenerateRequest):
    """Generate a response for the given prompt (preferred endpoint)."""
    return await _handle_generate(request)


class RelayRequest(BaseModel):
    """Incoming relay payload from upstream (e.g., Ollama driver)."""

    prompt: str = Field(..., min_length=1)
    provider: Optional[str] = Field(None)
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    source: Optional[str] = Field("ollama", description="Upstream source identifier")


class RelayAck(BaseModel):
    ok: bool
    event_type: str
    dispatched: bool


@app.post("/relay", response_model=RelayAck, tags=["Automation"])
async def relay(request: RelayRequest) -> RelayAck:
    """Accept a prompt, generate a response, and dispatch a repo event to persist it."""
    # 1) Generate locally
    gen = await _handle_generate(GenerateRequest(prompt=request.prompt, provider=request.provider, temperature=request.temperature))

    # 2) Prepare repository_dispatch
    event_type = "ai_response"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    prompt_sha256 = hashlib.sha256(gen["prompt"].encode("utf-8")).hexdigest()

    client_payload = {
        "source": request.source or "ollama",
        "provider": gen["provider"],
        "model": gen["model"],
        "content": gen["content"],
        "timestamp": timestamp,
        "prompt_sha256": prompt_sha256,
    }

    owner = os.getenv("REPO_OWNER", "Scarmonit")
    name = os.getenv("REPO_NAME", "LLM")
    token = os.getenv("GH_REPO_TOKEN")

    if not token:
        # If no token, we still return ok but mark dispatched False
        return RelayAck(ok=True, event_type=event_type, dispatched=False)

    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        }
        url = f"https://api.github.com/repos/{owner}/{name}/dispatches"
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.post(url, headers=headers, json={
                "event_type": event_type,
                "client_payload": client_payload,
            })
            r.raise_for_status()
        return RelayAck(ok=True, event_type=event_type, dispatched=True)
    except httpx.HTTPError as e:  # pragma: no cover
        raise HTTPException(status_code=502, detail=f"Dispatch failed: {str(e)}") from e


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)