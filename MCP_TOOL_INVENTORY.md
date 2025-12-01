# MCP Tool Inventory & Orchestration Guide

## Connected MCP Servers (14 Total)

### 1. AWS CLI Server (`mcp__aws-cli__`)
**Purpose:** AWS cloud operations and management

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `aws_s3_ls` | List S3 buckets/objects | path, recursive, human_readable |
| `aws_s3_cp` | Copy files to/from S3 | source, destination, recursive |
| `aws_ec2_describe_instances` | Describe EC2 instances | instance_ids, filters, region |
| `aws_lambda_list_functions` | List Lambda functions | region |
| `aws_lambda_invoke` | Invoke Lambda function | function_name, payload, region |
| `aws_cloudwatch_get_logs` | Get CloudWatch logs | log_group, log_stream, limit |
| `aws_iam_get_user` | Get IAM user info | user_name |
| `aws_sts_get_caller_identity` | Get current AWS identity | (none) |
| `aws_dynamodb_scan` | Scan DynamoDB table | table_name, limit, region |
| `aws_cli` | Run any AWS CLI command | command |

---

### 2. GitHub Server (`mcp__github__`)
**Purpose:** GitHub repository and issue management

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `create_or_update_file` | Create/update file in repo | owner, repo, path, content, message, branch |
| `search_repositories` | Search GitHub repos | query, page, perPage |
| `create_repository` | Create new repo | name, description, private, autoInit |
| `get_file_contents` | Get file/directory contents | owner, repo, path, branch |
| `push_files` | Push multiple files | owner, repo, branch, files, message |
| `create_issue` | Create GitHub issue | owner, repo, title, body, labels |
| `list_issues` | List repo issues | owner, repo, state, labels, sort |
| `update_issue` | Update existing issue | owner, repo, issue_number, state, body |
| `add_issue_comment` | Comment on issue | owner, repo, issue_number, body |
| `search_code` | Search code across GitHub | q, order, page, per_page |
| `search_issues` | Search issues/PRs | q, sort, order, page |
| `search_users` | Search GitHub users | q, sort, order, page |
| `get_issue` | Get issue details | owner, repo, issue_number |
| `get_pull_request` | Get PR details | owner, repo, pull_number |
| `list_pull_requests` | List repo PRs | owner, repo, state, sort |
| `create_pull_request` | Create new PR | owner, repo, title, head, base, body |
| `create_pull_request_review` | Review a PR | owner, repo, pull_number, event, body |
| `merge_pull_request` | Merge PR | owner, repo, pull_number, merge_method |
| `get_pull_request_files` | Get PR changed files | owner, repo, pull_number |
| `get_pull_request_status` | Get PR status checks | owner, repo, pull_number |
| `update_pull_request_branch` | Update PR branch | owner, repo, pull_number |
| `get_pull_request_comments` | Get PR comments | owner, repo, pull_number |
| `get_pull_request_reviews` | Get PR reviews | owner, repo, pull_number |
| `fork_repository` | Fork a repo | owner, repo, organization |
| `create_branch` | Create new branch | owner, repo, branch, from_branch |
| `list_commits` | List branch commits | owner, repo, sha, page |

---

### 3. Terraform Server (`mcp__terraform__`)
**Purpose:** Infrastructure as Code management

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `terraform_init` | Initialize working directory | directory, upgrade, reconfigure |
| `terraform_plan` | Generate execution plan | directory, var, target, out |
| `terraform_apply` | Apply changes | directory, auto_approve, plan_file, var |
| `terraform_destroy` | Destroy infrastructure | directory, auto_approve, target |
| `terraform_output` | Show output values | directory, name, json |
| `terraform_state_list` | List state resources | directory |
| `terraform_state_show` | Show resource in state | directory, address |
| `terraform_validate` | Validate configuration | directory |
| `terraform_fmt` | Format config files | directory, check, recursive |
| `terraform_version` | Show Terraform version | (none) |

---

### 4. Claude Bridge Server (`mcp__claude-bridge__`)
**Purpose:** Communication between Claude Desktop and CLI

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `send_to_desktop` | Send message to Desktop | message, channel |
| `read_from_desktop` | Read Desktop messages | channel, unread_only |
| `send_to_cli` | Send message to CLI | message, channel |
| `read_from_cli` | Read CLI messages | channel, unread_only |
| `get_unread_count` | Count unread messages | (none) |
| `mark_as_read` | Mark messages read | source, message_id |
| `search_messages` | Search by keyword | keyword, source |
| `delete_message` | Delete message | message_id |
| `clear_messages` | Clear all messages | (none) |
| `recover_backup` | Recover from backup | (none) |

---

### 5. Claude Tasks Server (`mcp__claude-tasks__`)
**Purpose:** Task management across Claude instances

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `create_task` | Create new task | title, assignTo, description, priority, tags |
| `get_tasks` | Get tasks with filters | status, priority, assignedTo, worktree |
| `get_my_tasks` | Get CLI-assigned tasks | worktree |
| `get_worktree_tasks` | Get worktree tasks | worktree |
| `update_task` | Update task status | id, status, worktree |
| `complete_task` | Mark task completed | id, result |
| `get_task_stats` | Get task statistics | (none) |

---

### 6. Prompt Agent Server (`mcp__prompt-agent__`)
**Purpose:** Code scanning and autonomous execution

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `scan_for_tasks` | Scan for TODOs, FIXMEs, lint errors | path |
| `execute_objective` | Autonomous plan and execute | objective, context_files |

---

### 7. Render API Server (`mcp__render-api__`)
**Purpose:** Render.com deployment management

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `render_set_env_var` | Set environment variable | serviceId, key, value |
| `render_update_service` | Update service config | serviceId, healthCheckPath |
| `render_deploy_service` | Trigger deployment | serviceId, clearCache |

---

### 8. Coding Agent Server (`mcp__coding-agent__`)
**Purpose:** Autonomous coding task execution

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `coding_agent_execute` | Execute coding task | description, files, auto_pr |
| `coding_agent_health` | Check agent health | (none) |
| `coding_agent_stats` | Get agent statistics | (none) |

---

### 9. Context7 Server (`mcp__context7__`)
**Purpose:** Library documentation lookup

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `resolve-library-id` | Find library ID | libraryName |
| `get-library-docs` | Fetch documentation | context7CompatibleLibraryID, topic, mode, page |

---

### 10. Productivity Server (`mcp__productivity__`)
**Purpose:** Project management and productivity tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `log_work` | Append to CLAUDE_LOG.md | entry |
| `read_work_log` | Read work log | (none) |
| `save_snippet` | Save reusable snippet | name, content |
| `get_snippet` | Retrieve snippet | name |
| `list_snippets` | List all snippets | (none) |
| `add_todo` | Add task to TODO.md | task |
| `list_todos` | List all tasks | (none) |
| `complete_todo` | Mark task complete | line_id |
| `delete_todo` | Delete task | line_id |
| `init_project` | Initialize project | project_name |
| `get_status` | Quick status check | (none) |
| `web_search` | DuckDuckGo search | query |
| `read_webpage` | Convert URL to markdown | url |
| `get_file_tree` | Recursive file tree | path |
| `search_code` | Search code patterns | query, path |
| `run_command` | Run shell command | command |
| `read_file` | Read file contents | filepath |
| `write_file` | Write file contents | filepath, content |

---

### 11. Git Server (`mcp__git__`)
**Purpose:** Git version control operations

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `git_status` | Show working tree status | repo_path |
| `git_diff_unstaged` | Show unstaged changes | repo_path, context_lines |
| `git_diff_staged` | Show staged changes | repo_path, context_lines |
| `git_diff` | Diff between branches/commits | repo_path, target, context_lines |
| `git_commit` | Record changes | repo_path, message |
| `git_add` | Stage files | repo_path, files |
| `git_reset` | Unstage changes | repo_path |
| `git_log` | Show commit logs | repo_path, max_count, start/end_timestamp |
| `git_create_branch` | Create new branch | repo_path, branch_name, base_branch |
| `git_checkout` | Switch branches | repo_path, branch_name |
| `git_show` | Show commit contents | repo_path, revision |
| `git_branch` | List branches | repo_path, branch_type, contains |

---

### 12. Filesystem Server (`mcp__filesystem__`)
**Purpose:** File system operations

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `read_file` | Read file as text | path, head, tail |
| `read_text_file` | Read text file | path, head, tail |
| `read_media_file` | Read image/audio | path |
| `read_multiple_files` | Read multiple files | paths |
| `write_file` | Create/overwrite file | path, content |
| `edit_file` | Line-based edits | path, edits, dryRun |
| `create_directory` | Create directory | path |
| `list_directory` | List directory contents | path |
| `list_directory_with_sizes` | List with sizes | path, sortBy |
| `directory_tree` | Recursive tree view | path |
| `move_file` | Move/rename files | source, destination |
| `search_files` | Search for files | path, pattern, excludePatterns |
| `get_file_info` | Get file metadata | path |
| `list_allowed_directories` | List allowed dirs | (none) |

---

### 13. Sequential Thinking Server (`mcp__sequential-thinking__`)
**Purpose:** Structured reasoning and problem-solving

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `sequentialthinking` | Dynamic problem-solving | thought, nextThoughtNeeded, thoughtNumber, totalThoughts, isRevision, branchId |

---

### 14. Swarm Server (`mcp__swarm__`)
**Purpose:** AI agent swarm orchestration

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `run_god_mode_swarm` | Full-access swarm | goal, agents_config |
| `run_autonomous_crew` | Autonomous crew (alias) | goal, agents_config |
| `run_local_crew` | Local Ollama swarm | goal, team_description, model |
| `quick_code_review` | Quick code review | path |
| `quick_research` | Quick research | topic |
| `check_hydra_status` | Check provider status | (none) |
| `list_swarm_options` | List swarm options | (none) |

---

## Tool Categories by Function

### Infrastructure & Cloud (21 tools)
- AWS CLI: 10 tools
- Terraform: 10 tools
- Render API: 3 tools

### Version Control & Collaboration (38 tools)
- GitHub: 26 tools
- Git: 12 tools

### File Operations (14 tools)
- Filesystem: 14 tools

### AI & Orchestration (12 tools)
- Sequential Thinking: 1 tool
- Swarm: 7 tools
- Coding Agent: 3 tools
- Prompt Agent: 2 tools

### Documentation & Research (2 tools)
- Context7: 2 tools

### Productivity & Project Management (25 tools)
- Productivity: 18 tools
- Claude Tasks: 7 tools

### Communication (10 tools)
- Claude Bridge: 10 tools

---

## Total: 95+ tools across 14 MCP servers
