# Drakenrider

> *"The sky belongs to those who dare ride its fire."*

A grim dark fantasy vertical shoot'em up with roguelite and RPG elements, built with [Phaser 3](https://phaser.io/) and Vite. Playable in the browser, hosted on GitHub Pages.

---

## Concept

You are a **dragon rider** soaring through a dying, magic-scorched world. The skies are ruled by corrupted wyverns, skeletal drakes, and the war-machines of a dark empire. You fight upward — wave after wave — collecting power from fallen foes to grow stronger before the next horror descends.

### Aesthetic & Tone

The visual and tonal target draws from:

- **Larry Elmore paintings** — warm candlelight golds against cold shadow, heroic figures with weight and grime
- **EverQuest box art** — epic scale, dark skies, a sense of ancient and terrible things
- **Dragonlance novel covers** — soaring dragon silhouettes, dramatic contrast, emotional stakes
- **Old School Revival RPGs** — sparse but evocative; every detail earns its place
- **90s PC game aesthetics** — pixel-adjacent sprites, chunky UI, atmospheric color palettes (deep purples, bruised magentas, amber firelight)

The world is **grim dark fantasy**: magic is rare and costly, monsters are genuinely threatening, and victory is never clean. Think *Birthright*, *Dark Sun*, or the opening chapters of *Dragons of Autumn Twilight* rather than high-fantasy triumph.

---

## Gameplay

### Core Loop

```
Fly → Dodge → Shoot → Collect Loot → Survive the Wave → Grow Stronger → Repeat
```

### Shoot'em Up

- Classic **vertical scrolling** flight
- **Twin dragonfire** projectiles (upgradeable to spread, homing, or burst)
- Enemy formations fly in from above in procedurally arranged waves
- Enemies fire aimed bolts and follow sine-wave flight paths

### Roguelite Layer

- Enemies drop **soul gems** — glowing fragments of slain creatures
- Gems grant one of three random upgrades on collection:
  - **Dragon Vitality** — increase max HP
  - **Dragonfire** — increase projectile damage
  - **Wing Cadence** — reduce shot cooldown (increase fire rate)
- Each **wave** escalates enemy count and spawn rate
- Death is permanent — but scores are recorded

### RPG Elements (planned)

- Persistent **dragon progression** between runs (level, lineage, breath type)
- **Rune system** — equip passive glyphs found in drops (e.g., "Soulfire: kills heal 1 HP", "Ironscale: reduce all damage by 1")
- **Boss encounters** at milestone waves (the Bone Drake, the Shadow Archmage, the Iron Kraken)
- **Lore fragments** dropped by elite enemies — pieces of the world's history

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Phaser 3](https://phaser.io/) | Game framework (physics, scenes, input, rendering) |
| [Vite](https://vitejs.dev/) | Dev server and production build |
| GitHub Pages | Hosting |

### Project Structure

```
src/
  main.js               # Phaser game config and entry point
  scenes/
    BootScene.js        # Procedurally generates placeholder textures
    GameScene.js        # Core gameplay loop
    UIScene.js          # HUD overlay (score, wave, HP bar)
  entities/
    Player.js           # Dragon rider: movement, shooting, stats, damage
    EnemyWyvern.js      # Basic enemy: sine-wave flight, aimed shots
  systems/
    WaveManager.js      # Escalating enemy wave spawner
    LootSystem.js       # Drop rolls and upgrade application
```

---

## Development

### Prerequisites

- Node.js 20+
- npm

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:8080` in your browser.

### Controls

**Keyboard (desktop)**

| Key | Action |
|-----|--------|
| Arrow keys | Move dragon |
| Z | Fire |
| R | Restart (after game over) |

**Touch (iOS / Android)**

| Gesture | Action |
|---------|--------|
| Touch and drag | Dragon follows your finger |
| Holding touch | Auto-fires continuously |
| Tap (after game over) | Restart |

The game auto-detects the input method — no configuration needed.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. GitHub Actions deploys this automatically on push to `main`.

---

## Roadmap

- [ ] Real pixel art sprites (dragon, wyverns, bosses, backgrounds)
- [ ] Parallax multi-layer scrolling background (mountains, clouds, ruins)
- [ ] Sound design — ambient wind, dragonfire roar, dark orchestral sting
- [ ] Rune/glyph equip system
- [ ] Boss encounters (Wave 10, 20, 30)
- [ ] Persistent dragon progression (localStorage)
- [ ] Lore fragment collectibles
- [ ] Mobile touch controls
- [ ] Leaderboard (score submission)

---

## Hosted Demo

Once deployed, the live demo will be available at:

```
https://malcolm-davidson.github.io/claude-game-experiment/
```
