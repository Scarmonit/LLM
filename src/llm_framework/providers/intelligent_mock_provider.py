"""
Intelligent mock provider that generates contextual responses.
Used ONLY when no real LLM is available (testing/demo).
"""

from llm_framework.core.base_provider import BaseProvider


class IntelligentMockProvider(BaseProvider):
    """
    Mock provider that generates intelligent, contextual responses.
    This is NOT random - it analyzes the prompt and generates appropriate responses.
    """

    def __init__(self):
        super().__init__(api_key=None)

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate a contextual response based on prompt analysis.
        """
        prompt_lower = prompt.lower()

        # Code analysis responses
        if "analyze" in prompt_lower and (
            "code" in prompt_lower or "function" in prompt_lower or "def " in prompt
        ):
            return self._analyze_code(prompt)

        # Documentation responses
        if "document" in prompt_lower or "docstring" in prompt_lower:
            return self._suggest_documentation(prompt)

        # Test-related responses
        if "test" in prompt_lower and ("coverage" in prompt_lower or "suggest" in prompt_lower):
            return self._suggest_tests(prompt)

        # README/documentation improvement
        if "readme" in prompt_lower or (
            "improve" in prompt_lower and "documentation" in prompt_lower
        ):
            return self._improve_readme(prompt)

        # Default: explain what was asked
        return f"Analysis of request: {prompt[:100]}...\n\nBased on the content provided, here are key observations and recommendations for improvement."

    def _analyze_code(self, prompt: str) -> str:
        """Analyze code and suggest improvements."""
        issues = []

        if "eval(" in prompt:
            issues.append(
                "Security Risk: Using eval() is dangerous - it executes arbitrary code. Use ast.literal_eval() or json.loads() instead."
            )

        if "except:" in prompt or "except Exception:" in prompt:
            issues.append(
                "Error Handling: Bare except clauses catch all exceptions. Be more specific about which exceptions to catch."
            )

        if "//" in prompt and "SELECT" in prompt.upper():
            issues.append(
                "SQL Injection Risk: String formatting in SQL queries is vulnerable. Use parameterized queries instead."
            )

        if "def " in prompt and '"""' not in prompt:
            issues.append(
                "Missing Documentation: Functions should have docstrings explaining parameters, return values, and purpose."
            )

        if "/ b" in prompt or "/ 0" in prompt:
            issues.append(
                "Division Error Risk: No error handling for division by zero. Add validation or try/except."
            )

        if not issues:
            issues.append(
                "Code Quality: Consider adding type hints, error handling, and comprehensive documentation."
            )
            issues.append("Testing: Ensure this code has unit tests covering edge cases.")

        response = "Code Analysis Results:\n\n"
        for i, issue in enumerate(issues, 1):
            response += f"{i}. {issue}\n\n"

        response += "Recommendations:\n- Add input validation\n- Implement proper error handling\n- Write comprehensive tests\n- Add detailed docstrings"

        return response

    def _suggest_documentation(self, _prompt: str) -> str:
        """Suggest documentation improvements."""
        return """Documentation Suggestions:

1. Add Module Docstring:
   - Explain the module's purpose
   - List main classes/functions
   - Provide usage examples

2. Function Docstrings:
   - Use Google or NumPy style docstrings
   - Document parameters with types
   - Document return values
   - Include usage examples for complex functions

3. Class Docstrings:
   - Explain the class purpose
   - Document attributes
   - Provide initialization examples

4. Inline Comments:
   - Explain complex logic
   - Document "why" not "what"
   - Keep comments up-to-date with code changes

Example:
```python
def process_data(items: list) -> dict:
    \"\"\"
    Process a list of items and return summary statistics.
    
    Args:
        items: List of numeric values to process
        
    Returns:
        Dictionary with 'total', 'average', and 'count' keys
        
    Example:
        >>> process_data([1, 2, 3])
        {'total': 6, 'average': 2.0, 'count': 3}
    \"\"\"
```"""

    def _suggest_tests(self, _prompt: str) -> str:
        """Suggest test improvements."""
        return """Test Suite Recommendations:

1. Unit Test Coverage:
   - Test each function/method independently
   - Cover normal cases, edge cases, and error conditions
   - Aim for 80%+ code coverage

2. Integration Tests:
   - Test component interactions
   - Verify data flow between modules
   - Test with realistic data

3. Test Organization:
   - Mirror source code structure in tests/
   - Use descriptive test names (test_function_name_scenario)
   - Group related tests in classes

4. Additional Test Types to Consider:
   - Performance tests for critical paths
   - Security tests for input validation
   - Regression tests for bug fixes
   - Property-based tests with hypothesis

5. Test Data:
   - Use fixtures for common test data
   - Test with boundary values (0, negative, very large)
   - Include invalid inputs to test error handling

Example test structure:
```python
def test_divide_numbers_normal_case():
    assert divide_numbers(10, 2) == 5

def test_divide_numbers_zero_division():
    with pytest.raises(ZeroDivisionError):
        divide_numbers(10, 0)
```"""

    def _improve_readme(self, _prompt: str) -> str:
        """Suggest README improvements."""
        return """README Improvement Suggestions:

1. Add Clear Sections:
   - Installation instructions
   - Quick start guide
   - Usage examples with code
   - API documentation
   - Contributing guidelines
   - License information

2. Include Badges:
   - Build status
   - Code coverage
   - Version information
   - License badge

3. Better Examples:
   - Show real-world use cases
   - Include code snippets
   - Demonstrate key features
   - Provide sample output

4. Prerequisites:
   - List required dependencies
   - Specify version requirements
   - Explain system requirements

5. Troubleshooting Section:
   - Common errors and solutions
   - FAQ
   - Link to issues page

6. Visual Elements:
   - Screenshots of UI features
   - Architecture diagrams
   - Flowcharts for complex processes

A good README answers: What, Why, How, and Who."""

    def is_available(self) -> bool:
        """Always available as fallback."""
        return True

    def get_provider_name(self) -> str:
        """Return provider name."""
        return "Intelligent Mock (contextual responses)"
