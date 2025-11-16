"""AWS Lambda handler for LM Studio LFM2 Agent

Serverless deployment with cold start optimization.
"""

import json
import logging
import os
from typing import Any, Dict, List

from lmstudio import LMStudio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global agent instance for cold start optimization
agent = None
lms = None
model = None


def init_agent():
    """Initialize LM Studio agent (runs once per container lifecycle)."""
    global agent, lms, model

    if model is not None:
        return  # Already initialized

    logger.info("Cold start: Initializing LM Studio agent")

    model_name = os.environ.get(
        "MODEL_NAME", "lmstudio-community/LFM2-350M-Instruct-GGUF"
    )

    lms = LMStudio()
    model = lms.llm(model_name)

    logger.info(f"Agent initialized with model: {model_name}")


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda entry point.

    Event structure:
    {
        "body": "{\"instruction\": \"...\", \"tools\": [...]}"
    }

    Returns:
    {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": "{\"result\": [...]}"
    }
    """
    try:
        # Initialize agent on cold start
        init_agent()

        # Parse request
        if isinstance(event.get("body"), str):
            body = json.loads(event.get("body", "{}"))
        else:
            body = event.get("body", {})

        instruction = body.get("instruction")
        if not instruction:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing instruction"}),
            }

        logger.info(f"Executing instruction: {instruction}")

        # Execute agent workflow
        results = []

        def collect_message(msg):
            results.append(msg)

        model.act(instruction=instruction, on_message=collect_message)

        # Return results
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"result": results}),
        }

    except Exception as e:
        logger.error(f"Lambda execution failed: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
