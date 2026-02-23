import { Player } from '../entities/Player.js';
import { EnemyWyvern } from '../entities/EnemyWyvern.js';
import { MarketTile } from '../entities/MarketTile.js';
import { ArenaManager } from '../systems/ArenaManager.js';
import { LootSystem } from '../systems/LootSystem.js';
import { ZoneManager } from '../systems/ZoneManager.js';
import { EssenceManager } from '../systems/EssenceManager.js';
import { TileManager } from '../systems/TileManager.js';
import { pickMarketItems } from '../data/MarketItems.js';
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
    this._setupRegistry();
    this._setupSystems();
    this._setupCollisions();
    this._setupInput();

    this._marketPanel   = null; // active micro-panel container
    this._activeMarket  = null; // active MarketTile instance

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
    this.tileManager.update();

    // B-01: track player zone each frame
    const zone = ZoneManager.getPlayerZone(this.player);
    if (zone.id !== this.registry.get('playerZone')) {
      this.registry.set('playerZone', zone.id);
    }

    // Scroll parallax background
    this.bg.tilePositionY -= 0.5;

    cullOffscreenBullets(
      this.playerBullets.getChildren(),
      this.enemyBullets.getChildren(),
    );
  }

  // ── Setup helpers ────────────────────────────────────────────────────

  _setupBackground() {
    this.bg = this.add.tileSprite(0, 0, 480, 640, 'background')
      .setOrigin(0, 0);

    this.add.rectangle(0, 0,   480, 200, 0x330000, 0.10).setOrigin(0, 0).setDepth(1);
    this.add.rectangle(0, 430, 480, 210, 0x001833, 0.10).setOrigin(0, 0).setDepth(1);
  }

  _setupGroups() {
    this.playerBullets = this.physics.add.group();
    this.enemyBullets  = this.physics.add.group();
    this.enemies       = this.physics.add.group();
    this.lootItems     = this.physics.add.group();
    this.tacTiles      = this.physics.add.group();
    this.marketTiles   = this.physics.add.group(); // F-01
  }

  _setupPlayer() {
    this.player = new Player(this, 240, 520);
  }

  _setupRegistry() {
    this.registry.set('score', 0);
    this.registry.set('hp',    this.player.stats.hp);
    this.registry.set('maxHp', this.player.stats.maxHp);
    this.registry.set('arenaIndex', 0);
    this.registry.set('arenaPhase', 'spawning');
    this.registry.set('dashCharges',    2);
    this.registry.set('maxDashCharges', 2);
    this.registry.set('essence_black',  0);
    this.registry.set('essence_purple', 0);
    this.registry.set('essence_red',    0);
    this.registry.set('essence_green',  0);

    const storedDevotion = this._loadDevotion();
    for (const color of ['black', 'purple', 'red', 'green']) {
      this.registry.set(`devotion_${color}`, storedDevotion[color] ?? 0);
    }

    this.registry.set('marketTileActive', false);
    this.registry.set('playerZone', 'bottom');
  }

  _setupSystems() {
    this.essenceManager = new EssenceManager(this);
    this.tileManager    = new TileManager(this);
    this.arenaManager   = new ArenaManager(this);
    this.lootSystem     = new LootSystem(this);

    this.events.on('essence-gained', ({ color, amount }) => {
      if (this._runStats?.essenceEarned) {
        this._runStats.essenceEarned[color] = (this._runStats.essenceEarned[color] ?? 0) + amount;
      }
    });
    this.events.on('essence-spent', ({ color, amount }) => {
      if (this._runStats?.essenceSpent) {
        this._runStats.essenceSpent[color] = (this._runStats.essenceSpent[color] ?? 0) + amount;
      }
    });
  }

  _setupCollisions() {
    this.physics.add.overlap(
      this.playerBullets, this.enemies,
      (bullet, enemySprite) =>
        onBulletHitEnemy(bullet, enemySprite, this.player.stats.attack),
    );
    this.physics.add.overlap(
      this.enemyBullets, this.player.sprite,
      (playerSprite, bullet) =>
        onEnemyBulletHitPlayer(playerSprite, bullet, this.player),
    );
    this.physics.add.overlap(
      this.player.sprite, this.lootItems,
      (playerSprite, loot) =>
        onPlayerCollectLoot(playerSprite, loot, this.lootSystem),
    );
    this.physics.add.overlap(
      this.tacTiles, this.enemies,
      (tileSprite, enemySprite) => {
        const type   = tileSprite.getData('tileType');
        const entity = enemySprite.getData('entity');
        if (!entity) return;
        if (type === 'pit')      entity.takeDamage(Math.max(entity.hp, 1));
        else if (type === 'silence')  entity._silenced = true;
        else if (type === 'weakness') entity._weakened = true;
        else if (type === 'slow')     entity._slowed   = true;
      },
    );

    // F-03: player enters market tile range → open panel
    this.physics.add.overlap(
      this.player.sprite, this.marketTiles,
      (playerSprite, tileSprite) => {
        const mt = tileSprite.getData('marketTile');
        if (mt && !this._marketPanel) this._openMarketPanel(mt);
      },
    );
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

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

  _showTouchRing(x, y) { this._touchRing.setPosition(x, y).setAlpha(0.9); }
  _moveTouchRing(x, y) { this._touchRing.setPosition(x, y); }
  _hideTouchRing()      { this._touchRing.setAlpha(0); }

  isMobile() { return !this.sys.game.device.os.desktop; }

  // ── Public helpers ───────────────────────────────────────────────────

  addScore(points) {
    this.registry.set('score', this.registry.get('score') + points);
  }

  spawnEnemy(x, y, type = 'griffin', zoneBonus = {}) {
    new EnemyWyvern(this, x, y, type, zoneBonus);
  }

  /** F-01: Spawn a market tile (called by ArenaManager at arena midpoint). */
  spawnMarketTile() {
    if (this._activeMarket?.active) return; // only one at a time
    const x  = Phaser.Math.Between(80, 400);
    const mt = new MarketTile(this, x, -64);
    this._activeMarket = mt;
  }

  gameOver() { this._runEnd(); }

  // ── Market micro-panel (F-03) ────────────────────────────────────────

  _openMarketPanel(marketTile) {
    if (this._marketPanel) return;
    marketTile.openPanel();

    // Soft slowdown
    this.physics.world.timeScale = 3.5; // slows physics (higher = slower)
    this.time.timeScale           = 0.3;

    const items = pickMarketItems(marketTile.tier, 3);
    const px    = Phaser.Math.Clamp(marketTile.x, 90, 390);
    const py    = Phaser.Math.Clamp(marketTile.y + 60, 60, 480);

    // Panel background
    const panel = this.add.container(px, py).setDepth(50);
    const bg    = this.add.rectangle(0, 0, 170, 30 + items.length * 52, 0x1a0a00, 0.95)
      .setStrokeStyle(1, 0xf8db8d, 0.8);
    panel.add(bg);

    // Title
    panel.add(this.add.text(0, -(items.length * 26 + 4), 'MARKET', {
      fontSize: '11px', color: '#f8db8d', fontStyle: 'bold',
    }).setOrigin(0.5));

    const ESSENCE_COLORS = { black: '#888888', purple: '#aa66ff', red: '#ff5555', green: '#44dd88' };

    items.forEach((item, i) => {
      const iy = -(items.length - 1) * 26 + i * 52;

      // Item label
      panel.add(this.add.text(-76, iy - 14, item.label, {
        fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0, 0.5));

      // Effect
      panel.add(this.add.text(-76, iy - 2, item.effect, {
        fontSize: '9px', color: '#aaaaaa',
      }).setOrigin(0, 0.5));

      // Cost
      const costStr = Object.entries(item.cost)
        .map(([c, n]) => `${n}${c[0].toUpperCase()}`)
        .join(' ');
      const canAfford = this.essenceManager.canAfford(item.cost);
      panel.add(this.add.text(-76, iy + 10, costStr, {
        fontSize: '9px',
        color: canAfford ? '#f8db8d' : '#666666',
      }).setOrigin(0, 0.5));

      // Buy button
      const btnBg = this.add.rectangle(62, iy, 44, 18,
        canAfford ? 0x2a5a00 : 0x333333, 1)
        .setStrokeStyle(1, canAfford ? 0x88ff44 : 0x555555);
      const btnTxt = this.add.text(62, iy, canAfford ? 'BUY' : '—', {
        fontSize: '10px', color: canAfford ? '#88ff44' : '#555555', fontStyle: 'bold',
      }).setOrigin(0.5);
      panel.add([btnBg, btnTxt]);

      if (canAfford) {
        btnBg.setInteractive({ useHandCursor: true });
        btnBg.on('pointerdown', () => {
          // Spend essence
          for (const [color, amt] of Object.entries(item.cost)) {
            this.essenceManager.spend(color, amt);
          }
          item.applyFn(this);
          this.addScore(100);
          this._closeMarketPanel(marketTile);
        });
      }
    });

    // Close button
    const closeBtn = this.add.text(72, -(items.length * 26 + 4), '✕', {
      fontSize: '11px', color: '#ff6666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this._closeMarketPanel(marketTile));
    panel.add(closeBtn);

    // ESC key closes
    this._marketEscKey = this.input.keyboard.once('keydown-ESC', () =>
      this._closeMarketPanel(marketTile));

    this._marketPanel = panel;
  }

  _closeMarketPanel(marketTile) {
    if (!this._marketPanel) return;
    this._marketPanel.destroy();
    this._marketPanel = null;
    marketTile.closePanel();

    this.physics.world.timeScale = 1;
    this.time.timeScale           = 1;

    if (this._marketEscKey) {
      this.input.keyboard.removeListener('keydown-ESC', this._marketEscKey);
      this._marketEscKey = null;
    }
  }

  // ── Run-end flow ─────────────────────────────────────────────────────

  _runEnd() {
    this.arenaManager.stop();
    this.physics.pause();
    if (this._marketPanel) this._closeMarketPanel(this._activeMarket);
    this.scene.stop('UI');

    const arenaIndex = this.registry.get('arenaIndex') ?? 0;
    const score      = this.registry.get('score') ?? 0;
    const stats = {
      score,
      arenaIndex,
      arenasCompleted: arenaIndex,
      essenceEarned: { ...this._runStats.essenceEarned },
      essenceSpent:  { ...this._runStats.essenceSpent },
    };

    this._saveDevotion();
    this.events.emit('run-end', stats);

    if (this.scene.get('Summary')) {
      this.scene.start('Summary', stats);
    } else {
      this._showFallbackGameOver(stats);
    }
  }

  _showFallbackGameOver(stats) {
    this.add.text(240, 240, 'THE DRAGON FALLS', {
      fontSize: '28px', color: '#cc3300', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
    this.add.text(240, 285, `Score: ${stats.score}  |  Arenas: ${stats.arenasCompleted}`, {
      fontSize: '15px', color: '#e8c87a', align: 'center',
    }).setOrigin(0.5);
    const hint = this.isMobile() ? 'Tap to restart' : 'Press R to restart';
    this.add.text(240, 340, hint, { fontSize: '16px', color: '#aaaaaa' }).setOrigin(0.5);
    const doRestart = () => { this._resetRegistry(); this.scene.restart(); this.scene.launch('UI'); };
    this.input.keyboard.once('keydown-R', doRestart);
    this.input.once('pointerup', doRestart);
  }

  _resetRegistry() {
    this.registry.set('score', 0);
    this.registry.set('arenaIndex', 0);
    this.registry.set('arenaPhase', 'spawning');
    this.registry.set('dashCharges', 2);
    this.registry.set('maxDashCharges', 2);
    this.registry.set('essence_black', 0);
    this.registry.set('essence_purple', 0);
    this.registry.set('essence_red', 0);
    this.registry.set('essence_green', 0);
    this.registry.set('marketTileActive', false);
  }

  _loadDevotion() {
    try { return JSON.parse(localStorage.getItem('devotion') ?? '{}'); }
    catch { return {}; }
  }

  _saveDevotion() {
    const d = {};
    for (const c of ['black', 'purple', 'red', 'green']) {
      d[c] = this.registry.get(`devotion_${c}`) ?? 0;
    }
    try { localStorage.setItem('devotion', JSON.stringify(d)); } catch {}
  }
}
