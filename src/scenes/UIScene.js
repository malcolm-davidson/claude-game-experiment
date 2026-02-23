/**
 * UIScene — HUD overlay that reads from the registry.
 * Runs in parallel with GameScene.
 */

const ESSENCE_SLOTS = [
  { color: 'black',  label: 'B', tint: 0x888888 },
  { color: 'purple', label: 'P', tint: 0xaa66ff },
  { color: 'red',    label: 'R', tint: 0xff5555 },
  { color: 'green',  label: 'G', tint: 0x44dd88 },
];

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    // Score
    this.scoreText = this.add.text(10, 10, 'SCORE: 0', {
      fontSize: '14px',
      color: '#e8c87a',
      fontStyle: 'bold',
    });

    // Arena index
    this.arenaText = this.add.text(240, 10, 'ARENA 1', {
      fontSize: '14px',
      color: '#cc8833',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // GitHub button
    this.githubButton = this.add.text(470, 10, '⭐ GitHub', {
      fontSize: '13px',
      color: '#f8db8d',
      fontStyle: 'bold',
      backgroundColor: '#2a1a12',
      padding: { x: 10, y: 6 },
    })
      .setOrigin(1, 0)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    this.githubButton
      .on('pointerover', () => {
        this.githubButton.setStyle({ color: '#fff5d6', backgroundColor: '#4a2a18' });
      })
      .on('pointerout', () => {
        this.githubButton.setStyle({ color: '#f8db8d', backgroundColor: '#2a1a12' });
        this.githubButton.setScale(1);
      })
      .on('pointerdown', () => {
        this.githubButton.setScale(0.97);
        window.open('https://github.com/malcolm-davidson/claude-game-experiment', '_blank', 'noopener,noreferrer');
      })
      .on('pointerup', () => {
        this.githubButton.setScale(1);
      });

    // HP bar
    this.add.text(10, 620, 'HP', { fontSize: '12px', color: '#cc3333' });
    this.hpBarBg = this.add.rectangle(35, 624, 120, 10, 0x330000).setOrigin(0, 0.5);
    this.hpBar   = this.add.rectangle(35, 624, 120, 10, 0xcc2222).setOrigin(0, 0.5);

    // C-03: 4-colour Essence HUD row (bottom-right, alongside HP bar)
    this._essenceSlots = {};
    const slotStartX = 168;
    const slotGap    = 76;

    ESSENCE_SLOTS.forEach(({ color, label, tint }, i) => {
      const x = slotStartX + i * slotGap;

      // Gem icon
      const icon = this.add.image(x, 618, `essence_${color}`)
        .setDisplaySize(20, 20)
        .setDepth(10)
        .setTint(tint);

      // Accessibility letter label (always visible, color-independent)
      const letterText = this.add.text(x + 13, 610, label, {
        fontSize: '10px',
        color: '#' + tint.toString(16).padStart(6, '0'),
        fontStyle: 'bold',
      }).setOrigin(0, 0.5).setDepth(10);

      // Count
      const countText = this.add.text(x + 13, 624, '0', {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5).setDepth(10);

      this._essenceSlots[color] = { icon, letterText, countText };
    });

    // Listen for registry changes
    this.registry.events.on('changedata', this._onRegistryChange, this);
  }

  _onRegistryChange(parent, key, value) {
    if (key === 'score') {
      this.scoreText.setText(`SCORE: ${value}`);

    } else if (key === 'arenaIndex') {
      this.arenaText.setText(`ARENA ${value + 1}`);

    } else if (key === 'hp' || key === 'maxHp') {
      const hp    = this.registry.get('hp');
      const maxHp = this.registry.get('maxHp');
      const ratio = Math.max(0, hp / maxHp);
      this.hpBar.setDisplaySize(120 * ratio, 10);

    } else if (key.startsWith('essence_')) {
      const color = key.slice('essence_'.length);
      const slot  = this._essenceSlots[color];
      if (!slot) return;

      slot.countText.setText(String(value));

      // Pulse tween on gain (scale 1 → 1.3 → 1, 200ms)
      this.tweens.add({
        targets: [slot.icon, slot.countText],
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Power1',
      });
    }
  }
}
