# MCP Tool Chain Orchestration Diagrams

## Master Architecture

```
                              ┌─────────────────────────────────────────┐
                              │      SEQUENTIAL THINKING (Planner)       │
                              │  mcp__sequential-thinking__sequentialthinking  │
                              └────────────────────┬────────────────────┘
                                                   │
                    ┌──────────────────────────────┼──────────────────────────────┐
                    │                              │                              │
                    ▼                              ▼                              ▼
        ┌───────────────────┐          ┌───────────────────┐          ┌───────────────────┐
        │   DISCOVERY LAYER │          │  EXECUTION LAYER  │          │   DEPLOY LAYER    │
        └─────────┬─────────┘          └─────────┬─────────┘          └─────────┬─────────┘
                  │                              │                              │
    ┌─────────────┼─────────────┐    ┌───────────┼───────────┐    ┌─────────────┼─────────────┐
    │             │             │    │           │           │    │             │             │
    ▼             ▼             ▼    ▼           ▼           ▼    ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Context7│  │WebSearch│ │ScanTask│  │CodingAg│ │EditFile│ │GitOps  │ │GitHub  │ │Render  │ │AWS     │
│  Docs  │  │  +Read  │ │Prompt  │  │Execute │ │FileSys │ │Commit  │ │  PR    │ │Deploy  │ │Monitor │
└────────┘  └────────┘  └────────┘  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

---

## Chain 1: Full DevOps Pipeline

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. SCAN TASKS   │────▶│  2. PLAN         │────▶│  3. EXECUTE      │
│  prompt-agent/   │     │  sequential-     │     │  coding-agent/   │
│  scan_for_tasks  │     │  thinking        │     │  execute         │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  4. STAGE        │────▶│  5. COMMIT       │────▶│  6. PUSH         │
│  git/git_add     │     │  git/git_commit  │     │  github/         │
│                  │     │                  │     │  push_files      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  7. CREATE PR    │────▶│  8. DEPLOY       │────▶│  9. MONITOR      │
│  github/         │     │  render-api/     │     │  aws-cli/        │
│  create_pull_req │     │  deploy_service  │     │  cloudwatch_logs │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Chain 2: Research & Documentation

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. WEB SEARCH   │────▶│  2. READ PAGE    │────▶│  3. GET LIB ID   │
│  productivity/   │     │  productivity/   │     │  context7/       │
│  web_search      │     │  read_webpage    │     │  resolve-lib-id  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  4. GET DOCS     │────▶│  5. WRITE FILE   │────▶│  6. LOG WORK     │
│  context7/       │     │  filesystem/     │     │  productivity/   │
│  get-library-docs│     │  write_file      │     │  log_work        │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Chain 3: Infrastructure as Code

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. AUTH CHECK   │────▶│  2. TF INIT      │────▶│  3. TF VALIDATE  │
│  aws-cli/        │     │  terraform/      │     │  terraform/      │
│  get_caller_id   │     │  terraform_init  │     │  terraform_valid │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  4. TF PLAN      │────▶│  5. TF APPLY     │────▶│  6. VERIFY       │
│  terraform/      │     │  terraform/      │     │  aws-cli/        │
│  terraform_plan  │     │  terraform_apply │     │  describe_inst   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  7. STATE LIST   │────▶│  8. LOG RESULTS  │
│  terraform/      │     │  productivity/   │
│  state_list      │     │  log_work        │
└──────────────────┘     └──────────────────┘
```

---

## Chain 4: Cross-Claude Collaboration

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. CREATE TASK  │────▶│  2. SEND TO      │────▶│  3. AWAIT        │
│  claude-tasks/   │     │  DESKTOP         │     │  RESPONSE        │
│  create_task     │     │  claude-bridge/  │     │  read_from_cli   │
│                  │     │  send_to_desktop │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  4. PROCESS      │────▶│  5. UPDATE TASK  │────▶│  6. COMPLETE     │
│  RESPONSE        │     │  claude-tasks/   │     │  claude-tasks/   │
│  (local ops)     │     │  update_task     │     │  complete_task   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Chain 5: AI Swarm Orchestration

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. CHECK STATUS │────▶│  2. DEFINE GOAL  │────▶│  3. CONFIG AGENTS│
│  swarm/          │     │  sequential-     │     │  (roles, goals,  │
│  check_hydra_st  │     │  thinking        │     │   backstories)   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
         ┌─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  4. LAUNCH SWARM │────▶│  5. MONITOR      │────▶│  6. HARVEST      │
│  swarm/          │     │  productivity/   │     │  RESULTS         │
│  run_god_mode    │     │  get_status      │     │  filesystem/read │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Parallel Execution Patterns

### Pattern A: Parallel Discovery
```
                    ┌───────────────┐
                    │  START TASK   │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  ┌───────────┐       ┌───────────┐       ┌───────────┐
  │ WebSearch │       │ Context7  │       │ ScanTasks │
  │  (async)  │       │  (async)  │       │  (async)  │
  └─────┬─────┘       └─────┬─────┘       └─────┬─────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼───────┐
                    │  MERGE DATA   │
                    └───────────────┘
```

### Pattern B: Fan-Out / Fan-In
```
                    ┌───────────────┐
                    │  SCAN REPO    │
                    └───────┬───────┘
                            │
    ┌───────────┬───────────┼───────────┬───────────┐
    │           │           │           │           │
    ▼           ▼           ▼           ▼           ▼
┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐
│File 1 │   │File 2 │   │File 3 │   │File 4 │   │File N │
│ Edit  │   │ Edit  │   │ Edit  │   │ Edit  │   │ Edit  │
└───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘   └───┬───┘
    │           │           │           │           │
    └───────────┴───────────┼───────────┴───────────┘
                            │
                    ┌───────▼───────┐
                    │   GIT ADD     │
                    │   ALL FILES   │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │  GIT COMMIT   │
                    └───────────────┘
```

---

## Error Handling Chains

```
┌──────────────────┐
│   ATTEMPT OP     │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ SUCCESS?│
    └────┬────┘
         │
    ┌────┴────┐
   YES       NO
    │         │
    ▼         ▼
┌───────┐  ┌───────────────┐
│PROCEED│  │ LOG ERROR     │
│ NEXT  │  │ productivity/ │
└───────┘  │ log_work      │
           └───────┬───────┘
                   │
           ┌───────▼───────┐
           │  RETRY OR     │
           │  FALLBACK?    │
           └───────┬───────┘
                   │
           ┌───────┴───────┐
         RETRY         FALLBACK
           │               │
           ▼               ▼
    ┌───────────┐   ┌───────────┐
    │  SAME OP  │   │ ALT PATH  │
    │  (retry)  │   │           │
    └───────────┘   └───────────┘
```

---

## Tool I/O Reference

| Tool Category | Input Type | Output Type |
|---------------|------------|-------------|
| context7 | string (library name) | markdown (documentation) |
| productivity/web_search | string (query) | JSON (search results) |
| filesystem/read_file | string (path) | string (file contents) |
| filesystem/write_file | string (path + content) | boolean (success) |
| git/* | string (repo_path) | string (status/diff) |
| github/* | strings (owner, repo) | JSON (API response) |
| terraform/* | string (directory) | string (plan/output) |
| aws-cli/* | varies | JSON (AWS response) |
| coding-agent/execute | string (description) | code changes |
| sequential-thinking | string (thought) | structured reasoning |
| swarm/* | string (goal + config) | task results |

---

## Quick Reference: Common Chains

| Use Case | Chain |
|----------|-------|
| Bug Fix | scan_tasks → coding_execute → git_add → git_commit → create_pr |
| Deploy | git_push → create_pr → merge_pr → render_deploy → cloudwatch_logs |
| Research | web_search → read_webpage → resolve_lib → get_docs → write_file |
| Infra | get_identity → tf_init → tf_plan → tf_apply → describe_instances |
| Collab | create_task → send_desktop → read_cli → complete_task |

---

*Generated by MCP Tool Discovery & Orchestration System*
