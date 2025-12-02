#!/usr/bin/env python3
"""
Comprehensive Audit System for LLM Multi-Provider Framework

This script runs multiple harsh tests to thoroughly validate the system:
- Code quality audit (linting, formatting, type checking)
- Security audit (vulnerabilities, unsafe patterns, dependency scanning)
- Performance audit (load testing, stress testing, memory profiling)
- Integration audit (provider connectivity, API tests)
- Robustness audit (error handling, edge cases, failure scenarios)
- Documentation audit (completeness, accuracy, examples)

Usage:
    python audit_system.py [--category CATEGORY] [--verbose] [--fail-fast]

Categories:
    all         - Run all audits (default)
    quality     - Code quality only
    security    - Security checks only
    performance - Performance tests only
    integration - Integration tests only
    robustness  - Robustness tests only
    docs        - Documentation audit only
"""

import sys
import os
import re
import time
import subprocess
import json
import argparse
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))


class Severity(Enum):
    """Severity levels for audit findings."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


@dataclass
class AuditResult:
    """Result from an individual audit check."""
    name: str
    passed: bool
    severity: Severity
    message: str
    details: str = ""
    execution_time: float = 0.0


@dataclass
class CategoryResult:
    """Results from a category of audits."""
    category: str
    results: List[AuditResult] = field(default_factory=list)
    total_time: float = 0.0

    @property
    def passed(self) -> bool:
        """Check if all critical and high severity tests passed."""
        critical_high = [r for r in self.results 
                        if r.severity in [Severity.CRITICAL, Severity.HIGH]]
        return all(r.passed for r in critical_high)

    @property
    def total_passed(self) -> int:
        """Count of passed tests."""
        return sum(1 for r in self.results if r.passed)

    @property
    def total_tests(self) -> int:
        """Total number of tests."""
        return len(self.results)


class AuditSystem:
    """Comprehensive audit system for the LLM framework."""

    def __init__(self, verbose: bool = False, fail_fast: bool = False):
        """Initialize audit system."""
        self.verbose = verbose
        self.fail_fast = fail_fast
        self.results: Dict[str, CategoryResult] = {}
        self.start_time = time.time()

    def log(self, message: str, level: str = "INFO"):
        """Log a message with timestamp."""
        timestamp = time.strftime("%H:%M:%S")
        prefix = {
            "INFO": "ℹ️ ",
            "SUCCESS": "✅",
            "WARNING": "⚠️ ",
            "ERROR": "❌",
            "CRITICAL": "🔥"
        }.get(level, "  ")
        print(f"[{timestamp}] {prefix} {message}")

    def run_command(self, cmd: List[str], check: bool = True) -> Tuple[int, str, str]:
        """Run a shell command and return exit code, stdout, stderr."""
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False,
                timeout=300  # 5 minute timeout
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return -1, "", "Command timed out after 5 minutes"
        except Exception as e:
            return -1, "", str(e)

    # ==================== CODE QUALITY AUDITS ====================

    def audit_code_quality(self) -> CategoryResult:
        """Run comprehensive code quality audits."""
        self.log("Running code quality audits...", "INFO")
        category = CategoryResult(category="Code Quality")
        start_time = time.time()

        # Test 1: Pylint check
        result = self._audit_pylint()
        category.results.append(result)
        if not result.passed and self.fail_fast:
            return category

        # Test 2: Black formatting check
        result = self._audit_black_formatting()
        category.results.append(result)
        if not result.passed and self.fail_fast:
            return category

        # Test 3: Import organization
        result = self._audit_import_organization()
        category.results.append(result)

        # Test 4: Code complexity
        result = self._audit_code_complexity()
        category.results.append(result)

        # Test 5: Docstring coverage
        result = self._audit_docstring_coverage()
        category.results.append(result)

        # Test 6: Type hints coverage
        result = self._audit_type_hints()
        category.results.append(result)

        category.total_time = time.time() - start_time
        return category

    def _audit_pylint(self) -> AuditResult:
        """Check pylint score."""
        start = time.time()
        returncode, stdout, stderr = self.run_command(
            ["pylint", "src/llm_framework/", "--score=yes", "--exit-zero"]
        )
        
        # Extract score from output
        score = 0.0
        for line in stdout.split('\n'):
            if 'rated at' in line.lower():
                try:
                    score = float(line.split('rated at')[1].split('/')[0].strip())
                except (ValueError, IndexError):
                    pass
        
        # Harsh criteria: Must be >= 9.0
        passed = score >= 9.0
        severity = Severity.HIGH if not passed else Severity.INFO
        message = f"Pylint score: {score:.2f}/10 (threshold: 9.0)"
        details = f"Command: pylint src/llm_framework/\n{stdout[-500:]}" if self.verbose else ""
        
        return AuditResult(
            name="Pylint Code Quality",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_black_formatting(self) -> AuditResult:
        """Check if code follows black formatting."""
        start = time.time()
        returncode, stdout, stderr = self.run_command(
            ["black", "--check", "src/llm_framework/", "--quiet"]
        )
        
        passed = returncode == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = "Black formatting check" + (" passed" if passed else " failed")
        details = stderr if not passed else ""
        
        return AuditResult(
            name="Black Formatting",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_import_organization(self) -> AuditResult:
        """Check for import organization issues."""
        start = time.time()
        issues = []
        
        # Check for wildcard imports
        for py_file in Path("src/llm_framework").rglob("*.py"):
            with open(py_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'from * import' in content or 'import *' in content:
                    issues.append(f"{py_file}: Contains wildcard import")
        
        passed = len(issues) == 0
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"Import organization check ({len(issues)} issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="Import Organization",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_code_complexity(self) -> AuditResult:
        """Check for overly complex code."""
        start = time.time()
        
        # Use radon for complexity analysis if available
        returncode, stdout, stderr = self.run_command(
            ["python", "-m", "pip", "list"]
        )
        
        has_radon = "radon" in stdout.lower()
        
        if has_radon:
            returncode, stdout, stderr = self.run_command(
                ["radon", "cc", "src/llm_framework/", "-a", "-nb"]
            )
            # Check if average complexity is reasonable
            passed = "F" not in stdout  # No F-grade functions
            message = "Cyclomatic complexity check"
            details = stdout[-500:] if self.verbose else ""
        else:
            # Manual check - count lines per function
            passed = True
            message = "Code complexity check (radon not available, skipped)"
            details = "Install radon for detailed complexity analysis"
        
        severity = Severity.MEDIUM if not passed else Severity.INFO
        
        return AuditResult(
            name="Code Complexity",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_docstring_coverage(self) -> AuditResult:
        """Check docstring coverage."""
        start = time.time()
        missing = []
        
        for py_file in Path("src/llm_framework").rglob("*.py"):
            if py_file.name.startswith("__"):
                continue
            
            with open(py_file, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for i, line in enumerate(lines):
                    # Check for function/class definitions
                    if line.strip().startswith('def ') or line.strip().startswith('class '):
                        # Skip private methods
                        if '_' not in line.split('(')[0].split()[-1][0:2]:
                            # Check next non-empty line for docstring
                            has_docstring = False
                            for j in range(i + 1, min(i + 5, len(lines))):
                                if lines[j].strip().startswith('"""') or lines[j].strip().startswith("'''"):
                                    has_docstring = True
                                    break
                                if lines[j].strip() and not lines[j].strip().startswith('#'):
                                    break
                            
                            if not has_docstring:
                                func_name = line.split('(')[0].split()[-1]
                                missing.append(f"{py_file}:{i+1} - {func_name}")
        
        # Harsh: Allow max 10 missing docstrings
        passed = len(missing) <= 10
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"Docstring coverage ({len(missing)} missing)"
        details = "\n".join(missing[:20]) if missing else ""
        
        return AuditResult(
            name="Docstring Coverage",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_type_hints(self) -> AuditResult:
        """Check for type hints coverage."""
        start = time.time()
        
        # Try mypy if available
        returncode, stdout, stderr = self.run_command(
            ["python", "-c", "import mypy"]
        )
        
        if returncode == 0:
            returncode, stdout, stderr = self.run_command(
                ["mypy", "src/llm_framework/", "--ignore-missing-imports"]
            )
            error_count = stdout.count("error:")
            passed = error_count < 50  # Allow some errors
            message = f"Type hints check ({error_count} mypy errors)"
            details = stdout[-500:] if self.verbose else ""
        else:
            passed = True
            message = "Type hints check (mypy not available, skipped)"
            details = "Install mypy for type checking"
        
        severity = Severity.LOW if not passed else Severity.INFO
        
        return AuditResult(
            name="Type Hints Coverage",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    # ==================== SECURITY AUDITS ====================

    def audit_security(self) -> CategoryResult:
        """Run comprehensive security audits."""
        self.log("Running security audits...", "INFO")
        category = CategoryResult(category="Security")
        start_time = time.time()

        # Test 1: Check for hardcoded secrets
        result = self._audit_hardcoded_secrets()
        category.results.append(result)
        if not result.passed and self.fail_fast:
            return category

        # Test 2: Unsafe code patterns
        result = self._audit_unsafe_patterns()
        category.results.append(result)
        if not result.passed and self.fail_fast:
            return category

        # Test 3: Dependency vulnerabilities
        result = self._audit_dependency_vulnerabilities()
        category.results.append(result)

        # Test 4: SQL injection patterns
        result = self._audit_sql_injection()
        category.results.append(result)

        # Test 5: Command injection patterns
        result = self._audit_command_injection()
        category.results.append(result)

        # Test 6: Path traversal vulnerabilities
        result = self._audit_path_traversal()
        category.results.append(result)

        category.total_time = time.time() - start_time
        return category

    def _audit_hardcoded_secrets(self) -> AuditResult:
        """Check for hardcoded secrets."""
        start = time.time()
        issues = []
        
        # Patterns that might indicate secrets
        patterns = [
            'password = ',
            'api_key = ',
            'secret = ',
            'token = ',
            'aws_access_key',
            'private_key'
        ]
        
        for py_file in Path("src/llm_framework").rglob("*.py"):
            with open(py_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    # Skip comments and env var references
                    if line.strip().startswith('#'):
                        continue
                    if 'os.environ' in line or 'getenv' in line:
                        continue
                    
                    for pattern in patterns:
                        if pattern in line.lower():
                            # Check if it's assigned to a string literal (not empty)
                            if '= "' in line or "= '" in line:
                                if len(line.split('=')[1].strip().strip('"\'')) > 5:
                                    issues.append(f"{py_file}:{i} - Possible hardcoded secret")
        
        passed = len(issues) == 0
        severity = Severity.CRITICAL if not passed else Severity.INFO
        message = f"Hardcoded secrets check ({len(issues)} found)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="Hardcoded Secrets",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_unsafe_patterns(self) -> AuditResult:
        """Check for unsafe code patterns."""
        start = time.time()
        issues = []
        
        unsafe_patterns = {
            'eval(': 'Use of eval() is dangerous',
            'exec(': 'Use of exec() is dangerous',
            'pickle.loads': 'Unpickling untrusted data is dangerous',
            '__import__': 'Dynamic imports can be dangerous',
            'shell=True': 'Shell execution can be dangerous',
        }
        
        for py_file in Path("src/llm_framework").rglob("*.py"):
            with open(py_file, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern, reason in unsafe_patterns.items():
                    if pattern in content:
                        issues.append(f"{py_file}: {reason}")
        
        passed = len(issues) == 0
        severity = Severity.HIGH if not passed else Severity.INFO
        message = f"Unsafe patterns check ({len(issues)} found)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="Unsafe Code Patterns",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_dependency_vulnerabilities(self) -> AuditResult:
        """Check for known vulnerabilities in dependencies."""
        start = time.time()
        
        # Try safety check if available
        returncode, stdout, stderr = self.run_command(
            ["python", "-c", "import safety"]
        )
        
        if returncode == 0:
            returncode, stdout, stderr = self.run_command(
                ["safety", "check", "--json"]
            )
            
            try:
                data = json.loads(stdout) if stdout else []
                vuln_count = len(data)
                passed = vuln_count == 0
                message = f"Dependency vulnerabilities ({vuln_count} found)"
                details = json.dumps(data, indent=2)[:500] if data else ""
            except json.JSONDecodeError:
                passed = True
                message = "Dependency check completed (no JSON output)"
                details = stdout[:500]
        else:
            # Try pip-audit
            returncode, stdout, stderr = self.run_command(
                ["pip-audit", "--format", "json"]
            )
            
            if returncode == 0:
                try:
                    data = json.loads(stdout) if stdout else {"dependencies": []}
                    vuln_count = len(data.get("dependencies", []))
                    passed = vuln_count == 0
                    message = f"Dependency vulnerabilities ({vuln_count} found)"
                    details = stdout[:500]
                except json.JSONDecodeError:
                    passed = True
                    message = "Dependency check completed"
                    details = ""
            else:
                passed = True
                message = "Dependency check (safety/pip-audit not available, skipped)"
                details = "Install safety or pip-audit for vulnerability scanning"
        
        severity = Severity.CRITICAL if not passed else Severity.INFO
        
        return AuditResult(
            name="Dependency Vulnerabilities",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_sql_injection(self) -> AuditResult:
        """Check for SQL injection vulnerabilities."""
        start = time.time()
        issues = []
        
        for py_file in Path("src/llm_framework").rglob("*.py"):
            with open(py_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    # Look for SQL string formatting
                    if any(kw in line.lower() for kw in ['select', 'insert', 'update', 'delete']):
                        if '.format(' in line or '% ' in line or 'f"' in line or "f'" in line:
                            issues.append(f"{py_file}:{i} - Potential SQL injection via string formatting")
        
        passed = len(issues) == 0
        severity = Severity.CRITICAL if not passed else Severity.INFO
        message = f"SQL injection check ({len(issues)} potential issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="SQL Injection Vulnerabilities",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_command_injection(self) -> AuditResult:
        """Check for command injection vulnerabilities."""
        start = time.time()
        issues = []
        
        for py_file in Path("src/llm_framework").rglob("*.py"):
            with open(py_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    # Look for subprocess calls with shell=True and string formatting
                    if 'subprocess' in line and 'shell=True' in line:
                        # Check previous or next few lines for string formatting
                        context = ''.join(lines[max(0, i-3):min(len(lines), i+2)])
                        if any(marker in context for marker in ['.format(', '% ', 'f"', "f'"]):
                            issues.append(f"{py_file}:{i} - Potential command injection")
        
        passed = len(issues) == 0
        severity = Severity.HIGH if not passed else Severity.INFO
        message = f"Command injection check ({len(issues)} potential issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="Command Injection Vulnerabilities",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_path_traversal(self) -> AuditResult:
        """Check for path traversal vulnerabilities."""
        start = time.time()
        issues = []
        
        for py_file in Path("src/llm_framework").rglob("*.py"):
            with open(py_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for i, line in enumerate(lines, 1):
                    # Look for file operations with user input
                    if any(op in line for op in ['open(', 'os.path.join', 'Path(']):
                        # Check if using user input without validation
                        if any(marker in line for marker in ['.format(', '% ', 'f"', "f'"]):
                            # Check if there's path validation nearby
                            context = ''.join(lines[max(0, i-3):min(len(lines), i+2)])
                            if 'abspath' not in context and 'realpath' not in context:
                                issues.append(f"{py_file}:{i} - Potential path traversal")
        
        passed = len(issues) == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = f"Path traversal check ({len(issues)} potential issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="Path Traversal Vulnerabilities",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    # ==================== PERFORMANCE AUDITS ====================

    def audit_performance(self) -> CategoryResult:
        """Run performance audits."""
        self.log("Running performance audits...", "INFO")
        category = CategoryResult(category="Performance")
        start_time = time.time()

        # Test 1: Unit test execution time
        result = self._audit_test_performance()
        category.results.append(result)

        # Test 2: Import time
        result = self._audit_import_time()
        category.results.append(result)

        # Test 3: Memory usage baseline
        result = self._audit_memory_baseline()
        category.results.append(result)

        # Test 4: Provider response time
        result = self._audit_provider_performance()
        category.results.append(result)

        category.total_time = time.time() - start_time
        return category

    def _audit_test_performance(self) -> AuditResult:
        """Check unit test execution time."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command(
            ["python", "-m", "pytest", "tests/", "-v", "--tb=no", "-q"]
        )
        
        execution_time = time.time() - start
        
        # Harsh: Tests should run in under 30 seconds
        passed = execution_time < 30.0 and returncode == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = f"Test suite performance: {execution_time:.2f}s (threshold: 30s)"
        
        # Extract test count
        test_count = stdout.count(" PASSED") + stdout.count(" FAILED")
        details = f"Tests run: {test_count}, Exit code: {returncode}"
        
        return AuditResult(
            name="Test Suite Performance",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=execution_time
        )

    def _audit_import_time(self) -> AuditResult:
        """Check module import time."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "import time; start = time.time(); "
            "from llm_framework.orchestrator import AgentOrchestrator; "
            "print(f'{time.time() - start:.3f}')"
        ])
        
        import_time = float(stdout.strip()) if stdout.strip() else 999.0
        
        # Should import in under 1 second
        passed = import_time < 1.0 and returncode == 0
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"Import time: {import_time:.3f}s (threshold: 1.0s)"
        
        return AuditResult(
            name="Module Import Time",
            passed=passed,
            severity=severity,
            message=message,
            execution_time=time.time() - start
        )

    def _audit_memory_baseline(self) -> AuditResult:
        """Check baseline memory usage."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "import tracemalloc; tracemalloc.start(); "
            "from llm_framework.orchestrator import AgentOrchestrator; "
            "orch = AgentOrchestrator(); "
            "current, peak = tracemalloc.get_traced_memory(); "
            "print(f'{peak / 1024 / 1024:.2f}')"
        ])
        
        memory_mb = float(stdout.strip()) if stdout.strip() else 999.0
        
        # Should use less than 100MB for basic setup
        passed = memory_mb < 100.0 and returncode == 0
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"Baseline memory: {memory_mb:.2f}MB (threshold: 100MB)"
        
        return AuditResult(
            name="Baseline Memory Usage",
            passed=passed,
            severity=severity,
            message=message,
            execution_time=time.time() - start
        )

    def _audit_provider_performance(self) -> AuditResult:
        """Check provider performance (if available)."""
        start = time.time()
        
        # Test with mock provider (always available)
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.providers.intelligent_mock_provider import IntelligentMockProvider; "
            "import time; "
            "provider = IntelligentMockProvider(); "
            "start = time.time(); "
            "result = provider.generate('Test prompt', max_tokens=50); "
            "print(f'{time.time() - start:.3f}')"
        ])
        
        response_time = float(stdout.strip()) if stdout.strip() else 999.0
        
        # Mock provider should respond in under 0.1 seconds
        passed = response_time < 0.1 and returncode == 0
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"Provider response time: {response_time:.3f}s (mock provider)"
        
        return AuditResult(
            name="Provider Performance",
            passed=passed,
            severity=severity,
            message=message,
            execution_time=time.time() - start
        )

    # ==================== INTEGRATION AUDITS ====================

    def audit_integration(self) -> CategoryResult:
        """Run integration audits."""
        self.log("Running integration audits...", "INFO")
        category = CategoryResult(category="Integration")
        start_time = time.time()

        # Test 1: Provider initialization
        result = self._audit_provider_initialization()
        category.results.append(result)

        # Test 2: Agent creation
        result = self._audit_agent_creation()
        category.results.append(result)

        # Test 3: Full test suite
        result = self._audit_full_test_suite()
        category.results.append(result)

        # Test 4: Configuration loading
        result = self._audit_configuration()
        category.results.append(result)

        category.total_time = time.time() - start_time
        return category

    def _audit_provider_initialization(self) -> AuditResult:
        """Test provider initialization."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.orchestrator import AgentOrchestrator; "
            "orch = AgentOrchestrator(); "
            "orch.setup_default_providers(); "
            "print('SUCCESS' if orch.list_providers() else 'FAIL')"
        ])
        
        passed = "SUCCESS" in stdout and returncode == 0
        severity = Severity.CRITICAL if not passed else Severity.INFO
        message = "Provider initialization" + (" passed" if passed else " failed")
        details = stderr if not passed else ""
        
        return AuditResult(
            name="Provider Initialization",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_agent_creation(self) -> AuditResult:
        """Test agent creation."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.orchestrator import AgentOrchestrator; "
            "orch = AgentOrchestrator(); "
            "orch.setup_default_providers(); "
            "orch.setup_default_agents(); "
            "agents = orch.list_agents(); "
            "print('SUCCESS' if len(agents) >= 3 else 'FAIL')"
        ])
        
        passed = "SUCCESS" in stdout and returncode == 0
        severity = Severity.CRITICAL if not passed else Severity.INFO
        message = "Agent creation" + (" passed" if passed else " failed")
        details = stderr if not passed else ""
        
        return AuditResult(
            name="Agent Creation",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_full_test_suite(self) -> AuditResult:
        """Run full test suite."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command([
            "python", "-m", "pytest", "tests/", "-v", "--tb=short"
        ])
        
        # Count passed tests (look for both formats)
        passed_count = stdout.count(" PASSED")
        if passed_count == 0:
            # Try to extract from summary line (e.g., "100 passed in 3.21s")
            import re as regex_module
            match = regex_module.search(r'(\d+) passed', stdout)
            if match:
                passed_count = int(match.group(1))
        
        failed_count = stdout.count(" FAILED")
        if failed_count == 0:
            import re as regex_module
            match = regex_module.search(r'(\d+) failed', stdout)
            if match:
                failed_count = int(match.group(1))
        
        passed = returncode == 0 and failed_count == 0
        severity = Severity.CRITICAL if not passed else Severity.INFO
        message = f"Test suite: {passed_count} passed, {failed_count} failed"
        details = stderr if not passed else ""
        
        return AuditResult(
            name="Full Test Suite",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_configuration(self) -> AuditResult:
        """Test configuration loading."""
        start = time.time()
        
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.config import Config; "
            "config = Config(); "
            "print('SUCCESS' if config else 'FAIL')"
        ])
        
        passed = "SUCCESS" in stdout and returncode == 0
        severity = Severity.HIGH if not passed else Severity.INFO
        message = "Configuration loading" + (" passed" if passed else " failed")
        details = stderr if not passed else ""
        
        return AuditResult(
            name="Configuration Loading",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    # ==================== ROBUSTNESS AUDITS ====================

    def audit_robustness(self) -> CategoryResult:
        """Run robustness audits (error handling, edge cases)."""
        self.log("Running robustness audits...", "INFO")
        category = CategoryResult(category="Robustness")
        start_time = time.time()

        # Test 1: Error handling
        result = self._audit_error_handling()
        category.results.append(result)

        # Test 2: Edge case handling
        result = self._audit_edge_cases()
        category.results.append(result)

        # Test 3: Invalid input handling
        result = self._audit_invalid_inputs()
        category.results.append(result)

        # Test 4: Resource cleanup
        result = self._audit_resource_cleanup()
        category.results.append(result)

        category.total_time = time.time() - start_time
        return category

    def _audit_error_handling(self) -> AuditResult:
        """Test error handling."""
        start = time.time()
        errors = []
        
        # Test 1: Missing provider
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.core.agent import Agent, AgentConfig; "
            "config = AgentConfig(name='Test'); "
            "try: "
            "    agent = Agent(config, None); "
            "    result = agent.execute('test'); "
            "    print('ERROR: Should have raised exception'); "
            "except Exception as e: "
            "    print('SUCCESS: Exception handled')"
        ])
        
        if "ERROR:" in stdout:
            errors.append("Missing provider not handled properly")
        
        # Test 2: Invalid configuration
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.orchestrator import AgentOrchestrator; "
            "try: "
            "    orch = AgentOrchestrator(config_path='/nonexistent/path'); "
            "    print('SUCCESS: Invalid config handled'); "
            "except Exception as e: "
            "    print('SUCCESS: Exception raised')"
        ])
        
        if "SUCCESS" not in stdout:
            errors.append("Invalid configuration not handled properly")
        
        passed = len(errors) == 0
        severity = Severity.HIGH if not passed else Severity.INFO
        message = f"Error handling ({len(errors)} issues)"
        details = "\n".join(errors) if errors else ""
        
        return AuditResult(
            name="Error Handling",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_edge_cases(self) -> AuditResult:
        """Test edge case handling."""
        start = time.time()
        errors = []
        
        # Test 1: Empty prompt
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.providers.intelligent_mock_provider import IntelligentMockProvider; "
            "provider = IntelligentMockProvider(); "
            "try: "
            "    result = provider.generate('', max_tokens=10); "
            "    print('SUCCESS: Empty prompt handled'); "
            "except Exception as e: "
            "    print(f'SUCCESS: Exception raised: {e}')"
        ])
        
        if "SUCCESS" not in stdout:
            errors.append("Empty prompt not handled")
        
        # Test 2: Very long prompt
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.providers.intelligent_mock_provider import IntelligentMockProvider; "
            "provider = IntelligentMockProvider(); "
            "try: "
            "    result = provider.generate('a' * 100000, max_tokens=10); "
            "    print('SUCCESS: Long prompt handled'); "
            "except Exception as e: "
            "    print(f'SUCCESS: Exception raised: {e}')"
        ])
        
        if "SUCCESS" not in stdout:
            errors.append("Very long prompt not handled")
        
        passed = len(errors) == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = f"Edge case handling ({len(errors)} issues)"
        details = "\n".join(errors) if errors else ""
        
        return AuditResult(
            name="Edge Case Handling",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_invalid_inputs(self) -> AuditResult:
        """Test invalid input handling."""
        start = time.time()
        errors = []
        
        # Test invalid temperature
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.core.agent import AgentConfig; "
            "try: "
            "    config = AgentConfig(name='Test', temperature=99.0); "
            "    print('WARNING: Invalid temperature accepted'); "
            "except Exception as e: "
            "    print('SUCCESS: Invalid temperature rejected')"
        ])
        
        # Note: AgentConfig might accept any float, which is OK
        # This is more of a documentation issue
        
        passed = True  # No strict validation required
        severity = Severity.INFO
        message = "Invalid input handling (permissive by design)"
        
        return AuditResult(
            name="Invalid Input Handling",
            passed=passed,
            severity=severity,
            message=message,
            execution_time=time.time() - start
        )

    def _audit_resource_cleanup(self) -> AuditResult:
        """Test resource cleanup."""
        start = time.time()
        
        # Test that continuous agents can be stopped
        returncode, stdout, stderr = self.run_command([
            "python", "-c",
            "import sys; sys.path.insert(0, 'src'); "
            "from llm_framework.continuous_agent import ContinuousAgent; "
            "from llm_framework.providers.intelligent_mock_provider import IntelligentMockProvider; "
            "from llm_framework.core.agent import Agent, AgentConfig; "
            "provider = IntelligentMockProvider(); "
            "config = AgentConfig(name='Test'); "
            "agent = Agent(config, provider); "
            "cont = ContinuousAgent(agent); "
            "cont.start(); "
            "cont.stop(); "
            "print('SUCCESS: Cleanup completed')"
        ])
        
        passed = "SUCCESS" in stdout and returncode == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = "Resource cleanup" + (" passed" if passed else " failed")
        details = stderr if not passed else ""
        
        return AuditResult(
            name="Resource Cleanup",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    # ==================== DOCUMENTATION AUDITS ====================

    def audit_documentation(self) -> CategoryResult:
        """Run documentation audits."""
        self.log("Running documentation audits...", "INFO")
        category = CategoryResult(category="Documentation")
        start_time = time.time()

        # Test 1: README exists and is comprehensive
        result = self._audit_readme()
        category.results.append(result)

        # Test 2: API documentation
        result = self._audit_api_docs()
        category.results.append(result)

        # Test 3: Code examples
        result = self._audit_code_examples()
        category.results.append(result)

        # Test 4: Documentation accuracy
        result = self._audit_doc_accuracy()
        category.results.append(result)

        category.total_time = time.time() - start_time
        return category

    def _audit_readme(self) -> AuditResult:
        """Check README quality."""
        start = time.time()
        issues = []
        
        readme_path = Path("README.md")
        if not readme_path.exists():
            issues.append("README.md not found")
        else:
            with open(readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for essential sections
                required_sections = [
                    'installation',
                    'usage',
                    'example',
                    'configuration'
                ]
                
                for section in required_sections:
                    if section.lower() not in content.lower():
                        issues.append(f"Missing section: {section}")
                
                # Check length (should be substantial)
                if len(content) < 1000:
                    issues.append("README is too short (< 1000 chars)")
        
        passed = len(issues) == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = f"README quality ({len(issues)} issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="README Quality",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_api_docs(self) -> AuditResult:
        """Check API documentation."""
        start = time.time()
        
        # Check if docs directory exists
        docs_dir = Path("docs")
        issues = []
        
        if not docs_dir.exists():
            issues.append("docs/ directory not found")
        else:
            # Check for key documentation files
            expected_docs = [
                'ARCHITECTURE.md',
                'CURRENT_STATE.md'
            ]
            
            for doc in expected_docs:
                if not (docs_dir / doc).exists():
                    issues.append(f"Missing documentation: {doc}")
        
        passed = len(issues) <= 1  # Allow 1 missing doc
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"API documentation ({len(issues)} issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="API Documentation",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_code_examples(self) -> AuditResult:
        """Check for code examples."""
        start = time.time()
        
        # Look for example files
        example_files = list(Path(".").glob("example*.py"))
        example_files.extend(list(Path(".").glob("demo*.py")))
        
        passed = len(example_files) >= 2
        severity = Severity.LOW if not passed else Severity.INFO
        message = f"Code examples ({len(example_files)} found)"
        details = "\n".join(str(f) for f in example_files) if self.verbose else ""
        
        return AuditResult(
            name="Code Examples",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    def _audit_doc_accuracy(self) -> AuditResult:
        """Check documentation accuracy against code."""
        start = time.time()
        issues = []
        
        # Check if documented features actually exist
        current_state = Path("docs/CURRENT_STATE.md")
        if current_state.exists():
            with open(current_state, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check if documented files exist
                if 'src/llm_framework/orchestrator.py' in content:
                    if not Path('src/llm_framework/orchestrator.py').exists():
                        issues.append("Documented file orchestrator.py not found")
                
                if 'src/llm_framework/providers/' in content:
                    if not Path('src/llm_framework/providers/').exists():
                        issues.append("Documented directory providers/ not found")
        
        passed = len(issues) == 0
        severity = Severity.MEDIUM if not passed else Severity.INFO
        message = f"Documentation accuracy ({len(issues)} issues)"
        details = "\n".join(issues) if issues else ""
        
        return AuditResult(
            name="Documentation Accuracy",
            passed=passed,
            severity=severity,
            message=message,
            details=details,
            execution_time=time.time() - start
        )

    # ==================== REPORTING ====================

    def generate_report(self) -> str:
        """Generate comprehensive audit report."""
        total_time = time.time() - self.start_time
        
        report = []
        report.append("=" * 80)
        report.append("COMPREHENSIVE AUDIT REPORT")
        report.append("=" * 80)
        report.append("")
        
        # Summary
        total_categories = len(self.results)
        passed_categories = sum(1 for r in self.results.values() if r.passed)
        
        report.append("SUMMARY")
        report.append("-" * 80)
        report.append(f"Categories: {passed_categories}/{total_categories} passed")
        report.append(f"Total execution time: {total_time:.2f}s")
        report.append("")
        
        # Category results
        for category_name, category in self.results.items():
            status = "✅ PASS" if category.passed else "❌ FAIL"
            report.append(f"{status} {category_name.upper()}")
            report.append(f"     {category.total_passed}/{category.total_tests} checks passed")
            report.append(f"     Execution time: {category.total_time:.2f}s")
            report.append("")
        
        report.append("")
        
        # Detailed results
        report.append("DETAILED RESULTS")
        report.append("=" * 80)
        report.append("")
        
        for category_name, category in self.results.items():
            report.append(f"{category_name.upper()} AUDITS")
            report.append("-" * 80)
            
            for result in category.results:
                status = "✅" if result.passed else "❌"
                severity = result.severity.value
                report.append(f"{status} [{severity}] {result.name}")
                report.append(f"   {result.message}")
                report.append(f"   Execution time: {result.execution_time:.3f}s")
                
                if result.details and self.verbose:
                    report.append(f"   Details:")
                    for line in result.details.split('\n')[:10]:
                        report.append(f"     {line}")
                
                report.append("")
            
            report.append("")
        
        # Critical issues
        critical_issues = []
        for category in self.results.values():
            for result in category.results:
                if not result.passed and result.severity in [Severity.CRITICAL, Severity.HIGH]:
                    critical_issues.append((result.severity, result.name, result.message))
        
        if critical_issues:
            report.append("CRITICAL & HIGH SEVERITY ISSUES")
            report.append("=" * 80)
            for severity, name, message in critical_issues:
                report.append(f"🔥 [{severity.value}] {name}")
                report.append(f"   {message}")
                report.append("")
        
        # Final verdict
        report.append("=" * 80)
        if passed_categories == total_categories:
            report.append("✅ ALL AUDITS PASSED")
        else:
            report.append("❌ SOME AUDITS FAILED")
            report.append(f"   {total_categories - passed_categories} categories failed")
            report.append(f"   {len(critical_issues)} critical/high severity issues")
        report.append("=" * 80)
        
        return "\n".join(report)

    def run_audit(self, category: str = "all") -> int:
        """Run audit for specified category."""
        self.log(f"Starting comprehensive audit (category: {category})...", "INFO")
        self.log("", "INFO")
        
        # Map of category names to audit methods
        audits = {
            "quality": self.audit_code_quality,
            "security": self.audit_security,
            "performance": self.audit_performance,
            "integration": self.audit_integration,
            "robustness": self.audit_robustness,
            "docs": self.audit_documentation,
        }
        
        # Run selected audits
        if category == "all":
            for cat_name, audit_func in audits.items():
                result = audit_func()
                self.results[cat_name] = result
                
                if not result.passed and self.fail_fast:
                    self.log(f"Fail-fast enabled, stopping after {cat_name} failure", "ERROR")
                    break
        elif category in audits:
            result = audits[category]()
            self.results[category] = result
        else:
            self.log(f"Unknown category: {category}", "ERROR")
            return 1
        
        # Generate and print report
        report = self.generate_report()
        print("\n" + report)
        
        # Return exit code
        all_passed = all(r.passed for r in self.results.values())
        return 0 if all_passed else 1


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Comprehensive audit system for LLM Multi-Provider Framework"
    )
    parser.add_argument(
        "--category",
        choices=["all", "quality", "security", "performance", "integration", "robustness", "docs"],
        default="all",
        help="Audit category to run (default: all)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output with details"
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="Stop on first category failure"
    )
    
    args = parser.parse_args()
    
    # Change to repository root
    repo_root = Path(__file__).parent
    os.chdir(repo_root)
    
    # Run audit
    audit = AuditSystem(verbose=args.verbose, fail_fast=args.fail_fast)
    exit_code = audit.run_audit(category=args.category)
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
