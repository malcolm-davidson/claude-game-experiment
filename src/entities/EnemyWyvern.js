/**
 * EnemyWyvern — basic enemy unit.
 * Flies down in a sine-wave pattern, fires green bolts at the player.
 */
export class EnemyWyvern {
  constructor(scene, x, y) {
    this.scene = scene;

    this.hp = 3;
    this._startX = x;
    this._amplitude = Phaser.Math.Between(40, 80);
    this._frequency = Phaser.Math.FloatBetween(0.001, 0.003);
    this._shootTimer = 0;
    this._shootInterval = Phaser.Math.Between(1200, 2400);

    this.sprite = scene.physics.add.sprite(x, y, 'griffin_d1');
    this.sprite.setDisplaySize(48, 48);
    this.sprite.body.setSize(40, 40);
    this.sprite.setVelocityY(90 + Phaser.Math.Between(0, 40));
    this.sprite.setDepth(10);
    this.sprite.play('enemy_walk');

    scene.enemies.add(this.sprite);
    this.sprite.setData('entity', this);

    // Attach update to scene
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

    // Shoot periodically
    this._shootTimer += delta;
    if (this._shootTimer >= this._shootInterval) {
      this._shootTimer = 0;
      this._shoot();
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

    // Score
    scene.addScore(100);

    // Explosion particles
    scene.add.particles(sprite.x, sprite.y, 'particle', {
      speed: { min: 60, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      tint: [0xff6600, 0xffcc00, 0x33ff66],
      quantity: 12,
      duration: 200,
      depth: 15,
    });

    // Chance to drop loot
    scene.lootSystem.tryDrop(sprite.x, sprite.y);

    sprite.destroy();
  }
}
