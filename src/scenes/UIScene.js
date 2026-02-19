/**
 * UIScene — HUD overlay that reads from the registry.
 * Runs in parallel with GameScene.
 */
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

    // Wave
    this.waveText = this.add.text(240, 10, 'WAVE 1', {
      fontSize: '14px',
      color: '#cc8833',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // HP bar
    this.add.text(10, 620, 'HP', { fontSize: '12px', color: '#cc3333' });
    this.hpBarBg = this.add.rectangle(35, 624, 120, 10, 0x330000).setOrigin(0, 0.5);
    this.hpBar   = this.add.rectangle(35, 624, 120, 10, 0xcc2222).setOrigin(0, 0.5);

    // Listen for registry changes
    this.registry.events.on('changedata', this._onRegistryChange, this);
  }

  _onRegistryChange(parent, key, value) {
    if (key === 'score') {
      this.scoreText.setText(`SCORE: ${value}`);
    } else if (key === 'wave') {
      this.waveText.setText(`WAVE ${value}`);
    } else if (key === 'hp' || key === 'maxHp') {
      const hp    = this.registry.get('hp');
      const maxHp = this.registry.get('maxHp');
      const ratio = Math.max(0, hp / maxHp);
      this.hpBar.setDisplaySize(120 * ratio, 10);
    }
  }
}
