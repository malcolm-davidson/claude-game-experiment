import { Player } from '../entities/Player.js';
import { EnemyWyvern } from '../entities/EnemyWyvern.js';
import { ArenaManager } from '../systems/ArenaManager.js';
import { LootSystem } from '../systems/LootSystem.js';
import { ZoneManager } from '../systems/ZoneManager.js';
import {
  onBulletHitEnemy,
  onEnemyBulletHitPlayer,
  onPlayerCollectLoot,
  cullOffscreenBullets,
} from '../systems/CollisionHandlers.js';

/**
 * GameScene — core gameplay loop.
 * Vertical scrolling shoot'em up with arena-based roguelite progression.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this._setupBackground();
    this._setupGroups();
    this._setupPlayer();
    this._setupRegistry();  // A-03: pre-populate all registry keys
    this._setupSystems();
    this._setupCollisions();
    this._setupInput();

    // Track run stats for the end-of-run summary
    this._runStats = {
      essenceEarned: { black: 0, purple: 0, red: 0, green: 0 },
      essenceSpent:  { black: 0, purple: 0, red: 0, green: 0 },
    };

    this.scene.launch('UI');
  }

  update(time, delta) {
    this.player.update(time, delta, this.cursors, this.fireKey);
    this.arenaManager.update(time, delta);

    // B-01: track player zone each frame
    const zone = ZoneManager.getPlayerZone(this.player);
    if (zone.id !== this.registry.get('playerZone')) {
      this.registry.set('playerZone', zone.id);
    }

    // Scroll parallax background
    this.bg.tilePositionY -= 0.5;

    // Cull off-screen bullets (snapshot arrays first to avoid mutation-during-iteration)
    cullOffscreenBullets(
      this.playerBullets.getChildren(),
      this.enemyBullets.getChildren(),
    );
  }

  // ── Setup helpers ────────────────────────────────────────────────────

  _setupBackground() {
    this.bg = this.add.tileSprite(0, 0, 480, 640, 'background')
      .setOrigin(0, 0);

    // B-02: subtle semi-transparent zone bands (fixed screen-space overlays)
    // Top zone (y 0–200) — dark red tint, higher danger
    this.add.rectangle(0, 0, 480, 200, 0x330000, 0.10).setOrigin(0, 0).setDepth(1);
    // Bottom zone (y 430–640) — blue-grey tint, safer
    this.add.rectangle(0, 430, 480, 210, 0x001833, 0.10).setOrigin(0, 0).setDepth(1);
  }

  _setupGroups() {
    this.playerBullets = this.physics.add.group();
    this.enemyBullets  = this.physics.add.group();
    this.enemies       = this.physics.add.group();
    this.lootItems     = this.physics.add.group();
  }

  _setupPlayer() {
    this.player = new Player(this, 240, 520);
  }

  /** A-03: Pre-populate all registry keys so UIScene can read safely. */
  _setupRegistry() {
    // Combat basics
    this.registry.set('score', 0);
    this.registry.set('hp',    this.player.stats.hp);
    this.registry.set('maxHp', this.player.stats.maxHp);

    // Arena progression
    this.registry.set('arenaIndex', 0);
    this.registry.set('arenaPhase', 'spawning');

    // Dash charges
    this.registry.set('dashCharges',    2);
    this.registry.set('maxDashCharges', 2);

    // In-run essence (all start at 0)
    this.registry.set('essence_black',  0);
    this.registry.set('essence_purple', 0);
    this.registry.set('essence_red',    0);
    this.registry.set('essence_green',  0);

    // Persistent devotion (load from localStorage, default 0)
    const devotionDefaults = { black: 0, purple: 0, red: 0, green: 0 };
    const storedDevotion   = this._loadDevotion();
    for (const color of Object.keys(devotionDefaults)) {
      this.registry.set(
        `devotion_${color}`,
        storedDevotion[color] ?? devotionDefaults[color],
      );
    }

    // Market tile active state
    this.registry.set('marketTileActive', false);

    // Current player zone (updated each frame)
    this.registry.set('playerZone', 'bottom');
  }

  _setupSystems() {
    this.arenaManager = new ArenaManager(this);
    this.lootSystem   = new LootSystem(this);
  }

  _setupCollisions() {
    // Player bullets hit enemies
    this.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      (bullet, enemySprite) =>
        onBulletHitEnemy(bullet, enemySprite, this.player.stats.attack),
    );

    // Enemy bullets hit player
    this.physics.add.overlap(
      this.enemyBullets,
      this.player.sprite,
      (playerSprite, bullet) =>
        onEnemyBulletHitPlayer(playerSprite, bullet, this.player),
    );

    // Player collects loot
    this.physics.add.overlap(
      this.player.sprite,
      this.lootItems,
      (playerSprite, loot) =>
        onPlayerCollectLoot(playerSprite, loot, this.lootSystem),
    );
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // ── Touch / pointer controls ──────────────────────────────────────
    this.input.on('pointerdown', (pointer) => {
      this.player.setTouchTarget(pointer.x, pointer.y);
      this._showTouchRing(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      this.player.setTouchTarget(pointer.x, pointer.y);
      this._moveTouchRing(pointer.x, pointer.y);
    });

    const onTouchEnd = () => {
      this.player.clearTouchTarget();
      this._hideTouchRing();
    };
    this.input.on('pointerup',     onTouchEnd);
    this.input.on('pointercancel', onTouchEnd);

    this._touchRing = this.add.graphics().setDepth(30).setAlpha(0);
    this._touchRing.lineStyle(2, 0xff9900, 0.7);
    this._touchRing.strokeCircle(0, 0, 22);
  }

  _showTouchRing(x, y) {
    this._touchRing.setPosition(x, y).setAlpha(0.9);
  }

  _moveTouchRing(x, y) {
    this._touchRing.setPosition(x, y);
  }

  _hideTouchRing() {
    this._touchRing.setAlpha(0);
  }

  /** Returns true when the primary input is touch (iOS / Android). */
  isMobile() {
    return !this.sys.game.device.os.desktop;
  }

  // ── Public helpers called by entities/systems ────────────────────────

  addScore(points) {
    const current = this.registry.get('score');
    this.registry.set('score', current + points);
  }

  spawnEnemy(x, y, type = 'griffin', zoneBonus = {}) {
    new EnemyWyvern(this, x, y, type, zoneBonus);
  }

  /**
   * A-04: Run-end flow.
   * Stops all systems, persists devotion, emits 'run-end', navigates to
   * SummaryScene. Called by Player.takeDamage() when HP reaches 0.
   */
  gameOver() {
    this._runEnd();
  }

  // ── Private ──────────────────────────────────────────────────────────

  _runEnd() {
    // Stop systems
    this.arenaManager.stop();
    this.physics.pause();
    this.scene.stop('UI');

    // Build stats payload
    const arenaIndex = this.registry.get('arenaIndex') ?? 0;
    const score      = this.registry.get('score') ?? 0;
    const stats = {
      score,
      arenaIndex,
      arenasCompleted: arenaIndex,
      essenceEarned: { ...this._runStats.essenceEarned },
      essenceSpent:  { ...this._runStats.essenceSpent },
    };

    // Persist devotion gained this run to localStorage
    this._saveDevotion();

    // Emit run-end event (SummaryScene and other systems can listen)
    this.events.emit('run-end', stats);

    // Navigate to summary (stub scene — will be created in Epic C/D)
    if (this.scene.get('Summary')) {
      this.scene.start('Summary', stats);
    } else {
      this._showFallbackGameOver(stats);
    }
  }

  /** Fallback shown when SummaryScene doesn't exist yet. */
  _showFallbackGameOver(stats) {
    this.add.text(240, 240, 'THE DRAGON FALLS', {
      fontSize: '28px',
      color: '#cc3300',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(240, 285, `Score: ${stats.score}  |  Arenas: ${stats.arenasCompleted}`, {
      fontSize: '15px',
      color: '#e8c87a',
      align: 'center',
    }).setOrigin(0.5);

    const restartHint = this.isMobile() ? 'Tap to restart' : 'Press R to restart';
    this.add.text(240, 340, restartHint, {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
    }).setOrigin(0.5);

    const doRestart = () => {
      this._resetRegistry();
      this.scene.restart();
      this.scene.launch('UI');
    };
    this.input.keyboard.once('keydown-R', doRestart);
    this.input.once('pointerup', doRestart);
  }

  /** A-04: Reset all A-03 registry keys on restart. */
  _resetRegistry() {
    this.registry.set('score',           0);
    this.registry.set('arenaIndex',      0);
    this.registry.set('arenaPhase',      'spawning');
    this.registry.set('dashCharges',     2);
    this.registry.set('maxDashCharges',  2);
    this.registry.set('essence_black',   0);
    this.registry.set('essence_purple',  0);
    this.registry.set('essence_red',     0);
    this.registry.set('essence_green',   0);
    this.registry.set('marketTileActive', false);
    // Note: devotion_* keys are NOT reset — they are persistent.
  }

  _loadDevotion() {
    try {
      return JSON.parse(localStorage.getItem('devotion') ?? '{}');
    } catch {
      return {};
    }
  }

  _saveDevotion() {
    const devotion = {};
    for (const color of ['black', 'purple', 'red', 'green']) {
      devotion[color] = this.registry.get(`devotion_${color}`) ?? 0;
    }
    try {
      localStorage.setItem('devotion', JSON.stringify(devotion));
    } catch {
      // localStorage unavailable (e.g. private browsing with quota 0)
    }
  }
}
