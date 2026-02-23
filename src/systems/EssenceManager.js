/**
 * EssenceManager — 4-colour in-run economy.
 *
 * Tracks current essence amounts per colour, syncs to the Phaser registry,
 * and emits events for other systems (UIScene pulse, DevotionManager, etc.)
 *
 * Registry keys (pre-populated in GameScene A-03):
 *   essence_black | essence_purple | essence_red | essence_green
 *
 * Events emitted on scene.events:
 *   'essence-gained'  { color, amount, source }
 *   'essence-spent'   { color, amount }
 */

export const ESSENCE_COLORS = ['black', 'purple', 'red', 'green'];

export class EssenceManager {
  constructor(scene) {
    this.scene    = scene;
    this._amounts = { black: 0, purple: 0, red: 0, green: 0 };
  }

  /**
   * Add essence of a given colour.
   * @param {'black'|'purple'|'red'|'green'} color
   * @param {number} amount  positive integer
   * @param {string} source  e.g. 'kill', 'market', 'ritual' — forwarded to DevotionManager (H-01)
   */
  gain(color, amount, source = 'unknown') {
    if (!this._valid(color) || amount <= 0) return;
    this._amounts[color] += amount;
    this.scene.registry.set(`essence_${color}`, this._amounts[color]);
    this.scene.events.emit('essence-gained', { color, amount, source });
  }

  /**
   * Spend essence of a given colour.
   * @returns {boolean} true if affordable and deducted, false otherwise
   */
  spend(color, amount) {
    if (!this._valid(color) || amount <= 0) return false;
    if (this._amounts[color] < amount) return false;
    this._amounts[color] -= amount;
    this.scene.registry.set(`essence_${color}`, this._amounts[color]);
    this.scene.events.emit('essence-spent', { color, amount });
    return true;
  }

  /**
   * Check whether all colour costs can be met simultaneously.
   * @param {Partial<Record<'black'|'purple'|'red'|'green', number>>} costs
   * @returns {boolean}
   */
  canAfford(costs) {
    for (const [color, amount] of Object.entries(costs)) {
      if ((this._amounts[color] ?? 0) < amount) return false;
    }
    return true;
  }

  /** Returns a shallow copy of current amounts. */
  getAll() {
    return { ...this._amounts };
  }

  // ── Private ──────────────────────────────────────────────────────────

  _valid(color) {
    return color in this._amounts;
  }
}
