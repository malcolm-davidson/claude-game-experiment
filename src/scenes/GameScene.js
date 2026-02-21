import { Player } from '../entities/Player.js';
import { EnemyWyvern } from '../entities/EnemyWyvern.js';
import { WaveManager } from '../systems/WaveManager.js';
import { LootSystem } from '../systems/LootSystem.js';
import {
  onBulletHitEnemy,
  onEnemyBulletHitPlayer,
  onPlayerCollectLoot,
  cullOffscreenBullets,
} from '../systems/CollisionHandlers.js';

/**
 * GameScene — core gameplay loop.
 * Vertical scrolling shoot'em up with roguelite wave progression.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this._setupBackground();
    this._setupGroups();
    this._setupPlayer();
    this._setupSystems();
    this._setupCollisions();
    this._setupInput();

    // Expose shared state for UIScene
    this.registry.set('score', 0);
    this.registry.set('wave', 1);
    this.registry.set('hp', this.player.stats.hp);
    this.registry.set('maxHp', this.player.stats.maxHp);

    this.scene.launch('UI');
  }

  update(time, delta) {
    this.player.update(time, delta, this.cursors, this.fireKey);
    this.waveManager.update(time, delta);

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

  _setupSystems() {
    this.waveManager = new WaveManager(this);
    this.lootSystem  = new LootSystem(this);
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
    // Pointer coordinates from Phaser are already in game-space (scaled),
    // so no coordinate conversion is needed regardless of device pixel ratio.

    this.input.on('pointerdown', (pointer) => {
      this.player.setTouchTarget(pointer.x, pointer.y);
      this._showTouchRing(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return;
      this.player.setTouchTarget(pointer.x, pointer.y);
      this._moveTouchRing(pointer.x, pointer.y);
    });

    // pointerup = normal finger lift
    // pointercancel = iOS interrupted the touch (multitasking swipe, notification, etc.)
    // Both must clear touch state, otherwise the touch stays "stuck" open.
    const onTouchEnd = () => {
      this.player.clearTouchTarget();
      this._hideTouchRing();
    };
    this.input.on('pointerup',     onTouchEnd);
    this.input.on('pointercancel', onTouchEnd);

    // Build the touch-ring graphic (hidden by default)
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

  spawnEnemy(x, y, type = 'griffin') {
    new EnemyWyvern(this, x, y, type);
  }

  gameOver() {
    this.scene.stop('UI');
    this.add.text(240, 280, 'THE DRAGON FALLS', {
      fontSize: '28px',
      color: '#cc3300',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    const restartHint = this.isMobile()
      ? 'Tap to restart'
      : 'Press R to restart';
    this.add.text(240, 340, restartHint, {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
      this.scene.launch('UI');
    });
    this.input.once('pointerup', () => {
      this.scene.restart();
      this.scene.launch('UI');
    });
    this.physics.pause();
  }
}
