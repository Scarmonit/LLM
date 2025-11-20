# Documentation Index

Welcome to the LLM Multi-Provider Framework documentation. This directory contains comprehensive guides and references for understanding and working with the framework.

## Table of Contents

### Core Documentation

- **[Architecture](ARCHITECTURE.md)** - System design, components, and architectural patterns
- **[Current State](CURRENT_STATE.md)** - Latest status, verified working configuration, and recent updates
- **[Lessons Learned](LESSONS_LEARNED.md)** - Past mistakes, solutions, and best practices to avoid pitfalls

### Development Guides

- **[Copilot Guide](COPILOT_GUIDE.md)** - Working with GitHub Copilot on this repository
- **[PR Automation](PR_AUTOMATION.md)** - Automated pull request workflows and code review

### Environment & Security Documentation

- **[Claude Code Environment](CLAUDE_CODE_ENVIRONMENT.md)** - Complete technical specifications for Claude Code environment
  - Architecture and deployment options (CLI, Web, Desktop, VS Code)
  - Available models (Sonnet 4.5, Haiku 4.5, Opus 4) with pricing
  - Complete tool inventory (15+ tools with detailed descriptions)
  - Sandboxing and security features (bubblewrap/seatbelt)
  - Context and token management (200K standard, 1M beta)
  - Agent and subagent system with parallel execution
  - MCP integration capabilities
  - Configuration, customization, and best practices
  - **1,068 lines** | Research date: 2025-11-15

- **[Environment Restrictions](ENVIRONMENT_RESTRICTIONS.md)** - Official documentation on environment restrictions and security isolation
  - Linux kernel security (namespaces, cgroups, seccomp, capabilities, LSMs)
  - Container technologies (Docker, Kubernetes, OCI, Kata Containers)
  - Virtualization (QEMU/KVM, Firecracker, gVisor)
  - OS-level isolation (chroot, pivot_root, ACLs, resource limits)
  - Application sandboxing (Windows, Android, Flatpak, Snap)
  - Browser security (Chromium, V8)
  - Runtime environments (WebAssembly, Java, Python, Node.js)
  - Security standards (NIST SP 800-190, CIS Benchmarks, OWASP)
  - **603 lines** | Research date: 2025-11-15

## Research Methodology

The environment and security documentation was compiled through:
- 25+ targeted web searches from official sources
- Documentation from kernel.org, NIST, CIS, OWASP, OCI
- Vendor docs from Red Hat, Microsoft, Google, Oracle, Docker
- Official project documentation verified and catalogued
- All sources current as of Q4 2025

## Quick Navigation

### For New Contributors
Start with:
1. [Architecture](ARCHITECTURE.md) - Understand the system
2. [Current State](CURRENT_STATE.md) - Know what's working
3. [Lessons Learned](LESSONS_LEARNED.md) - Avoid past mistakes

### For GitHub Copilot Users
Read:
1. [Copilot Guide](COPILOT_GUIDE.md) - Best practices for AI-assisted development
2. [PR Automation](PR_AUTOMATION.md) - Automated workflows

### For Security & Environment Research
Reference:
1. [Environment Restrictions](ENVIRONMENT_RESTRICTIONS.md) - Official security documentation
2. [Claude Code Environment](CLAUDE_CODE_ENVIRONMENT.md) - Claude Code technical specs

## Contributing to Documentation

When updating documentation:
- Keep files focused on a single topic
- Update this index when adding new documentation
- Include dates for time-sensitive information
- Provide sources for external references
- Follow existing formatting conventions

## Documentation Standards

All documentation should:
- Use clear, concise language
- Include practical examples where applicable
- Provide links to relevant files or sections
- Be kept up-to-date with code changes
- Follow markdown best practices

---

**Last Updated**: 2025-11-16  
**Total Documentation**: 7 files (2 new comprehensive guides added)
