# Ashfall Tactics — Design Wrap-Up (Agent Handoff)
## Balanced Hybrid Scrolling Tactical Roguelite (Updated Progression + Economy + UI)

> This document summarizes the current agreed design direction, including the tactical scrolling core, Fourfold Rite upgrade system, Market Tile economy, Devotion meta progression, and required run UI components.

---

## 1) High Concept

**Ashfall Tactics** is a **real-time positional roguelite** that blends:

- vertical scrolling battlefield pressure (arcade tension)
- chess-like positional importance (space, routing, threat reading)
- environmental tactics (special tiles)
- short chained encounters (snackable runs)
- a color-based economy and ritual upgrade system

The player controls a **dragon rider** in a top-down scrolling battlefield and must decide:
- where to fly (risk/reward by board position),
- which opportunities to route toward (market/ritual tiles),
- what essence to spend now vs save,
- and which color devotion path to pursue long-term.

---

## 2) Core Design Pillars

1. **Positional Play Over Raw DPS**
   - Space, timing, and routing matter more than stat stacking.
   - Environmental tiles and enemy formations create tactical puzzles.

2. **Continuous Pressure + Tactical Decisions**
   - Battlefield scrolls continuously, but key moments can use soft slowdowns.
   - Real-time play remains readable and strategic.

3. **Risk-Reward by Vertical Position**
   - Bottom = safer, more information, weaker rewards
   - Top = more danger, less information, better rewards

4. **Dual Paths to Power**
   - Immediate in-run strength via Market + Ritual
   - Long-term progression via persistent Devotion unlocks

5. **Complexity via Interactions**
   - Enemy + tile + zone + economy interactions create depth
   - Avoid overly complex single systems

---

## 3) Run Structure

### 3.1 Encounter / Arena Duration
- **Arena:** ~45–90 seconds
- **Run:** ~3–6 arenas (5–8 minutes target for MVP+)

### 3.2 Micro Loop (during arena)
1. Read incoming formations and special tiles
2. Manage position within top/mid/bottom risk zones
3. Collect colored Essence
4. Decide whether to route to Market / Ritual opportunities
5. Survive/complete objective
6. Transition to next arena (or continue chain)

---

## 4) Battlefield Model

### 4.1 Scroll Tempo (Balanced Hybrid)
- **Base mode:** slow continuous vertical scroll
- **Tactical interruptions:** brief slow/pause during elite telegraphs, ritual interactions, or key objective phases

This preserves flow while allowing deeper reads in important moments.

### 4.2 Player Control Model
- Free movement (8-direction)
- Basic attack (projectile)
- Dash / mobility action
- Hidden tactical grid may be used for tile interactions and wave logic

### 4.3 Vertical Risk Zones (Signature Mechanic)
The visible battlefield is conceptually split into 3 zones:

- **Bottom (Safe / Tactical)**
  - Highest information quality
  - Lower enemy density
  - Lower reward quality

- **Middle (Balanced)**
  - Standard density and telegraphing

- **Top (Chaos / High Reward)**
  - Higher density and pressure
  - Shorter telegraphs / lower perfect information
  - Better loot and higher-tier opportunity spawns

---

## 5) Special Tactical Tiles (Board as Weapon)

Tiles are a core part of positional play. They interact with enemies (and optionally player later).

### MVP Tile Types
1. **Pit**
   - destroys/traps enemies crossing it

2. **Silence**
   - enemies on tile cannot shoot

3. **Weakness**
   - enemies on tile take bonus damage / lose armor

4. **Slow / Grasp**
   - enemies on tile move slower

### Design Rule
Tiles should be:
- visually distinct
- instantly readable
- tactically meaningful in under 1 second

---

## 6) Enemy Progression + Wave Memory

### 6.1 Enemy Complexity Ladder (MVP starts simple)
- Contact enemies (crawler/pawn)
- Shooters
- Chargers
- Shield/defense units

### 6.2 Recurrence / Wave Memory
Escaped enemies influence future waves (simple weighted token model):
- melee escaped → increases melee token weight
- ranged escaped → increases ranged token weight
- defense escaped → increases defense token weight

This gives the battlefield memory and makes immediate decisions affect future pressure.

---

## 7) Four-Color Essence System (In-Run Economy)

The game uses four elemental **Essence** colors collected during a run:

- **Black** — necromancy, aging, death
- **Purple** — knowledge, time, deception
- **Red** — fire, birth, creation
- **Green** — nature, change

### Opposition Pairs (thematic + mechanical)
- **Black ↔ Red**
- **Purple ↔ Green**

Essence is an **in-run temporary resource**:
- spent at **Market Tiles**
- spent in the **Fourfold Rite**
- **does not persist after death**

This makes spend/save decisions meaningful in each run.

---

## 8) Dual-Sink Economy (Essence Value)

Essence is valuable because it can be spent in **two different systems** with different roles.

### 8.1 Market Tile (Reliable Value)
- board-embedded opportunity
- purchases passives, equipment, utility, ritual support
- predictable / lower-risk value
- forces positional routing decisions

### 8.2 Fourfold Rite (Volatile Build Power)
- ritual system with Depth vs Resonance tradeoffs
- higher upside and stronger synergy shaping
- consumes Essence and other ritual resources (Thread)

### Strategic Tension
Players must choose:
- spend now for build power
- save for guaranteed market purchases
- preserve specific colors to maintain synergy/devotion goals

---

## 9) Market Tile System (Board-Embedded Shop)

### 9.1 Core Concept
A **Market Tile** spawns semi-periodically on the battlefield. The player must route to it and interact before it scrolls away.

This makes shopping a **positional/risk decision**, not a guaranteed menu action.

### 9.2 Market Tile Behavior (MVP recommendation)
- Spawns roughly once per arena (tunable)
- Spawned in top/mid/bottom zone (tier affected by zone)
- Exists for a limited time / scroll distance
- Interact by entering radius + input (or auto-open)
- Offers **2–3 items max**
- Uses **small overlay panel**, not full menu

### 9.3 Time Behavior at Market (Balanced Hybrid)
- **Soft slowdown / sanctuary window** recommended
  - local or global time slows briefly while interacting
- Avoid full pause in default mode (can be later option/mode)

### 9.4 Market Inventory Role
Market sells **reliable** upgrades:
- passives
- equipment
- utility
- ritual support items (Thread, preview, insurance)
- consumables

Market should **not** replace ritual build-defining upgrades.

---

## 10) Fourfold Rite Upgrade System (Depth vs Resonance)

The Fourfold Rite is the main high-variance build-shaping upgrade system.

### 10.1 Ritual Resources
- **Essence** (Black/Purple/Red/Green)
- **Thread** (finite ritual skip resource)
- **Depth** (power tier earned by matching revealed steps)
- **Resonance** (synergy quality based on spent color composition/pattern)

### 10.2 Ritual Flow (refined)
A ritual reveals a sequence of colored sigils one step at a time.

For each revealed step, player chooses:

#### A) Match
- Spend **1 Essence** of the revealed color
- Gain **+1 Depth**
- Commit build identity toward that color / pattern

#### B) Skip
- Spend no Essence
- Lose **1 Thread**
- Preserve Essence and potentially maintain desired synergy/devotion direction

Ritual ends when:
- player **banks** the current outcome, or
- sequence ends, or
- **Thread** is depleted

### 10.3 Outcome Model
Final ritual reward depends on both:
- **Depth** (raw power tier)
- **Resonance** (synergy modifier / variant)

This creates two viable routes to strength:
- **Deep rituals** (higher raw power)
- **High-resonance rituals** (stronger synergy and efficiency)

### 10.4 Opposition Interaction (future-ready)
Mixing opposed colors can:
- increase potential power
- reduce stability
- add drawbacks or increased ritual difficulty

This should be explicit and readable in UI.

---

## 11) Devotion (Persistent Meta Progression)

### 11.1 Devotion vs Essence
- **Essence** = temporary in-run resource (lost on death)
- **Devotion** = persistent meta progression (survives across runs)

This distinction must be clear in both design and UI.

### 11.2 Devotion Tracks
Persistent values by color:
- devotion.black
- devotion.purple
- devotion.red
- devotion.green

### 11.3 How Devotion Is Earned (recommended)
Devotion should reflect **commitment**, not just pickup volume.

Weight contributions from:
1. Essence spent by color (market + ritual)
2. Ritual matches by color
3. Market purchases aligned to color
4. (Optional later) color-identity gameplay actions

### 11.4 Devotion Use
Devotion unlocks:
- new mounts
- mount variants
- color-aligned starting options / doctrines / starter tools

### 11.5 Mount Unlock Philosophy
Unlocks should be mostly **horizontal** (new playstyles), not pure stat upgrades.

Examples:
- Red mount = aggressive / top-zone pressure play
- Purple mount = info/ritual control
- Green mount = tile interaction/adaptation
- Black mount = sacrifice/attrition

Pair-color mounts can be advanced unlocks.

---

## 12) UI Components Needed During a Run (Critical)

The UI must make these obvious at a glance:
1. **Current combat danger**
2. **Current Essence economy**
3. **Current build/devotion direction**
4. **Nearby opportunities (Market / Ritual tiles)**

### 12.1 Always-On Core Combat HUD (minimal)
Recommended (top-left):
- HP
- Dash charges / cooldown
- Objective status (timer, elite, nodes, etc.)
- Arena index / progress

### 12.2 Essence HUD (Always-On, High Priority)
A 4-color Essence row with icons/symbols + counts:
- Black / Purple / Red / Green

Required behaviors:
- pulse on pickup
- visible spend animation
- affordability highlighting near Market/Ritual
- **do not rely on color alone** (use icons/sigils + labels)

### 12.3 Devotion Mini-Widget (Always-On, Compact)
Show persistent progress without clutter:
- 4 small bars/rings (one per color)
- highlight current run leaning / dominant color
- show nearest unlock threshold indicator (compact)

During combat, only show:
- current devotion progress
- near unlock notice
- recent devotion gain popups (brief)

Full devotion tree belongs outside combat.

### 12.4 Zone Indicator (Always-On)
Player should always understand current risk zone.

Use both:
- **world-space zone visuals** (bands/fog/markers)
- **HUD zone indicator** (Safe / Balanced / Chaos + reward multiplier)

### 12.5 Market Tile Indicators (Contextual, World + HUD)
When a Market Tile spawns, UI should show:
- world-space icon/marker over tile
- edge arrow if off-screen
- despawn timer ring
- tier / zone quality indicator
- optional toast: “Market Tile Spawned (Chaos Tier)”
- optional affordability hint: “2 items affordable”

### 12.6 Market Interaction UI (Micro-Shop Panel)
When in interaction range:
- tiny panel with **2–3 items**
- item icon/name + one-line effect
- color costs with affordability states
- one-button purchase flow
- fast open/close, no nested menus

### 12.7 Ritual UI (Contextual Overlay)
Ritual overlay needs to show:
- current revealed step (big/readable)
- sequence history (matched/skipped)
- Thread remaining
- Depth
- Resonance trend/state
- available Essence
- Bank option

Most important UX rule:
- show **action consequences before input**
  - Match → spend color, gain depth, resonance change
  - Skip → Thread loss, resonance preserved

### 12.8 Event Feed (Small, Great for Testing)
Lightweight transient messages:
- Essence gained/spent
- Market purchases
- Ritual match/skip/bank
- Devotion gain
- zone bonus changes

### 12.9 End-of-Run Summary (Required)
Must clearly separate:

#### Lost (temporary)
- Unspent Essence

#### Gained (persistent)
- Devotion by color
- Unlock progress
- New mount unlocks (if any)

Also show why:
- ritual matches
- market spending
- purchase alignment
- total devotion gained by color

This reduces death frustration and teaches the system.

---

## 13) Accessibility + Readability Requirements

Because the economy is color-based, **color alone cannot carry meaning**.

### Every color must also have:
- icon / sigil
- shape/pattern
- label or abbreviation

Suggested placeholders:
- Black = skull / hex
- Purple = eye / hourglass
- Red = flame / triangle
- Green = leaf / vine

Also required:
- clear affordability states
- concise consistent verbs (Gain, Spend, Match, Skip, Bank, Buy)
- readable telegraphs and tile silhouettes

---

## 14) MVP Priorities for Agent (Design-Facing)

If scoping tightly, prioritize proving this loop:

1. Tactical scrolling combat is fun
2. Essence matters and supports meaningful spending choices
3. Market Tile routing creates positional decisions
4. Ritual Depth vs Resonance creates strategic tradeoffs
5. Devotion persistence makes deaths feel productive
6. UI communicates all of the above without overload

### MVP UI Checklist
- [ ] HP / dash / objective HUD
- [ ] Essence row (icons + counts)
- [ ] Zone indicator + multiplier
- [ ] Market tile marker + despawn indicator
- [ ] Micro market panel (2–3 items)
- [ ] Ritual overlay (Thread/Depth/Resonance)
- [ ] Compact devotion progress widget
- [ ] End-of-run devotion summary

---

## 15) Naming (Working Terms)

Use these terms consistently unless intentionally renamed:
- **Essence** (temporary color resource)
- **Devotion** (persistent color progression)
- **Market Tile** (board-embedded shop node)
- **Fourfold Rite** (ritual upgrade system)
- **Thread** (ritual skip resource)
- **Depth** (ritual power tier)
- **Resonance** (ritual synergy quality)

---

## 16) Open Questions (Safe to Defer)
These can be deferred after MVP:
- exact devotion gain formula / caps
- exact opposition penalties/bonuses
- whether ritual happens on board tile vs between arenas
- market time slowdown tuning
- pair-color mount unlock thresholds
- how many market items are static vs rotating
- exact sequence memory component strength (Simon emphasis)

---

## 17) Summary

This design now has a cohesive loop:

- **Combat and positioning** generate Essence opportunities
- **Board routing** determines access to Market Tiles and risk level
- **Ritual choices** convert Essence into high-upside build power (Depth vs Resonance)
- **Market choices** provide reliable tools and passives
- **Devotion** persists and unlocks new mounts based on color commitment

The result is a balanced hybrid of:
- arcade motion
- positional tactics
- strategic economy
- thematic progression
