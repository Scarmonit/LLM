"""LM Studio Agent with LFM2 Model Integration

This agent uses the LM Studio SDK to run LiquidAI's LFM2-350M model
with agentic workflows via the .act() method.
"""

import asyncio
import json
import logging
from typing import Any, Callable, Dict, List, Optional

import websockets
from lmstudio import LMStudio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LMStudioAgent:
    """Agent that uses LM Studio SDK for LFM2 model inference."""

    def __init__(
        self,
        model_name: str = "lmstudio-community/LFM2-350M-Instruct-GGUF",
        bridge_url: str = "ws://localhost:65028",
        agent_id: str = "lm-studio-agent",
    ):
        self.model_name = model_name
        self.bridge_url = bridge_url
        self.agent_id = agent_id
        self.lms = LMStudio()
        self.model = None
        self.ws = None
        self.tools = {}
        self._register_builtin_tools()

    def _register_builtin_tools(self):
        """Register built-in tools for edge RAG and data processing."""
        self.tools["extract_data"] = self._extract_data
        self.tools["analyze_sentiment"] = self._analyze_sentiment

    def _extract_data(self, text: str, schema: Dict[str, str]) -> Dict[str, Any]:
        """Extract structured data from text based on schema."""
        # Use LFM2 for extraction
        prompt = f"Extract the following fields from the text: {json.dumps(schema)}\n\nText: {text}\n\nReturn JSON only."
        result = self.model.respond(prompt)
        try:
            return json.loads(result.content)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse extraction result: {result.content}")
            return {}

    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text."""
        prompt = f"Analyze the sentiment of this text and return a JSON object with 'sentiment' (positive/negative/neutral) and 'confidence' (0-1):\n\n{text}"
        result = self.model.respond(prompt)
        try:
            return json.loads(result.content)
        except json.JSONDecodeError:
            return {"sentiment": "neutral", "confidence": 0.5}

    def load_model(self):
        """Load LFM2 model into LM Studio."""
        logger.info(f"Loading model: {self.model_name}")
        self.model = self.lms.llm(self.model_name)
        logger.info("Model loaded successfully")

    def act(
        self,
        instruction: str,
        tools: Optional[List[Callable]] = None,
        on_message: Optional[Callable] = None,
    ):
        """Execute agentic workflow using LFM2's .act() method.

        Args:
            instruction: Natural language instruction for the agent
            tools: Optional list of callable tools for the agent to use
            on_message: Optional callback for streaming agent messages
        """
        if not self.model:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        # Merge custom tools with built-in tools
        all_tools = self.tools.copy()
        if tools:
            for tool in tools:
                all_tools[tool.__name__] = tool

        logger.info(f"Executing instruction: {instruction}")
        logger.info(f"Available tools: {list(all_tools.keys())}")

        # Execute using LM Studio's agentic workflow
        self.model.act(
            instruction,
            tools=list(all_tools.values()),
            on_message=on_message or self._default_message_handler,
        )

    def _default_message_handler(self, message):
        """Default handler for agent messages."""
        logger.info(f"Agent message: {message}")

    async def connect_to_bridge(self):
        """Connect to AI Bridge WebSocket hub."""
        logger.info(f"Connecting to AI Bridge at {self.bridge_url}")
        self.ws = await websockets.connect(self.bridge_url)

        # Register with bridge
        await self.ws.send(
            json.dumps(
                {
                    "type": "agent:register",
                    "data": {
                        "agent_id": self.agent_id,
                        "capabilities": ["llm", "rag", "tool-use"],
                        "model": self.model_name,
                    },
                }
            )
        )
        logger.info("Connected to AI Bridge")

        # Start listening for tasks
        await self._listen_for_tasks()

    async def _listen_for_tasks(self):
        """Listen for tasks from AI Bridge."""
        async for message in self.ws:
            try:
                data = json.loads(message)
                if data.get("type") == "task:execute":
                    await self._handle_task(data.get("data", {}))
            except Exception as e:
                logger.error(f"Error handling message: {e}")

    async def _handle_task(self, task_data: Dict[str, Any]):
        """Handle task execution request."""
        instruction = task_data.get("instruction")
        task_id = task_data.get("task_id")

        if not instruction:
            logger.warning("Received task without instruction")
            return

        logger.info(f"Executing task {task_id}: {instruction}")

        # Execute task
        try:
            result = []

            def collect_result(msg):
                result.append(msg)

            self.act(instruction, on_message=collect_result)

            # Send result back to bridge
            await self.ws.send(
                json.dumps(
                    {
                        "type": "task:result",
                        "data": {
                            "task_id": task_id,
                            "status": "success",
                            "result": result,
                        },
                    }
                )
            )
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            await self.ws.send(
                json.dumps(
                    {
                        "type": "task:result",
                        "data": {
                            "task_id": task_id,
                            "status": "error",
                            "error": str(e),
                        },
                    }
                )
            )


async def main():
    """Example usage of LM Studio Agent."""
    agent = LMStudioAgent()
    agent.load_model()

    # Example 1: Simple instruction
    agent.act("Summarize the key benefits of using small language models")

    # Example 2: With custom tool
    def search_database(query: str) -> List[Dict[str, Any]]:
        """Search local database for relevant documents."""
        # Mock implementation
        return [{"title": "Doc 1", "content": "Sample content"}]

    agent.act(
        "Find documents about machine learning and summarize the top 3",
        tools=[search_database],
    )

    # Example 3: Connect to AI Bridge for distributed tasks
    await agent.connect_to_bridge()


if __name__ == "__main__":
    asyncio.run(main())
