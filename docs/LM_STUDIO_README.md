# LM Studio LFM2 Agent Integration

## Overview

This integration adds LiquidAI's **LFM2-350M** small language model to the LLM Multi-Provider Framework using the **LM Studio SDK**. It provides:

- 🤖 **Python Agent** with `.act()` agentic workflows
- 🎯 **Fine-tuning Pipeline** using Axolotl framework
- ☁️ **Cloudflare Worker** microservice deployment
- 🚀 **AWS Lambda** serverless deployment
- 🛠️ **CLI Tools** for model management
- 🔗 **AI Bridge Integration** for multi-agent coordination

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Python Agent Usage](#python-agent-usage)
4. [Fine-Tuning Guide](#fine-tuning-guide)
5. [Microservices Deployment](#microservices-deployment)
6. [CLI Reference](#cli-reference)
7. [Architecture](#architecture)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- Python 3.8+ with pip
- Node.js 18+
- LM Studio installed ([download here](https://lmstudio.ai))
- Git for version control

### Step 1: Install Python Dependencies

```bash
pip install -r requirements-lm-studio.txt
```

This installs:
- `lmstudio>=0.1.0` - LM Studio SDK
- `websockets>=12.0` - WebSocket client
- `uvloop>=0.19.0` - High-performance event loop
- `axolotl>=0.4.0` - Fine-tuning framework
- `accelerate>=0.25.0` - Distributed training
- `pyyaml>=6.0` - Config file support

### Step 2: Install CLI Tool

```bash
npm install -g ./src/cli
# Or use locally:
node src/cli/lm-studio-cli.js --help
```

### Step 3: Bootstrap LM Studio

```bash
# Download and setup LFM2 model
lm-studio-cli bootstrap
lm-studio-cli get LFM2-350M-Instruct
```

---

## Quick Start

### 1. Start the AI Bridge

```bash
npm run start:bridge
# AI Bridge running on ws://localhost:65028
```

### 2. Run the Python Agent

```python
import asyncio
from src.agents.lm_studio_agent import LMStudioAgent

async def main():
    agent = LMStudioAgent(
        model_name="lmstudio-community/LFM2-350M-Instruct-GGUF",
        bridge_url="ws://localhost:65028"
    )
    
    # Load model
    agent.load_model()
    
    # Execute simple instruction
    agent.act("Summarize the benefits of small language models")
    
    # Connect to AI Bridge for distributed tasks
    await agent.connect_to_bridge()

if __name__ == "__main__":
    asyncio.run(main())
```

### 3. Use CLI Tool

```bash
# Load model into LM Studio
lm-studio-cli load LFM2-350M-Instruct

# Start agent connected to bridge
lm-studio-cli agent:start

# Fine-tune on custom dataset
lm-studio-cli fine-tune \
  --dataset ./my-data.jsonl \
  --epochs 3 \
  --output ./fine-tuned-lfm2
```

---

## Python Agent Usage

### Basic Agent Workflow

```python
from src.agents.lm_studio_agent import LMStudioAgent

agent = LMStudioAgent()
agent.load_model()

# Simple instruction execution
agent.act("Explain quantum computing in simple terms")
```

### Using Custom Tools

```python
def search_database(query: str) -> list:
    """Search local vector database."""
    # Your RAG implementation
    return [{"title": "Doc 1", "content": "..."}]

def analyze_code(code: str) -> dict:
    """Analyze code for bugs."""
    # Your static analysis
    return {"bugs": [], "suggestions": []}

# Execute with custom tools
agent.act(
    instruction="Find bugs in the authentication module and suggest fixes",
    tools=[search_database, analyze_code]
)
```

### Built-in Tools

The agent includes these built-in tools for edge RAG:

1. **extract_data(text, schema)**: Extract structured data from text
2. **analyze_sentiment(text)**: Analyze sentiment and confidence

```python
# Use built-in extraction
result = agent._extract_data(
    text="John Doe, age 30, lives in New York",
    schema={"name": "string", "age": "number", "city": "string"}
)
# Returns: {"name": "John Doe", "age": 30, "city": "New York"}
```

### WebSocket Integration

```python
import asyncio
from src.agents.lm_studio_agent import LMStudioAgent

async def distributed_agent():
    agent = LMStudioAgent(
        agent_id="custom-agent-1",
        bridge_url="ws://localhost:65028"
    )
    
    agent.load_model()
    
    # Connect to AI Bridge
    await agent.connect_to_bridge()
    
    # Agent now receives tasks from bridge automatically
    # Tasks are executed via .act() method

asyncio.run(distributed_agent())
```

---

## Fine-Tuning Guide

### Prepare Training Data

Create a JSONL file with instruction-response pairs:

```jsonl
{"instruction": "What is LFM2?", "response": "LFM2 is a 350M parameter language model..."}
{"instruction": "Explain transformers", "response": "Transformers are neural network architectures..."}
{"instruction": "What is RAG?", "response": "RAG (Retrieval Augmented Generation) is..."}
```

### Fine-Tune with Python

```python
from src.agents.lm_studio_fine_tuner import LMStudioFineTuner

tuner = LMStudioFineTuner(
    base_model="lmstudio-community/LFM2-350M-Instruct-GGUF",
    output_dir="./my-finetuned-model"
)

# Load training data
training_data = [
    {"instruction": "...", "response": "..."},
    # ... more examples
]

# Prepare dataset
dataset_path = tuner.prepare_dataset(training_data)

# Create Axolotl configuration
config_path = tuner.create_axolotl_config(
    dataset_path,
    num_epochs=3,
    learning_rate=2e-5,
    batch_size=4
)

# Run fine-tuning
success = tuner.run_fine_tuning(config_path, use_lm_studio_cli=True)

if success:
    # Convert to GGUF for efficient inference
    gguf_path = tuner.convert_to_gguf(
        tuner.output_dir / "final",
        "my-custom-lfm2"
    )
    print(f"Model ready: {gguf_path}")
```

### Fine-Tune with CLI

```bash
lm-studio-cli fine-tune \
  --dataset ./training-data.jsonl \
  --model lmstudio-community/LFM2-350M-Instruct-GGUF \
  --epochs 5 \
  --learning-rate 1e-5 \
  --output ./fine-tuned-models/custom-lfm2
```

### Advanced Configuration

Customize Axolotl config for specific needs:

```python
config_path = tuner.create_axolotl_config(
    dataset_path,
    num_epochs=10,
    learning_rate=1e-5,
    batch_size=8,
    gradient_accumulation_steps=2  # Effective batch size = 8 * 2 = 16
)

# Modify config for specific hardware
import yaml
with open(config_path) as f:
    config = yaml.safe_load(f)

config['bf16'] = False  # Disable for older GPUs
config['fp16'] = True   # Enable FP16 instead
config['load_in_4bit'] = True  # Use 4-bit quantization

with open(config_path, 'w') as f:
    yaml.dump(config, f)
```

---

## Microservices Deployment

### Cloudflare Worker

#### 1. Configure Worker

Edit `wrangler.toml`:

```toml
name = "lm-studio-lfm2-agent"
main = "src/microservices/cloudflare-worker.ts"
compatibility_date = "2024-01-01"

[env.production]

[[env.production.kv_namespaces]]
binding = "AGENT_CACHE"
id = "YOUR_KV_NAMESPACE_ID"

[env.production.vars]
LM_STUDIO_API_URL = "https://api.lmstudio.ai"
AGENT_AUTH_TOKEN = "" # Set via wrangler secret put
```

#### 2. Deploy to Cloudflare

```bash
# Set secrets
wrangler secret put AGENT_AUTH_TOKEN
# Enter your auth token when prompted

# Deploy worker
wrangler deploy
```

#### 3. Test Endpoint

```bash
curl -X POST https://your-worker.workers.dev/execute \
  -H "Content-Type: application/json" \
  -d '{
    "instruction": "Summarize recent AI developments",
    "model": "lmstudio-community/LFM2-350M-Instruct-GGUF"
  }'
```

### AWS Lambda

#### 1. Build Docker Image

```bash
docker build -f Dockerfile.lambda -t lfm2-agent-lambda .
```

#### 2. Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name lfm2-agent

# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push image
docker tag lfm2-agent-lambda:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lfm2-agent:latest
  
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lfm2-agent:latest
```

#### 3. Create Lambda Function

```bash
aws lambda create-function \
  --function-name lfm2-agent \
  --package-type Image \
  --code ImageUri=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lfm2-agent:latest \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables='{MODEL_NAME=lmstudio-community/LFM2-350M-Instruct-GGUF}'
```

#### 4. Test Lambda

```bash
aws lambda invoke \
  --function-name lfm2-agent \
  --payload '{
    "body": "{\"instruction\": \"Test instruction\"}"
  }' \
  response.json
  
cat response.json
```

---

## CLI Reference

### `bootstrap`

Install LM Studio SDK and dependencies.

```bash
lm-studio-cli bootstrap
```

### `get <model>`

Download LFM2 model from LM Studio.

```bash
lm-studio-cli get LFM2-350M-Instruct
lm-studio-cli get lmstudio-community/LFM2-350M-Instruct-GGUF
```

### `load <model>`

Load model into LM Studio runtime.

```bash
lm-studio-cli load LFM2-350M-Instruct
```

### `unload`

Unload current model from memory.

```bash
lm-studio-cli unload
```

### `agent:start`

Start Python agent connected to AI Bridge.

```bash
lm-studio-cli agent:start \
  --model lmstudio-community/LFM2-350M-Instruct-GGUF \
  --bridge ws://localhost:65028
```

### `fine-tune`

Fine-tune LFM2 with custom dataset.

```bash
lm-studio-cli fine-tune \
  --dataset ./training-data.jsonl \
  --model lmstudio-community/LFM2-350M-Instruct-GGUF \
  --epochs 5 \
  --learning-rate 1e-5 \
  --output ./fine-tuned-models
```

**Options:**
- `-d, --dataset <path>`: Path to JSONL training dataset (required)
- `-m, --model <name>`: Base model (default: LFM2-350M-Instruct-GGUF)
- `-e, --epochs <number>`: Training epochs (default: 3)
- `-lr, --learning-rate <rate>`: Learning rate (default: 2e-5)
- `-o, --output <dir>`: Output directory (default: ./fine-tuned-models)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AI Bridge (WS Hub)                   │
│                  ws://localhost:65028                   │
└──────────────────┬──────────────────────────────────────┘
                   │
          ┌────────┼────────┐
          │        │        │
      ┌───▼──┐ ┌──▼───┐ ┌─▼────┐
      │ LFM2 │ │Claude│ │Ollama│
      │Agent │ │Agent │ │Agent │
      └──────┘ └──────┘ └──────┘
          │
          │ .act() workflow
          │
      ┌───▼──────────────┐
      │ LM Studio SDK    │
      │ LFM2-350M-GGUF   │
      └──────────────────┘
```

### Components

1. **Python Agent** (`src/agents/lm-studio-agent.py`)
   - Manages LFM2 model via LM Studio SDK
   - Implements `.act()` agentic workflow
   - Connects to AI Bridge via WebSocket
   - Supports custom tools for edge RAG

2. **Fine-Tuning Pipeline** (`src/agents/lm-studio-fine-tuner.py`)
   - Prepares datasets in Axolotl format
   - Generates training configurations
   - Executes fine-tuning via LM Studio CLI or Axolotl
   - Converts models to GGUF format

3. **Cloudflare Worker** (`src/microservices/cloudflare-worker.ts`)
   - Edge deployment for low-latency inference
   - Caches results in KV storage
   - CORS support for browser access
   - REST API endpoints

4. **AWS Lambda** (`src/microservices/aws-lambda-handler.py`)
   - Serverless deployment with container support
   - Cold start optimization (persistent model)
   - Auto-scaling based on demand

5. **CLI Tool** (`src/cli/lm-studio-cli.js`)
   - Model management (get, load, unload)
   - Agent lifecycle (start, stop)
   - Fine-tuning orchestration
   - System bootstrap

---

## Troubleshooting

### Model Not Loading

**Error:** `Model not loaded. Call load_model() first.`

**Solution:**
```python
agent = LMStudioAgent()
agent.load_model()  # Must call before .act()
agent.act("instruction")
```

### WebSocket Connection Failed

**Error:** `Connection to AI Bridge failed`

**Solution:**
1. Verify AI Bridge is running:
   ```bash
   npm run start:bridge
   ```
2. Check port is not blocked:
   ```bash
   netstat -an | grep 65028
   ```
3. Update bridge URL if needed:
   ```python
   agent = LMStudioAgent(bridge_url="ws://your-host:65028")
   ```

### Fine-Tuning Out of Memory

**Error:** `CUDA out of memory`

**Solution:**
Reduce batch size and enable gradient accumulation:

```python
config_path = tuner.create_axolotl_config(
    dataset_path,
    batch_size=2,  # Reduce from 4
    gradient_accumulation_steps=8  # Increase from 4
)
```

### LM Studio SDK Not Found

**Error:** `ModuleNotFoundError: No module named 'lmstudio'`

**Solution:**
```bash
pip install lmstudio
# Or run full bootstrap:
lm-studio-cli bootstrap
```

### Cloudflare Worker 500 Error

**Error:** `LM Studio API error: 500`

**Solution:**
1. Verify `LM_STUDIO_API_URL` in `wrangler.toml`
2. Check auth token is set:
   ```bash
   wrangler secret put AGENT_AUTH_TOKEN
   ```
3. Test API endpoint manually:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.lmstudio.ai/health
   ```

### Lambda Cold Starts Too Slow

**Problem:** First invocation takes 10+ seconds

**Solution:**
1. Enable provisioned concurrency:
   ```bash
   aws lambda put-provisioned-concurrency-config \
     --function-name lfm2-agent \
     --provisioned-concurrent-executions 1
   ```
2. Reduce model size with quantization
3. Use Lambda container snapshots (SnapStart for Java, similar for Python)

---

## Performance Benchmarks

| Metric | Value |
|--------|-------|
| Model Load Time | ~2s |
| Inference Latency (LFM2-350M) | 50-100ms |
| WebSocket Connection | <200ms |
| Cloudflare Worker Cold Start | <50ms |
| AWS Lambda Cold Start | 1-3s (with optimization) |
| Fine-Tuning Time (1000 examples) | 5-10 min (GPU) |

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`feat/your-feature`)
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

---

## License

ISC License - See LICENSE file for details

---

## Related Documentation

- [LM Studio SDK Documentation](https://lmstudio.ai/docs)
- [LFM2 Model Card](https://huggingface.co/lmstudio-community/LFM2-350M-Instruct-GGUF)
- [Axolotl Framework](https://github.com/OpenAccess-AI-Collective/axolotl)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [AWS Lambda Containers](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
