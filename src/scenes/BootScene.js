/**
 * BootScene — generates placeholder assets procedurally so the game
 * is playable before any art assets are created.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.spritesheet('dragon', 'assets/IMG_0278.png', {
      frameWidth: 341,
      frameHeight: 512,
    });
  }

  create() {
    this._applyColorKey('dragon', 220);
    this._createEnemyWyvern();
    this._createFireball();
    this._createEnemyShot();
    this._createParticle();
    this._createBackground();

    this.scene.start('Game');
  }

  _applyColorKey(key, threshold) {
    const src = this.textures.get(key).source[0];
    const canvas = document.createElement('canvas');
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src.image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > threshold && data[i + 1] > threshold && data[i + 2] > threshold) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    this.textures.remove(key);
    this.textures.addSpriteSheet(key, canvas, { frameWidth: 341, frameHeight: 512 });
  }

  // ── Procedural texture helpers ──────────────────────────────────────

  _createEnemyWyvern() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x1a3a0a);
    g.fillRect(10, 8, 20, 28);
    g.fillStyle(0x2d6b1a);
    g.fillTriangle(10, 12, 0, 36, 10, 36);
    g.fillTriangle(30, 12, 40, 36, 30, 36);
    g.fillStyle(0x1a3a0a);
    g.fillRect(13, 0, 14, 10);
    g.fillStyle(0xff3300);
    g.fillRect(15, 2, 4, 4);
    g.fillRect(21, 2, 4, 4);
    g.generateTexture('enemy_wyvern', 40, 40);
    g.destroy();
  }

  _createFireball() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xff6600);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffcc00);
    g.fillCircle(6, 6, 3);
    g.generateTexture('fireball', 12, 12);
    g.destroy();
  }

  _createEnemyShot() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x33ff66);
    g.fillCircle(4, 4, 4);
    g.generateTexture('enemy_shot', 8, 8);
    g.destroy();
  }

  _createParticle() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff);
    g.fillCircle(2, 2, 2);
    g.generateTexture('particle', 4, 4);
    g.destroy();
  }

  _createBackground() {
    // Dark parchment-sky gradient with distant mountains
    const g = this.make.graphics({ add: false });
    // Sky gradient bands
    const bands = [
      [0, 0x080012],
      [80, 0x120020],
      [200, 0x1a0030],
      [360, 0x0d000f],
      [480, 0x060008],
    ];
    for (let i = 0; i < bands.length - 1; i++) {
      const [y0, c0] = bands[i];
      const [y1] = bands[i + 1];
      g.fillStyle(c0);
      g.fillRect(0, y0, 480, y1 - y0);
    }
    // Distant mountain silhouettes
    g.fillStyle(0x0d0018);
    const peaks = [
      [0, 560, 120, 400],
      [80, 580, 200, 380],
      [160, 600, 300, 360],
      [260, 610, 380, 350],
      [340, 600, 480, 370],
    ];
    for (const [x1, y1, x2, y2] of peaks) {
      const mx = (x1 + x2) / 2;
      g.fillTriangle(x1, y1, mx, y2, x2, y1);
    }
    // Stars
    g.fillStyle(0xffffff);
    const starPositions = [
      [30, 20], [80, 60], [140, 15], [200, 80], [260, 30],
      [320, 55], [380, 10], [440, 70], [50, 120], [170, 100],
      [290, 90], [410, 130], [100, 170], [230, 150], [350, 160],
    ];
    for (const [sx, sy] of starPositions) {
      g.fillRect(sx, sy, 2, 2);
    }
    g.generateTexture('background', 480, 640);
    g.destroy();
  }
}
