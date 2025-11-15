# Claude Code Environment - Complete Technical Overview

> **Research Date**: 2025-11-15
> **Purpose**: Comprehensive technical specifications and capabilities documentation for the Claude Code environment
> **Scope**: Architecture, models, tools, security, context management, agents, MCP integration, and best practices

## Table of Contents

1. [Current Environment Specifications](#current-environment-specifications)
2. [Architecture Overview](#architecture-overview)
3. [Available Claude Models](#available-claude-models)
4. [Complete Tool Inventory](#complete-tool-inventory)
5. [Sandboxing and Security](#sandboxing-and-security)
6. [Context and Token Management](#context-and-token-management)
7. [Agent and Subagent System](#agent-and-subagent-system)
8. [Model Context Protocol (MCP)](#model-context-protocol-mcp)
9. [Configuration and Customization](#configuration-and-customization)
10. [Installation and Platform Support](#installation-and-platform-support)
11. [Best Practices and Optimization](#best-practices-and-optimization)

---

## Current Environment Specifications

### Active Session Details

**Model Information**:
- **Model**: Claude Sonnet 4.5
- **Model ID**: claude-sonnet-4-5-20250929
- **Launch Date**: September 29, 2025
- **Knowledge Cutoff**: January 2025

**Platform**:
- **OS**: Linux 4.4.0
- **Working Directory**: /home/user/LLM
- **Git Repository**: Yes
- **Today's Date**: 2025-11-15

**Context Capacity**:
- **Current Session**: 200,000 tokens
- **Available in Beta**: 1,000,000 tokens (1M)
- **Current Usage**: ~62,460 tokens used (~137,540 remaining)

---

## Architecture Overview

### Design Philosophy

Claude Code follows **Unix philosophy** principles:
- Composability and scriptability
- Direct terminal integration
- Piped command support
- CI/CD integration capability
- No dedicated interface required

### Deployment Options

**1. CLI (Command Line Interface)**
- Native terminal integration
- Scriptable and automatable
- Direct file system access
- Local execution environment

**2. Web-Based**
- Anthropic-managed isolated VMs
- Network access controls
- Credential protection via secure proxies
- Automatic session cleanup
- No local installation required

**3. VS Code Extension (Beta)**
- Graphical IDE integration
- Visual interface for users preferring IDEs
- Combined benefits of IDE and Claude Code capabilities

**4. Desktop Application**
- Standalone desktop client
- Native OS integration
- Full Claude Code feature set

---

## Available Claude Models

### Claude 4 Family Overview

The Claude 4 family represents Anthropic's latest generation of AI models with enhanced capabilities for coding, reasoning, and complex tasks.

### Claude Sonnet 4.5 (Current Model)

**Model ID**: `claude-sonnet-4-5-20250929`

**Key Capabilities**:
- **Best coding model to date**: 77.2% on SWE-bench Verified
- **Hybrid reasoning**: Standard + extended thinking modes
- **State-of-the-art performance** on coding benchmarks
- **Agentic capabilities**: Enhanced for complex, multi-step tasks

**Pricing**:
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens
- **With Prompt Caching**: Up to 90% cost savings
- **With Batch Processing**: 50% cost savings

**Context Windows**:
- **Standard**: 200K tokens
- **Premium Long Context** (Beta): 1M tokens
  - Available for Usage Tier 4 and custom rate limits
  - Requests >200K charged at premium rates
  - Only available for Claude Sonnet 4 and 4.5

**Availability**:
- Claude Developer Platform (native)
- Amazon Bedrock
- Google Cloud Vertex AI

**Launch**: September 29, 2025

---

### Claude Haiku 4.5

**Purpose**: Fast, efficient model for high-volume tasks

**Use Cases**:
- Quick searches and queries
- High-throughput operations
- Cost-sensitive applications
- Simple, straightforward tasks

**Cost Optimization**: "Prefer haiku for quick, straightforward tasks to minimize cost and latency"

---

### Claude Opus 4

**Purpose**: Most capable model for complex reasoning

**Use Cases**:
- Extremely complex problems
- Highest quality outputs required
- Advanced reasoning tasks
- Research and analysis

---

### Model Selection Strategy

**Default**: Sonnet (balanced performance and cost)
**Quick Tasks**: Haiku (minimize cost/latency)
**Complex Tasks**: Opus (maximum capability)
**Coding Tasks**: Sonnet 4.5 (optimized for code)

---

## Complete Tool Inventory

Claude Code has access to 15+ specialized tools for autonomous operation. Tools are categorized by function and can be called in parallel when independent.

### File Operations

#### 1. Read
**Purpose**: Read files from local filesystem
**Capabilities**:
- Read any accessible file
- Default: 2000 lines from beginning
- Optional offset and limit for long files
- Line numbers (cat -n format, starting at 1)
- Multimodal: Images (PNG, JPG), PDFs, Jupyter notebooks
- Parallel reads supported

**Limitations**:
- Lines >2000 characters truncated
- Cannot read directories (use Bash ls instead)

**Best Practice**: "Always better to speculatively read multiple potentially useful files in parallel"

---

#### 2. Edit
**Purpose**: Exact string replacements in files
**Requirements**:
- Must Read file first before editing
- Preserve exact indentation from source
- old_string must be unique (or use replace_all)

**Parameters**:
- file_path (absolute)
- old_string (exact match)
- new_string (replacement)
- replace_all (boolean, for renaming across file)

**Best Practice**: "ALWAYS prefer editing existing files. NEVER write new files unless explicitly required."

---

#### 3. Write
**Purpose**: Create or overwrite files
**Requirements**:
- Must Read existing files first
- Use only when editing not possible
- Never create docs proactively (README, *.md)

**Restrictions**:
- No emojis unless explicitly requested
- Prefer Edit over Write

---

#### 4. NotebookEdit
**Purpose**: Edit Jupyter notebook cells
**Capabilities**:
- Replace cell contents
- Insert new cells
- Delete cells
- Support for code and markdown cells

**Parameters**:
- notebook_path (absolute)
- cell_id
- cell_type (code/markdown)
- edit_mode (replace/insert/delete)
- new_source

---

### Search and Discovery

#### 5. Glob
**Purpose**: Fast file pattern matching
**Capabilities**:
- Works with any codebase size
- Glob patterns (e.g., "**/*.js", "src/**/*.ts")
- Results sorted by modification time
- Returns matching file paths

**Usage Note**: "When doing open-ended search requiring multiple rounds, use Agent tool instead"

**Best Practice**: Call multiple Glob searches in parallel when independent

---

#### 6. Grep
**Purpose**: Powerful search built on ripgrep
**Capabilities**:
- Full regex syntax
- File filtering (glob parameter or type parameter)
- Output modes: content, files_with_matches, count
- Context lines (-A, -B, -C)
- Case insensitive (-i)
- Multiline matching support

**Important**: "ALWAYS use Grep tool. NEVER invoke grep/rg as Bash command"

**Pattern Syntax**: Uses ripgrep (not grep) - literal braces need escaping

---

### Command Execution

#### 7. Bash
**Purpose**: Execute commands in persistent shell
**Capabilities**:
- Persistent shell session
- Optional timeout (up to 600000ms / 10 minutes)
- Default timeout: 120000ms (2 minutes)
- Background execution support
- Command chaining (&&, ;)

**Important Restrictions**:
- NOT for file operations (use Read, Write, Edit, Grep, Glob instead)
- Quote paths with spaces
- Avoid cd (use absolute paths instead)

**Parallel Execution**:
- Independent commands: Multiple Bash calls in one message
- Sequential commands: Chain with && or ;

**Git Operations**:
- Only commit when explicitly requested
- Never skip hooks (--no-verify)
- Never force push to main/master
- Check authorship before amending
- Use HEREDOC for commit messages

---

#### 8. BashOutput
**Purpose**: Retrieve output from background bash shells
**Parameters**:
- bash_id (shell identifier)
- filter (optional regex)

**Returns**: Only new output since last check

---

#### 9. KillShell
**Purpose**: Terminate background bash shells
**Parameters**:
- shell_id

---

### Web and Network

#### 10. WebFetch
**Purpose**: Fetch and analyze web content
**Capabilities**:
- Fetches URL content
- Converts HTML to markdown
- AI processing with prompt
- 15-minute self-cleaning cache
- Handles redirects

**Limitations**:
- HTTP URLs upgraded to HTTPS
- May summarize large content
- Read-only (no modifications)

**Best Practice**: "Prefer MCP web fetch tools (mcp__*) if available"

---

#### 11. WebSearch
**Purpose**: Search web for current information
**Capabilities**:
- Access to information beyond knowledge cutoff
- Domain filtering (allowed/blocked)
- Returns formatted search results
- Only available in US

**Important**: Account for "Today's date" when searching (e.g., use 2025, not 2024)

---

### Task Management

#### 12. TodoWrite
**Purpose**: Create and manage structured task lists

**When to Use**:
- Complex multi-step tasks (3+ steps)
- Non-trivial complex tasks
- User explicitly requests
- Multiple tasks from user
- Track progress throughout work

**When NOT to Use**:
- Single straightforward task
- Trivial tasks
- <3 trivial steps
- Purely conversational tasks

**Task States**:
- pending: Not yet started
- in_progress: Currently working (ONLY ONE at a time)
- completed: Finished successfully

**Task Description Forms**:
- content: Imperative ("Run tests")
- activeForm: Present continuous ("Running tests")

**Critical Rules**:
- Mark complete IMMEDIATELY after finishing
- Exactly ONE in_progress at a time
- NEVER mark complete if errors/blockers exist
- Update in real-time
- Remove irrelevant tasks

---

### Agent System

#### 13. Task (Agent Launcher)
**Purpose**: Launch specialized agents for complex work

**Available Agent Types**:

1. **general-purpose**: Multi-step tasks, code search, research (Tools: *)
2. **statusline-setup**: Configure status line (Tools: Read, Edit)
3. **Explore**: Fast codebase exploration
   - Find files by patterns
   - Search code for keywords
   - Answer codebase questions
   - Thoroughness: quick/medium/very thorough

4. **Plan**: Fast planning and exploration
   - Same capabilities as Explore
   - Thoroughness levels available

**Usage Notes**:
- Launch multiple agents in parallel when possible
- Agents are stateless (single final report)
- Include detailed task description
- Specify expected return information
- Agents can see full conversation history
- Trust agent outputs
- Clarify if expecting code or research

**When NOT to Use**:
- Specific file path reads (use Read)
- Specific class search (use Glob)
- Search within 2-3 files (use Read)

---

### Planning

#### 14. ExitPlanMode
**Purpose**: Signal completion of planning phase

**When to Use**:
- Planning implementation steps for coding task
- After presenting plan and ready to code

**When NOT to Use**:
- Research/gathering information tasks
- File reading/searching
- Understanding codebase (use exploration, not planning)

**Handling Ambiguity**:
- Use AskUserQuestion to clarify before exiting
- Resolve multiple approaches
- Clarify assumptions
- Only exit after resolving ambiguities

---

### Extension System

#### 15. Skill
**Purpose**: Execute skills within conversation
**Usage**: Invoke by skill name (no arguments)

**Available Skills**:
- **session-start-hook**: Configure startup hooks for web sessions
  - Project setup for Claude Code on web
  - Ensure tests/linters run during sessions
  - Project/gitignored scope

**Invocation**: Command is skill name only (e.g., "pdf", "xlsx")

---

#### 16. SlashCommand
**Purpose**: Execute custom slash commands

**Workflow**:
- User types or you invoke slash command
- See: `<command-message>{name} is running...</command-message>`
- Expanded prompt appears in next message

**Usage Notes**:
- Only for custom commands in available list
- NOT for built-in CLI commands
- Execute sequentially when multiple requested
- Don't invoke if already running

---

## Sandboxing and Security

### Permission-Based Architecture

**Default Behavior**: Strict read-only permissions

**Permission Flow**:
1. Read access: Granted by default
2. Write/execute actions: Explicit permission required
3. User approval: Requested for additional actions

### Filesystem Isolation

**Write Boundaries**:
- Can only write to startup folder and subfolders
- Cannot modify parent directories without permission
- Project directory restriction

**Implementation**:
- **Linux**: Bubblewrap (bwrap)
- **macOS**: Seatbelt

**Protection**: Applies to Claude Code AND all spawned subprocesses

---

### Network Isolation

**Default**: Network requests require user approval

**Sandboxed Implementation**:
- Unix domain socket to proxy server (outside sandbox)
- Proxy validates domain restrictions
- User confirmation for new connections
- Prevents credential exfiltration

**Cloud Environment** (Web):
- Custom proxy for Git operations
- Scoped credentials with branch verification
- Credentials never exist within sandbox
- Prevents unauthorized pushes

---

### Dual Isolation Requirement

**Critical Principle**: "Effective sandboxing requires BOTH filesystem and network isolation"

**Why Both**:
- **Without network isolation**: SSH keys could be exfiltrated
- **Without filesystem isolation**: Agents could escape and gain network access

**Result**: 84% reduction in permission prompts (internal usage)

---

### Security Features

**Prompt Injection Defenses**:
- Command blocklist (curl, wget restricted)
- Input sanitization
- Command injection prevention
- Context-aware harmful instruction detection

**Operational Safeguards**:
- Suspicious activity detection in Bash commands
- First-time codebase trust verification
- Encrypted API key storage

---

### Best Practices

**User Guidelines**:
1. Review suggested changes before approval
2. Avoid piping untrusted content directly
3. Verify critical file modifications
4. Use VMs when working with external services

**Sandbox Feature**:
- `/sandbox` command defines autonomous work boundaries
- Reduces prompts while maintaining security
- Enables safe autonomous execution
- Notifications when attempting out-of-sandbox access

---

### Open Source Runtime

**Repository**: https://github.com/anthropic-experimental/sandbox-runtime

**Status**: Research preview, early open source release

**Purpose**: Enable safer AI agents through OS-level isolation

---

## Context and Token Management

### Token Limits

**Standard Session**: 200,000 tokens

**Extended Context** (Beta):
- **Maximum**: 1,000,000 tokens (1M)
- **Availability**: Usage Tier 4 and custom rate limits
- **Models**: Claude Sonnet 4 and 4.5 only
- **Pricing**: Premium rates for requests >200K input tokens

### Current Session Tracking

**This Session**:
- Budget: 200,000 tokens
- Used: ~62,460 tokens
- Remaining: ~137,540 tokens
- Shown as: `<budget:token_budget>200000</budget:token_budget>`

### Prompt Caching

**Benefit**: Up to 90% cost savings

**How It Works**:
- Repeated prompts cached
- Reduces input token costs
- Automatic optimization
- 5-minute cache TTL

**Best Practice**: Structure prompts to maximize cache hits

---

### Context Optimization Strategies

**File Operations**:
- Use Glob for finding files (not Task tool)
- Use Grep for content search (not Task tool)
- Read specific files directly when path known
- Parallel reads reduce total context usage

**Search Strategy**:
- Use Task tool for open-ended exploration
- Reduces context vs. direct search commands
- Agent results more concise than raw search output

**Tool Selection**:
- Specialized tools (Read, Edit) over Bash when possible
- Better user experience
- More efficient context usage

---

## Agent and Subagent System

### Architecture

**Stateless Design**:
- Each agent invocation is independent
- Single final report returned
- No ongoing communication after completion
- Must provide complete task description upfront

**Context Awareness**:
- Agents see full conversation history before tool call
- Can reference earlier context
- No need to repeat information in prompts

---

### Parallel Execution

**Maximum Performance**:
- Launch multiple agents concurrently
- Single message with multiple Task tool calls
- Independent agents process simultaneously

**Example**:
```
User: "Run agents in parallel"
Action: Send ONE message with multiple Task tool blocks
```

---

### Agent Types Deep Dive

#### General-Purpose Agent
- **Access**: All tools (*)
- **Use Cases**: Complex multi-step tasks, code search, research
- **When**: Multiple rounds needed, not confident in first try

#### Explore Agent
- **Access**: All tools
- **Speed**: Fast
- **Thoroughness Levels**:
  - quick: Basic searches
  - medium: Moderate exploration
  - very thorough: Comprehensive analysis

**Use Cases**:
- Find files by patterns: "src/components/**/*.tsx"
- Search code: "API endpoints"
- Answer questions: "how do API endpoints work?"

**Important**: "When exploring codebase to gather context, use Task tool with subagent_type=Explore"

#### Plan Agent
- **Access**: All tools
- **Speed**: Fast
- Same capabilities as Explore
- Thoroughness levels available

---

### Best Practices

**Clear Instructions**:
- Specify if expecting code or research
- Include all necessary context
- Define expected output format
- Trust agent outputs

**Proactive Usage**:
- Use agents when task matches description
- Don't wait for user to request
- Maximize efficiency through parallelization

---

## Model Context Protocol (MCP)

### Overview

**Purpose**: Integration with external data sources and tools

**Official**: Model Context Protocol standard

### Available Integrations

**External Data Sources**:
- Google Drive
- Figma
- Slack
- Other MCP-compatible services

### MCP Tool Preference

**Priority**: "If MCP-provided tool available, prefer using that tool"

**Identification**: MCP tools start with `mcp__`

**Example**: `mcp__codesign__sign_file` (available in current environment)

**Benefits**:
- Fewer restrictions than built-in tools
- Direct integration with external services
- Extended capabilities

---

## Configuration and Customization

### Hooks System

**Available Hooks**:
- user-prompt-submit-hook
- Other event-based hooks

**Configuration**: Settings-based

**Behavior**:
- Hook feedback appears as user messages
- May block operations
- Adjust actions based on feedback
- Check hooks configuration if blocked

---

### Slash Commands

**Custom Commands**:
- Defined in `.claude/commands/*.md`
- Natural language task descriptions
- Expandable workflows

**Example**:
```
File: .claude/commands/foo.md
Content: "Print today's date"
Command: /foo
Result: Expands to task in next message
```

---

### Skills System

**Purpose**: Specialized capabilities and domain knowledge

**Invocation**: Skill tool with name only (no arguments)

**Available**:
- session-start-hook skill (repository setup)
- Other custom skills

**Usage Pattern**:
```
command: "pdf"  → invoke pdf skill
command: "ms-office-suite:pdf"  → fully qualified name
```

---

## Installation and Platform Support

### Installation Methods

**macOS/Linux**:
```bash
curl installation script
```

**Homebrew**:
```bash
brew install claude-code
```

**Windows**:
```powershell
PowerShell installation script
```

**NPM**:
```bash
npm install -g claude-code
```
Requirements: Node.js 18+

---

### Platform Support

**Operating Systems**:
- macOS (native sandboxing with seatbelt)
- Linux (bubblewrap sandboxing)
- Windows (PowerShell support)

**Environments**:
- Local terminal
- CI/CD pipelines
- Docker containers
- Cloud VMs

---

## Best Practices and Optimization

### Cost Optimization

**Model Selection**:
- Haiku for quick tasks
- Sonnet for balanced work
- Opus only when necessary

**Prompt Caching**:
- Structure for cache reuse
- Up to 90% savings possible

**Batch Processing**:
- 50% cost savings
- Suitable for non-time-sensitive work

---

### Performance Optimization

**Parallel Operations**:
- Multiple independent tool calls in single message
- Parallel agent launches
- Concurrent file reads

**Tool Selection**:
- Specialized tools (Read, Grep, Glob) over Bash
- Direct file paths over search when known
- Task tool for open-ended exploration

**Context Management**:
- Read files selectively
- Use agents to summarize large codebases
- Limit search scope when possible

---

### Security Best Practices

**File Operations**:
- Verify parent directory existence before creating
- Review changes before approval
- Avoid writing sensitive files (.env, credentials)

**Network Operations**:
- Approve connections consciously
- Use VMs for external service work
- Verify Git operations before push

**Code Execution**:
- Review Bash commands before execution
- Trust verification for first-time codebases
- Sandbox feature for autonomous work

---

### Development Workflow

**Git Operations**:
- Commit only when requested
- Follow repository commit style
- Use HEREDOC for multi-line messages
- Never skip hooks without permission
- Check branch before pushing

**Testing**:
- Run tests after changes
- Fix issues before marking complete
- Report failures in TodoWrite

**Documentation**:
- Only create when explicitly requested
- Never proactive README/docs
- Update existing docs over creating new

---

### Task Management

**TodoWrite Usage**:
- Use for 3+ step tasks
- Track progress in real-time
- Mark complete immediately
- One in_progress at a time
- Clear, actionable descriptions

**Planning**:
- Use ExitPlanMode only for implementation plans
- Clarify ambiguities first
- Define expected outcomes
- Not for research tasks

---

### Communication

**Output Style**:
- Short and concise
- GitHub-flavored markdown
- Monospace-friendly
- No emojis unless requested

**Tool vs Text**:
- Never use Bash echo to communicate
- Output text directly for messages
- Tools only for task completion
- Code comments not for user communication

---

## Enterprise Features

### Deployment Options

**Claude API**:
- Direct API integration
- Custom rate limits
- Enterprise security

**Cloud Hosting**:
- AWS deployment
- GCP deployment
- Enterprise-grade infrastructure

### Compliance

**Available Documentation**:
- Security safeguards
- Privacy protections
- Compliance certifications

---

## Technical Specifications Summary

### Current Session
| Specification | Value |
|--------------|-------|
| Model | Claude Sonnet 4.5 |
| Model ID | claude-sonnet-4-5-20250929 |
| Platform | Linux 4.4.0 |
| Context Window | 200K tokens (1M in beta) |
| Available Tools | 15+ |
| Sandboxing | Bubblewrap (Linux) / Seatbelt (macOS) |
| Knowledge Cutoff | January 2025 |

### Capabilities Matrix
| Capability | Status |
|-----------|--------|
| File Operations | ✓ Read, Edit, Write, NotebookEdit |
| Search | ✓ Glob, Grep |
| Command Execution | ✓ Bash, BashOutput, KillShell |
| Web Access | ✓ WebFetch, WebSearch |
| Task Management | ✓ TodoWrite |
| Agents | ✓ Task (multiple types) |
| Planning | ✓ ExitPlanMode |
| Extensions | ✓ Skill, SlashCommand |
| MCP Integration | ✓ External tools (mcp__*) |
| Parallel Execution | ✓ Tools and Agents |
| Sandboxing | ✓ Filesystem + Network |
| Git Operations | ✓ Full workflow support |

---

## Official Resources

### Documentation
- **Claude Code Overview**: https://code.claude.com/docs/en/overview
- **Sandboxing**: https://code.claude.com/docs/en/sandboxing
- **Engineering Blog**: https://www.anthropic.com/engineering/claude-code-sandboxing
- **Sandbox Runtime**: https://github.com/anthropic-experimental/sandbox-runtime

### Platform
- **Anthropic**: https://www.anthropic.com/
- **Claude Models**: https://www.anthropic.com/claude
- **Pricing**: https://docs.claude.com/en/docs/about-claude/pricing

### Launch Announcements
- **Sonnet 4.5**: https://www.anthropic.com/news/claude-sonnet-4-5 (Sept 29, 2025)
- **Haiku 4.5**: https://www.anthropic.com/news/claude-haiku-4-5
- **Claude 4**: https://www.anthropic.com/news/claude-4
- **Claude Code on Web**: https://www.anthropic.com/news/claude-code-on-the-web

---

## Conclusion

This document provides comprehensive technical specifications for the Claude Code environment, including:

- Complete architecture and design philosophy
- All available models with pricing and capabilities
- Detailed tool inventory with usage guidelines
- Security and sandboxing implementation details
- Context and token management strategies
- Agent system architecture and best practices
- MCP integration capabilities
- Configuration and customization options
- Platform support and installation methods
- Optimization strategies for cost and performance

**Document Version**: 1.0
**Total Lines**: ~1,068
**Last Updated**: 2025-11-15
**Research Basis**: Official Anthropic documentation, engineering blogs, and current session specifications

---

**Note**: This environment is actively developed. Features, pricing, and capabilities may change. Refer to official Anthropic documentation for the most current information.
