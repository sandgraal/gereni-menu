# AI Agent State Directory

**Purpose:** Track agent execution state, coordination, and queued operations.

---

## Overview

This directory contains state files used by the AI agent system for:

- Tracking active/pending agent operations
- Coordinating multi-agent workflows
- Maintaining execution queues
- Storing temporary agent data

---

## File Structure

### `agents.json` (Optional)

Tracks the status and coordination of all agents in the system.

**Example Structure:**

```json
{
  "last_updated": "2025-11-02T12:00:00.000Z",
  "agents": {
    "menu-content": {
      "status": "idle",
      "last_run": "2025-11-02T10:30:00.000Z",
      "next_scheduled": null
    },
    "menu-image": {
      "status": "running",
      "last_run": "2025-11-02T12:00:00.000Z",
      "next_scheduled": null
    },
    "menu-data": {
      "status": "idle",
      "last_run": "2025-11-01T15:00:00.000Z",
      "next_scheduled": "2025-11-03T00:00:00.000Z"
    }
  }
}
```

**Status Values:**

- `idle` — Agent available for work
- `running` — Agent currently executing
- `scheduled` — Agent queued for future execution
- `error` — Agent failed last execution
- `disabled` — Agent temporarily disabled

### `queue.json` (Optional)

Maintains a queue of pending operations for coordinated workflows.

**Example Structure:**

```json
{
  "last_updated": "2025-11-02T12:00:00.000Z",
  "queue": [
    {
      "id": "task-001",
      "agent": "menu-content",
      "operation": "sync-menu",
      "priority": 1,
      "created_at": "2025-11-02T11:00:00.000Z",
      "dependencies": []
    },
    {
      "id": "task-002",
      "agent": "menu-image",
      "operation": "optimize-photos",
      "priority": 2,
      "created_at": "2025-11-02T11:05:00.000Z",
      "dependencies": ["task-001"]
    }
  ]
}
```

### `locks/` (Optional)

Directory for file-based locks to prevent concurrent agent execution.

**Example:**

- `locks/menu-content.lock` — Created when menu-content agent starts
- Lock file contains: `{"pid": 12345, "started_at": "2025-11-02T12:00:00.000Z"}`
- Removed when agent completes

---

## Usage

### Manual Queue Operations

**Check agent status:**

```bash
cat ai/_state/agents.json | jq '.agents["menu-content"]'
```

**Add to queue:**

```javascript
// Example: Add task to queue
const queue = require("./ai/_state/queue.json");
queue.queue.push({
  id: `task-${Date.now()}`,
  agent: "menu-content",
  operation: "rebuild-menu",
  priority: 1,
  created_at: new Date().toISOString(),
  dependencies: [],
});
fs.writeFileSync("ai/_state/queue.json", JSON.stringify(queue, null, 2));
```

### Automated State Management

Agents can read and update state files as part of their execution:

```javascript
// Example: Update agent status
import { readFileSync, writeFileSync } from "fs";

const statePath = "ai/_state/agents.json";
const state = JSON.parse(readFileSync(statePath, "utf8"));

state.agents["menu-content"] = {
  status: "running",
  last_run: new Date().toISOString(),
  next_scheduled: null,
};

writeFileSync(statePath, JSON.stringify(state, null, 2));
```

---

## Current Implementation

**Status:** MINIMAL (v1.0)

The current system uses:

- ✅ `ai/logs/*.jsonl` for execution logging (primary tracking)
- ⚠️ `ai/_state/` directory created but state files not yet implemented
- ⚠️ No queue coordination (agents run independently)

**Why Minimal?**
The project currently uses simple, independent agents that:

- Trigger via GitHub Actions on file changes
- Don't require coordination (no dependencies between agents)
- Log to JSONL files for observability
- Run idempotently (safe to re-run)

---

## Future Enhancements

### Phase 1: Basic State Tracking

- [ ] Implement `agents.json` for status tracking
- [ ] Add read/write utilities in `ai/scripts/state-utils.mjs`
- [ ] Update agent scripts to report status
- [ ] Create dashboard to visualize agent states

### Phase 2: Queue Coordination

- [ ] Implement `queue.json` for task management
- [ ] Add priority-based execution
- [ ] Support task dependencies
- [ ] Enable manual task triggering

### Phase 3: Advanced Coordination

- [ ] File-based locking for concurrency control
- [ ] Distributed agent execution (multi-runner)
- [ ] Retry logic with exponential backoff
- [ ] Health checks and auto-recovery

---

## Best Practices

### State File Management

1. **Atomic Writes:** Use temp file + rename for atomic updates
2. **Version Control:** Add `agents.json` and `queue.json` to `.gitignore`
3. **Schema Validation:** Validate structure before writing
4. **Backup:** Keep last-known-good state in `_state/backups/`

### Coordination

1. **Idempotency:** Agents should be safe to re-run
2. **Timeout:** Set max execution time for agents
3. **Cleanup:** Remove stale locks older than timeout period
4. **Logging:** Log all state changes to JSONL logs

### Error Handling

1. **Graceful Degradation:** If state files missing, agents run independently
2. **Lock Cleanup:** Remove locks on error or timeout
3. **Queue Retry:** Failed tasks return to queue with backoff
4. **Status Recovery:** Reset stuck agents to idle after timeout

---

## Troubleshooting

### Agent Stuck in "Running" Status

```bash
# Check if agent process is actually running
ps aux | grep menu-content

# If not running, reset status
jq '.agents["menu-content"].status = "idle"' ai/_state/agents.json > tmp.json
mv tmp.json ai/_state/agents.json
```

### Stale Lock Files

```bash
# Remove all locks older than 1 hour
find ai/_state/locks -name "*.lock" -mtime +1h -delete
```

### Queue Not Processing

```bash
# Check queue status
cat ai/_state/queue.json | jq '.queue | length'

# Manually trigger queue processing
node ai/scripts/process-queue.mjs
```

---

## Related Documents

- [`AGENTS.md`](../../AGENTS.md) — Agent system overview
- [`ai/scripts/`](../scripts/) — Agent implementation scripts
- [`ai/logs/`](../logs/) — Execution logs (JSONL format)
- [`.github/workflows/ai-agents.yml`](../../.github/workflows/ai-agents.yml) — CI/CD integration

---

## Notes

- **Git Ignore:** State files (agents.json, queue.json) should be gitignored to avoid conflicts
- **Initialization:** Directory created by bootstrap.mjs, state files created on-demand
- **Logs vs State:** Logs are append-only history; state is current snapshot
- **File Signaling:** Alternative to state files; use file presence as signals (e.g., `_state/triggers/rebuild-menu.flag`)

---

**Created:** 2025-11-02  
**Last Updated:** 2025-11-02  
**Status:** Documentation complete, implementation pending
