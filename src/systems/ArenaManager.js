import { TILE_TYPES } from './TileManager.js';

/**
 * ArenaManager — replaces WaveManager with arena-based progression.
 *
 * Each arena lasts ~60 s and progresses through three phases:
 *   spawning        — regular enemy spawns
 *   elite_warning   — brief pause / telegraph before arena ends
 *   transitioning   — short cooldown between arenas
 *
 * Events emitted on scene.events:
 *   'arena-start'  { arenaIndex }
 *   'arena-end'    { arenaIndex }
 *   'run-end'      { arenaIndex }  (when run is stopped externally)
 */
export class ArenaManager {
  // Total duration of one arena (ms)
  static ARENA_DURATION      = 60_000;
  // How long the elite_warning phase lasts (ms)
  static WARNING_DURATION   = 4_000;
  // How long the transitioning phase lasts (ms)
  static TRANSITION_DURATION = 3_000;

  // E-01: type → escape category
  static ESCAPE_CATEGORY = {
    bat:     'melee',
    griffin: 'melee',
    dragon:  'melee',
    moth:    'ranged',
    demon:   'ranged',
  };

  // E-02: max extra weight added per category
  static TOKEN_CAP = 5;

  constructor(scene) {
    this.scene = scene;

    this.arenaIndex    = 0;
    this.phase         = 'spawning'; // 'spawning' | 'elite_warning' | 'transitioning'

    this._arenaTimer   = 0;
    this._spawnTimer   = 0;
    this._spawnInterval = 2000; // ms between enemy spawns
    this._enemiesThisArena = 0;
    this._maxEnemies       = 6;

    // D-01: tile spawn timer (~1 tile per 18 s during spawning phase)
    this._tileTimer    = 0;
    this._tileInterval = 18_000;

    // F-01: market tile spawned once per arena at midpoint
    this._marketSpawned = false;

    // E-01: persistent escape token counters (accumulate across arenas)
    this._escapeTokens     = { melee: 0, ranged: 0, defense: 0 };
    this._toastCooldown    = 0; // ms until next escape toast is allowed

    this._running = true;

    this._beginArena();
  }

  /**
   * E-02: Enemy pool weighted by arena tier and escape tokens.
   * Each escape token for a category adds +1 copy of a matching type
   * to the pool (capped at TOKEN_CAP extra entries per category).
   */
  _poolForArena() {
    const a = this.arenaIndex;
    let base;
    if (a <= 1) base = ['griffin', 'bat', 'bat'];
    else if (a <= 3) base = ['griffin', 'griffin', 'bat', 'moth'];
    else if (a <= 5) base = ['griffin', 'moth', 'moth', 'demon'];
    else if (a <= 7) base = ['moth', 'demon', 'demon', 'dragon'];
    else base = ['demon', 'demon', 'dragon', 'dragon'];

    const pool = [...base];

    // Add extra entries proportional to escape tokens
    const meleeBonus  = this._escapeTokens.melee  ?? 0;
    const rangedBonus = this._escapeTokens.ranged  ?? 0;

    // Melee representatives available in this tier
    const meleeTypes  = base.filter(t => ArenaManager.ESCAPE_CATEGORY[t] === 'melee');
    const rangedTypes = base.filter(t => ArenaManager.ESCAPE_CATEGORY[t] === 'ranged');

    // Fall back to tier-appropriate defaults if category not in base yet
    const meleeRep  = meleeTypes.length  ? meleeTypes[0]  : 'griffin';
    const rangedRep = rangedTypes.length ? rangedTypes[0] : 'moth';

    for (let i = 0; i < meleeBonus;  i++) pool.push(meleeRep);
    for (let i = 0; i < rangedBonus; i++) pool.push(rangedRep);

    return pool;
  }

  /** Stop all activity (call before run-end). */
  stop() {
    this._running = false;
  }

  /**
   * E-01: Called by EnemyWyvern when it scrolls off the bottom.
   * Increments the escape token for the enemy's category.
   * @param {string} type  enemy type string (e.g. 'griffin', 'moth')
   */
  recordEscape(type) {
    const category = ArenaManager.ESCAPE_CATEGORY[type] ?? 'melee';
    this._escapeTokens[category] = Math.min(
      (this._escapeTokens[category] ?? 0) + 1,
      ArenaManager.TOKEN_CAP,
    );

    this.scene.events.emit('arena-escape-penalty', { type, category });

    // Toast — debounced so rapid escapes don't flood the screen
    if (this._toastCooldown <= 0) {
      const total = Object.values(this._escapeTokens).reduce((a, b) => a + b, 0);
      this._showEscapeToast(`${total} escaped — more incoming!`);
      this._toastCooldown = 3000;
    }
  }

  update(time, delta) {
    if (!this._running) return;

    this._arenaTimer    += delta;
    this._toastCooldown -= delta;

    switch (this.phase) {
      case 'spawning':
        this._updateSpawning(delta);
        this._updateTileSpawn(delta);
        this._updateMarketSpawn();
        // Transition to warning phase when ~4 s remain in the arena
        if (this._arenaTimer >= ArenaManager.ARENA_DURATION - ArenaManager.WARNING_DURATION) {
          this._setPhase('elite_warning');
        }
        break;

      case 'elite_warning':
        // No spawns during warning; just wait it out
        if (this._arenaTimer >= ArenaManager.ARENA_DURATION) {
          this._setPhase('transitioning');
          this.scene.events.emit('arena-end', { arenaIndex: this.arenaIndex });
        }
        break;

      case 'transitioning':
        if (this._arenaTimer >= ArenaManager.ARENA_DURATION + ArenaManager.TRANSITION_DURATION) {
          this.arenaIndex++;
          this._beginArena();
        }
        break;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────

  _updateMarketSpawn() {
    if (this._marketSpawned) return;
    const midpoint = ArenaManager.ARENA_DURATION / 2;
    if (this._arenaTimer >= midpoint) {
      this._marketSpawned = true;
      if (this.scene.spawnMarketTile) this.scene.spawnMarketTile();
    }
  }

  _updateTileSpawn(delta) {
    if (!this.scene.tileManager) return;
    this._tileTimer += delta;
    if (this._tileTimer >= this._tileInterval) {
      this._tileTimer = 0;
      const type = TILE_TYPES[Phaser.Math.Between(0, TILE_TYPES.length - 1)];
      this.scene.tileManager.spawnTile(type);
    }
  }

  _beginArena() {
    this._arenaTimer           = 0;
    this._spawnTimer           = 0;
    this._tileTimer            = 0;
    this._marketSpawned        = false;
    this._enemiesThisArena     = 0;
    this._spawnInterval        = Math.max(600, 2000 - this.arenaIndex * 150);
    this._maxEnemies           = Math.min(20, 6 + this.arenaIndex * 2);

    this._setPhase('spawning');

    this.scene.registry.set('arenaIndex', this.arenaIndex);
    this.scene.events.emit('arena-start', { arenaIndex: this.arenaIndex });

    this._showAnnouncement(`ARENA ${this.arenaIndex + 1}`);
  }

  _setPhase(phase) {
    this.phase = phase;
    this.scene.registry.set('arenaPhase', phase);
  }

  _updateSpawning(delta) {
    this._spawnTimer += delta;

    // B-03: read current player zone to adjust spawn pressure
    const playerZone = this.scene.registry.get('playerZone') ?? 'middle';

    // Bottom zone: reduce spawn pressure (safer area, lower reward)
    const spawnInterval = playerZone === 'bottom'
      ? this._spawnInterval * 1.35
      : this._spawnInterval;

    if (this._spawnTimer >= spawnInterval &&
        this._enemiesThisArena < this._maxEnemies) {
      this._spawnTimer = 0;
      this._enemiesThisArena++;
      const pool = this._poolForArena();
      const type = pool[Phaser.Math.Between(0, pool.length - 1)];

      // B-03: build zone bonus config for spawnEnemy
      const zoneBonus = this._zoneBonus(playerZone);

      this.scene.spawnEnemy(
        Phaser.Math.Between(40, 440),
        -40,
        type,
        zoneBonus,
      );
    }
  }

  /**
   * Returns a zoneBonus config object based on current player zone.
   * Top zone: +20% enemy speed, higher essence drop chance.
   * Bottom zone: fewer spawns (handled above), higher loot rate.
   * Middle: no modifier.
   */
  _zoneBonus(playerZone) {
    if (playerZone === 'top') {
      return { speedMult: 1.2, essenceDropBonus: 0.3, lootBonus: 0 };
    }
    if (playerZone === 'bottom') {
      return { speedMult: 1.0, essenceDropBonus: 0,   lootBonus: 0.4 };
    }
    return { speedMult: 1.0, essenceDropBonus: 0, lootBonus: 0 };
  }

  _showEscapeToast(message) {
    const txt = this.scene.add.text(240, 120, message, {
      fontSize: '13px',
      color: '#ff8844',
      fontStyle: 'bold',
      backgroundColor: '#1a0000',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(21).setAlpha(0.9);

    this.scene.tweens.add({
      targets: txt,
      alpha: 0,
      y: txt.y - 24,
      duration: 2000,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });
  }

  _showAnnouncement(message) {
    const txt = this.scene.add.text(240, 200, message, {
      fontSize: '32px',
      color: '#e8c87a',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: txt,
      alpha: 0,
      y: 160,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }
}
