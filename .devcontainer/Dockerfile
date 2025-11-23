# LLM Development Container with Ona JetBrains Support
FROM mcr.microsoft.com/devcontainers/universal:2

# Install additional tools
RUN apt-get update && apt-get install -y \
    vim \
    curl \
    wget \
    jq \
    htop \
    tree \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama (optional - for local LLM)
RUN curl -fsSL https://ollama.com/install.sh | sh || true

# Set up Python environment
RUN pip install --upgrade pip && \
    pip install \
    anthropic \
    openai \
    langchain \
    chromadb \
    jupyter \
    fastapi \
    uvicorn \
    requests \
    python-dotenv

# Set working directory
WORKDIR /workspaces

# Environment variables
ENV PYTHONPATH=/workspaces
ENV PYTHONDONTWRITEBYTECODE=1
ENV EDITOR=vim

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version && python --version || exit 1

# Labels for JetBrains
LABEL maintainer="Scarmonit"
LABEL description="LLM Development Environment with Ona JetBrains Support"
LABEL ona.jetbrains.enabled="true"
