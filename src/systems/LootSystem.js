/**
 * LootSystem — handles loot drops on enemy death.
 *
 * Two drop types:
 *   Upgrade  — stat upgrades (hp/attack/fireRate), existing system
 *   Essence  — coloured essence orbs collected into EssenceManager
 *
 * Drop rates are modified by the zoneBonus.lootBonus from ArenaManager (B-03).
 */

const UPGRADES = [
  { type: 'hp',       label: 'Dragon Vitality +2',  value: 2,   tint: 0xff4444, textureKey: 'loot_hp'       },
  { type: 'attack',   label: 'Dragonfire +1',        value: 1,   tint: 0xff8800, textureKey: 'loot_attack'   },
  { type: 'fireRate', label: 'Wing Cadence +50ms',   value: 50,  tint: 0xffdd00, textureKey: 'loot_firerate' },
];

/**
 * Type-to-essence-colour affinity.
 * dragon has two entries — a second drop is attempted at half rate.
 */
const ESSENCE_AFFINITY = {
  bat:    ['purple'],
  griffin: ['red'],
  moth:   ['green'],
  demon:  ['black'],
  dragon: ['black', 'red'],  // both colours possible
};

export class LootSystem {
  constructor(scene) {
    this.scene         = scene;
    this._upgradeDrop  = 0.20; // base chance of an upgrade drop per kill
    this._essenceDrop  = 0.55; // base chance of an essence drop per kill
  }

  /**
   * Called by EnemyWyvern._die() at the enemy's position.
   * @param {number} x
   * @param {number} y
   * @param {string} [enemyType]
   * @param {{ lootBonus?: number }} [zoneBonus]
   */
  tryDrop(x, y, enemyType = 'griffin', zoneBonus = {}) {
    const bonus = zoneBonus.lootBonus ?? 0;

    // Essence drop (55% base, +lootBonus%)
    const colors = ESSENCE_AFFINITY[enemyType] ?? ['purple'];
    if (Math.random() < this._essenceDrop + bonus) {
      this._dropEssence(x, y, colors[0]);
    }
    // Dragon: additional chance for the second colour
    if (colors.length > 1 && Math.random() < (this._essenceDrop + bonus) * 0.5) {
      this._dropEssence(x + 10, y, colors[1]);
    }

    // Upgrade drop (20% base, +lootBonus%)
    if (Math.random() < this._upgradeDrop + bonus) {
      this._dropUpgrade(x, y);
    }
  }

  collect(loot) {
    const essenceColor = loot.getData('essenceColor');
    if (essenceColor) {
      this._collectEssence(loot, essenceColor);
    } else {
      this._collectUpgrade(loot);
    }
  }

  // ── Private ──────────────────────────────────────────────────────────

  _dropEssence(x, y, color) {
    const orb = this.scene.lootItems.create(x, y, `essence_${color}`);
    orb.setScale(1.8);
    orb.setDepth(5);
    orb.setData('essenceColor', color);
    orb.setVelocityY(50);
  }

  _dropUpgrade(x, y) {
    const upgrade = Phaser.Utils.Array.GetRandom(UPGRADES);
    const gem = this.scene.lootItems.create(x, y, upgrade.textureKey);
    gem.setScale(2);
    gem.setDepth(5);
    gem.setData('upgrade', upgrade);
    gem.setVelocityY(40);
  }

  _collectEssence(loot, color) {
    const em = this.scene.essenceManager;
    if (em) em.gain(color, 1, 'kill');
    this.scene.addScore(20);

    // Floating pickup text
    const colors = { black: '#888888', purple: '#aa66ff', red: '#ff4444', green: '#44ff88' };
    const labels = { black: 'B', purple: 'P', red: 'R', green: 'G' };
    const txt = this.scene.add.text(loot.x, loot.y, `+${labels[color] ?? color}`, {
      fontSize: '13px',
      color: colors[color] ?? '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 35,
      alpha: 0,
      duration: 900,
      ease: 'Power1',
      onComplete: () => txt.destroy(),
    });

    loot.destroy();
  }

  _collectUpgrade(loot) {
    const upgrade = loot.getData('upgrade');
    if (!upgrade) { loot.destroy(); return; }

    this.scene.player.applyUpgrade(upgrade);
    this.scene.addScore(50);

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
