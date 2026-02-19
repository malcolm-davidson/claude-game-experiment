import { Player } from '../entities/Player.js';
import { EnemyWyvern } from '../entities/EnemyWyvern.js';
import { WaveManager } from '../systems/WaveManager.js';
import { LootSystem } from '../systems/LootSystem.js';

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

    // Cull off-screen enemy shots
    this.enemyBullets.getChildren().forEach(b => {
      if (b.y > 700) b.destroy();
    });
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
      (bullet, enemy) => {
        bullet.destroy();
        enemy.takeDamage(this.player.stats.attack);
      },
    );

    // Enemy bullets hit player
    this.physics.add.overlap(
      this.enemyBullets,
      this.player.sprite,
      (playerSprite, bullet) => {
        bullet.destroy();
        this.player.takeDamage(1);
      },
    );

    // Player collects loot
    this.physics.add.overlap(
      this.player.sprite,
      this.lootItems,
      (playerSprite, loot) => {
        this.lootSystem.collect(loot);
      },
    );
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  }

  // ── Public helpers called by entities/systems ────────────────────────

  addScore(points) {
    const current = this.registry.get('score');
    this.registry.set('score', current + points);
  }

  spawnEnemy(x, y) {
    new EnemyWyvern(this, x, y);
  }

  gameOver() {
    this.scene.stop('UI');
    this.add.text(240, 280, 'THE DRAGON FALLS', {
      fontSize: '28px',
      color: '#cc3300',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(240, 340, 'Press R to restart', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center',
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
      this.scene.launch('UI');
    });
    this.physics.pause();
  }
}
