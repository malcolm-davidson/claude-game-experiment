/**
 * Player — the dragon rider.
 * Handles movement, shooting, stats, and damage.
 *
 * Input modes (both can be active simultaneously):
 *   Keyboard — arrow keys to move, Z to fire
 *   Touch    — drag finger to move (dragon follows pointer), auto-fires while touching
 */
export class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    this.stats = {
      hp: 10,
      maxHp: 10,
      speed: 200,
      attack: 2,
      fireRate: 300, // ms between shots
    };

    this._lastFired  = 0;
    this._touchX     = null; // null = no active touch
    this._touchY     = null;

    this.sprite = scene.physics.add.sprite(x, y, 'dragon');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);

    // Thrust particle emitter
    this._thrustEmitter = scene.add.particles(x, y + 24, 'particle', {
      speed: { min: 20, max: 60 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      tint: [0xff6600, 0xffcc00, 0xcc3300],
      frequency: 40,
      depth: 9,
    });
  }

  update(time, delta, cursors, fireKey) {
    const { sprite, stats } = this;
    sprite.setVelocity(0);

    const isTouching = this._touchX !== null;

    if (isTouching) {
      // Touch: move dragon toward the finger position
      const dx   = this._touchX - sprite.x;
      const dy   = this._touchY - sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 6) {
        sprite.setVelocityX((dx / dist) * stats.speed);
        sprite.setVelocityY((dy / dist) * stats.speed);
      }

      // Auto-fire while touching
      if (time > this._lastFired + stats.fireRate) {
        this._fire(time);
      }
    } else {
      // Keyboard movement
      if (cursors.left.isDown)  sprite.setVelocityX(-stats.speed);
      if (cursors.right.isDown) sprite.setVelocityX(stats.speed);
      if (cursors.up.isDown)    sprite.setVelocityY(-stats.speed);
      if (cursors.down.isDown)  sprite.setVelocityY(stats.speed);

      // Keyboard fire
      if (fireKey.isDown && time > this._lastFired + stats.fireRate) {
        this._fire(time);
      }
    }

    // Keep thrust emitter attached
    this._thrustEmitter.setPosition(sprite.x, sprite.y + 24);
  }

  /** Called by GameScene pointer events. Pass null to clear. */
  setTouchTarget(x, y) {
    this._touchX = x;
    this._touchY = y;
  }

  clearTouchTarget() {
    this._touchX = null;
    this._touchY = null;
  }

  takeDamage(amount) {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    this.scene.registry.set('hp', this.stats.hp);

    // Flash red
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: 80,
      yoyo: true,
      repeat: 2,
    });

    if (this.stats.hp <= 0) {
      this.scene.gameOver();
    }
  }

  applyUpgrade(upgrade) {
    switch (upgrade.type) {
      case 'hp':
        this.stats.maxHp += upgrade.value;
        this.stats.hp = Math.min(this.stats.hp + upgrade.value, this.stats.maxHp);
        this.scene.registry.set('hp', this.stats.hp);
        this.scene.registry.set('maxHp', this.stats.maxHp);
        break;
      case 'attack':
        this.stats.attack += upgrade.value;
        break;
      case 'fireRate':
        this.stats.fireRate = Math.max(80, this.stats.fireRate - upgrade.value);
        break;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────

  _fire(time) {
    this._lastFired = time;
    const { scene, sprite } = this;

    // Twin fireballs
    for (const offsetX of [-8, 8]) {
      const bullet = scene.playerBullets.create(
        sprite.x + offsetX, sprite.y - 20, 'fireball',
      );
      bullet.setVelocityY(-500);
      bullet.setDepth(8);
    }
  }
}
