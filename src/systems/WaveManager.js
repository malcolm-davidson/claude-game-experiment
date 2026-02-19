/**
 * WaveManager — spawns enemies in waves with increasing difficulty.
 * Each wave adds more enemies and shorter intervals.
 */
export class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.wave  = 1;
    this._spawnTimer   = 0;
    this._waveTimer    = 0;
    this._spawnInterval = 2000; // ms between enemy spawns
    this._waveDuration  = 20000; // ms per wave
    this._enemiesThisWave = 0;
    this._maxEnemies      = 6;
  }

  update(time, delta) {
    this._spawnTimer += delta;
    this._waveTimer  += delta;

    if (this._spawnTimer >= this._spawnInterval &&
        this._enemiesThisWave < this._maxEnemies) {
      this._spawnTimer = 0;
      this._enemiesThisWave++;
      this.scene.spawnEnemy(
        Phaser.Math.Between(40, 440),
        -40,
      );
    }

    if (this._waveTimer >= this._waveDuration) {
      this._advanceWave();
    }
  }

  // ── Private ──────────────────────────────────────────────────────────

  _advanceWave() {
    this.wave++;
    this._waveTimer       = 0;
    this._enemiesThisWave = 0;
    this._spawnInterval   = Math.max(600, this._spawnInterval - 200);
    this._maxEnemies      = Math.min(20, this._maxEnemies + 2);

    this.scene.registry.set('wave', this.wave);

    // Brief flash announcement
    const txt = this.scene.add.text(240, 200, `WAVE ${this.wave}`, {
      fontSize: '32px',
      color: '#e8c87a',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: txt,
      alpha: 0,
      y: 160,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }
}
