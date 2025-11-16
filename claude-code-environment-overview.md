# Claude Code Environment - Comprehensive Technical Overview

**Last Updated:** 2025-11-15
**Environment:** Claude Code CLI via Claude Agent SDK
**Platform:** Linux 4.4.0
**Working Directory:** /home/user/LLM
**Repository:** Git-enabled

---

## Table of Contents
1. [What is Claude Code](#what-is-claude-code)
2. [Current Environment Specifications](#current-environment-specifications)
3. [Architecture and Components](#architecture-and-components)
4. [Available Models](#available-models)
5. [Tools and Capabilities](#tools-and-capabilities)
6. [Sandboxing and Security](#sandboxing-and-security)
7. [Context and Token Management](#context-and-token-management)
8. [Agent and Subagent System](#agent-and-subagent-system)
9. [MCP Integration](#mcp-integration)
10. [Configuration and Customization](#configuration-and-customization)
11. [Pricing and Cost Management](#pricing-and-cost-management)
12. [Installation and Platform Support](#installation-and-platform-support)
13. [Best Practices and Optimization](#best-practices-and-optimization)

---

## What is Claude Code

Claude Code is an agentic coding tool that lives in your terminal, built on the Claude Agent SDK. It provides:

- **Agentic Capabilities**: Autonomous execution of routine tasks through natural language
- **Codebase Understanding**: Deep comprehension of repository structure and relationships
- **Direct System Integration**: Direct file manipulation, git workflows, and terminal command execution
- **Low-Level Access**: Intentionally unopinionated, providing close to raw model access
- **Flexible Workflow**: Customizable, scriptable, and safe power tool for developers

### Official Resources
- **Official Documentation**: https://docs.claude.com/en/docs/claude-code/
- **CLI Reference**: https://code.claude.com/docs/en/cli-reference
- **GitHub Repository**: https://github.com/anthropics/claude-code
- **Engineering Blog**: https://www.anthropic.com/engineering/claude-code-best-practices

---

## Current Environment Specifications

### System Information
```
Platform: Linux
OS Version: Linux 4.4.0
Architecture: Likely 64-bit (required for sandbox)
Current Date: 2025-11-15
Working Directory: /home/user/LLM
Git Repository: Yes
Branch: claude/research-env-restrictions-014GsbT6R8Rm5D33Fv7GUzen
```

### Runtime Environment
- **SDK**: Claude Agent SDK (Python/TypeScript available)
- **Shell**: Bash (persistent session)
- **Environment Inheritance**: Full bash environment access
- **Tools Available**: All standard Unix utilities (grep, find, cat, etc.)

### Current Session Model
- **Model**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Knowledge Cutoff**: January 2025
- **Context Window**: 200,000 tokens (standard), 1M tokens available in beta
- **Token Budget**: 200,000 tokens allocated for this session

---

## Architecture and Components

### Core Architecture

Claude Code operates through the **Claude Agent SDK**, which provides:

1. **Context Management**: Automatic compaction and context management
2. **Rich Tool Ecosystem**: File operations, code execution, web search, MCP extensibility
3. **Advanced Permissions**: Fine-grained control over agent capabilities
4. **Production Essentials**: Built-in error handling, session management, monitoring
5. **Optimized Integration**: Automatic prompt caching and performance optimizations

### Environment Types

**1. CLI (Command Line Interface)**
- Runs in terminal with direct system access
- Full bash environment integration
- Local file system access
- Requires API authentication

**2. Web Version**
- Browser-based interface
- Containerized environment with `--dangerously-skip-permissions`
- Parallel execution of multiple tasks
- "Teleport" feature to sync with local CLI
- Limited to repository scope

**3. Desktop Application**
- Native app with MCP client capabilities
- Chat-based interface
- Separate context per chat
- Projects for shared instructions

---

## Available Models

### Claude 4.5 Family (Current Generation)

**Claude Sonnet 4.5** (Released: September 29, 2025)
- **Model ID**: `claude-sonnet-4-5-20250929`
- **Status**: Current default model, "best coding model in the world"
- **Context Window**: 200,000 tokens (1M tokens in beta)
- **Max Output**: 64,000 tokens (standard conditions)
- **Strengths**: Exceptional coding, agentic tasks, computer use
- **Use Case**: Recommended starting point for balanced intelligence, speed, and cost

**Claude Haiku 4.5** (Released: October 15, 2025)
- **Model ID**: `claude-haiku-4-5`
- **Pricing**: $1/1M input tokens, $5/1M output tokens
- **Performance**: 90% of Sonnet 4.5's performance in agentic coding
- **Speed**: 2x faster than Sonnet 4
- **Cost**: 1/3 the cost of Sonnet 4
- **Use Case**: Low latency, cost-optimized tasks

### Claude 4.1 Family

**Claude Opus 4.1** (Released: August 5, 2025)
- **Model ID**: `claude-opus-4-1`
- **Status**: Most powerful Claude model
- **Pricing**: $15/1M input tokens
- **Strengths**: Improved code generation, search reasoning, instruction adherence
- **Access**: Pro, Max, Team, and Enterprise users

### Claude 4 Family

**Claude Sonnet 4 & Opus 4** (Released: May 22-23, 2025)
- Hybrid reasoning capabilities
- Extended thinking support
- Frontier coding capabilities

### Model Naming Convention
- **Haiku**: Smallest, fastest model
- **Sonnet**: Mid-sized, balanced model
- **Opus**: Largest, most capable model

---

## Tools and Capabilities

### File Operations

**Read**
- Read any file type: text, images, PDFs, Jupyter notebooks
- Supports line offset and limit for large files
- Max 2000 lines per read by default
- Line numbers in cat -n format
- Multimodal support (images rendered visually)

**Write**
- Create new files
- Overwrites existing files
- Requires prior Read for existing files
- Absolute paths required

**Edit**
- Exact string replacement
- Must preserve indentation exactly
- old_string must be unique or use replace_all
- Requires prior Read of file

**MultiEdit**
- Multiple edits to single file in one operation
- More efficient than sequential Edit calls

**NotebookEdit**
- Edit Jupyter notebook cells (.ipynb files)
- Modes: replace, insert, delete
- Cell type support: code, markdown

### Search and Navigation

**Glob**
- Fast file pattern matching
- Supports glob patterns: `**/*.js`, `src/**/*.ts`
- Returns files sorted by modification time
- Works with any codebase size

**Grep**
- Built on ripgrep (not grep)
- Full regex support
- File filtering via glob or type parameters
- Output modes: content, files_with_matches, count
- Context lines: -A, -B, -C flags
- Multiline matching support
- head_limit and offset parameters

### Command Execution

**Bash**
- Persistent shell session with state
- Timeout: default 120s, max 600s (10 minutes)
- Background execution support
- Command chaining with && and ;
- Inherits full user bash environment
- Quote file paths with spaces

**BashOutput**
- Retrieve output from background shells
- Optional regex filtering
- Shows only new output since last check

**KillShell**
- Terminate background bash shells
- By shell_id

### Web Operations

**WebFetch**
- Fetch and process URL content
- HTML to markdown conversion
- AI-powered content extraction
- 15-minute self-cleaning cache
- Handles redirects

**WebSearch**
- Search the web for current information
- Domain filtering (allow/block)
- Available in US only
- Returns formatted search result blocks

### Task Management and Agents

**Task**
- Launch specialized subagents
- Types: general-purpose, statusline-setup, Explore, Plan
- Parallel execution support
- Each subagent has own context window
- Cannot spawn nested subagents
- Stateless (one final report)

**TodoWrite**
- Track task progress
- States: pending, in_progress, completed
- Requires content and activeForm
- Real-time status updates
- Only ONE task in_progress at a time

### Special Tools

**ExitPlanMode**
- Exit planning mode to start coding
- Only for implementation tasks, not research

**Skill**
- Execute custom skills
- User-defined specialized capabilities

**SlashCommand**
- Execute custom commands from .claude/commands/
- Markdown files become slash commands

---

## Sandboxing and Security

### Native Sandboxing Features

Claude Code implements **OS-level sandboxing** using:
- **Linux**: bubblewrap
- **macOS**: seatbelt

### Filesystem Restrictions

**Default Behavior:**
- **Write Access**: Current working directory and subdirectories only
- **Read Access**: Entire computer (except denied directories)
- **Blocked Access**: Cannot modify files outside working directory without permission

**Error Handling:**
- Operations outside working directory fail with "Read-only file system"
- Applies to: `echo >`, `touch`, `mkdir`, `cp`, and all write operations

**Permission Configuration:**
```json
{
  "permissions": {
    "filesystem": {
      "edit": {
        "allow": ["src/", "tests/"],
        "deny": [".env", "credentials.json"]
      }
    }
  }
}
```

**Deny Patterns:**
- Files matching deny patterns are completely invisible to Claude Code
- Configured via `.claude/settings.json`

### Network Sandboxing

**Domain Filtering:**
- Restricts domains that processes can connect to
- Does not inspect traffic content
- Operates through network proxy

**Security Considerations:**
- Broad domains (e.g., github.com) may allow data exfiltration
- Domain fronting may bypass filters in some cases
- `allowUnixSockets` can grant access to powerful system services

**Impact:**
- Reduces permission prompts by 84% in internal usage
- Provides defined boundaries for safer autonomous operation

### Permission System

**Granular Controls:**
- Read/Edit permissions per directory
- Tool-specific permissions
- Command pattern matching (e.g., `Bash(git *)` vs `Bash(rm *)`)

**Configuration Locations:**
- Project: `.claude/settings.json`
- Project local: `.claude/settings.local.json`
- User local: `~/.claude/settings.local.json`

---

## Context and Token Management

### Context Window

**Standard:**
- **Sonnet 4/4.5**: 200,000 tokens
- **Output**: Up to 64,000 tokens

**Beta (Tier 4+ organizations):**
- **Extended**: 1,000,000 tokens
- **Models**: Sonnet 4 and Sonnet 4.5 only

**Enterprise:**
- **Extended**: 500,000 tokens per conversation

### Token Enforcement

**Strict Limits (Claude 3.7+, 4+):**
- `max_tokens` enforced as strict limit
- Validation error if `prompt_tokens + max_tokens > context_window`

### Extended Thinking

**Budget Tokens:**
- Subset of `max_tokens` parameter
- Billed as output tokens
- Count towards rate limits
- Previous thinking blocks auto-stripped from context
- Not part of conversation history for subsequent turns

**Optimization:**
- Larger budgets improve complex problem responses
- Claude may not use entire budget
- Diminishing returns above 32K

### Prompt Caching

**Automatic Optimization:**
- Claude Code enables prompt caching automatically
- **Cost Reduction**: Up to 90% on input tokens
- **Speed Improvement**: Up to 85% faster for long prompts
- **Cache TTL**: 5 minutes, resets on each hit

**Best Practices:**
- Place static content at prompt beginning
- Set cache breakpoints strategically
- Separate different cacheable prefix sections
- Monitor with `/cost` command

**Cache Order:**
1. Tools
2. System prompts
3. Messages

**Optimal Structure:**
- Static content first (tool definitions, system instructions)
- Cacheable context (codebase snippets, examples)
- Dynamic content last (user queries, editable content)

### Token Monitoring

**Commands:**
- `/cost`: View current session costs and token usage
- Context automatically compacted when approaching limits
- `PreCompact` hook available for notification

---

## Agent and Subagent System

### Subagent Architecture

**What Are Subagents:**
- Lightweight instances of Claude Code
- Spawned via Task tool
- Execute in parallel
- Each has own context window
- Cannot spawn nested subagents

**When Spawned:**
- Automatic: When using Task tool
- Explicit: User says "use subagent" or "multiple subagents"

### Parallel Execution

**Capabilities:**
- Multiple subagents run simultaneously
- Batch execution with parallelism level
- Wait for batch completion before next batch
- "7-parallel-Task method" recommended for efficiency

**Benefits:**
- Each subagent gets dedicated context window
- Quality preservation for each step
- Effective context multiplication for large codebases

### Specialized Subagents

**Available Types:**

1. **general-purpose**
   - Complex multi-step tasks
   - Codebase research
   - Multiple-round operations
   - Tools: All (*)

2. **statusline-setup**
   - Configure Claude Code status line
   - Tools: Read, Edit

3. **Explore**
   - Quick codebase exploration
   - File pattern searches
   - Keyword searches
   - Thoroughness levels: quick, medium, very thorough
   - Tools: All tools

4. **Plan**
   - Task planning and breakdown
   - Implementation strategy
   - Thoroughness levels: quick, medium, very thorough
   - Tools: All tools

### Use Cases

**Large-Scale Refactoring:**
- Dedicated subagent per file
- Parallel processing
- Isolated context per refactoring

**Incident Response:**
- Parallel analysis of microservice logs
- Simultaneous investigation
- Independent context per service

**Multi-Feature Development:**
- Git worktrees for isolation
- Parallel implementation
- Same feature, different approaches

### Best Practices

**Delegation:**
- Provide explicit steps to Claude
- Specify which steps go to subagents
- Detailed delegation instructions increase usage
- Claude uses Task agents cautiously without explicit instruction

**Context Management:**
- Leverage separate context windows
- Avoid context pollution
- Specialized agents for specialized tasks

---

## MCP Integration

### Model Context Protocol

**What is MCP:**
- Open-source standard for AI-tool integrations
- "USB-C for AI"
- Universal connection method for tools and services
- Standardized protocol for external data sources

### How MCP Works

**Architecture:**
- Claude Code acts as MCP client
- Connects to multiple MCP servers
- Each server provides specific capabilities
- HTTP transport recommended for remote servers

### Configuration

**Transport Types:**
- **HTTP**: Cloud-based services (recommended)
- **stdio**: Local processes
- **SSE**: Server-sent events

**Configuration Scopes:**

1. **Project-scoped** (`.mcp.json`)
   - Version-controlled
   - Team-shared configuration
   - Project-specific tools

2. **Project-local** (`.claude/settings.local.json`)
   - Not version-controlled
   - Local overrides

3. **User-local** (`~/.claude/settings.local.json`)
   - Global user settings
   - Personal preferences

**Add MCP Server:**
```bash
claude mcp add <name> <command> [parameters...]
```

### Popular MCP Servers

**Financial:**
- Plaid: Banking integration analysis
- Stripe: Payment processing
- Square: Payments, inventory, orders

**Development:**
- GitHub: Repository management, CI/CD
- Figma: Design to code with context

**Automation:**
- Zapier: Connect to 8,000+ apps

### Token Management

**Warnings:**
- Alert when MCP tool output exceeds 10,000 tokens
- Default maximum: 25,000 tokens per tool output
- Monitor via `/cost` command

### Configuration Example

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

---

## Configuration and Customization

### Environment Variables

**Key Variables:**
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR`: Freeze working directory for bash
- `MCP_TIMEOUT`: Configure MCP server startup timeout

### Configuration Files

**Settings Hierarchy:**
1. User settings: `~/.claude/settings.local.json`
2. Project settings: `.claude/settings.json` (version-controlled)
3. Project local: `.claude/settings.local.json` (gitignored)

**MCP Configuration:**
- Project scope: `.mcp.json`
- Previous "project" scope renamed to "local"
- Previous "global" scope renamed to "user"

### Slash Commands

**Custom Commands:**
- Store in `.claude/commands/` directory
- Markdown files (e.g., `foo.md`)
- Become available as `/foo`
- Can be version-controlled
- Team-accessible when checked into git

**Example Structure:**
```
.claude/
├── commands/
│   ├── review.md
│   ├── test.md
│   └── deploy.md
├── settings.json
└── settings.local.json
```

### Hooks System

**Available Lifecycle Events:**

1. **SessionStart**: Session begins/resumes
   - Sources: "startup", "resume", "clear"
   - Use: Load development context

2. **UserPromptSubmit**: Before prompt processing
   - Use: Input validation, preprocessing

3. **PreToolUse**: Before tool execution
   - Use: Blocking, validation, feedback to Claude

4. **PostToolUse**: After successful tool execution
   - Use: Logging, notifications, cleanup

5. **Notification**: Claude sends notifications
   - Use: Custom notification handling

6. **Stop**: Session ends
   - Use: Cleanup, statistics, state saving

7. **SubagentStop**: Subagent completes
   - Use: Track subagent completion

8. **PreCompact**: Before context compaction
   - Use: Warning before context loss

**Hook Configuration:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "git status && git log -1"
          }
        ]
      }
    ]
  }
}
```

**Hook Input Data:**
- `session_id`: Unique session identifier
- `transcript_path`: Path to session transcript
- `cwd`: Current working directory
- `permission_mode`: Current permission mode
- Event-specific fields

### Additional Directories

**CLI Flag:**
```bash
claude --add-dir /path/to/additional/directory
```

Only way to grant access outside current working directory.

---

## Pricing and Cost Management

### Subscription Plans

**Pro Plan:**
- **Monthly**: $20/month
- **Annual**: $200/year (saves $36/year)
- **Usage**: ~45 messages or 10-40 prompts per 5 hours
- **Models**: Sonnet 4 access
- **Best For**: Light coding tasks, repositories <1,000 lines

**Max Plans:**
- **Max 5x**: ~$100/person/month
  - 5x rate limits
  - Increased concurrent usage

- **Max 20x**: ~$200/person/month
  - 20x rate limits
  - May include Opus access
  - High-throughput workflows

**Limit Reset:**
- Every 5 hours

### API Pricing (Pay-As-You-Go)

**Token-Based Billing:**

**Sonnet 4.5:**
- Input: $3 per 1M tokens
- Output: Standard API rates

**Opus 4.1:**
- Input: $15 per 1M tokens
- Output: Higher than Sonnet

**Haiku 4.5:**
- Input: $1 per 1M tokens
- Output: $5 per 1M tokens

**Billing System:**
- Prepaid credit system
- Purchase credits in advance
- Usage deducted from balance
- Monitor in Anthropic Console
- Auto-reload available
- Optional (requires explicit consent)

**Typical Costs:**
- Professional developers: $100-200/person/month
- High automation/agentic tasks: Higher
- Optimization critical for cost control

### Cost Management

**Commands:**
- `/cost`: Monitor token usage and costs

**Optimization Strategies:**
1. Use Haiku 4.5 for quick tasks (1/3 cost of Sonnet 4)
2. Enable prompt caching (90% input token savings)
3. Use subagents wisely (each has own context)
4. Set appropriate max_tokens limits
5. Monitor usage regularly
6. Use Grep/Glob instead of Read for searches

**Workspace Management:**
- "Claude Code" workspace auto-created
- Centralized cost tracking
- Cannot create API keys for this workspace
- Dedicated to Claude Code authentication

---

## Installation and Platform Support

### Supported Platforms

**macOS:**
- Version 10.15 (Catalina) or newer
- Native support
- Seatbelt sandbox

**Linux:**
- Ubuntu 20.04+
- Debian 10+
- Alpine (requires libgcc, libstdc++, ripgrep)
- Bubblewrap sandbox

**Windows:**
- Windows 10+ with WSL2
- Windows 11 21H2+ recommended
- Does NOT run natively on Windows
- WSL2 required for Linux environment
- Requires CPU virtualization support

### Hardware Requirements

**Minimum:**
- 4GB RAM
- Active internet connection
- 2-4GB free disk space (WSL2 + Claude Code + projects)

**Recommended:**
- 8GB+ RAM for comfortable development
- Additional storage for project files

### Software Dependencies

**Native Installation:**
- No Node.js required (legacy npm method requires 18.0+)
- Git (required)
- ripgrep (required for best experience)

**Alpine Linux:**
- libgcc
- libstdc++
- ripgrep

### Installation Methods

**Native Installer** (Recommended)
- No Node.js dependency
- Simplest installation

**npm Method** (Legacy)
- Requires Node.js 18.0+
- For compatibility with older setups

### Authentication

- Requires Claude Pro or Max credentials
- API key from Anthropic Console
- "Claude Code" workspace auto-created on first auth

---

## Best Practices and Optimization

### Performance Optimization

**Prompt Caching:**
- Structure prompts with static content first
- Use cache breakpoints strategically
- Monitor cache hit rates
- Analyze with `/cost` command

**Tool Selection:**
- Use Grep/Glob instead of Bash for searches
- Prefer Read over `cat` via Bash
- Use Edit over `sed` via Bash
- Use Write over `echo >` via Bash
- Reserve Bash for actual system commands

**Subagent Usage:**
- Provide explicit delegation instructions
- Use parallel execution for independent tasks
- Leverage separate context windows
- Avoid nested subagents

### Cost Optimization

**Model Selection:**
- Haiku 4.5: Quick, cost-sensitive tasks
- Sonnet 4.5: Balanced performance (default)
- Opus 4.1: Complex, critical tasks only

**Context Management:**
- Set appropriate max_tokens
- Use prompt caching
- Monitor token usage
- Clean up verbose outputs

### Security Best Practices

**Filesystem:**
- Use deny patterns for sensitive files
- Grant minimal Edit permissions
- Review Edit allow/deny rules
- Never commit credentials to git

**Network:**
- Whitelist specific domains
- Avoid broad domain access
- Review allowUnixSockets carefully
- Monitor for data exfiltration risks

**Permissions:**
- Grant tool permissions as needed
- Use `PreToolUse` hook for validation
- Review permission grants regularly
- Use sandbox mode when possible

### Workflow Best Practices

**Version Control:**
- Commit .claude/settings.json for team
- Gitignore .claude/settings.local.json
- Version-control custom slash commands
- Share MCP configurations in .mcp.json

**Task Management:**
- Use TodoWrite for complex tasks
- Mark tasks completed immediately
- Keep one task in_progress at a time
- Break down large tasks into subtasks

**Communication:**
- Be explicit about requirements
- Provide context upfront
- Specify delegation for subagents
- Use hooks for automation

### Development Workflow

**Codebase Understanding:**
- Use Explore subagent for initial exploration
- Use Grep for targeted searches
- Use Glob for file discovery
- Read files selectively

**Code Changes:**
- Read before Write/Edit
- Use Edit for targeted changes
- Use MultiEdit for multiple changes in one file
- Test changes incrementally

**Git Workflows:**
- Use Bash for git commands
- Commit regularly
- Use hooks for git automation
- Review changes before commit

**Testing:**
- Run tests via Bash
- Use TodoWrite to track test failures
- Fix issues incrementally
- Verify fixes before marking complete

---

## Comparison Matrix

### Claude Code CLI vs Web vs Desktop

| Feature | CLI | Web | Desktop |
|---------|-----|-----|---------|
| **Access** | Terminal | Browser | Native App |
| **Authentication** | API Key | Login | Account |
| **System Access** | Full | Containerized | Limited |
| **File System** | Full local | Repository only | Via MCP |
| **Parallel Execution** | Sequential | 3x concurrent | N/A |
| **Context** | Persistent | Per session | Per chat |
| **MCP Support** | Yes | Limited | Yes |
| **Sandboxing** | Optional | Forced | N/A |
| **Pricing** | API usage | API usage | Subscription |
| **Offline** | No | No | No |
| **Teleport** | N/A | Yes (to CLI) | N/A |
| **Best For** | Local dev | Remote/mobile | Chat assistance |

---

## Limitations and Considerations

### Current Limitations

**Context Window:**
- 200K tokens standard (1M beta)
- Compaction may lose information
- Extended thinking stripped from history

**Filesystem:**
- Cannot access outside working directory without `--add-dir`
- Sandbox write restrictions
- Deny patterns hide files completely

**Network:**
- Domain filtering can be bypassed
- Unix sockets may expose system services
- No traffic inspection

**Subagents:**
- Cannot spawn nested subagents
- Stateless (one report only)
- No interactive communication

**Platform:**
- Windows requires WSL2
- Some features platform-specific
- Sandbox implementation varies

### Known Issues

**Windows:**
- No native support
- WSL2 required
- Performance overhead

**Sandbox:**
- May affect certain workflows
- Requires manual permission grants
- Can block legitimate operations

**MCP:**
- Token limits on tool outputs
- Timeout configuration needed
- Transport compatibility

---

## Technical Specifications Summary

### Core Environment
- **Platform**: Linux 4.4.0
- **Shell**: Bash (persistent session)
- **Working Directory**: /home/user/LLM
- **Git**: Enabled, branch: claude/research-env-restrictions-014GsbT6R8Rm5D33Fv7GUzen

### Model Configuration
- **Current Model**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Knowledge Cutoff**: January 2025
- **Context Window**: 200,000 tokens
- **Max Output**: 64,000 tokens
- **Token Budget**: 200,000 tokens (current session)

### Available Tools
- File Operations: Read, Write, Edit, MultiEdit, NotebookEdit
- Search: Glob, Grep
- Execution: Bash, BashOutput, KillShell
- Web: WebFetch, WebSearch
- Task Management: Task, TodoWrite
- Special: ExitPlanMode, Skill, SlashCommand

### Security Features
- OS-level sandboxing (bubblewrap on Linux)
- Filesystem isolation (working directory only for writes)
- Network domain filtering
- Permission system (Read/Edit granularity)
- Hooks for validation (PreToolUse, PostToolUse)

### Performance Features
- Automatic prompt caching (90% cost reduction, 85% speed improvement)
- Context compaction (automatic)
- Parallel subagent execution
- Batch processing support

---

## Official Documentation Links

### Primary Resources
- **Main Docs**: https://docs.claude.com/en/docs/claude-code/
- **API Docs**: https://docs.claude.com/en/docs/
- **CLI Reference**: https://code.claude.com/docs/en/cli-reference
- **GitHub**: https://github.com/anthropics/claude-code

### Specific Features
- **Sandboxing**: https://docs.claude.com/en/docs/claude-code/sandboxing
- **MCP**: https://docs.anthropic.com/en/docs/claude-code/mcp
- **Hooks**: https://docs.claude.com/en/docs/claude-code/hooks
- **Settings**: https://docs.claude.com/en/docs/claude-code/settings
- **Costs**: https://docs.claude.com/en/docs/claude-code/costs
- **Pricing**: https://docs.claude.com/en/docs/about-claude/pricing

### Community Resources
- **ClaudeLog**: https://claudelog.com/
- **Awesome Claude Code**: https://github.com/hesreallyhim/awesome-claude-code
- **Engineering Blog**: https://www.anthropic.com/engineering/claude-code-best-practices

---

## Conclusion

This Claude Code environment provides a powerful, flexible, and secure platform for autonomous coding assistance. With 200,000 token context, full bash integration, extensive tool support, parallel subagent execution, and comprehensive security features, it represents a state-of-the-art AI coding assistant.

Key advantages:
- Deep codebase understanding via persistent context
- Direct system integration for autonomous operation
- Flexible tooling with MCP extensibility
- Strong security through OS-level sandboxing
- Cost optimization via prompt caching
- Parallel execution via subagents

The environment is currently configured for the /home/user/LLM repository with full git integration, running on Linux 4.4.0, powered by Claude Sonnet 4.5 with extended thinking capabilities.

---

**Environment Assessment Date**: 2025-11-15
**Documentation Version**: 1.0
**Sources**: Official Anthropic documentation, web search of current resources, system introspection
