#!/usr/bin/env python3
"""Command-line interface for LLM orchestration."""
import argparse
import sys
import json
from llm import Orchestrator, ProviderUnavailable, ValidationError


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="LLM Multi-Provider CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Auto-detect provider and generate
  llm "What is the capital of France?"
  
  # Use specific provider
  llm --provider mock "Hello, world!"
  
  # Use Ollama with specific model
  llm --provider ollama --model llama3 "Explain quantum computing"
  
  # Get provider info
  llm --info
        """,
    )

    parser.add_argument("prompt", nargs="?", help="The prompt to generate from")
    parser.add_argument(
        "--provider", choices=["mock", "ollama"], help="Provider to use (default: auto-detect)"
    )
    parser.add_argument("--model", help="Model to use (provider-specific)")
    parser.add_argument("--temperature", type=float, help="Temperature parameter (0.0-2.0)")
    parser.add_argument("--info", action="store_true", help="Show current provider information")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")

    args = parser.parse_args()

    try:
        # Create orchestrator
        orchestrator = Orchestrator(provider=args.provider, model=args.model)

        # Show provider info if requested
        if args.info:
            info = orchestrator.get_provider_info()
            if args.json:
                print(json.dumps(info, indent=2))
            else:
                print(f"Provider: {info['provider']}")
                print(f"Model: {info['model']}")
            return 0

        # Generate response
        if not args.prompt:
            parser.print_help()
            return 1

        kwargs = {}
        if args.temperature is not None:
            kwargs["temperature"] = args.temperature

        response = orchestrator.generate(args.prompt, **kwargs)

        if args.json:
            print(json.dumps(response, indent=2))
        else:
            print(f"Provider: {response['provider']}")
            print(f"Model: {response['model']}")
            if response.get("fallback"):
                print("(Fallback to mock)")
            print(f"\n{response['content']}")

        return 0

    except ValidationError as e:
        print(f"Validation error: {e}", file=sys.stderr)
        return 1
    except ProviderUnavailable as e:
        print(f"Provider unavailable: {e}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted", file=sys.stderr)
        return 130
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
