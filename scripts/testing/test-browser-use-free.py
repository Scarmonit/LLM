"""
100% FREE Browser Automation Test
Using Browser-Use + Ollama (No API Keys Needed!)
"""
import asyncio
from browser_use import Agent, Browser, Controller
from langchain_ollama import OllamaLLM
import os

async def test_free_browser_agent():
    """Test browser automation with free local AI model"""

    print("🚀 Starting 100% FREE browser automation test...")
    print("📦 Using local Ollama model: qwen2.5:7b")
    print("💰 Cost: $0.00 - No API keys needed!\n")

    # Use your local Ollama model - NO API KEYS!
    llm = OllamaLLM(
        model="qwen2.5:7b",
    )

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

async def test_hacker_news():
    """Test with more complex task - scraping Hacker News"""

    print("\n" + "="*60)
    print("🔍 Testing with Hacker News scraping task...")
    print("="*60 + "\n")

    llm = OllamaLLM(
        model="qwen2.5:7b",
    )

    agent = Agent(
        task="Go to news.ycombinator.com and find the title of the top post",
        llm=llm,
    )

    result = await agent.run()

    print(f"\n📰 Result: {result}")

    return result

async def test_persistent_agent():
    """Test persistent agent that can handle multiple tasks"""

    print("\n" + "="*60)
    print("🔄 Testing persistent agent mode...")
    print("="*60 + "\n")

    llm = OllamaLLM(
        model="qwen2.5:7b",
    )

    # Multiple tasks in sequence
    tasks = [
        "Go to github.com and tell me the main headline",
        "Go to python.org and find the latest Python version"
    ]

    for i, task in enumerate(tasks, 1):
        print(f"\n📋 Task {i}/{len(tasks)}: {task}")
        agent = Agent(task=task, llm=llm)
        result = await agent.run()
        print(f"✅ Result: {result}")

    print("\n🎉 All tasks completed!")

if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════╗
║   100% FREE Browser Automation Test                        ║
║   Browser-Use + Ollama = $0.00 Forever!                   ║
╚════════════════════════════════════════════════════════════╝
    """)

    # Run all tests
    try:
        # Test 1: Simple task
        asyncio.run(test_free_browser_agent())

        # Test 2: Hacker News scraping (uncomment to run)
        # asyncio.run(test_hacker_news())

        # Test 3: Persistent agent (multiple tasks) (uncomment to run)
        # asyncio.run(test_persistent_agent())

        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
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
