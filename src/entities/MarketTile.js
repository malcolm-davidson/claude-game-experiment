/**
 * MarketTile — a world-space scrolling tile with a despawn timer.
 *
 * Spawns at the top of the screen and scrolls down with the battlefield.
 * While active it writes to the registry so UIScene can show edge arrows etc.
 * When the player overlaps it, GameScene opens the market micro-panel.
 *
 * Registry keys updated:
 *   marketTileActive        boolean
 *   marketTileX / Y         world position
 *   marketTileTier          1 | 2 | 3 (based on spawn zone)
 *   marketTileTimeRemaining ms remaining
 */

import { ZoneManager } from '../systems/ZoneManager.js';

const LIFETIME_MS   = 15_000; // 15 s before self-destruct
const SCROLL_SPEED  = 30;     // px/s — matches bg scroll
const TILE_SIZE     = 48;

export class MarketTile {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y  spawn Y (typically -64)
   */
  constructor(scene, x, y) {
    this.scene   = scene;
    this._timeMs = LIFETIME_MS;
    this._open   = false; // panel currently open

    // Sprite — gold-tinted chest
    this.sprite = scene.marketTiles.create(x, y, 'tile_market');
    this.sprite.setDisplaySize(TILE_SIZE, TILE_SIZE);
    this.sprite.setDepth(4);
    this.sprite.setVelocityY(SCROLL_SPEED);
    this.sprite.setData('marketTile', this);

    // Derive tier from spawn Y (roughly — tile will pass through zones)
    this.tier = this._tierFromY(y);

    // Timer ring — drawn as a simple arc using Graphics
    this._ring = scene.add.graphics().setDepth(5);

    // Label
    this._label = scene.add.text(x, y - 28, 'MARKET', {
      fontSize: '9px',
      color: '#f8db8d',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    this._updateRegistry(true);

    scene.events.on('update', this._onUpdate, this);
    this.sprite.once('destroy', () => this._cleanup());
  }

  get x() { return this.sprite.active ? this.sprite.x : 0; }
  get y() { return this.sprite.active ? this.sprite.y : 0; }
  get active() { return this.sprite.active; }

  /** Called by GameScene when player enters overlap range. */
  openPanel() { this._open = true; }

  /** Called by GameScene when the panel closes. */
  closePanel() { this._open = false; }

  destroy() {
    if (this.sprite.active) this.sprite.destroy();
  }

  // ── Private ──────────────────────────────────────────────────────────

  _onUpdate(time, delta) {
    if (!this.sprite.active) return;

    this._timeMs -= delta;

    // Despawn when timer expires or scrolled off screen
    if (this._timeMs <= 0 || this.sprite.y > 700) {
      this._cleanup();
      this.sprite.destroy();
      return;
    }

    // Update tier based on current Y position
    this.tier = this._tierFromY(this.sprite.y);

    // Keep decorations aligned
    this._label.setPosition(this.sprite.x, this.sprite.y - 28);
    this._drawRing();

    this._updateRegistry(true);
  }

  _drawRing() {
    const r   = this.sprite.active ? this.sprite : null;
    if (!r) return;
    const pct = Math.max(0, this._timeMs / LIFETIME_MS);
    const sx  = r.x;
    const sy  = r.y;

    this._ring.clear();
    // Background ring
    this._ring.lineStyle(3, 0x333333, 0.6);
    this._ring.strokeCircle(sx, sy, 28);
    // Filled arc proportional to time remaining
    this._ring.lineStyle(3, 0xf8db8d, 0.9);
    this._ring.beginPath();
    this._ring.arc(sx, sy, 28, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * pct));
    this._ring.strokePath();
  }

  _updateRegistry(active) {
    const r = this.scene.registry;
    r.set('marketTileActive',        active);
    if (active && this.sprite.active) {
      r.set('marketTileX',           this.sprite.x);
      r.set('marketTileY',           this.sprite.y);
      r.set('marketTileTier',        this.tier);
      r.set('marketTileTimeRemaining', Math.max(0, Math.round(this._timeMs)));
    }
  }

  _cleanup() {
    this.scene.events.off('update', this._onUpdate, this);
    this._ring.destroy();
    this._label.destroy();
    this._updateRegistry(false);
  }

  _tierFromY(y) {
    return ZoneManager.getZone(y).id === 'top'    ? 3
         : ZoneManager.getZone(y).id === 'middle' ? 2
         : 1;
  }
}
