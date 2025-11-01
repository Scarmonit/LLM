.PHONY: help install test lint format type-check clean run-api run-cli docker-build docker-run

help:
	@echo "LLM Orchestrator - Available Commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make install-dev   - Install dev dependencies"
	@echo "  make test          - Run tests with coverage"
	@echo "  make lint          - Run pylint"
	@echo "  make format        - Format code with black"
	@echo "  make type-check    - Run mypy type checking"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make run-api       - Run the FastAPI server"
	@echo "  make run-cli       - Run the CLI (with PROMPT variable)"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-run    - Run Docker container"

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt

test:
	pytest --cov=llm --cov=api --cov=cli --cov-report=term-missing

lint:
	pylint llm/ api.py cli.py

format:
	black .

type-check:
	mypy llm/ api.py cli.py --ignore-missing-imports

clean:
	rm -rf __pycache__ .pytest_cache .coverage htmlcov dist build *.egg-info
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

run-api:
	python -m uvicorn api:app --reload

run-cli:
	python cli.py $(PROMPT)

docker-build:
	docker build -t llm-api .

docker-run:
	docker run -p 8000:8000 llm-api

docker-compose-up:
	docker-compose up

docker-compose-down:
	docker-compose down
