# LM Studio Agent API Reference

## Python Agent API

### Class: `LMStudioAgent`

Main agent class for LFM2 model integration.

#### Constructor

```python
LMStudioAgent(
    model_name: str = "lmstudio-community/LFM2-350M-Instruct-GGUF",
    bridge_url: str = "ws://localhost:65028",
    agent_id: str = "lm-studio-agent"
)
```

**Parameters:**
- `model_name` (str): LFM2 model identifier in LM Studio format
- `bridge_url` (str): WebSocket URL for AI Bridge connection
- `agent_id` (str): Unique identifier for this agent instance

**Returns:** LMStudioAgent instance

**Example:**
```python
agent = LMStudioAgent(
    model_name="lmstudio-community/LFM2-350M-Instruct-GGUF",
    bridge_url="ws://localhost:65028",
    agent_id="custom-agent-1"
)
```

---

#### Method: `load_model()`

Load LFM2 model into LM Studio runtime.

```python
agent.load_model() -> None
```

**Parameters:** None

**Returns:** None

**Raises:**
- `RuntimeError`: If LM Studio SDK fails to load model

**Example:**
```python
agent = LMStudioAgent()
agent.load_model()  # Model ready for inference
```

---

#### Method: `act()`

Execute agentic workflow with tool support.

```python
agent.act(
    instruction: str,
    tools: Optional[List[Callable]] = None,
    on_message: Optional[Callable] = None
) -> None
```

**Parameters:**
- `instruction` (str): Natural language instruction for agent to execute
- `tools` (List[Callable], optional): Custom tools for agent to use
- `on_message` (Callable, optional): Callback for streaming agent messages

**Returns:** None (results sent via callback)

**Raises:**
- `RuntimeError`: If model not loaded

**Example:**
```python
# Simple usage
agent.act("Summarize the document")

# With custom tools
def search(query: str) -> list:
    return [{"doc": "..."}]

agent.act(
    "Find and summarize docs about AI",
    tools=[search]
)

# With message callback
results = []
agent.act(
    "Analyze sentiment",
    on_message=lambda msg: results.append(msg)
)
```

---

#### Method: `connect_to_bridge()`

Connect agent to AI Bridge WebSocket hub.

```python
await agent.connect_to_bridge() -> None
```

**Parameters:** None

**Returns:** None (async)

**Raises:**
- `ConnectionError`: If WebSocket connection fails

**Example:**
```python
import asyncio

async def main():
    agent = LMStudioAgent()
    agent.load_model()
    await agent.connect_to_bridge()  # Starts listening for tasks

asyncio.run(main())
```

---

### Class: `LMStudioFineTuner`

Fine-tuning pipeline for LFM2 models using Axolotl.

#### Constructor

```python
LMStudioFineTuner(
    base_model: str = "lmstudio-community/LFM2-350M-Instruct-GGUF",
    output_dir: str = "./fine-tuned-models"
)
```

**Parameters:**
- `base_model` (str): Base model to fine-tune
- `output_dir` (str): Directory for output files and checkpoints

**Returns:** LMStudioFineTuner instance

---

#### Method: `prepare_dataset()`

Convert training data to JSONL format for Axolotl.

```python
tuner.prepare_dataset(
    data: List[Dict[str, str]],
    output_file: str = "training_data.jsonl"
) -> Path
```

**Parameters:**
- `data` (List[Dict]): Training examples with 'instruction' and 'response' keys
- `output_file` (str): Output filename

**Returns:** Path to created JSONL file

**Example:**
```python
training_data = [
    {"instruction": "What is AI?", "response": "AI is..."},
    {"instruction": "Explain ML", "response": "ML is..."}
]

dataset_path = tuner.prepare_dataset(training_data)
# Returns: PosixPath('./fine-tuned-models/training_data.jsonl')
```

---

#### Method: `create_axolotl_config()`

Generate Axolotl configuration file for fine-tuning.

```python
tuner.create_axolotl_config(
    dataset_path: Path,
    num_epochs: int = 3,
    learning_rate: float = 2e-5,
    batch_size: int = 4,
    gradient_accumulation_steps: int = 4
) -> Path
```

**Parameters:**
- `dataset_path` (Path): Path to training dataset
- `num_epochs` (int): Number of training epochs
- `learning_rate` (float): Optimizer learning rate
- `batch_size` (int): Per-device batch size
- `gradient_accumulation_steps` (int): Gradient accumulation steps

**Returns:** Path to created config file

**Example:**
```python
config_path = tuner.create_axolotl_config(
    dataset_path,
    num_epochs=5,
    learning_rate=1e-5,
    batch_size=8
)
```

---

#### Method: `run_fine_tuning()`

Execute fine-tuning using Axolotl or LM Studio CLI.

```python
tuner.run_fine_tuning(
    config_path: Path,
    use_lm_studio_cli: bool = True
) -> bool
```

**Parameters:**
- `config_path` (Path): Path to Axolotl config file
- `use_lm_studio_cli` (bool): Use LM Studio CLI if True, else direct Axolotl

**Returns:** True if successful, False otherwise

**Example:**
```python
success = tuner.run_fine_tuning(config_path)
if success:
    print("Fine-tuning complete!")
```

---

#### Method: `convert_to_gguf()`

Convert fine-tuned model to GGUF format.

```python
tuner.convert_to_gguf(
    model_path: Path,
    output_name: str
) -> Optional[Path]
```

**Parameters:**
- `model_path` (Path): Path to fine-tuned model directory
- `output_name` (str): Name for output GGUF file (without extension)

**Returns:** Path to GGUF file if successful, None otherwise

**Example:**
```python
gguf_path = tuner.convert_to_gguf(
    Path("./fine-tuned-models/final"),
    "my-custom-lfm2"
)
# Returns: PosixPath('./fine-tuned-models/my-custom-lfm2.gguf')
```

---

## Cloudflare Worker API

### Endpoint: `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1699564800000
}
```

**Status Codes:**
- `200 OK`: Service is healthy

---

### Endpoint: `POST /execute`

Execute agent instruction.

**Request:**
```json
{
  "instruction": "Summarize recent AI developments",
  "tools": ["search", "extract"],
  "model": "lmstudio-community/LFM2-350M-Instruct-GGUF"
}
```

**Response (Success):**
```json
{
  "success": true,
  "result": [
    {"type": "thought", "content": "I should search for recent AI news"},
    {"type": "action", "tool": "search", "args": {"query": "AI 2024"}},
    {"type": "result", "content": "Summary: ..."}
  ],
  "cached": false
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing instruction"
}
```

**Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request body
- `500 Internal Server Error`: LM Studio API error

---

## AWS Lambda API

### Function: `lambda_handler`

Lambda entry point for agent execution.

**Event Structure:**
```json
{
  "body": "{\"instruction\": \"Test instruction\", \"tools\": []}"
}
```

**Response (Success):**
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"result\": [...]}"
}
```

**Response (Error):**
```json
{
  "statusCode": 400,
  "headers": {"Content-Type": "application/json"},
  "body": "{\"error\": \"Missing instruction\"}"
}
```

**Status Codes:**
- `200 OK`: Execution successful
- `400 Bad Request`: Invalid event body
- `500 Internal Server Error`: Execution failed

---

## WebSocket Protocol

### Agent Registration

**Client → Bridge:**
```json
{
  "type": "agent:register",
  "data": {
    "agent_id": "lm-studio-agent-1",
    "capabilities": ["llm", "rag", "tool-use"],
    "model": "lmstudio-community/LFM2-350M-Instruct-GGUF"
  }
}
```

**Bridge → Client:**
```json
{
  "type": "registration:success",
  "data": {
    "agent_id": "lm-studio-agent-1"
  }
}
```

### Task Execution

**Bridge → Agent:**
```json
{
  "type": "task:execute",
  "data": {
    "task_id": "task-123",
    "instruction": "Analyze sentiment of customer feedback",
    "tools": ["extract_data", "analyze_sentiment"]
  }
}
```

**Agent → Bridge:**
```json
{
  "type": "task:result",
  "data": {
    "task_id": "task-123",
    "status": "success",
    "result": [
      {"type": "result", "content": "Overall sentiment: Positive (0.85 confidence)"}
    ]
  }
}
```

### Error Reporting

**Agent → Bridge:**
```json
{
  "type": "task:result",
  "data": {
    "task_id": "task-123",
    "status": "error",
    "error": "Model not loaded"
  }
}
```

---

## Built-in Tools

### Tool: `extract_data`

Extract structured data from text.

**Function Signature:**
```python
def extract_data(
    text: str,
    schema: Dict[str, str]
) -> Dict[str, Any]
```

**Parameters:**
- `text` (str): Input text to extract from
- `schema` (Dict[str, str]): Field names and types

**Returns:** Extracted data as dictionary

**Example:**
```python
result = agent._extract_data(
    text="Jane Smith, 28 years old, works at Google",
    schema={"name": "string", "age": "number", "company": "string"}
)
# Returns: {"name": "Jane Smith", "age": 28, "company": "Google"}
```

---

### Tool: `analyze_sentiment`

Analyze sentiment of text.

**Function Signature:**
```python
def analyze_sentiment(text: str) -> Dict[str, Any]
```

**Parameters:**
- `text` (str): Text to analyze

**Returns:** Dictionary with 'sentiment' and 'confidence' keys

**Example:**
```python
result = agent._analyze_sentiment("This product is amazing!")
# Returns: {"sentiment": "positive", "confidence": 0.95}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| `MODEL_NOT_LOADED` | Model Not Loaded | Call `load_model()` before `.act()` |
| `CONNECTION_FAILED` | WebSocket Connection Failed | AI Bridge not reachable |
| `INVALID_INSTRUCTION` | Invalid Instruction | Empty or malformed instruction |
| `TOOL_EXECUTION_FAILED` | Tool Execution Failed | Custom tool raised exception |
| `FINE_TUNING_FAILED` | Fine-Tuning Failed | Axolotl/LM Studio CLI error |
| `GGUF_CONVERSION_FAILED` | GGUF Conversion Failed | Model conversion error |

---

## Type Definitions

### AgentMessage

```python
class AgentMessage(TypedDict):
    type: Literal["thought", "action", "result", "error"]
    content: Optional[str]
    tool: Optional[str]
    args: Optional[Dict[str, Any]]
```

### TrainingExample

```python
class TrainingExample(TypedDict):
    instruction: str
    input: Optional[str]
    response: str
```

### WebSocketMessage

```python
class WebSocketMessage(TypedDict):
    type: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]]
```
