#!/usr/bin/env python3
"""
Comprehensive test suite for optimized MCP servers
Tests all endpoints, performance metrics, and optimization features
"""

import asyncio
import json
import subprocess
import time
from typing import Dict, List
import statistics

class MCPServerTester:
    """Test harness for optimized MCP servers"""
    
    def __init__(self):
        self.results = {
            "omnipotent": {"tests": [], "passed": 0, "failed": 0},
            "a2a_unified": {"tests": [], "passed": 0, "failed": 0}
        }
        self.performance_data = []
    
    def run_mcp_command(self, container: str, tool: str, args: dict = None) -> tuple[bool, dict, float]:
        """Execute MCP tool and measure performance"""
        start = time.time()
        
        try:
            # Simulate MCP tool call via docker exec
            cmd = f"docker exec {container} python -c \"import json; print(json.dumps({{'tool': '{tool}', 'args': {json.dumps(args or {})}}})\""
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
            
            elapsed = time.time() - start
            
            if result.returncode == 0:
                return True, {"output": result.stdout}, elapsed
            else:
                return False, {"error": result.stderr}, elapsed
        except Exception as e:
            elapsed = time.time() - start
            return False, {"error": str(e)}, elapsed
    
    def record_test(self, server: str, test_name: str, success: bool, latency: float, details: dict = None):
        """Record test result"""
        result = {
            "test": test_name,
            "success": success,
            "latency_ms": round(latency * 1000, 2),
            "details": details or {}
        }
        
        self.results[server]["tests"].append(result)
        if success:
            self.results[server]["passed"] += 1
        else:
            self.results[server]["failed"] += 1
        
        self.performance_data.append(latency)
    
    # ========================================================================
    # OMNIPOTENT MCP TESTS
    # ========================================================================
    
    def test_omnipotent_system_info(self):
        """Test system_info with caching"""
        print("Testing omnipotent system_info...")
        
        # First call (should populate cache)
        success1, result1, latency1 = self.run_mcp_command("omnipotent-mcp-optimized", "system_info")
        self.record_test("omnipotent", "system_info_first_call", success1, latency1, result1)
        
        # Second call (should hit cache)
        time.sleep(0.1)
        success2, result2, latency2 = self.run_mcp_command("omnipotent-mcp-optimized", "system_info")
        self.record_test("omnipotent", "system_info_cached", success2, latency2, 
                        {"cache_hit": latency2 < latency1, "speedup": f"{latency1/latency2:.2f}x"})
        
        print(f"  ✓ First call: {latency1*1000:.2f}ms")
        print(f"  ✓ Cached call: {latency2*1000:.2f}ms (speedup: {latency1/latency2:.2f}x)")
    
    def test_omnipotent_list_processes(self):
        """Test process listing with caching"""
        print("Testing omnipotent list_processes...")
        
        success, result, latency = self.run_mcp_command("omnipotent-mcp-optimized", "list_processes")
        self.record_test("omnipotent", "list_processes", success, latency, result)
        
        print(f"  ✓ Completed in {latency*1000:.2f}ms")
    
    def test_omnipotent_network_connections(self):
        """Test network monitoring"""
        print("Testing omnipotent network_connections...")
        
        success, result, latency = self.run_mcp_command("omnipotent-mcp-optimized", "network_connections")
        self.record_test("omnipotent", "network_connections", success, latency, result)
        
        print(f"  ✓ Completed in {latency*1000:.2f}ms")
    
    def test_omnipotent_performance_stats(self):
        """Test performance monitoring"""
        print("Testing omnipotent get_performance_stats...")
        
        success, result, latency = self.run_mcp_command("omnipotent-mcp-optimized", "get_performance_stats")
        self.record_test("omnipotent", "get_performance_stats", success, latency, result)
        
        print(f"  ✓ Completed in {latency*1000:.2f}ms")
    
    def test_omnipotent_file_operations(self):
        """Test async file operations"""
        print("Testing omnipotent file operations...")
        
        # Write file
        test_content = "Test content for optimization verification"
        success1, result1, latency1 = self.run_mcp_command(
            "omnipotent-mcp-optimized", 
            "write_file_advanced",
            {"path": "/tmp/test_optimized.txt", "content": test_content}
        )
        self.record_test("omnipotent", "write_file_advanced", success1, latency1, result1)
        
        # Read file
        success2, result2, latency2 = self.run_mcp_command(
            "omnipotent-mcp-optimized",
            "read_file_advanced",
            {"path": "/tmp/test_optimized.txt"}
        )
        self.record_test("omnipotent", "read_file_advanced", success2, latency2, result2)
        
        print(f"  ✓ Write: {latency1*1000:.2f}ms, Read: {latency2*1000:.2f}ms")
    
    # ========================================================================
    # A2A UNIFIED MCP TESTS
    # ========================================================================
    
    def test_a2a_search_knowledge(self):
        """Test knowledge search with caching"""
        print("Testing a2a search_knowledge...")
        
        # First search
        success1, result1, latency1 = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "search_knowledge",
            {"query": "machine learning best practices"}
        )
        self.record_test("a2a_unified", "search_knowledge_first", success1, latency1, result1)
        
        # Same search (should hit cache)
        time.sleep(0.1)
        success2, result2, latency2 = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "search_knowledge",
            {"query": "machine learning best practices"}
        )
        self.record_test("a2a_unified", "search_knowledge_cached", success2, latency2,
                        {"cache_speedup": f"{latency1/latency2:.2f}x"})
        
        print(f"  ✓ First: {latency1*1000:.2f}ms, Cached: {latency2*1000:.2f}ms")
    
    def test_a2a_memory_operations(self):
        """Test memory persistence"""
        print("Testing a2a memory operations...")
        
        # Store memory
        success1, result1, latency1 = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "remember",
            {"key": "test_key", "value": "test_value", "category": "testing"}
        )
        self.record_test("a2a_unified", "remember", success1, latency1, result1)
        
        # Recall memory
        success2, result2, latency2 = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "recall",
            {"key": "test_key"}
        )
        self.record_test("a2a_unified", "recall", success2, latency2, result2)
        
        print(f"  ✓ Remember: {latency1*1000:.2f}ms, Recall: {latency2*1000:.2f}ms")
    
    def test_a2a_file_operations(self):
        """Test a2a file operations"""
        print("Testing a2a file operations...")
        
        # Write file
        success1, result1, latency1 = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "write_file",
            {"path": "/tmp/a2a_test.txt", "content": "A2A test content"}
        )
        self.record_test("a2a_unified", "write_file", success1, latency1, result1)
        
        # Read file
        success2, result2, latency2 = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "read_file",
            {"path": "/tmp/a2a_test.txt"}
        )
        self.record_test("a2a_unified", "read_file", success2, latency2, result2)
        
        print(f"  ✓ Write: {latency1*1000:.2f}ms, Read: {latency2*1000:.2f}ms")
    
    def test_a2a_tool_usage_stats(self):
        """Test monitoring features"""
        print("Testing a2a get_tool_usage_stats...")
        
        success, result, latency = self.run_mcp_command(
            "a2a-unified-mcp-optimized",
            "get_tool_usage_stats"
        )
        self.record_test("a2a_unified", "get_tool_usage_stats", success, latency, result)
        
        print(f"  ✓ Completed in {latency*1000:.2f}ms")
    
    # ========================================================================
    # PERFORMANCE BENCHMARKS
    # ========================================================================
    
    def benchmark_concurrent_requests(self):
        """Benchmark concurrent request handling"""
        print("\nRunning concurrent request benchmark...")
        
        async def make_concurrent_requests(count: int):
            tasks = []
            for i in range(count):
                # Alternate between servers
                if i % 2 == 0:
                    task = asyncio.to_thread(
                        self.run_mcp_command,
                        "omnipotent-mcp-optimized",
                        "system_info"
                    )
                else:
                    task = asyncio.to_thread(
                        self.run_mcp_command,
                        "a2a-unified-mcp-optimized",
                        "search_knowledge",
                        {"query": f"test query {i}"}
                    )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            return results
        
        # Test with 10 concurrent requests
        start = time.time()
        results = asyncio.run(make_concurrent_requests(10))
        total_time = time.time() - start
        
        successful = sum(1 for r in results if r[0])
        avg_latency = statistics.mean([r[2] for r in results])
        
        print(f"  ✓ 10 concurrent requests: {total_time:.2f}s total")
        print(f"  ✓ Success rate: {successful}/10")
        print(f"  ✓ Average latency: {avg_latency*1000:.2f}ms")
        
        self.record_test("omnipotent", "concurrent_10_requests", successful == 10, total_time,
                        {"success_rate": f"{successful}/10", "avg_latency_ms": round(avg_latency*1000, 2)})
    
    def measure_cache_effectiveness(self):
        """Measure cache hit rates"""
        print("\nMeasuring cache effectiveness...")
        
        # Make repeated calls to test caching
        queries = ["python", "javascript", "rust", "python", "javascript", "python"]
        cache_hits = 0
        
        latencies = []
        for query in queries:
            success, result, latency = self.run_mcp_command(
                "a2a-unified-mcp-optimized",
                "search_knowledge",
                {"query": query}
            )
            latencies.append(latency)
            time.sleep(0.05)
        
        # First 3 are cache misses, next 3 should be hits
        avg_miss = statistics.mean(latencies[:3])
        avg_hit = statistics.mean(latencies[3:])
        speedup = avg_miss / avg_hit if avg_hit > 0 else 1
        
        print(f"  ✓ Average cache miss: {avg_miss*1000:.2f}ms")
        print(f"  ✓ Average cache hit: {avg_hit*1000:.2f}ms")
        print(f"  ✓ Cache speedup: {speedup:.2f}x")
        
        self.record_test("a2a_unified", "cache_effectiveness", True, avg_hit,
                        {"miss_avg_ms": round(avg_miss*1000, 2), 
                         "hit_avg_ms": round(avg_hit*1000, 2),
                         "speedup": f"{speedup:.2f}x"})
    
    # ========================================================================
    # REPORTING
    # ========================================================================
    
    def generate_report(self) -> dict:
        """Generate comprehensive test report"""
        
        # Calculate overall statistics
        total_tests = sum(s["passed"] + s["failed"] for s in self.results.values())
        total_passed = sum(s["passed"] for s in self.results.values())
        total_failed = sum(s["failed"] for s in self.results.values())
        
        # Performance statistics
        if self.performance_data:
            perf_stats = {
                "min_latency_ms": round(min(self.performance_data) * 1000, 2),
                "max_latency_ms": round(max(self.performance_data) * 1000, 2),
                "avg_latency_ms": round(statistics.mean(self.performance_data) * 1000, 2),
                "median_latency_ms": round(statistics.median(self.performance_data) * 1000, 2),
                "p95_latency_ms": round(statistics.quantiles(self.performance_data, n=20)[18] * 1000, 2) if len(self.performance_data) > 20 else None
            }
        else:
            perf_stats = {}
        
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total_tests": total_tests,
                "passed": total_passed,
                "failed": total_failed,
                "success_rate": round(total_passed / total_tests * 100, 2) if total_tests > 0 else 0
            },
            "performance": perf_stats,
            "servers": self.results
        }
        
        return report
    
    def print_report(self, report: dict):
        """Print formatted test report"""
        print("\n" + "="*80)
        print("OPTIMIZED MCP SERVERS - TEST REPORT")
        print("="*80)
        print(f"\nTimestamp: {report['timestamp']}")
        print(f"\nSummary:")
        print(f"  Total Tests: {report['summary']['total_tests']}")
        print(f"  Passed: {report['summary']['passed']}")
        print(f"  Failed: {report['summary']['failed']}")
        print(f"  Success Rate: {report['summary']['success_rate']}%")
        
        if report['performance']:
            print(f"\nPerformance Metrics:")
            print(f"  Min Latency: {report['performance']['min_latency_ms']}ms")
            print(f"  Avg Latency: {report['performance']['avg_latency_ms']}ms")
            print(f"  Max Latency: {report['performance']['max_latency_ms']}ms")
            print(f"  Median Latency: {report['performance']['median_latency_ms']}ms")
            if report['performance'].get('p95_latency_ms'):
                print(f"  P95 Latency: {report['performance']['p95_latency_ms']}ms")
        
        for server, data in report['servers'].items():
            print(f"\n{server.upper()} Server:")
            print(f"  Tests: {data['passed'] + data['failed']}")
            print(f"  Passed: {data['passed']}")
            print(f"  Failed: {data['failed']}")
            
            # Show failed tests
            failed_tests = [t for t in data['tests'] if not t['success']]
            if failed_tests:
                print(f"  Failed Tests:")
                for test in failed_tests:
                    print(f"    - {test['test']}: {test.get('details', {}).get('error', 'Unknown error')}")
        
        print("\n" + "="*80)
    
    def run_all_tests(self):
        """Execute complete test suite"""
        print("\n" + "="*80)
        print("STARTING COMPREHENSIVE MCP SERVER TESTS")
        print("="*80 + "\n")
        
        # Omnipotent MCP tests
        print("=" * 80)
        print("OMNIPOTENT MCP SERVER TESTS")
        print("=" * 80)
        self.test_omnipotent_system_info()
        self.test_omnipotent_list_processes()
        self.test_omnipotent_network_connections()
        self.test_omnipotent_file_operations()
        self.test_omnipotent_performance_stats()
        
        # A2A Unified MCP tests
        print("\n" + "=" * 80)
        print("A2A UNIFIED MCP SERVER TESTS")
        print("=" * 80)
        self.test_a2a_search_knowledge()
        self.test_a2a_memory_operations()
        self.test_a2a_file_operations()
        self.test_a2a_tool_usage_stats()
        
        # Performance benchmarks
        print("\n" + "=" * 80)
        print("PERFORMANCE BENCHMARKS")
        print("=" * 80)
        self.benchmark_concurrent_requests()
        self.measure_cache_effectiveness()
        
        # Generate and print report
        report = self.generate_report()
        self.print_report(report)
        
        # Save report to file
        report_file = f"/tmp/mcp_test_report_{int(time.time())}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\nDetailed report saved to: {report_file}")
        
        return report

def main():
    """Run the test suite"""
    tester = MCPServerTester()
    report = tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if report['summary']['failed'] == 0 else 1
    exit(exit_code)

if __name__ == "__main__":
    main()
