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
  static ARENA_DURATION     = 60_000;
  // How long the elite_warning phase lasts (ms)
  static WARNING_DURATION   = 4_000;
  // How long the transitioning phase lasts (ms)
  static TRANSITION_DURATION = 3_000;

  constructor(scene) {
    this.scene = scene;

    this.arenaIndex    = 0;
    this.phase         = 'spawning'; // 'spawning' | 'elite_warning' | 'transitioning'

    this._arenaTimer   = 0;
    this._spawnTimer   = 0;
    this._spawnInterval = 2000; // ms between enemy spawns
    this._enemiesThisArena = 0;
    this._maxEnemies       = 6;

    this._running = true;

    this._beginArena();
  }

  /** Enemy types available per arena tier. Earlier entries = more common. */
  _poolForArena() {
    const a = this.arenaIndex;
    if (a <= 1) return ['griffin', 'bat', 'bat'];
    if (a <= 3) return ['griffin', 'griffin', 'bat', 'moth'];
    if (a <= 5) return ['griffin', 'moth', 'moth', 'demon'];
    if (a <= 7) return ['moth', 'demon', 'demon', 'dragon'];
    return ['demon', 'demon', 'dragon', 'dragon'];
  }

  /** Stop all activity (call before run-end). */
  stop() {
    this._running = false;
  }

  update(time, delta) {
    if (!this._running) return;

    this._arenaTimer += delta;

    switch (this.phase) {
      case 'spawning':
        this._updateSpawning(delta);
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

  _beginArena() {
    this._arenaTimer           = 0;
    this._spawnTimer           = 0;
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

    if (this._spawnTimer >= this._spawnInterval &&
        this._enemiesThisArena < this._maxEnemies) {
      this._spawnTimer = 0;
      this._enemiesThisArena++;
      const pool = this._poolForArena();
      const type = pool[Phaser.Math.Between(0, pool.length - 1)];
      this.scene.spawnEnemy(
        Phaser.Math.Between(40, 440),
        -40,
        type,
      );
    }
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
