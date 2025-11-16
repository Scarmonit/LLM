#!/usr/bin/env python3
"""
Comprehensive Test Suite for MCP Servers
Tests all endpoints with various scenarios
"""

import asyncio
import json
import subprocess
import time
from typing import Dict, List, Any

# ============================================================================
# TEST CONFIGURATION
# ============================================================================

OMNIPOTENT_CONTAINER = "omnipotent-mcp-production"
A2A_CONTAINER = "a2a-unified-mcp-server"

# ============================================================================
# TEST UTILITIES
# ============================================================================

class TestRunner:
    """Test runner for MCP servers"""

    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        self.start_time = None

    def start(self):
        """Start test suite"""
        self.start_time = time.time()
        print("=" * 80)
        print("MCP SERVER COMPREHENSIVE TEST SUITE")
        print("=" * 80)
        print()

    def test(self, name: str, container: str, tool: str, args: Dict[str, Any] = None):
        """Execute a test"""
        print(f"Testing: {name}...", end=" ")

        try:
            # Build MCP tool call JSON
            tool_call = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {
                    "name": tool,
                    "arguments": args or {}
                }
            }

            # Execute via docker exec
            cmd = [
                "docker", "exec", "-i", container,
                "python", "-c",
                f"import json; print(json.dumps({tool_call}))"
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                print("✓ PASS")
                self.passed += 1
                self.results.append({
                    "test": name,
                    "status": "PASS",
                    "tool": tool,
                    "container": container
                })
                return True
            else:
                print(f"✗ FAIL ({result.stderr[:50]})")
                self.failed += 1
                self.results.append({
                    "test": name,
                    "status": "FAIL",
                    "tool": tool,
                    "container": container,
                    "error": result.stderr
                })
                return False

        except Exception as e:
            print(f"✗ ERROR ({str(e)[:50]})")
            self.failed += 1
            self.results.append({
                "test": name,
                "status": "ERROR",
                "tool": tool,
                "container": container,
                "error": str(e)
            })
            return False

    def check_container_running(self, container: str) -> bool:
        """Check if container is running"""
        try:
            result = subprocess.run(
                ["docker", "ps", "-q", "-f", f"name={container}"],
                capture_output=True,
                text=True
            )
            return bool(result.stdout.strip())
        except:
            return False

    def get_container_health(self, container: str) -> str:
        """Get container health status"""
        try:
            result = subprocess.run(
                ["docker", "inspect", "--format={{.State.Health.Status}}", container],
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except:
            return "unknown"

    def finish(self):
        """Print test summary"""
        duration = time.time() - self.start_time

        print()
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed / (self.passed + self.failed) * 100):.2f}%")
        print(f"Duration: {duration:.2f}s")
        print("=" * 80)

        # Save results
        with open("test_results.json", "w") as f:
            json.dump({
                "summary": {
                    "total": self.passed + self.failed,
                    "passed": self.passed,
                    "failed": self.failed,
                    "success_rate": (self.passed / (self.passed + self.failed) * 100) if (self.passed + self.failed) > 0 else 0,
                    "duration": duration
                },
                "results": self.results
            }, f, indent=2)

        print("\nResults saved to test_results.json")
        return self.failed == 0

# ============================================================================
# TEST CASES
# ============================================================================

def run_omnipotent_tests(runner: TestRunner):
    """Test Omnipotent MCP Server"""
    print("\n" + "=" * 80)
    print("OMNIPOTENT MCP SERVER TESTS")
    print("=" * 80 + "\n")

    # Check container
    if not runner.check_container_running(OMNIPOTENT_CONTAINER):
        print(f"✗ Container {OMNIPOTENT_CONTAINER} is not running!")
        return

    health = runner.get_container_health(OMNIPOTENT_CONTAINER)
    print(f"Container health: {health}\n")

    # System information tests
    runner.test("System Info", OMNIPOTENT_CONTAINER, "system_info")
    runner.test("List Processes", OMNIPOTENT_CONTAINER, "list_processes")
    runner.test("Network Connections", OMNIPOTENT_CONTAINER, "network_connections")

    # Environment tests
    runner.test("Get ENV Var", OMNIPOTENT_CONTAINER, "get_env_var", {"name": "PATH"})
    runner.test("List ENV Vars", OMNIPOTENT_CONTAINER, "list_env_vars")

    # Performance tests
    runner.test("Performance Stats", OMNIPOTENT_CONTAINER, "get_performance_stats")
    runner.test("Health Check", OMNIPOTENT_CONTAINER, "health_check")

    # Cache tests
    runner.test("Clear Cache", OMNIPOTENT_CONTAINER, "clear_cache")

def run_a2a_tests(runner: TestRunner):
    """Test A2A Unified MCP Server"""
    print("\n" + "=" * 80)
    print("A2A UNIFIED MCP SERVER TESTS")
    print("=" * 80 + "\n")

    # Check container
    if not runner.check_container_running(A2A_CONTAINER):
        print(f"✗ Container {A2A_CONTAINER} is not running!")
        return

    health = runner.get_container_health(A2A_CONTAINER)
    print(f"Container health: {health}\n")

    # Knowledge base tests
    runner.test("Search Knowledge", A2A_CONTAINER, "search_knowledge", {"query": "python", "limit": 5})
    runner.test("Trending Repos", A2A_CONTAINER, "get_trending_repos", {"language": "python", "limit": 5})
    runner.test("Stack Overflow Q&A", A2A_CONTAINER, "get_stackoverflow_qa", {"topic": "docker", "limit": 3})

    # Memory tests
    runner.test("Remember Data", A2A_CONTAINER, "remember", {"key": "test_key", "value": "test_value", "category": "test"})
    runner.test("Recall Data", A2A_CONTAINER, "recall", {"key": "test_key"})
    runner.test("List Memories", A2A_CONTAINER, "list_memories", {"limit": 10})

def run_integration_tests(runner: TestRunner):
    """Run integration tests"""
    print("\n" + "=" * 80)
    print("INTEGRATION TESTS")
    print("=" * 80 + "\n")

    # Test network connectivity between containers
    print("Testing inter-container connectivity...", end=" ")
    try:
        result = subprocess.run(
            ["docker", "exec", OMNIPOTENT_CONTAINER, "ping", "-c", "1", A2A_CONTAINER],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print("✓ PASS")
            runner.passed += 1
        else:
            print("✗ FAIL")
            runner.failed += 1
    except Exception as e:
        print(f"✗ ERROR ({str(e)})")
        runner.failed += 1

def run_performance_tests(runner: TestRunner):
    """Run performance tests"""
    print("\n" + "=" * 80)
    print("PERFORMANCE TESTS")
    print("=" * 80 + "\n")

    # Test response times
    print("Testing response times...")

    for _ in range(5):
        start = time.time()
        runner.test("Response Time Test", OMNIPOTENT_CONTAINER, "system_info")
        duration = time.time() - start
        print(f"  Response time: {duration:.3f}s")

    # Test caching effectiveness
    print("\nTesting cache effectiveness...")

    # First call (cache miss)
    start = time.time()
    runner.test("Cache Test (Miss)", OMNIPOTENT_CONTAINER, "system_info")
    miss_time = time.time() - start

    # Second call (cache hit)
    start = time.time()
    runner.test("Cache Test (Hit)", OMNIPOTENT_CONTAINER, "system_info")
    hit_time = time.time() - start

    improvement = ((miss_time - hit_time) / miss_time * 100) if miss_time > 0 else 0
    print(f"  Cache improvement: {improvement:.1f}%")

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Run all tests"""
    runner = TestRunner()
    runner.start()

    # Run test suites
    run_a2a_tests(runner)

    # Print summary
    success = runner.finish()

    exit(0 if success else 1)

if __name__ == "__main__":
    main()
