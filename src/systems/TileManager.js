/**
 * TileManager — spawns tactical tiles that scroll down with the battlefield.
 *
 * Tiles appear at the top of the screen (y ≈ -64) and travel downward at the
 * same rate as the parallax background (30 px/s = 0.5 px/frame × 60fps).
 * They are destroyed once they scroll off the bottom (y > 700).
 *
 * Each tile has a type stored via setData('tileType'). GameScene registers
 * physics overlaps against scene.enemies to apply tile effects.
 *
 * Tile types:
 *   pit       — instant kill on enemy contact
 *   silence   — suppresses enemy shooting while overlapping
 *   weakness  — enemies take double damage while overlapping
 *   slow      — halves enemy velocity while overlapping
 */

export const TILE_CONFIGS = {
  pit: {
    textureKey: 'tile_pit',
    tint:       null,         // use sprite as-is (dark hole)
    size:       48,
    label:      'PIT',
  },
  silence: {
    textureKey: 'tile_silence',
    tint:       0xaa66ff,     // purple
    size:       48,
    label:      'SILENCE',
  },
  weakness: {
    textureKey: 'tile_weakness',
    tint:       0xff4444,     // red
    size:       48,
    label:      'WEAK',
  },
  slow: {
    textureKey: 'tile_slow',
    tint:       0x44aaff,     // blue
    size:       48,
    label:      'SLOW',
  },
};

export const TILE_TYPES = Object.keys(TILE_CONFIGS);

/** Downward scroll speed matching bg.tilePositionY -= 0.5 at 60fps */
const SCROLL_SPEED = 30; // px/s

export class TileManager {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Spawn a tile of the given type at a random X position.
   * @param {'pit'|'silence'|'weakness'|'slow'} type
   */
  spawnTile(type) {
    const cfg = TILE_CONFIGS[type];
    if (!cfg) return;

    const x    = Phaser.Math.Between(48, 432);
    const tile = this.scene.tacTiles.create(x, -64, cfg.textureKey);

    tile.setDisplaySize(cfg.size, cfg.size);
    tile.setDepth(2);
    tile.setVelocityY(SCROLL_SPEED);
    tile.setData('tileType', type);

    if (cfg.tint !== null) tile.setTint(cfg.tint);

    // Small label above tile for readability during testing
    const label = this.scene.add.text(x, -80, cfg.label, {
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 1).setDepth(3).setAlpha(0.7);

    // Keep label aligned to tile each frame; destroy with tile
    const onUpdate = () => {
      if (!tile.active) {
        label.destroy();
        this.scene.events.off('update', onUpdate);
        return;
      }
      label.setPosition(tile.x, tile.y - 26);
    };
    this.scene.events.on('update', onUpdate);

    tile.once('destroy', () => {
      label.destroy();
      this.scene.events.off('update', onUpdate);
    });
  }

  /** Call from GameScene.update() to cull off-screen tiles. */
  update() {
    for (const tile of [...this.scene.tacTiles.getChildren()]) {
      if (tile.y > 700) tile.destroy();
    }
  }
}
