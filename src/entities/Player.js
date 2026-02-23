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

    // Dash state
    this._dashCharges    = 2;
    this._maxDashCharges = 2;
    this._dashing        = false;      // true during iframe window
    this._dashTimer      = 0;
    this._dashDuration   = 120;        // ms of iframe / speed burst
    this._dashCooldown   = 800;        // ms per charge recharge
    this._dashRechargeTimer = 0;
    this._lastDashDir    = { x: 0, y: -1 }; // default: forward

    this.sprite = scene.physics.add.sprite(x, y, 'dragon');
    this.sprite.setDisplaySize(64, 96);
    this.sprite.body.setSize(40, 70);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.setFrame(1);

    // Dash key (Shift or X)
    this._dashKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this._dashKeyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // Dash particle emitter (burst on demand, frequency=0 = manual emit only)
    this._dashEmitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 80, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 250,
      tint: [0x88aaff, 0xaaccff, 0xffffff],
      frequency: -1, // manual explode
      depth: 11,
      quantity: 14,
    });

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

    this._updateDash(delta, cursors);

    // While dashing, skip normal movement/firing control
    if (this._dashing) {
      sprite.setVelocityX(this._lastDashDir.x * stats.speed * 3);
      sprite.setVelocityY(this._lastDashDir.y * stats.speed * 3);
      this._thrustEmitter.setPosition(sprite.x, sprite.y + 24);
      this._dashEmitter.setPosition(sprite.x, sprite.y);
      return;
    }

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

    // Keep emitters attached
    this._thrustEmitter.setPosition(sprite.x, sprite.y + 24);
    this._dashEmitter.setPosition(sprite.x, sprite.y);

    // Banking pose based on horizontal movement
    const vx = sprite.body.velocity.x;
    if (vx < -10)      sprite.setFrame(0);
    else if (vx > 10)  sprite.setFrame(2);
    else               sprite.setFrame(1);
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

  _updateDash(delta, cursors) {
    // Tick active dash timer
    if (this._dashing) {
      this._dashTimer -= delta;
      if (this._dashTimer <= 0) {
        this._dashing = false;
      }
    }

    // Recharge a consumed charge
    if (this._dashCharges < this._maxDashCharges) {
      this._dashRechargeTimer -= delta;
      if (this._dashRechargeTimer <= 0) {
        this._dashCharges++;
        this._dashRechargeTimer = this._dashCooldown;
        this.scene.registry.set('dashCharges', this._dashCharges);
      }
    }

    // Consume a charge on button press (not while already dashing)
    const dashPressed = Phaser.Input.Keyboard.JustDown(this._dashKey) ||
                        Phaser.Input.Keyboard.JustDown(this._dashKeyX);
    if (dashPressed && !this._dashing && this._dashCharges > 0) {
      // Derive direction from current input
      let dx = 0, dy = 0;
      if (cursors.left.isDown)  dx -= 1;
      if (cursors.right.isDown) dx += 1;
      if (cursors.up.isDown)    dy -= 1;
      if (cursors.down.isDown)  dy += 1;

      // Normalise; default to forward (up) if no input
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this._lastDashDir = { x: dx / len, y: dy / len };
      } else {
        this._lastDashDir = { x: 0, y: -1 };
      }

      this._dashing     = true;
      this._dashTimer   = this._dashDuration;
      this._dashCharges--;
      if (this._dashCharges < this._maxDashCharges) {
        this._dashRechargeTimer = this._dashCooldown;
      }

      // Burst particles
      this._dashEmitter.setPosition(this.sprite.x, this.sprite.y);
      this._dashEmitter.explode(14);

      this.scene.registry.set('dashCharges', this._dashCharges);
    }
  }

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
