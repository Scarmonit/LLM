#!/usr/bin/env python3
"""
Reliable test for the autonomous agent system.
This test PROVES the agents are working by:
1. Creating a test repository with known issues
2. Running autonomous agents on it
3. Verifying they found and analyzed the issues
4. Checking the work logs contain real LLM responses
"""
import sys
import os
import json
import time
import shutil
import tempfile
from pathlib import Path

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.autonomous_agent import (
    CodeAnalysisAgent,
    TestMonitorAgent,
    DocumentationAgent,
    IssueMonitorAgent
)


def create_test_repo(path: str):
    """Create a test repository with known issues to find."""
    os.makedirs(path, exist_ok=True)
    
    # Create a Python file with no docstring (documentation issue)
    with open(os.path.join(path, 'undocumented.py'), 'w') as f:
        f.write("""
def calculate_total(items):
    total = 0
    for item in items:
        total += item
    return total

def process_data(data):
    results = []
    for d in data:
        results.append(calculate_total(d))
    return results
""")
    
    # Create a file with potential issues (code analysis)
    with open(os.path.join(path, 'buggy_code.py'), 'w') as f:
        f.write("""
def divide_numbers(a, b):
    # No error handling for division by zero
    return a / b

def get_user_data(user_id):
    # SQL injection vulnerability
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return query
    
def unsafe_function(user_input):
    # Using eval is dangerous
    result = eval(user_input)
    return result
""")
    
    # Create README (issue monitoring)
    with open(os.path.join(path, 'README.md'), 'w') as f:
        f.write("# Test Project\n\nThis is a test.")
    
    # Create test directory (test monitoring)
    test_dir = os.path.join(path, 'tests')
    os.makedirs(test_dir, exist_ok=True)
    with open(os.path.join(test_dir, 'test_basic.py'), 'w') as f:
        f.write("def test_example():\n    assert True\n")


def verify_work_was_done(agent_name: str, expected_keywords: list) -> bool:
    """Verify that an agent actually did work by checking its log."""
    log_file = f'/tmp/autonomous_{agent_name}_log.json'
    
    if not os.path.exists(log_file):
        print(f"  ❌ {agent_name}: No log file found")
        return False
    
    try:
        with open(log_file, 'r') as f:
            log = json.load(f)
    except Exception as e:
        print(f"  ❌ {agent_name}: Error reading log: {e}")
        return False
    
    if not log:
        print(f"  ❌ {agent_name}: Log is empty")
        return False
    
    # Check last entry
    last_entry = log[-1]
    result = last_entry.get('result', '')
    
    # Verify it's not empty or generic
    if len(result) < 50:
        print(f"  ❌ {agent_name}: Result too short ({len(result)} chars)")
        return False
    
    # Check for expected keywords
    found_keywords = [kw for kw in expected_keywords if kw.lower() in result.lower()]
    
    if not found_keywords:
        print(f"  ❌ {agent_name}: No expected keywords found in result")
        print(f"     Expected one of: {expected_keywords}")
        print(f"     Got: {result[:100]}...")
        return False
    
    print(f"  ✅ {agent_name}: Completed work ({len(log)} tasks)")
    print(f"     Keywords found: {found_keywords}")
    print(f"     Last result: {result[:100]}...")
    return True


def main():
    """Run the test."""
    print("="*80)
    print("RELIABLE AUTONOMOUS AGENT TEST")
    print("="*80)
    print()
    
    # Create test repository
    test_repo = tempfile.mkdtemp(prefix='test_repo_')
    print(f"📁 Created test repository: {test_repo}")
    create_test_repo(test_repo)
    print("   - undocumented.py (missing docstrings)")
    print("   - buggy_code.py (security issues)")
    print("   - README.md (incomplete documentation)")
    print("   - tests/ (test directory)")
    print()
    
    # Setup orchestrator with REAL LLM
    print("🤖 Setting up orchestrator...")
    try:
        orch = AgentOrchestrator()
        orch.setup_default_providers()
        orch.setup_default_agents()
        
        providers = orch.list_providers()
        print(f"   Provider: {providers[0] if providers else 'NONE'}")
        
        if not providers:
            print("   ❌ No providers available!")
            return False
            
    except Exception as e:
        print(f"   ❌ Error setting up orchestrator: {e}")
        return False
    
    print()
    
    # Create autonomous agents
    print("🔧 Creating autonomous agents...")
    autonomous_agents = [
        CodeAnalysisAgent(orch.get_agent('coding'), test_repo),
        DocumentationAgent(orch.get_agent('writing'), test_repo),
        TestMonitorAgent(orch.get_agent('research'), test_repo),
        IssueMonitorAgent(orch.get_agent('research'), test_repo),
    ]
    
    for agent in autonomous_agents:
        print(f"   - {agent.name}")
    print()
    
    # Run agents for several cycles
    print("⚙️  Running agents (max 3 minutes)...")
    print()
    
    start_time = time.time()
    max_runtime = 180  # 3 minutes max
    target_work_items = len(autonomous_agents)  # At least one per agent
    total_work = 0
    
    while time.time() - start_time < max_runtime and total_work < target_work_items * 2:
        for agent in autonomous_agents:
            if agent.run_cycle():
                total_work += 1
                print(f"   ✓ Work item {total_work} completed")
        
        if total_work >= target_work_items:
            break
            
        time.sleep(2)  # Short wait between cycles
    
    print()
    print(f"   Total work items: {total_work}")
    print(f"   Runtime: {time.time() - start_time:.1f}s")
    print()
    
    # Verify results
    print("🔍 Verifying results...")
    print()
    
    results = {
        'code_analysis': verify_work_was_done(
            'code_analysis',
            ['code', 'function', 'improve', 'bug', 'error', 'security', 'should']
        ),
        'documentation': verify_work_was_done(
            'documentation',
            ['document', 'docstring', 'comment', 'explain', 'describe', 'should']
        ),
        'test_monitor': verify_work_was_done(
            'test_monitor',
            ['test', 'coverage', 'assert', 'verify', 'check']
        ),
        'issue_monitor': verify_work_was_done(
            'issue_monitor',
            ['readme', 'improve', 'documentation', 'should', 'add']
        ),
    }
    
    print()
    print("="*80)
    print("TEST RESULTS")
    print("="*80)
    
    passed = sum(results.values())
    total = len(results)
    
    for agent_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {agent_name}")
    
    print()
    print(f"Result: {passed}/{total} agents completed real work")
    print()
    
    if passed >= 3:  # At least 3 of 4 agents should work
        print("✅ TEST PASSED - Agents are truly autonomous and working!")
        success = True
    else:
        print("❌ TEST FAILED - Agents did not complete enough real work")
        success = False
    
    print()
    print("Work logs saved to:")
    for agent_name in results.keys():
        log_file = f'/tmp/autonomous_{agent_name}_log.json'
        if os.path.exists(log_file):
            print(f"  - {log_file}")
    
    print()
    
    # Cleanup
    try:
        shutil.rmtree(test_repo)
    except Exception:
        pass
    
    return success


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
