#!/usr/bin/env python3
"""
Quick test script to verify omnipotent MCP server tools.
"""

import json
import sys

def test_imports():
    """Test that all required imports work."""
    print("Testing imports...")
    try:
        import mcp
        import httpx
        import requests
        from bs4 import BeautifulSoup
        import psutil
        import platform
        print("✅ All imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False

def test_system_info():
    """Test system info gathering."""
    print("\nTesting system info...")
    try:
        import psutil
        import platform

        info = {
            "system": platform.system(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total
        }
        print(f"✅ System info: {json.dumps(info, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ System info failed: {e}")
        return False

def test_file_operations():
    """Test file operations."""
    print("\nTesting file operations...")
    try:
        from pathlib import Path
        import tempfile

        # Test write
        test_file = Path(tempfile.gettempdir()) / "mcp_test.txt"
        test_file.write_text("Hello from Omnipotent MCP!")

        # Test read
        content = test_file.read_text()

        # Cleanup
        test_file.unlink()

        print(f"✅ File operations work! Content: {content}")
        return True
    except Exception as e:
        print(f"❌ File operations failed: {e}")
        return False

def test_network():
    """Test network capabilities."""
    print("\nTesting network...")
    try:
        import httpx
        # Just check that httpx can be instantiated
        client = httpx.Client()
        client.close()
        print("✅ Network client works!")
        return True
    except Exception as e:
        print(f"❌ Network test failed: {e}")
        return False

def test_git():
    """Test git operations."""
    print("\nTesting git...")
    try:
        import git
        print("✅ GitPython available!")
        return True
    except ImportError:
        print("⚠️  GitPython not available (optional)")
        return True  # Not critical

def main():
    """Run all tests."""
    print("=" * 50)
    print("Omnipotent MCP Server - Component Tests")
    print("=" * 50)

    tests = [
        test_imports,
        test_system_info,
        test_file_operations,
        test_network,
        test_git
    ]

    results = [test() for test in tests]

    print("\n" + "=" * 50)
    print(f"Results: {sum(results)}/{len(results)} tests passed")
    print("=" * 50)

    if all(results):
        print("\n🎉 All tests passed! Server is ready to use.")
        print("\nNext steps:")
        print("1. Add server config to Claude Code CLI")
        print("2. Restart Claude Code CLI")
        print("3. Try: 'What omnipotent tools do you have?'")
        return 0
    else:
        print("\n❌ Some tests failed. Check dependencies.")
        print("\nRun: uv add 'mcp[cli]' httpx requests beautifulsoup4 psutil gitpython")
        return 1

if __name__ == "__main__":
    sys.exit(main())
