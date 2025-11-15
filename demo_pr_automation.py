#!/usr/bin/env python3
"""
Demo script showing PR automation capabilities.

This demonstrates the complete workflow:
1. Create a pull request
2. Review it automatically
3. Validate its status
4. Auto-merge if ready
"""

import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from llm_framework.orchestrator import AgentOrchestrator
from llm_framework.github_integration import GitHubIntegration
from llm_framework.agents.code_review_agent import create_code_review_agent, PRReviewer


def demo_pr_automation():
    """Demonstrate PR automation workflow."""
    
    print("=" * 60)
    print("GitHub PR Automation Demo")
    print("=" * 60)
    print()
    
    # Check environment
    print("📋 Checking environment...")
    
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        print("❌ GITHUB_TOKEN not set")
        print("   Set it with: export GITHUB_TOKEN=your_token")
        return False
    
    repo_owner = os.getenv("GITHUB_REPO_OWNER", "Scarmonit")
    repo_name = os.getenv("GITHUB_REPO_NAME", "LLM")
    
    print(f"✅ GitHub token configured")
    print(f"✅ Repository: {repo_owner}/{repo_name}")
    print()
    
    # Setup orchestrator
    print("🔧 Setting up LLM provider...")
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()
    
    providers = orchestrator.list_providers()
    if not providers:
        print("❌ No LLM provider available")
        print("   Install Ollama or set ANTHROPIC_API_KEY")
        return False
    
    provider_name = providers[0]
    print(f"✅ Using provider: {provider_name}")
    print()
    
    # Create agents
    print("🤖 Creating code review agent...")
    provider = orchestrator.providers[provider_name]
    agent = create_code_review_agent(provider)
    print(f"✅ Code review agent ready")
    print()
    
    # Setup GitHub integration
    print("🔗 Connecting to GitHub...")
    github = GitHubIntegration(repo_owner, repo_name)
    reviewer = PRReviewer(agent, github)
    print(f"✅ GitHub integration ready")
    print()
    
    # Demo features
    print("=" * 60)
    print("Available PR Automation Features")
    print("=" * 60)
    print()
    
    print("1. 📝 Create Pull Request")
    print("   - Programmatically create PRs")
    print("   - Support for draft PRs")
    print("   - CLI: python -m llm_framework.scripts.create_pr")
    print()
    
    print("2. 🔍 Auto-Review Pull Request")
    print("   - AI-powered code analysis")
    print("   - Focus on quality, security, performance")
    print("   - CLI: python -m llm_framework.scripts.auto_review_pr")
    print()
    
    print("3. ✅ Validate PR Status")
    print("   - Check CI/CD status")
    print("   - Verify mergeable state")
    print("   - CLI: python -m llm_framework.scripts.check_pr_status")
    print()
    
    print("4. 🔀 Auto-Merge PR")
    print("   - Merge when all checks pass")
    print("   - Configurable merge method (merge/squash/rebase)")
    print("   - CLI: python -m llm_framework.scripts.auto_merge_pr")
    print()
    
    print("=" * 60)
    print("GitHub Actions Workflows")
    print("=" * 60)
    print()
    
    print("🤖 Auto-Review Workflow (.github/workflows/auto-review.yml)")
    print("   - Triggers: PR opened, synchronized, reopened")
    print("   - Automatically reviews code changes")
    print("   - Posts review comments")
    print()
    
    print("🔀 Auto-Merge Workflow (.github/workflows/auto-merge.yml)")
    print("   - Triggers: PR review, check completion, label added")
    print("   - Merges PRs with 'auto-merge' label")
    print("   - Validates all checks pass")
    print()
    
    # Example usage
    print("=" * 60)
    print("Example Usage")
    print("=" * 60)
    print()
    
    print("To review PR #123:")
    print("  python demo_pr_automation.py review 123")
    print()
    
    print("To validate PR #123:")
    print("  python demo_pr_automation.py validate 123")
    print()
    
    print("To create a PR:")
    print("  python -m llm_framework.scripts.create_pr \\")
    print("    --title 'Add feature' \\")
    print("    --head feature-branch \\")
    print("    --base main")
    print()
    
    print("=" * 60)
    print("Documentation")
    print("=" * 60)
    print()
    print("📚 See docs/PR_AUTOMATION.md for complete guide")
    print()
    
    return True


def review_pr(pr_number: int):
    """Review a specific PR."""
    print(f"\n🔍 Reviewing PR #{pr_number}...\n")
    
    # Setup
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()
    provider = orchestrator.providers[orchestrator.list_providers()[0]]
    
    agent = create_code_review_agent(provider)
    repo_owner = os.getenv("GITHUB_REPO_OWNER", "Scarmonit")
    repo_name = os.getenv("GITHUB_REPO_NAME", "LLM")
    github = GitHubIntegration(repo_owner, repo_name)
    reviewer = PRReviewer(agent, github)
    
    # Review
    print("Analyzing code changes...")
    review = reviewer.review_pr(pr_number)
    
    if review:
        print(f"\n✅ Review posted successfully!")
        print(f"   URL: {review.get('html_url', 'N/A')}")
    else:
        print(f"\n❌ Failed to review PR")


def validate_pr(pr_number: int):
    """Validate a specific PR."""
    print(f"\n✅ Validating PR #{pr_number}...\n")
    
    # Setup
    orchestrator = AgentOrchestrator()
    orchestrator.setup_default_providers()
    provider = orchestrator.providers[orchestrator.list_providers()[0]]
    
    agent = create_code_review_agent(provider)
    repo_owner = os.getenv("GITHUB_REPO_OWNER", "Scarmonit")
    repo_name = os.getenv("GITHUB_REPO_NAME", "LLM")
    github = GitHubIntegration(repo_owner, repo_name)
    reviewer = PRReviewer(agent, github)
    
    # Validate
    validation = reviewer.validate_pr(pr_number)
    
    print("Validation Results:")
    print(f"  Valid: {validation['valid']}")
    print(f"  Mergeable: {validation['mergeable']}")
    print(f"  Checks passed: {validation['checks_passed']}")
    print(f"  State: {validation['mergeable_state']}")
    
    if validation.get('check_details'):
        print("\n  Check Details:")
        for check in validation['check_details']:
            status_icon = "✅" if check['conclusion'] == 'success' else "❌"
            print(f"    {status_icon} {check['name']}: {check['conclusion']}")


def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "review" and len(sys.argv) > 2:
            pr_number = int(sys.argv[2])
            review_pr(pr_number)
            return
        
        if command == "validate" and len(sys.argv) > 2:
            pr_number = int(sys.argv[2])
            validate_pr(pr_number)
            return
    
    # Default: show demo
    success = demo_pr_automation()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
