---
project: drakenrider
schema_version: "1.0"
created: Fri Feb 20 2026 13:17:40 GMT-0800 (Pacific Standard Time)
updated: 2026-02-22T06:36:19.274Z
default_workflow: [backlog, todo, in_progress, review, done]
id_prefix: TASK
next_id: 40
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
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-21T05:16:23.125Z
updated_at: 2026-02-21T05:24:52.515Z
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
  - ts: 2026-02-21T05:21:01.413Z
    who: "@claude-code"
    action: commented
    note: >-
      Refined scope: 

      1. BootScene: load sprites for bat (d1/d2), demon (d1/d2), dragon (d1/d2),
      moth (d1/d2)

      2. Refactor EnemyWyvern into a config-driven Enemy class with type param
      (hp, speed, size, shootInterval, sprite key)

      3. WaveManager: pass enemy type to scene.spawnEnemy() based on wave number
      (bat early, demon/dragon later)

      4. GameScene.spawnEnemy(x, y, type) routes to correct enemy config

      Chosen types: bat (fast/weak), griffin (current), moth (medium), demon
      (tough), dragon (boss)
  - ts: 2026-02-21T05:24:52.515Z
    who: "@claude-maestro"
    action: completed
    from: backlog
    to: done
```

### TASK-006 · BootScene: load sprites for bat, demon, dragon, moth

```yaml
id: TASK-006
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-21T05:21:06.132Z
updated_at: 2026-02-21T05:24:51.703Z
tags:
  - sprites
  - boot
history:
  - ts: 2026-02-21T05:21:06.132Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-21T05:21:09.045Z
    who: "@claude-maestro"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-21T05:24:51.703Z
    who: "@claude-maestro"
    action: completed
    from: in_progress
    to: done
```

### TASK-007 · Enemy: refactor EnemyWyvern into config-driven Enemy class with type support

```yaml
id: TASK-007
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-21T05:21:06.368Z
updated_at: 2026-02-21T05:24:51.932Z
tags:
  - enemies
  - refactor
history:
  - ts: 2026-02-21T05:21:06.368Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-21T05:21:09.272Z
    who: "@claude-maestro"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-21T05:24:51.932Z
    who: "@claude-maestro"
    action: completed
    from: in_progress
    to: done
```

### TASK-008 · WaveManager + GameScene: spawn enemy variety by wave

```yaml
id: TASK-008
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-21T05:21:06.595Z
updated_at: 2026-02-21T05:24:52.192Z
tags:
  - enemies
  - waves
history:
  - ts: 2026-02-21T05:21:06.595Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-21T05:21:09.507Z
    who: "@claude-maestro"
    action: claimed
    from: backlog
    to: in_progress
  - ts: 2026-02-21T05:24:52.192Z
    who: "@claude-maestro"
    action: completed
    from: in_progress
    to: done
```

### TASK-009 · Create upgrade system

```yaml
id: TASK-009
status: done
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T05:25:34.193Z
updated_at: 2026-02-22T06:34:07.475Z
tags:
  - gameplay
  - upgrades
  - gh-10
history:
  - ts: 2026-02-22T05:25:34.193Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-22T06:34:07.475Z
    who: "@plan"
    action: completed
    from: backlog
    to: done
```

> Fast-paced upgrade section appearing at end of a section. Simon-like mini game to trigger certain upgrades. GH Issue #10

### TASK-010 · Add static collectibles

```yaml
id: TASK-010
status: done
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T05:25:36.851Z
updated_at: 2026-02-22T06:34:07.665Z
tags:
  - gameplay
  - collectibles
  - gh-7
history:
  - ts: 2026-02-22T05:25:36.851Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-22T06:34:07.665Z
    who: "@plan"
    action: completed
    from: backlog
    to: done
```

> Collectibles appear on screen; player crosses them to add loot. Collection spins the word 'plunder'. Future: good/bad aligned pop-ups depending on build/alignment path. GH Issue #7

### TASK-011 · Improve gameplay balance

```yaml
id: TASK-011
status: done
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T05:25:38.124Z
updated_at: 2026-02-22T06:34:07.843Z
tags:
  - balance
  - gameplay
  - gh-18
history:
  - ts: 2026-02-22T05:25:38.124Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-22T06:34:07.843Z
    who: "@plan"
    action: completed
    from: backlog
    to: done
```

> Game is currently too easy. Adjust difficulty — enemy speed, spawn rates, damage values, or wave scaling. GH Issue #18

### TASK-012 · Add enemy escape penalty

```yaml
id: TASK-012
status: done
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T05:25:39.443Z
updated_at: 2026-02-22T06:34:08.018Z
tags:
  - gameplay
  - enemies
  - gh-16
history:
  - ts: 2026-02-22T05:25:39.443Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-22T06:34:08.018Z
    who: "@plan"
    action: completed
    from: backlog
    to: done
```

> Enemies that pass the bottom of the screen should accumulate into a significant penalty (rather than silently despawning). GH Issue #16

### TASK-013 · Add high score page

```yaml
id: TASK-013
status: done
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T05:25:42.682Z
updated_at: 2026-02-22T06:34:08.186Z
tags:
  - ui
  - scores
  - gh-5
history:
  - ts: 2026-02-22T05:25:42.682Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-22T06:34:08.186Z
    who: "@plan"
    action: completed
    from: backlog
    to: done
```

> Add a high score leaderboard/page to the game. GH Issue #5

### TASK-014 · Add GitHub likes and coffee tips section

```yaml
id: TASK-014
status: done
priority: low
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T05:25:43.828Z
updated_at: 2026-02-22T06:34:08.358Z
tags:
  - ui
  - community
  - gh-6
history:
  - ts: 2026-02-22T05:25:43.828Z
    who: "@malcolm-davidson"
    action: created
  - ts: 2026-02-22T06:34:08.358Z
    who: "@plan"
    action: completed
    from: backlog
    to: done
```

> Add a section/screen in the game for GitHub likes and coffee tip links. GH Issue #6

### TASK-015 · EPIC-A-01: Refactor WaveManager → ArenaManager

```yaml
id: TASK-015
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:37.167Z
updated_at: 2026-02-22T06:34:37.167Z
tags:
  - epic-a
  - systems
  - foundation
history:
  - ts: 2026-02-22T06:34:37.167Z
    who: "@malcolm-davidson"
    action: created
```

> Replace WaveManager with ArenaManager. Add arena phases (spawning/elite_warning/transitioning), tunable arena duration (~60s), arena-start/arena-end/run-end events. Preserve _poolForArena() enemy pool logic. Files: src/systems/ArenaManager.js (new), src/scenes/GameScene.js

### TASK-016 · EPIC-A-02: Add Dash action to Player

```yaml
id: TASK-016
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:37.341Z
updated_at: 2026-02-22T06:34:37.341Z
tags:
  - epic-a
  - player
  - foundation
history:
  - ts: 2026-02-22T06:34:37.341Z
    who: "@malcolm-davidson"
    action: created
```

> Add dash mechanic: 2 charges, ~120ms iframes (_dashing flag), dashCharges registry key, particle burst on dash. Input: double-tap direction or Shift/X key. File: src/entities/Player.js

### TASK-017 · EPIC-A-03: Pre-populate registry schema in GameScene

```yaml
id: TASK-017
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:37.510Z
updated_at: 2026-02-22T06:34:37.510Z
tags:
  - epic-a
  - foundation
  - registry
history:
  - ts: 2026-02-22T06:34:37.510Z
    who: "@malcolm-davidson"
    action: created
```

> In GameScene.create(), pre-populate all new registry keys so UIScene can safely read without null checks: essence_black/purple/red/green (0), devotion_* (from localStorage or 0), dashCharges/maxDashCharges (2), arenaIndex, arenaPhase, marketTileActive (false). File: src/scenes/GameScene.js

### TASK-018 · EPIC-A-04: Upgrade gameOver() to run-end flow

```yaml
id: TASK-018
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:37.681Z
updated_at: 2026-02-22T06:34:37.681Z
tags:
  - epic-a
  - foundation
  - scenes
history:
  - ts: 2026-02-22T06:34:37.681Z
    who: "@malcolm-davidson"
    action: created
```

> Stop all systems, emit run-end with stats payload (score, essence earned/spent by colour, arenas completed), navigate to stub SummaryScene, reset all A-03 registry keys on restart. File: src/scenes/GameScene.js

### TASK-019 · EPIC-B-01: ZoneManager — zone constants and player zone tracking

```yaml
id: TASK-019
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:55.214Z
updated_at: 2026-02-22T06:34:55.214Z
tags:
  - epic-b
  - systems
  - zones
history:
  - ts: 2026-02-22T06:34:55.214Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/systems/ZoneManager.js with ZONES constants (Bottom y:430-640, Middle y:200-430, Top y:0-200, each with label and reward multiplier), getZone(y), getPlayerZone(player). GameScene calls each frame, writes playerZone to registry. Unblocks: D-01, F-01, I-02.

### TASK-020 · EPIC-B-02: World-space zone visual bands

```yaml
id: TASK-020
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:55.383Z
updated_at: 2026-02-22T06:34:55.383Z
tags:
  - epic-b
  - visuals
  - zones
history:
  - ts: 2026-02-22T06:34:55.383Z
    who: "@malcolm-davidson"
    action: created
```

> In GameScene render subtle semi-transparent horizontal strips at zone boundaries (alpha 0.08-0.12). Dark red at top, neutral in middle, blue-grey at bottom. Scrolls with bg.tilePositionY. File: src/scenes/GameScene.js

### TASK-021 · EPIC-B-03: Zone-aware enemy spawn weighting in ArenaManager

```yaml
id: TASK-021
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:34:55.558Z
updated_at: 2026-02-22T06:34:55.558Z
tags:
  - epic-b
  - systems
  - zones
history:
  - ts: 2026-02-22T06:34:55.558Z
    who: "@malcolm-davidson"
    action: created
```

> Update ArenaManager _poolForArena() so top zone enemies get +20% speed and higher essence drop chance; bottom zone has fewer enemies but higher loot rate. Adds zoneBonus property to spawn config. File: src/systems/ArenaManager.js

### TASK-022 · EPIC-C-01: EssenceManager — 4-colour registry model

```yaml
id: TASK-022
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:15.698Z
updated_at: 2026-02-22T06:35:15.698Z
tags:
  - epic-c
  - economy
  - systems
history:
  - ts: 2026-02-22T06:35:15.698Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/systems/EssenceManager.js: gain(color, amount, source), spend(color, amount), canAfford(costs), getAll(). Emits essence-gained/essence-spent events via scene.events. Writes registry keys from A-03. source param used by DevotionManager (H-01).

### TASK-023 · EPIC-C-02: Colour-coded essence drops from enemies

```yaml
id: TASK-023
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:15.870Z
updated_at: 2026-02-22T06:35:15.870Z
tags:
  - epic-c
  - economy
  - enemies
history:
  - ts: 2026-02-22T06:35:15.870Z
    who: "@malcolm-davidson"
    action: created
```

> Extend LootSystem.tryDrop() to drop coloured essence orbs. Type-to-colour affinity: bat=purple, griffin=red, moth=green, demon=black, dragon=black+red mix. Use gem sprites (gem_amethyst, gem_ruby, gem_jade, skull) from td_items. Overlap-to-collect calls essenceManager.gain(color, 1, 'kill'). Supersedes TASK-010.

### TASK-024 · EPIC-C-03: Essence HUD row in UIScene

```yaml
id: TASK-024
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:16.052Z
updated_at: 2026-02-22T06:35:16.052Z
tags:
  - epic-c
  - economy
  - ui
history:
  - ts: 2026-02-22T06:35:16.052Z
    who: "@malcolm-davidson"
    action: created
```

> Add 4-icon row to UIScene (bottom or right side). Each slot: gem icon + count text. Pulse tween on gain (scale 1→1.3→1, 200ms). Dim/highlight affordability based on marketTileActive/ritualActive registry. Accessibility: letter label (B/P/R/G) per colour slot. File: src/scenes/UIScene.js

### TASK-025 · EPIC-C-04: Unit tests for EssenceManager

```yaml
id: TASK-025
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:16.229Z
updated_at: 2026-02-22T06:35:16.229Z
tags:
  - epic-c
  - economy
  - tests
history:
  - ts: 2026-02-22T06:35:16.229Z
    who: "@malcolm-davidson"
    action: created
```

> Add src/__tests__/EssenceManager.test.js: gain/spend/canAfford logic (pure, no Phaser), reject spend below zero, event emission with vi.fn() mocks. Follow CollisionHandlers.test.js pattern.

### TASK-026 · EPIC-D-01: TileManager — spawn and scroll system

```yaml
id: TASK-026
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:32.910Z
updated_at: 2026-02-22T06:35:32.910Z
tags:
  - epic-d
  - tiles
  - systems
history:
  - ts: 2026-02-22T06:35:32.910Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/systems/TileManager.js: spawns tiles at zone-appropriate Y band, tile has physics overlap body, type config {type, textureKey, radius}, manages lifecycle (destroy at y>700). scene.tacTiles group. ArenaManager calls tileManager.spawnTile(type, zone) at intervals.

### TASK-027 · EPIC-D-02: Pit tile — instant kill on enemy contact

```yaml
id: TASK-027
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:33.084Z
updated_at: 2026-02-22T06:35:33.084Z
tags:
  - epic-d
  - tiles
  - enemies
history:
  - ts: 2026-02-22T06:35:33.084Z
    who: "@malcolm-davidson"
    action: created
```

> First tile type. Visual: td_world_floor_pit.png. Behaviour: enemy overlaps pit → takeDamage(entity.hp) (instant kill) + particle burst. Pit stays active for scroll lifetime. Depends on D-01.

### TASK-028 · EPIC-D-03: Silence tile — suppress enemy shooting

```yaml
id: TASK-028
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:33.259Z
updated_at: 2026-02-22T06:35:33.259Z
tags:
  - epic-d
  - tiles
  - enemies
history:
  - ts: 2026-02-22T06:35:33.259Z
    who: "@malcolm-davidson"
    action: created
```

> Add _silenced flag to EnemyWyvern. When overlapping Silence tile, suppress _shootTimer. Flag cleared each frame if not overlapping. Visual: purple-tinted tile or voidimpact FX overlay. Files: src/entities/EnemyWyvern.js, src/systems/TileManager.js

### TASK-029 · EPIC-D-04: Weakness tile — enemies take double damage

```yaml
id: TASK-029
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:33.435Z
updated_at: 2026-02-22T06:35:33.435Z
tags:
  - epic-d
  - tiles
  - enemies
history:
  - ts: 2026-02-22T06:35:33.435Z
    who: "@malcolm-davidson"
    action: created
```

> Add _weakened flag to EnemyWyvern. When overlapping Weakness tile, takeDamage(amount) deals amount*2. Visual: red-tinted td_world_trap.png. Files: src/entities/EnemyWyvern.js, src/systems/TileManager.js

### TASK-030 · EPIC-D-05: Slow tile — halve enemy move speed

```yaml
id: TASK-030
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:33.611Z
updated_at: 2026-02-22T06:35:33.611Z
tags:
  - epic-d
  - tiles
  - enemies
history:
  - ts: 2026-02-22T06:35:33.611Z
    who: "@malcolm-davidson"
    action: created
```

> Add _slowed flag to EnemyWyvern. When overlapping Slow tile, velocity Y *= 0.5. Velocity restored on exit (overlap exit tracking). Visual: blue-tinted floor tile. Files: src/entities/EnemyWyvern.js, src/systems/TileManager.js

### TASK-031 · EPIC-E-01: Escape tracking and token accumulation in ArenaManager

```yaml
id: TASK-031
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:43.171Z
updated_at: 2026-02-22T06:35:43.171Z
tags:
  - epic-e
  - wave-memory
  - enemies
history:
  - ts: 2026-02-22T06:35:43.171Z
    who: "@malcolm-davidson"
    action: created
```

> Replace silent y>700 destroy in EnemyWyvern with arenaManager.recordEscape(type). ArenaManager maintains _escapeTokens = {melee, ranged, defense}. Type-to-category: bat/griffin/dragon=melee, moth/demon=ranged. Tokens accumulate within a run. Supersedes TASK-012. Files: src/entities/EnemyWyvern.js, src/systems/ArenaManager.js

### TASK-032 · EPIC-E-02: Token-weighted spawn pool

```yaml
id: TASK-032
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:43.346Z
updated_at: 2026-02-22T06:35:43.346Z
tags:
  - epic-e
  - wave-memory
  - enemies
history:
  - ts: 2026-02-22T06:35:43.346Z
    who: "@malcolm-davidson"
    action: created
```

> Update ArenaManager _poolForArena() to weight enemy type selection by escape tokens (+1 weight per token per category, cap +5). Emit arena-escape-penalty event. Brief screen toast 'X escaped — more incoming!' using existing wave-announcement tween pattern. File: src/systems/ArenaManager.js

### TASK-033 · EPIC-F-01: MarketTile — world object with despawn timer

```yaml
id: TASK-033
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:57.846Z
updated_at: 2026-02-22T06:35:57.846Z
tags:
  - epic-f
  - market
  - tiles
history:
  - ts: 2026-02-22T06:35:57.846Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/entities/MarketTile.js: world-space tile with despawn timer (~15s), timer ring visual, zone determines item tier. Writes marketTileActive, marketTileX/Y, marketTileTier, marketTileTimeRemaining to registry. ArenaManager spawns one per arena at midpoint.

### TASK-034 · EPIC-F-02: Market item pool and pricing data

```yaml
id: TASK-034
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:58.027Z
updated_at: 2026-02-22T06:35:58.027Z
tags:
  - epic-f
  - market
  - data
history:
  - ts: 2026-02-22T06:35:58.027Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/data/MarketItems.js: 12-16 items {id, label, effect, cost: {color: n}, tier}. Spans all 4 colours. Tier 1=cheap, Tier 2=moderate, Tier 3=top-zone only. Apply via player.applyUpgrade() where possible, new handlers for ritual resources (Thread).

### TASK-035 · EPIC-F-03: Market interaction micro-panel

```yaml
id: TASK-035
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:58.205Z
updated_at: 2026-02-22T06:35:58.205Z
tags:
  - epic-f
  - market
  - ui
history:
  - ts: 2026-02-22T06:35:58.205Z
    who: "@malcolm-davidson"
    action: created
```

> Physics overlap with MarketTile triggers: scene.physics.world.timeScale=0.3, 160x200 overlay panel opens near tile, shows 2-3 zone-tier-filtered items with icon+label+colour costs, affordability states, one-button purchase flow. Restores time scale on close. Files: src/entities/MarketTile.js, src/scenes/GameScene.js

### TASK-036 · EPIC-F-04: Unit tests for MarketItems and affordability

```yaml
id: TASK-036
status: backlog
priority: medium
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:35:58.382Z
updated_at: 2026-02-22T06:35:58.382Z
tags:
  - epic-f
  - market
  - tests
history:
  - ts: 2026-02-22T06:35:58.382Z
    who: "@malcolm-davidson"
    action: created
```

> Unit tests for MarketItems data file (tier filtering, cost structure) and affordability check path. No Phaser dependency. File: src/__tests__/MarketItems.test.js

### TASK-037 · EPIC-G-01: RitualManager — sigil sequence engine

```yaml
id: TASK-037
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:36:18.912Z
updated_at: 2026-02-22T06:36:18.912Z
tags:
  - epic-g
  - ritual
  - systems
history:
  - ts: 2026-02-22T06:36:18.912Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/systems/RitualManager.js (pure logic, no Phaser). State machine: idle→revealing→waiting_input→result→done. Generates colour sigil sequence (5-8 steps). Methods: startRitual(threadCount), match(color), skip(), bank(). Computes Depth (match count) + Resonance (colour pattern score, consecutive same=bonus). Takes callback/event bus. Supersedes TASK-009.

### TASK-038 · EPIC-G-02: Ritual outcome rewards data

```yaml
id: TASK-038
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:36:19.096Z
updated_at: 2026-02-22T06:36:19.096Z
tags:
  - epic-g
  - ritual
  - data
history:
  - ts: 2026-02-22T06:36:19.096Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/data/RitualRewards.js: maps (depth, resonance) to reward definitions. Low=minor stat bumps via player.applyUpgrade(), high=compound effects ('all essence gain +1 for rest of run'), very high=rare placeholder slots. File: src/data/RitualRewards.js

### TASK-039 · EPIC-G-03: RitualScene overlay

```yaml
id: TASK-039
status: backlog
priority: high
assigned_to: null
claimed_by: null
created_by: "@malcolm-davidson"
created_at: 2026-02-22T06:36:19.274Z
updated_at: 2026-02-22T06:36:19.274Z
tags:
  - epic-g
  - ritual
  - scenes
history:
  - ts: 2026-02-22T06:36:19.274Z
    who: "@malcolm-davidson"
    action: created
```

> Create src/scenes/RitualScene.js — launches over GameScene at arena-end event. Shows: current sigil (large + colour icon), sequence history (row of small icons), Thread count, Depth, Resonance bar, available Essence. Input: 4 colour Match buttons + Skip + Bank. Preview consequences before input. Applies RitualManager outcome on completion, resumes game.
