"""Tests for FastAPI application."""

import pytest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


class TestAPI:
    """Test cases for FastAPI endpoints."""

    def test_root(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "version" in data

    def test_health(self):
        """Test health endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_get_provider_info(self):
        """Test provider info endpoint."""
        response = client.get("/provider")
        assert response.status_code == 200
        data = response.json()
        assert "provider" in data
        assert "model" in data

    def test_generate_basic(self):
        """Test basic generation."""
        response = client.post("/generate", json={"prompt": "Hello, world!"})
        assert response.status_code == 200
        data = response.json()
        assert "provider" in data
        assert "model" in data
        assert "content" in data
        assert data["prompt"] == "Hello, world!"

    def test_generate_with_provider(self):
        """Test generation with specific provider."""
        response = client.post("/generate", json={"prompt": "Test", "provider": "mock"})
        assert response.status_code == 200
        data = response.json()
        assert data["provider"] == "mock"

    def test_generate_empty_prompt(self):
        """Test generation with empty prompt."""
        response = client.post("/generate", json={"prompt": ""})
        assert response.status_code == 422  # Validation error from Pydantic

    def test_generate_with_temperature(self):
        """Test generation with temperature parameter."""
        response = client.post("/generate", json={"prompt": "Test", "temperature": 0.8})
        assert response.status_code == 200
        data = response.json()
        assert "content" in data

    def test_generate_invalid_temperature(self):
        """Test generation with invalid temperature."""
        response = client.post("/generate", json={"prompt": "Test", "temperature": 3.0})  # > 2.0
        assert response.status_code == 422  # Validation error

    def test_generate_invalid_provider(self):
        """Test generation with invalid provider."""
        response = client.post("/generate", json={"prompt": "Test", "provider": "invalid"})
        # Should fail validation or return 400
        assert response.status_code in [400, 422]

    def test_openapi_schema(self):
        """Test that OpenAPI schema is available."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert "openapi" in schema
        assert "paths" in schema
