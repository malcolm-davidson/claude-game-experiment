---
project: drakenrider
schema_version: "1.0"
created: Fri Feb 20 2026 13:17:40 GMT-0800 (Pacific Standard Time)
updated: 2026-02-21T05:17:24.862Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 6
---

## Tasks

### TASK-001 · Study new sprites in assets and incorperate their use in the game

```yaml
id: TASK-001
status: done
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-20T21:18:46.087Z
updated_at: 2026-02-20T21:35:19.088Z
history:
  - ts: 2026-02-20T21:18:46.087Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-20T21:27:06.942Z
    who: "@claude-code"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-20T21:35:19.088Z
    who: "@claude-code"
    action: completed
    from: in_progress
    to: done
```

### TASK-002 · BootScene: Load Tiny Dungeon assets & remove procedural textures

```yaml
id: TASK-002
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-20T21:31:29.410Z
updated_at: 2026-02-20T21:34:59.503Z
history:
  - ts: 2026-02-20T21:31:29.410Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-20T21:32:47.985Z
    who: "@claude-agent-002"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-20T21:34:59.503Z
    who: "@claude-agent-002"
    action: completed
    from: in_progress
    to: done
```

### TASK-003 · EnemyWyvern: Switch to griffin sprite with walk animation

```yaml
id: TASK-003
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-20T21:31:32.718Z
updated_at: 2026-02-20T21:34:26.772Z
history:
  - ts: 2026-02-20T21:31:32.718Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-20T21:32:55.287Z
    who: "@claude-agent-003"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-20T21:34:26.772Z
    who: "@claude-agent-003"
    action: completed
    from: in_progress
    to: done
```

### TASK-004 · LootSystem: Use item sprites per upgrade type

```yaml
id: TASK-004
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-20T21:31:33.427Z
updated_at: 2026-02-20T21:33:39.017Z
history:
  - ts: 2026-02-20T21:31:33.427Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-20T21:33:04.769Z
    who: "@claude-agent-004"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-20T21:33:39.017Z
    who: "@claude-agent-004"
    action: completed
    from: in_progress
    to: done
```

### TASK-005 · EnemyWyvern: Apply sprite from td_monsters sheet

```yaml
id: TASK-005
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-21T05:16:23.125Z
updated_at: 2026-02-21T05:17:24.862Z
tags:
  - sprites
  - enemies
history:
  - ts: 2026-02-21T05:16:23.125Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-21T05:17:24.862Z
    who: "@claude-code"
    action: commented
    note: EnemyWyvern already uses griffin from td_monsters. Task should cover
      adding more enemy variety — e.g. bat, skeleton, dragon, goblin etc. — each
      with their own walk/flap animation frames from td_monsters.
```
