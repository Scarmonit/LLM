#!/usr/bin/env python3
"""
Production MCP Deployment Test Suite
Tests all critical functionality of omnipotent-mcp and a2a-unified-mcp
"""

import asyncio
import json
import subprocess
import sys
from datetime import datetime
from typing import Dict, List, Tuple

# ANSI colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class MCPTester:
    """Test MCP servers via docker exec"""
    
    def __init__(self):
        self.results = {
            "omnipotent": {"passed": 0, "failed": 0, "tests": []},
            "a2a_unified": {"passed": 0, "failed": 0, "tests": []}
        }
    
    def log(self, msg: str, level: str = "INFO"):
        color = {"INFO": BLUE, "SUCCESS": GREEN, "ERROR": RED, "WARNING": YELLOW}.get(level, RESET)
        print(f"{color}[{level}]{RESET} {msg}")
    
    def test_result(self, server: str, test_name: str, passed: bool, details: str = ""):
        """Record test result"""
        status = "PASSED" if passed else "FAILED"
        color = GREEN if passed else RED
        self.log(f"{test_name}: {color}{status}{RESET} {details}", "INFO")
        
        self.results[server]["tests"].append({
            "name": test_name,
            "passed": passed,
            "details": details
        })
        
        if passed:
            self.results[server]["passed"] += 1
        else:
            self.results[server]["failed"] += 1
    
    async def test_omnipotent_health(self) -> bool:
        """Test omnipotent health check"""
        try:
            result = subprocess.run(
                ["docker", "inspect", "--format={{.State.Health.Status}}", "omnipotent-mcp-production"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            health = result.stdout.strip()
            passed = health == "healthy"
            self.test_result("omnipotent", "Health Check", passed, f"Status: {health}")
            return passed
        except Exception as e:
            self.test_result("omnipotent", "Health Check", False, str(e))
            return False
    
    async def test_omnipotent_system_info(self) -> bool:
        """Test system_info tool"""
        try:
            # Test via Python in container
            cmd = [
                "docker", "exec", "omnipotent-mcp-production",
                "python", "-c",
                """
import asyncio
import json
import sys
sys.path.insert(0, '/app')

async def test():
    # Import server module
    from server_production import system_info
    result = await system_info()
    data = json.loads(result)
    print(json.dumps(data, indent=2))
    return bool(data.get('platform') and data.get('cpu') and data.get('memory'))

result = asyncio.run(test())
sys.exit(0 if result else 1)
"""
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            passed = result.returncode == 0
            
            if passed and result.stdout:
                data = json.loads(result.stdout)
                details = f"Platform: {data['platform']['system']}, CPU: {data['cpu']['logical_cores']} cores"
            else:
                details = result.stderr[:100] if result.stderr else "No output"
            
            self.test_result("omnipotent", "System Info Tool", passed, details)
            return passed
        except Exception as e:
            self.test_result("omnipotent", "System Info Tool", False, str(e)[:100])
            return False
    
    async def test_omnipotent_process_list(self) -> bool:
        """Test process listing with cache"""
        try:
            cmd = [
                "docker", "exec", "omnipotent-mcp-production",
                "python", "-c",
                """
import asyncio
import json
import sys
sys.path.insert(0, '/app')

async def test():
    from server_production import list_processes
    result = await list_processes("")
    data = json.loads(result)
    return data.get('count', 0) > 0

result = asyncio.run(test())
sys.exit(0 if result else 1)
"""
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            passed = result.returncode == 0
            details = "Processes listed successfully" if passed else result.stderr[:100]
            
            self.test_result("omnipotent", "Process List (with cache)", passed, details)
            return passed
        except Exception as e:
            self.test_result("omnipotent", "Process List", False, str(e)[:100])
            return False
    
    async def test_omnipotent_security_validator(self) -> bool:
        """Test security validation"""
        try:
            cmd = [
                "docker", "exec", "omnipotent-mcp-production",
                "python", "-c",
                """
import asyncio
import json
import sys
sys.path.insert(0, '/app')

async def test():
    from server_production import validator
    
    # Test dangerous command blocking
    valid, msg = validator.validate_command("rm -rf /")
    if valid:
        return False  # Should be blocked
    
    # Test safe command
    valid, msg = validator.validate_command("ls -la")
    if not valid:
        return False  # Should be allowed
    
    # Test path validation
    valid, path = validator.validate_path("/tmp/test.txt")
    if not valid:
        return False
    
    return True

result = asyncio.run(test())
sys.exit(0 if result else 1)
"""
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            passed = result.returncode == 0
            details = "Security controls working" if passed else "Security validation failed"
            
            self.test_result("omnipotent", "Security Validator", passed, details)
            return passed
        except Exception as e:
            self.test_result("omnipotent", "Security Validator", False, str(e)[:100])
            return False
    
    async def test_omnipotent_cache(self) -> bool:
        """Test cache functionality"""
        try:
            cmd = [
                "docker", "exec", "omnipotent-mcp-production",
                "python", "-c",
                """
import asyncio
import json
import sys
sys.path.insert(0, '/app')

async def test():
    from server_production import cache
    
    # Test cache operations
    cache.set("test_key", {"value": "test_data"})
    result = cache.get("test_key")
    
    if result is None or result.get("value") != "test_data":
        return False
    
    stats = cache.stats()
    return stats.get("size", 0) > 0

result = asyncio.run(test())
sys.exit(0 if result else 1)
"""
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            passed = result.returncode == 0
            details = "Cache operational" if passed else "Cache test failed"
            
            self.test_result("omnipotent", "Cache Manager", passed, details)
            return passed
        except Exception as e:
            self.test_result("omnipotent", "Cache Manager", False, str(e)[:100])
            return False
    
    async def test_a2a_health(self) -> bool:
        """Test a2a-unified health check"""
        try:
            result = subprocess.run(
                ["docker", "inspect", "--format={{.State.Health.Status}}", "a2a-unified-mcp-production"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            health = result.stdout.strip()
            passed = health == "healthy"
            self.test_result("a2a_unified", "Health Check", passed, f"Status: {health}")
            return passed
        except Exception as e:
            self.test_result("a2a_unified", "Health Check", False, str(e))
            return False
    
    async def test_a2a_database(self) -> bool:
        """Test a2a-unified database"""
        try:
            cmd = [
                "docker", "exec", "a2a-unified-mcp-production",
                "python", "-c",
                """
import asyncio
import sys
sys.path.insert(0, '/app')

async def test():
    from server_production import KnowledgeStore
    from pathlib import Path
    
    store = KnowledgeStore(Path('/app/data/test.db'))
    await store.init()
    
    # Test store operations
    await store.store('test', 'category', 'key1', 'value1', {'meta': 'data'})
    results = await store.search('value1')
    
    return len(results) > 0

result = asyncio.run(test())
sys.exit(0 if result else 1)
"""
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            passed = result.returncode == 0
            details = "Database operational" if passed else result.stderr[:100]
            
            self.test_result("a2a_unified", "Knowledge Store Database", passed, details)
            return passed
        except Exception as e:
            self.test_result("a2a_unified", "Database", False, str(e)[:100])
            return False
    
    async def test_containers_running(self) -> Tuple[bool, bool]:
        """Test if containers are running"""
        try:
            result = subprocess.run(
                ["docker", "ps", "--filter", "name=mcp-production", "--format", "{{.Names}}"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            containers = result.stdout.strip().split('\n')
            omnipotent_running = "omnipotent-mcp-production" in containers
            a2a_running = "a2a-unified-mcp-production" in containers
            
            return omnipotent_running, a2a_running
        except:
            return False, False
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 70)
        print(f"{BLUE}PRODUCTION DEPLOYMENT TEST RESULTS{RESET}")
        print("=" * 70)
        
        for server, data in self.results.items():
            total = data["passed"] + data["failed"]
            pass_rate = (data["passed"] / total * 100) if total > 0 else 0
            color = GREEN if data["failed"] == 0 else (YELLOW if pass_rate >= 70 else RED)
            
            print(f"\n{BLUE}{server.upper()}{RESET}")
            print(f"  Passed: {GREEN}{data['passed']}{RESET}")
            print(f"  Failed: {RED}{data['failed']}{RESET}")
            print(f"  Pass Rate: {color}{pass_rate:.1f}%{RESET}")
        
        total_passed = sum(d["passed"] for d in self.results.values())
        total_failed = sum(d["failed"] for d in self.results.values())
        total_tests = total_passed + total_failed
        overall_pass_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n{BLUE}OVERALL{RESET}")
        print(f"  Total Tests: {total_tests}")
        print(f"  Passed: {GREEN}{total_passed}{RESET}")
        print(f"  Failed: {RED}{total_failed}{RESET}")
        print(f"  Pass Rate: {GREEN if total_failed == 0 else YELLOW}{overall_pass_rate:.1f}%{RESET}")
        
        print("\n" + "=" * 70)
        
        if total_failed == 0:
            print(f"{GREEN}✓ ALL TESTS PASSED - PRODUCTION READY{RESET}")
        elif overall_pass_rate >= 70:
            print(f"{YELLOW}⚠ SOME TESTS FAILED - REVIEW REQUIRED{RESET}")
        else:
            print(f"{RED}✗ MULTIPLE FAILURES - NOT PRODUCTION READY{RESET}")
        
        print("=" * 70 + "\n")
        
        return total_failed == 0

async def main():
    """Run all tests"""
    tester = MCPTester()
    
    print(f"\n{BLUE}{'=' * 70}{RESET}")
    print(f"{BLUE}PRODUCTION MCP DEPLOYMENT VERIFICATION{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Testing: omnipotent-mcp-production, a2a-unified-mcp-production\n")
    
    # Check containers are running
    tester.log("Checking container status...", "INFO")
    omnipotent_running, a2a_running = await tester.test_containers_running()
    
    if not omnipotent_running:
        tester.log("Omnipotent container not running!", "ERROR")
    if not a2a_running:
        tester.log("A2A Unified container not running!", "ERROR")
    
    if not (omnipotent_running and a2a_running):
        tester.log("Containers not running. Deploy with: docker-compose -f docker-compose.production.yml up -d", "ERROR")
        sys.exit(1)
    
    # Test omnipotent-mcp
    tester.log("\nTesting omnipotent-mcp-production...", "INFO")
    await tester.test_omnipotent_health()
    await tester.test_omnipotent_system_info()
    await tester.test_omnipotent_process_list()
    await tester.test_omnipotent_security_validator()
    await tester.test_omnipotent_cache()
    
    # Test a2a-unified-mcp
    tester.log("\nTesting a2a-unified-mcp-production...", "INFO")
    await tester.test_a2a_health()
    await tester.test_a2a_database()
    
    # Print summary
    production_ready = tester.print_summary()
    
    # Save results
    results_file = "test_production_results.json"
    with open(results_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "production_ready": production_ready,
            "results": tester.results
        }, f, indent=2)
    
    tester.log(f"Results saved to: {results_file}", "SUCCESS")
    
    sys.exit(0 if production_ready else 1)

if __name__ == "__main__":
    asyncio.run(main())
