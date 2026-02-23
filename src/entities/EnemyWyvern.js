/**
 * EnemyWyvern — config-driven enemy unit.
 * Accepts a `type` string to pick stats and sprites from ENEMY_TYPES.
 */

/** Per-type enemy configuration. */
const ENEMY_TYPES = {
  bat: {
    spriteBase:    'bat',
    hp:            1,
    speed:         130,
    size:          32,
    bodySize:      28,
    shootInterval: 0,          // 0 = never shoots
    amplitude:     [25, 45],
    frequency:     [0.0003, 0.0006],
    score:         50,
    tintFill:      0xaa66ff,   // near-black sprite — fill with solid purple silhouette
  },
  griffin: {
    spriteBase:    'griffin',
    hp:            3,
    speed:         90,
    size:          48,
    bodySize:      40,
    shootInterval: [1200, 2400],
    amplitude:     [20, 40],
    frequency:     [0.0002, 0.0005],
    score:         100,
  },
  moth: {
    spriteBase:    'moth',
    hp:            2,
    speed:         110,
    size:          40,
    bodySize:      34,
    shootInterval: [1800, 3000],
    amplitude:     [15, 30],
    frequency:     [0.0002, 0.0004],
    score:         75,
  },
  demon: {
    spriteBase:    'demon',
    hp:            5,
    speed:         70,
    size:          52,
    bodySize:      44,
    shootInterval: [800, 1600],
    amplitude:     [10, 25],
    frequency:     [0.00015, 0.0003],
    score:         200,
  },
  dragon: {
    spriteBase:    'dragon',
    hp:            8,
    speed:         55,
    size:          64,
    bodySize:      56,
    shootInterval: [600, 1200],
    amplitude:     [8, 18],
    frequency:     [0.0001, 0.0002],
    score:         400,
  },
};

export class EnemyWyvern {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} type
   * @param {{ speedMult?: number, essenceDropBonus?: number, lootBonus?: number }} [zoneBonus]
   */
  constructor(scene, x, y, type = 'griffin', zoneBonus = {}) {
    this.scene = scene;
    const cfg = ENEMY_TYPES[type] ?? ENEMY_TYPES.griffin;
    this._cfg = cfg;
    this._zoneBonus = zoneBonus;

    this.hp = cfg.hp;
    this._startX = x;
    this._amplitude  = Phaser.Math.Between(...cfg.amplitude);
    this._frequency  = Phaser.Math.FloatBetween(...cfg.frequency);
    this._shootTimer = 0;
    this._shootInterval = cfg.shootInterval
      ? Phaser.Math.Between(...cfg.shootInterval)
      : 0;

    this._frameKeys = [`${cfg.spriteBase}_d1`, `${cfg.spriteBase}_d2`];

    this.sprite = scene.physics.add.sprite(x, y, this._frameKeys[0]);
    this.sprite.setDisplaySize(cfg.size, cfg.size);
    this.sprite.setDepth(10);
    if (cfg.tintFill) this.sprite.setTintFill(cfg.tintFill);
    else if (cfg.tint) this.sprite.setTint(cfg.tint);

    // Add to group BEFORE setting body properties — group.add() resets the body
    scene.enemies.add(this.sprite);
    this.sprite.body.setSize(cfg.bodySize, cfg.bodySize);
    const speedMult = zoneBonus.speedMult ?? 1.0;
    this.sprite.setVelocityY((cfg.speed + Phaser.Math.Between(0, 40)) * speedMult);
    this.sprite.setData('entity', this);

    scene.events.on('update', this._update, this);
    this.sprite.once('destroy', () => {
      scene.events.off('update', this._update, this);
    });
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 60,
      yoyo: true,
    });
    if (this.hp <= 0) this._die();
  }

  // ── Private ──────────────────────────────────────────────────────────

  _update(time, delta) {
    if (!this.sprite.active) return;

    // Sine-wave horizontal drift
    this.sprite.x = this._startX +
      Math.sin(time * this._frequency * Math.PI * 2) * this._amplitude;

    // 2-frame flap animation (toggle every 250ms)
    this.sprite.setTexture(Math.floor(time / 250) % 2 === 0
      ? this._frameKeys[0]
      : this._frameKeys[1]);

    // Shoot periodically (0 = never)
    if (this._shootInterval > 0) {
      this._shootTimer += delta;
      if (this._shootTimer >= this._shootInterval) {
        this._shootTimer = 0;
        this._shoot();
      }
    }

    // Despawn if off bottom
    if (this.sprite.y > 700) this.sprite.destroy();
  }

  _shoot() {
    const { scene, sprite } = this;
    const player = scene.player.sprite;
    const angle  = Phaser.Math.Angle.Between(sprite.x, sprite.y, player.x, player.y);

    const bolt = scene.enemyBullets.create(sprite.x, sprite.y + 20, 'enemy_shot');
    scene.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), 180, bolt.body.velocity);
    bolt.setDepth(8);
  }

  _die() {
    const { scene, sprite } = this;

    scene.addScore(this._cfg.score);

    scene.add.particles(sprite.x, sprite.y, 'particle', {
      speed: { min: 60, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      tint: [0xff6600, 0xffcc00, 0x33ff66],
      quantity: 12,
      duration: 200,
      depth: 15,
    });

    scene.lootSystem.tryDrop(sprite.x, sprite.y);

    sprite.destroy();
  }
}
