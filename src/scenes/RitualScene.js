/**
 * RitualScene — Fourfold Rite overlay.
 *
 * Launched over GameScene at arena-end. Pauses GameScene physics while
 * open. Player works through the sigil sequence then the overlay closes
 * and GameScene resumes.
 *
 * Layout (480×640):
 *   - Dark overlay background
 *   - Title "FOURFOLD RITE"
 *   - Current sigil (large colour circle + label)
 *   - Sequence history row (small icons)
 *   - Thread / Depth / Resonance stats row
 *   - Available Essence row (read-only mirror of registry)
 *   - 4 Match buttons (one per colour) + Skip + Bank
 *   - Consequence preview text (shows what Bank would give right now)
 */

import { RitualManager } from '../systems/RitualManager.js';
import { getRitualReward, rewardPreviewLabel } from '../data/RitualRewards.js';

const SIGIL_COLOR = {
  black:  0x888888,
  purple: 0xaa66ff,
  red:    0xff5555,
  green:  0x44dd88,
};

const HEX = {
  black:  '#888888',
  purple: '#aa66ff',
  red:    '#ff5555',
  green:  '#44dd88',
};

export class RitualScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Ritual', active: false });
  }

  /**
   * @param {{ threadCount: number }} data  passed from GameScene.launchRitual()
   */
  create(data) {
    const threadCount = data?.threadCount ?? 3;

    // Pause game physics while ritual is open
    const game = this.scene.get('Game');
    if (game?.physics) game.physics.pause();

    this._buildUI();
    this._startRitual(threadCount);
  }

  // ── UI construction ──────────────────────────────────────────────────

  _buildUI() {
    // Dark overlay
    this.add.rectangle(240, 320, 480, 640, 0x000000, 0.82).setDepth(0);

    // Title
    this.add.text(240, 28, 'FOURFOLD RITE', {
      fontSize: '20px', color: '#f8db8d', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(1);

    // ── Current sigil ──
    this._sigilCircle = this.add.circle(240, 130, 48, 0x333333).setDepth(1);
    this._sigilLabel  = this.add.text(240, 130, '?', {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    this.add.text(240, 185, 'CURRENT SIGIL', {
      fontSize: '10px', color: '#888888',
    }).setOrigin(0.5).setDepth(1);

    // ── History row ──
    this._historyRow = this.add.container(240, 230).setDepth(1);
    this.add.text(240, 210, 'HISTORY', {
      fontSize: '9px', color: '#555555',
    }).setOrigin(0.5).setDepth(1);

    // ── Stats row: Thread / Depth / Resonance ──
    this._threadText    = this._statLabel(80,  278, 'THREAD',    '3');
    this._depthText     = this._statLabel(240, 278, 'DEPTH',     '0');
    this._resonanceText = this._statLabel(400, 278, 'RESONANCE', '0');

    // ── Essence row (read from registry) ──
    this.add.text(240, 308, 'AVAILABLE ESSENCE', {
      fontSize: '9px', color: '#555555',
    }).setOrigin(0.5).setDepth(1);
    this._essenceTexts = {};
    ['black', 'purple', 'red', 'green'].forEach((c, i) => {
      const x = 100 + i * 94;
      this.add.text(x, 322, c[0].toUpperCase(), {
        fontSize: '9px', color: HEX[c], fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1);
      this._essenceTexts[c] = this.add.text(x, 336, '0', {
        fontSize: '14px', color: HEX[c], fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1);
    });

    // ── Match buttons ──
    this.add.text(240, 362, 'MATCH', {
      fontSize: '9px', color: '#555555',
    }).setOrigin(0.5).setDepth(1);
    this._matchBtns = {};
    ['black', 'purple', 'red', 'green'].forEach((c, i) => {
      const x = 60 + i * 94;
      const btn = this._makeButton(x, 390, 80, 30, c[0].toUpperCase(), SIGIL_COLOR[c], () => {
        this._ritual.match(c);
      });
      this._matchBtns[c] = btn;
    });

    // ── Skip + Bank ──
    this._skipBtn = this._makeButton(140, 440, 110, 32, 'SKIP  (–1 Thread)', 0x333333, () => {
      this._ritual.skip();
    });
    this._bankBtn = this._makeButton(340, 440, 110, 32, 'BANK', 0x2a5a00, () => {
      this._ritual.bank();
    });

    // ── Consequence preview ──
    this.add.text(240, 476, 'BANK REWARD PREVIEW', {
      fontSize: '9px', color: '#555555',
    }).setOrigin(0.5).setDepth(1);
    this._previewText = this.add.text(240, 492, '—', {
      fontSize: '11px', color: '#f8db8d', align: 'center', wordWrap: { width: 360 },
    }).setOrigin(0.5).setDepth(1);

    // ── Step progress ──
    this._progressText = this.add.text(240, 526, '', {
      fontSize: '10px', color: '#666666',
    }).setOrigin(0.5).setDepth(1);
  }

  // ── Ritual wiring ────────────────────────────────────────────────────

  _startRitual(threadCount) {
    this._ritual = new RitualManager(
      (event, payload) => this._onRitualEvent(event, payload),
      (color) => {
        const game = this.scene.get('Game');
        return game?.essenceManager?.spend(color, 1) ?? false;
      },
    );
    this._ritual.startRitual(threadCount);
    this._refreshEssence();
  }

  _onRitualEvent(event, payload) {
    switch (event) {
      case 'step-revealed':
        this._showSigil(payload.color);
        this._progressText.setText(`Step ${payload.stepIndex + 1} / ${payload.totalSteps}`);
        this._refreshStats();
        this._refreshMatchButtons();
        this._refreshPreview();
        break;

      case 'match-success':
        this._addHistoryIcon(payload.color, 'match');
        this._refreshStats();
        this._refreshEssence();
        this._refreshPreview();
        break;

      case 'skip-success':
        this._addHistoryIcon(this._ritual.history.at(-1)?.color ?? 'black', 'skip');
        this._refreshStats();
        this._refreshPreview();
        break;

      case 'thread-depleted':
        this._skipBtn.setAlpha(0.3).disableInteractive();
        break;

      case 'ritual-complete':
        this._onComplete(payload);
        break;
    }
  }

  _onComplete({ depth, resonance, history }) {
    const reward = getRitualReward(depth, resonance);

    // Show result screen briefly then close
    this._clearInteractives();

    this.add.text(240, 560, `✦ ${reward.label}`, {
      fontSize: '13px', color: '#f8db8d', fontStyle: 'bold', align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5).setDepth(3);

    this.add.text(240, 590, reward.effect, {
      fontSize: '10px', color: '#aaaaaa', align: 'center',
      wordWrap: { width: 380 },
    }).setOrigin(0.5).setDepth(3);

    // Apply reward and close after 2s
    this.time.delayedCall(2000, () => {
      const game = this.scene.get('Game');
      if (game) {
        reward.applyFn(game);
        game.physics.resume();
      }
      this.scene.stop();
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  _showSigil(color) {
    this._sigilCircle.setFillStyle(SIGIL_COLOR[color] ?? 0x333333);
    this._sigilLabel.setText(color.toUpperCase()).setColor(HEX[color] ?? '#ffffff');

    // Pulse
    this.tweens.add({
      targets: [this._sigilCircle, this._sigilLabel],
      scaleX: 1.15, scaleY: 1.15,
      duration: 120, yoyo: true, ease: 'Power1',
    });
  }

  _addHistoryIcon(color, action) {
    const count = this._ritual.history.length;
    const x     = (count - 1) * 22 - Math.min(count - 1, 9) * 11;
    const dot   = this.add.circle(x, 0, 8,
      action === 'match' ? (SIGIL_COLOR[color] ?? 0x888888) : 0x333333)
      .setStrokeStyle(1, action === 'skip' ? 0x666666 : 0xffffff, 0.4);
    this._historyRow.add(dot);
  }

  _refreshStats() {
    this._threadText.setText(`THREAD\n${this._ritual.thread}`);
    this._depthText.setText(`DEPTH\n${this._ritual.depth}`);
    this._resonanceText.setText(`RESONANCE\n${this._ritual.resonance}`);
  }

  _refreshEssence() {
    const game = this.scene.get('Game');
    if (!game) return;
    for (const c of ['black', 'purple', 'red', 'green']) {
      const val = game.registry.get(`essence_${c}`) ?? 0;
      this._essenceTexts[c].setText(String(val));
    }
  }

  _refreshMatchButtons() {
    const game = this.scene.get('Game');
    const em   = game?.essenceManager;
    const cur  = this._ritual.currentColor;
    for (const [c, btn] of Object.entries(this._matchBtns)) {
      const isMatch    = c === cur;
      const canAfford  = em ? em.canAfford({ [c]: 1 }) : false;
      const active     = isMatch && canAfford;
      btn.setAlpha(active ? 1 : 0.35);
      if (active) btn.setInteractive({ useHandCursor: true });
      else        btn.disableInteractive();
    }
  }

  _refreshPreview() {
    const label = rewardPreviewLabel(this._ritual.depth, this._ritual.resonance);
    this._previewText.setText(label);
  }

  _clearInteractives() {
    Object.values(this._matchBtns).forEach(b => b.disableInteractive());
    this._skipBtn.disableInteractive();
    this._bankBtn.disableInteractive();
  }

  _statLabel(x, y, title, value) {
    const txt = this.add.text(x, y, `${title}\n${value}`, {
      fontSize: '11px', color: '#cccccc', align: 'center',
    }).setOrigin(0.5).setDepth(1);
    return txt;
  }

  _makeButton(x, y, w, h, label, color, onDown) {
    const bg  = this.add.rectangle(x, y, w, h, color, 1)
      .setStrokeStyle(1, 0xffffff, 0.3)
      .setDepth(1)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2);

    bg.on('pointerdown', onDown);
    bg.on('pointerover',  () => bg.setAlpha(0.8));
    bg.on('pointerout',   () => bg.setAlpha(1.0));

    // Return bg as the primary handle for disabling
    bg._label = txt;
    return bg;
  }
}
