# LLM Multi-Provider Framework

A provider-agnostic LLM orchestration system with automatic provider detection, fallback support, and no required external dependencies.

## Features

- **Provider-Agnostic Orchestration**: Works with multiple LLM providers through a unified interface
- **Auto-Detection**: Automatically detects available providers (Ollama) and falls back to mock
- **Mock Provider**: Deterministic mock provider for testing and offline use (no network calls)
- **Ollama Integration**: Optional Ollama support with automatic availability checking
- **FastAPI REST API**: Simple HTTP API for LLM interactions
- **CLI Tool**: Command-line interface for quick interactions
- **Docker Support**: Containerized deployment with docker-compose
- **Comprehensive Testing**: Full test suite with pytest
- **CI/CD**: Automated linting, type-checking, and testing

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Install development dependencies (for testing)
pip install -r requirements-dev.txt
```

### Using the Library

```python
from llm import Orchestrator

# Auto-detect provider (tries Ollama, falls back to mock)
orchestrator = Orchestrator()

# Generate a response
response = orchestrator.generate("What is the capital of France?")
print(response["content"])

# Use specific provider
orchestrator = Orchestrator(provider="mock")
response = orchestrator.generate("Hello, world!")

# Use Ollama (if available)
try:
    orchestrator = Orchestrator(provider="ollama", model="llama3")
    response = orchestrator.generate("Explain quantum computing")
except ProviderUnavailable:
    print("Ollama not available")
```

### Using the API

```bash
# Start the API server
python api.py
# or
uvicorn api:app --reload

# In another terminal, test the API
curl http://localhost:8000/health

# Generate a response
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the capital of France?"}'

# Get provider info
curl http://localhost:8000/provider
```

### Using the CLI

```bash
# Auto-detect provider
python cli.py "What is the capital of France?"

# Use specific provider
python cli.py --provider mock "Hello, world!"

# Use Ollama with specific model
python cli.py --provider ollama --model llama3 "Explain quantum computing"

# Get provider info
python cli.py --info

# JSON output
python cli.py --json "Test prompt"
```

### Using Docker

```bash
# Build and run with docker-compose
docker-compose up

# Or build and run manually
docker build -t llm-api .
docker run -p 8000:8000 llm-api

# Test the containerized API
curl http://localhost:8000/health
```

## Architecture

### Core Components

- **`llm/orchestrator.py`**: Provider-agnostic orchestration with auto-detection
- **`llm/providers/mock.py`**: Deterministic mock provider (no network)
- **`llm/providers/ollama.py`**: Ollama provider with availability checking
- **`llm/exceptions.py`**: Custom exceptions (ProviderUnavailable, ValidationError)
- **`api.py`**: FastAPI application
- **`cli.py`**: Command-line interface

### Provider Auto-Detection

The orchestrator automatically detects available providers:

1. Checks if Ollama is available at `http://localhost:11434`
2. If available, uses Ollama as the default provider
3. If unavailable, falls back to mock provider
4. Explicit provider selection overrides auto-detection

### Response Format

All providers return a normalized response:

```json
{
  "provider": "mock|ollama",
  "model": "model-name",
  "content": "Generated response text",
  "prompt": "Original prompt",
  "fallback": true  // Optional, present if auto-fallback occurred
}
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=llm --cov=api --cov=cli

# Run specific test file
pytest tests/test_orchestrator.py

# Run specific test
pytest tests/test_orchestrator.py::TestOrchestrator::test_generate_basic
```

## Development

### Code Quality

```bash
# Format code
black .

# Lint code
pylint llm/ api.py cli.py

# Type check
mypy llm/ api.py cli.py
```

### CI/CD

The project includes GitHub Actions workflows:

- **Lint**: Runs pylint and black formatting checks
- **Type Check**: Runs mypy type checking
- **Test**: Runs pytest with coverage reporting
- **Docker**: Builds and tests Docker image

## Configuration

### Environment Variables

- None required! The system works without any external secrets or accounts.

### Ollama Setup (Optional)

To use Ollama:

1. Install Ollama: https://ollama.ai
2. Start Ollama: `ollama serve`
3. Pull a model: `ollama pull llama3`
4. The orchestrator will auto-detect Ollama

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /health` - Health check
- `GET /provider` - Get current provider information
- `POST /generate` - Generate a response
  - Request: `{"prompt": "...", "provider": "mock|ollama", "temperature": 0.7}`
  - Response: `{"provider": "...", "model": "...", "content": "..."}`

## License

MIT
