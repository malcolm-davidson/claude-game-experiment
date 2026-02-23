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
    this.load.image('griffin_d1', 'assets/td_monsters/td_monsters_griffin_d1.png');
    this.load.image('griffin_d2', 'assets/td_monsters/td_monsters_griffin_d2.png');
    this.load.image('bat_d1',    'assets/td_monsters/td_monsters_bat_d1.png');
    this.load.image('bat_d2',    'assets/td_monsters/td_monsters_bat_d2.png');
    this.load.image('moth_d1',   'assets/td_monsters/td_monsters_moth_d1.png');
    this.load.image('moth_d2',   'assets/td_monsters/td_monsters_moth_d2.png');
    this.load.image('demon_d1',  'assets/td_monsters/td_monsters_demon_d1.png');
    this.load.image('demon_d2',  'assets/td_monsters/td_monsters_demon_d2.png');
    this.load.image('dragon_d1', 'assets/td_monsters/td_monsters_dragon_d1.png');
    this.load.image('dragon_d2', 'assets/td_monsters/td_monsters_dragon_d2.png');
    this.load.image('fireball',   'assets/td_fx/tiny_dungeon_fx_fireball_n.png');
    this.load.image('enemy_shot', 'assets/td_fx/tiny_dungeon_fx_voidball_s.png');
    this.load.image('loot_hp',       'assets/td_items/td_items_flask_red.png');
    this.load.image('loot_attack',   'assets/td_items/td_items_flask_blue.png');
    this.load.image('loot_firerate', 'assets/td_items/td_items_coins_gold.png');
    // Essence orb sprites (one per colour)
    this.load.image('essence_black',  'assets/td_items/td_items_skull.png');
    this.load.image('essence_purple', 'assets/td_items/td_items_gem_amethyst.png');
    this.load.image('essence_red',    'assets/td_items/td_items_gem_ruby.png');
    this.load.image('essence_green',  'assets/td_items/td_items_gem_jade.png');
  }

  create() {
    this._applyColorKey('dragon', 220);
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
