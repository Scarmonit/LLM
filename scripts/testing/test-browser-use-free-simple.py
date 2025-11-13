"""
100% FREE Browser Automation Test
Using Browser-Use + Ollama (No API Keys Needed!)

Simplified version using direct ollama library
"""
import asyncio
from browser_use import Agent
import ollama

# Create a simple wrapper for Ollama to work with Browser-Use
class OllamaWrapper:
    def __init__(self, model="qwen2.5:7b"):
        self.model = model
        self.model_name = model  # Required by Browser-Use for telemetry
        self.provider = "ollama"  # Required by Browser-Use

    def invoke(self, prompt, **kwargs):
        """Synchronous invoke for compatibility"""
        # Handle both string and message list formats
        if isinstance(prompt, str):
            messages = [{'role': 'user', 'content': prompt}]
        elif isinstance(prompt, list):
            messages = prompt
        else:
            messages = [{'role': 'user', 'content': str(prompt)}]

        response = ollama.chat(
            model=self.model,
            messages=messages
        )
        return response['message']['content']

    async def ainvoke(self, prompt, **kwargs):
        """Async invoke - accept any additional kwargs"""
        return self.invoke(prompt, **kwargs)

async def test_free_browser_agent():
    """Test browser automation with free local AI model"""

    print("🚀 Starting 100% FREE browser automation test...")
    print("📦 Using local Ollama model: qwen2.5:7b")
    print("💰 Cost: $0.00 - No API keys needed!\n")

    # Use our wrapper
    llm = OllamaWrapper(model="qwen2.5:7b")

    print("🤖 Creating autonomous agent...")
    print("🔄 Running task autonomously...\n")

    # Create agent with a simple task
    agent = Agent(
        task="Go to example.com and tell me what the main heading says",
        llm=llm,
    )

    # Run task
    result = await agent.run()

    print("\n✅ Task completed!")
    print(f"📊 Result: {result}")
    print("\n💡 This ran 100% locally with no API costs!")

    return result

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║   100% FREE Browser Automation Test                        ║
║   Browser-Use + Ollama = $0.00 Forever!                   ║
╚════════════════════════════════════════════════════════════╝
    """)

    try:
        # Test the setup
        asyncio.run(test_free_browser_agent())

        print("\n" + "="*60)
        print("✅ TEST PASSED!")
        print("💰 Total cost: $0.00")
        print("🎯 You now have unlimited browser automation!")
        print("="*60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        print("\n💡 Troubleshooting:")
        print("1. Make sure Ollama is running: ollama serve")
        print("2. Check if model is downloaded: ollama list")
        print("3. Test model directly: ollama run qwen2.5:7b")
        print("4. Install ollama python library: pip install ollama")
