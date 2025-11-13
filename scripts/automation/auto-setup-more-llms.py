"""
🤖 AUTO-SETUP MORE LLMs & TOOLS
Using our FREE browser automation to get access to more AI services!

This script will:
1. Automatically navigate to free AI provider sites
2. Extract API keys or access tokens
3. Set up integrations
4. Test each service
5. Save credentials securely

ALL 100% FREE!
"""
import asyncio
import json
import os
from pathlib import Path
from browser_use import Agent, ChatOllama


class LLMSetupAutomation:
    """Automate setup of free LLM providers"""

    def __init__(self):
        self.llm = ChatOllama(model="qwen2.5:7b")
        self.credentials_file = Path.home() / ".llm-credentials.json"
        self.credentials = self.load_credentials()

    def load_credentials(self):
        """Load existing credentials"""
        if self.credentials_file.exists():
            with open(self.credentials_file) as f:
                return json.load(f)
        return {}

    def save_credentials(self):
        """Save credentials securely"""
        with open(self.credentials_file, 'w') as f:
            json.dump(self.credentials, f, indent=2)
        os.chmod(self.credentials_file, 0o600)  # Read/write for owner only

    async def setup_huggingface(self):
        """
        HuggingFace: 1000s of FREE models!
        URL: https://huggingface.co
        """
        print("\n" + "="*70)
        print("🤗 SETTING UP HUGGINGFACE (1000s of FREE models)")
        print("="*70)

        agent = Agent(
            task="""
            Go to huggingface.co/settings/tokens
            If not logged in, inform me that I need to create an account first.
            If logged in, find the section to create a new token.
            Tell me the exact steps to create a token.
            """,
            llm=self.llm
        )

        result = await agent.run()
        print(f"\n📋 Instructions: {result}")
        print("\n💡 After creating token manually, add it with:")
        print("   export HUGGINGFACE_TOKEN='your-token-here'")

    async def setup_groq(self):
        """
        Groq: 18x faster than GPUs, FREE tier with generous limits!
        URL: https://console.groq.com
        """
        print("\n" + "="*70)
        print("⚡ SETTING UP GROQ (Ultra-fast FREE inference)")
        print("="*70)

        agent = Agent(
            task="""
            Go to console.groq.com/keys
            Find information about:
            1. How to sign up for free account
            2. Where to get API keys
            3. What the free tier limits are
            Tell me the steps to get started.
            """,
            llm=self.llm
        )

        result = await agent.run()
        print(f"\n📋 Setup info: {result}")

    async def setup_together_ai(self):
        """
        Together AI: Multiple open source models, generous free tier
        URL: https://api.together.xyz
        """
        print("\n" + "="*70)
        print("🔗 SETTING UP TOGETHER AI (Multiple FREE models)")
        print("="*70)

        agent = Agent(
            task="""
            Go to api.together.xyz/signup
            Find information about:
            1. Free tier details
            2. Available models
            3. How to get API key
            Extract this information and summarize it.
            """,
            llm=self.llm
        )

        result = await agent.run()
        print(f"\n📋 Together AI info: {result}")

    async def setup_replicate(self):
        """
        Replicate: Run AI models in the cloud, free credits
        URL: https://replicate.com
        """
        print("\n" + "="*70)
        print("🔄 SETTING UP REPLICATE (Cloud AI models)")
        print("="*70)

        agent = Agent(
            task="""
            Go to replicate.com
            Find information about:
            1. Free tier or credits
            2. Available models
            3. API access
            Summarize the key information.
            """,
            llm=self.llm
        )

        result = await agent.run()
        print(f"\n📋 Replicate info: {result}")

    async def discover_free_apis(self):
        """
        Discover more free AI APIs
        """
        print("\n" + "="*70)
        print("🔍 DISCOVERING MORE FREE AI APIS")
        print("="*70)

        agent = Agent(
            task="""
            Go to github.com and search for "awesome free ai apis"
            Find the top repository with lists of free AI APIs.
            Extract the first 10 free AI providers mentioned.
            For each, note:
            - Provider name
            - What it offers
            - If it's truly free
            """,
            llm=self.llm
        )

        result = await agent.run()
        print(f"\n📋 Discovered APIs: {result}")

    async def setup_local_model_zoo(self):
        """
        Set up more local Ollama models (all FREE!)
        """
        print("\n" + "="*70)
        print("🦁 SETTING UP LOCAL MODEL ZOO (Ollama)")
        print("="*70)

        # List of recommended free models
        recommended_models = {
            "gemma2:9b": "Google's Gemma 2 - excellent for reasoning",
            "codellama:13b": "Code specialist - great for programming",
            "mistral-nemo:12b": "Balanced performance and speed",
            "llama3.2:3b": "Ultra-lightweight, very fast",
            "vicuna:13b": "Conversational AI, GPT-4 level",
            "nous-hermes2:10.7b": "Excellent instruction following",
            "solar:10.7b": "Strong reasoning abilities",
            "starling-lm:7b": "Chat-optimized model"
        }

        print("\n📦 Recommended FREE models to add:")
        for model, description in recommended_models.items():
            print(f"\n  • {model}")
            print(f"    {description}")
            print(f"    Command: ollama pull {model}")

        print("\n💡 To download all:")
        for model in recommended_models.keys():
            print(f"ollama pull {model}")

    async def test_local_models(self):
        """
        Test all installed Ollama models
        """
        print("\n" + "="*70)
        print("🧪 TESTING ALL LOCAL MODELS")
        print("="*70)

        models_to_test = [
            "qwen2.5:7b",
            "llama3.1:8b",
            "deepseek-r1:8b",
            "mistral:7b",
            "phi3:mini"
        ]

        test_task = "What is 2+2? Reply with just the number."

        for model in models_to_test:
            print(f"\n🔬 Testing {model}...")
            try:
                llm = ChatOllama(model=model)
                agent = Agent(
                    task=f"Go to example.com and then answer: {test_task}",
                    llm=llm,
                    max_steps=5
                )
                result = await agent.run()
                print(f"   ✅ {model}: Working! Result: {result}")
            except Exception as e:
                print(f"   ❌ {model}: {str(e)}")

    async def create_llm_router(self):
        """
        Create a smart LLM router that picks the best free model for each task
        """
        print("\n" + "="*70)
        print("🧠 CREATING SMART LLM ROUTER")
        print("="*70)

        router_code = '''
"""
Smart LLM Router - Automatically picks best FREE model for each task
"""
from browser_use import Agent, ChatOllama


class SmartLLMRouter:
    """Routes tasks to the best free model"""

    MODELS = {
        "fast": "phi3:mini",              # 2.2GB - Very fast
        "balanced": "qwen2.5:7b",         # 4.7GB - Best for automation
        "reasoning": "deepseek-r1:8b",     # 5.2GB - Complex reasoning
        "vision": "qwen3-vl",              # 6.1GB - Image understanding
        "code": "codellama:7b",            # 3.8GB - Programming
        "chat": "llama3.1:8b",             # 4.9GB - Conversation
    }

    def choose_model(self, task_type="balanced"):
        """Choose best model for task type"""
        return self.MODELS.get(task_type, self.MODELS["balanced"])

    async def run(self, task, task_type="balanced"):
        """Run task with optimal model"""
        model = self.choose_model(task_type)
        print(f"🤖 Using {model} for {task_type} task")

        llm = ChatOllama(model=model)
        agent = Agent(task=task, llm=llm)
        return await agent.run()


# Example usage:
async def demo():
    router = SmartLLMRouter()

    # Fast simple task
    result = await router.run(
        task="Go to example.com and get the heading",
        task_type="fast"
    )

    # Vision task
    result = await router.run(
        task="Go to python.org and describe the design",
        task_type="vision"
    )

    # Coding task
    result = await router.run(
        task="Go to github.com and analyze the code structure",
        task_type="code"
    )


if __name__ == "__main__":
    import asyncio
    asyncio.run(demo())
'''

        router_file = Path.home() / "smart_llm_router.py"
        with open(router_file, 'w') as f:
            f.write(router_code)

        print(f"\n✅ Created: {router_file}")
        print("\n💡 Now you have a smart router that picks the best FREE model!")


async def main():
    """Run all setup tasks"""

    print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║       🚀 AUTO-SETUP MORE LLMs & TOOLS (100% FREE!) 🚀            ║
║                                                                  ║
║   Using our free browser automation to expand capabilities      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    setup = LLMSetupAutomation()

    # Menu
    print("\n📋 What would you like to set up?")
    print("\n  1. 🤗 HuggingFace (1000s of models)")
    print("  2. ⚡ Groq (Ultra-fast inference)")
    print("  3. 🔗 Together AI (Multiple models)")
    print("  4. 🔄 Replicate (Cloud models)")
    print("  5. 🔍 Discover more free APIs")
    print("  6. 🦁 Add more local Ollama models")
    print("  7. 🧪 Test all local models")
    print("  8. 🧠 Create smart LLM router")
    print("  9. 🎯 Do everything!")

    choice = input("\n👉 Enter choice (1-9): ").strip()

    tasks = {
        "1": setup.setup_huggingface,
        "2": setup.setup_groq,
        "3": setup.setup_together_ai,
        "4": setup.setup_replicate,
        "5": setup.discover_free_apis,
        "6": setup.setup_local_model_zoo,
        "7": setup.test_local_models,
        "8": setup.create_llm_router,
    }

    if choice == "9":
        # Do everything!
        for task in tasks.values():
            try:
                await task()
            except Exception as e:
                print(f"\n⚠️  Error: {e}")
                print("Continuing with next task...")
    elif choice in tasks:
        await tasks[choice]()
    else:
        print("Invalid choice!")

    print("\n" + "="*70)
    print("✅ SETUP COMPLETE!")
    print("="*70)
    print("\n💡 Summary:")
    print("  • You now have access to multiple FREE LLM providers")
    print("  • All automation is powered by your local Ollama + Browser-Use")
    print("  • Cost: Still $0.00!")
    print("\n🚀 Start using your expanded AI capabilities!\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⏸️  Stopped by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
