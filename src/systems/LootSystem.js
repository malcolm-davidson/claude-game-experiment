/**
 * LootSystem — handles loot drops and player upgrades (roguelite layer).
 * Drop rate and upgrade pool grow with wave number.
 */

const UPGRADES = [
  { type: 'hp',       label: 'Dragon Vitality +2',  value: 2,   tint: 0xff4444 },
  { type: 'attack',   label: 'Dragonfire +1',        value: 1,   tint: 0xff8800 },
  { type: 'fireRate', label: 'Wing Cadence +50ms',   value: 50,  tint: 0xffdd00 },
];

export class LootSystem {
  constructor(scene) {
    this.scene    = scene;
    this._dropRate = 0.25; // 25% chance on enemy death
  }

  tryDrop(x, y) {
    if (Math.random() > this._dropRate) return;

    const upgrade = Phaser.Utils.Array.GetRandom(UPGRADES);
    const gem = this.scene.lootItems.create(x, y, 'particle');
    gem.setScale(3);
    gem.setTint(upgrade.tint);
    gem.setDepth(5);
    gem.setData('upgrade', upgrade);
    gem.setVelocityY(40);
  }

  collect(loot) {
    const upgrade = loot.getData('upgrade');
    if (!upgrade) return;

    this.scene.player.applyUpgrade(upgrade);
    this.scene.addScore(50);

    // Floating pickup text
    const txt = this.scene.add.text(loot.x, loot.y, upgrade.label, {
      fontSize: '11px',
      color: '#' + upgrade.tint.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 40,
      alpha: 0,
      duration: 1200,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });

    loot.destroy();
  }
}
