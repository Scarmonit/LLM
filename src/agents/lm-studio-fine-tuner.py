"""Fine-tuning pipeline for LFM2 using Axolotl framework

Supports both LM Studio CLI and direct Axolotl execution.
"""

import json
import logging
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LMStudioFineTuner:
    """Fine-tune LFM2 models using Axolotl framework."""

    def __init__(
        self,
        base_model: str = "lmstudio-community/LFM2-350M-Instruct-GGUF",
        output_dir: str = "./fine-tuned-models",
    ):
        self.base_model = base_model
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def prepare_dataset(
        self, data: List[Dict[str, str]], output_file: str = "training_data.jsonl"
    ) -> Path:
        """Prepare dataset in JSONL format for Axolotl.

        Args:
            data: List of training examples with 'instruction' and 'response' keys
            output_file: Output filename for JSONL dataset

        Returns:
            Path to created dataset file
        """
        dataset_path = self.output_dir / output_file

        with open(dataset_path, "w", encoding="utf-8") as f:
            for example in data:
                # Convert to Axolotl format
                formatted = {
                    "instruction": example.get("instruction", ""),
                    "input": example.get("input", ""),
                    "output": example.get("response", ""),
                }
                f.write(json.dumps(formatted) + "\n")

        logger.info(f"Dataset prepared: {dataset_path} ({len(data)} examples)")
        return dataset_path

    def create_axolotl_config(
        self,
        dataset_path: Path,
        num_epochs: int = 3,
        learning_rate: float = 2e-5,
        batch_size: int = 4,
        gradient_accumulation_steps: int = 4,
    ) -> Path:
        """Create Axolotl configuration file.

        Args:
            dataset_path: Path to training dataset
            num_epochs: Number of training epochs
            learning_rate: Learning rate for optimizer
            batch_size: Per-device batch size
            gradient_accumulation_steps: Gradient accumulation steps

        Returns:
            Path to created config file
        """
        config = {
            "base_model": self.base_model,
            "model_type": "AutoModelForCausalLM",
            "tokenizer_type": "AutoTokenizer",
            "load_in_8bit": False,
            "load_in_4bit": True,
            "strict": False,
            "datasets": [
                {
                    "path": str(dataset_path),
                    "type": "alpaca",
                }
            ],
            "dataset_prepared_path": str(self.output_dir / "prepared"),
            "val_set_size": 0.05,
            "output_dir": str(self.output_dir / "checkpoint"),
            "adapter": "lora",
            "lora_r": 8,
            "lora_alpha": 16,
            "lora_dropout": 0.05,
            "lora_target_linear": True,
            "sequence_len": 2048,
            "sample_packing": True,
            "pad_to_sequence_len": True,
            "num_epochs": num_epochs,
            "optimizer": "adamw_torch",
            "lr_scheduler": "cosine",
            "learning_rate": learning_rate,
            "train_on_inputs": False,
            "group_by_length": False,
            "bf16": True,
            "fp16": False,
            "tf32": False,
            "gradient_checkpointing": True,
            "micro_batch_size": batch_size,
            "gradient_accumulation_steps": gradient_accumulation_steps,
            "warmup_steps": 10,
            "eval_steps": 50,
            "save_steps": 100,
            "logging_steps": 10,
        }

        config_path = self.output_dir / "axolotl_config.yml"
        with open(config_path, "w", encoding="utf-8") as f:
            yaml.dump(config, f, default_flow_style=False)

        logger.info(f"Axolotl config created: {config_path}")
        return config_path

    def run_fine_tuning(
        self, config_path: Path, use_lm_studio_cli: bool = True
    ) -> bool:
        """Execute fine-tuning using Axolotl or LM Studio CLI.

        Args:
            config_path: Path to Axolotl config file
            use_lm_studio_cli: Use LM Studio CLI if True, else use Axolotl directly

        Returns:
            True if fine-tuning succeeded, False otherwise
        """
        try:
            if use_lm_studio_cli:
                # Use LM Studio CLI for fine-tuning
                logger.info("Starting fine-tuning with LM Studio CLI")
                cmd = [
                    "lms",
                    "finetune",
                    "--model",
                    self.base_model,
                    "--config",
                    str(config_path),
                    "--output",
                    str(self.output_dir / "final"),
                ]
            else:
                # Use Axolotl directly
                logger.info("Starting fine-tuning with Axolotl")
                cmd = [
                    "accelerate",
                    "launch",
                    "-m",
                    "axolotl.cli.train",
                    str(config_path),
                ]

            logger.info(f"Running command: {' '.join(cmd)}")
            result = subprocess.run(
                cmd, check=True, capture_output=True, text=True
            )
            logger.info("Fine-tuning completed successfully")
            logger.info(result.stdout)
            return True

        except subprocess.CalledProcessError as e:
            logger.error(f"Fine-tuning failed: {e.stderr}")
            return False
        except FileNotFoundError:
            logger.error(
                "LM Studio CLI or Axolotl not found. Please install using:\n"
                "  pip install lmstudio axolotl accelerate"
            )
            return False

    def convert_to_gguf(self, model_path: Path, output_name: str) -> Optional[Path]:
        """Convert fine-tuned model to GGUF format.

        Args:
            model_path: Path to fine-tuned model directory
            output_name: Name for output GGUF file

        Returns:
            Path to GGUF file if successful, None otherwise
        """
        try:
            output_path = self.output_dir / f"{output_name}.gguf"
            cmd = [
                "lms",
                "convert",
                str(model_path),
                "--output",
                str(output_path),
                "--format",
                "gguf",
            ]

            logger.info(f"Converting to GGUF: {' '.join(cmd)}")
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            logger.info(f"GGUF conversion complete: {output_path}")
            return output_path

        except subprocess.CalledProcessError as e:
            logger.error(f"GGUF conversion failed: {e.stderr}")
            return None


def example_fine_tuning():
    """Example: Fine-tune LFM2 on custom dataset."""
    # Prepare training data
    training_data = [
        {
            "instruction": "Explain quantum computing",
            "response": "Quantum computing uses quantum mechanics principles...",
        },
        {
            "instruction": "What is machine learning?",
            "response": "Machine learning is a subset of AI that enables systems...",
        },
        # Add more examples...
    ]

    # Initialize fine-tuner
    tuner = LMStudioFineTuner(
        base_model="lmstudio-community/LFM2-350M-Instruct-GGUF",
        output_dir="./my-fine-tuned-lfm2",
    )

    # Prepare dataset
    dataset_path = tuner.prepare_dataset(training_data)

    # Create Axolotl config
    config_path = tuner.create_axolotl_config(
        dataset_path, num_epochs=3, learning_rate=2e-5, batch_size=4
    )

    # Run fine-tuning
    success = tuner.run_fine_tuning(config_path, use_lm_studio_cli=True)

    if success:
        # Convert to GGUF for efficient inference
        gguf_path = tuner.convert_to_gguf(
            tuner.output_dir / "final", "lfm2-custom-finetuned"
        )
        logger.info(f"Fine-tuned model ready: {gguf_path}")


if __name__ == "__main__":
    example_fine_tuning()
