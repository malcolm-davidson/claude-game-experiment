/**
 * RitualRewards — maps (depth, resonance) to reward definitions.
 *
 * Tiers (by depth):
 *   1–2  minor  — small stat bumps
 *   3–4  medium — meaningful upgrades
 *   5+   high   — compound / run-altering effects
 *
 * Resonance modifier (stacks on top of depth tier):
 *   0–2   base      — reward as-is
 *   3–5   enhanced  — higher values on the same reward type
 *   6+    resonant  — compound/rare reward unlocked
 *
 * Each reward:
 *   label      display name
 *   effect     one-line description
 *   applyFn    (scene) => void
 */

// ── Reward definitions ────────────────────────────────────────────────────────

const MINOR_HP = (v) => ({
  label:   `Ritual Mending +${v} HP`,
  effect:  `Restore and increase max HP by ${v}`,
  applyFn: (scene) => scene.player.applyUpgrade({ type: 'hp', value: v }),
});

const MINOR_ATTACK = (v) => ({
  label:   `Sigil Sharpening +${v} ATK`,
  effect:  `Increase attack damage by ${v}`,
  applyFn: (scene) => scene.player.applyUpgrade({ type: 'attack', value: v }),
});

const MINOR_FIRERATE = (v) => ({
  label:   `Rite of Cadence -${v}ms`,
  effect:  `Decrease fire interval by ${v}ms`,
  applyFn: (scene) => scene.player.applyUpgrade({ type: 'fireRate', value: v }),
});

const ESSENCE_BURST = (colors, amount) => ({
  label:   'Essence Overflow',
  effect:  `Gain ${amount} ${colors.join('+')} Essence`,
  applyFn: (scene) => colors.forEach(c => scene.essenceManager?.gain(c, amount, 'ritual')),
});

const ESSENCE_BONUS_ALL = (amount) => ({
  label:   'Fourfold Resonance',
  effect:  `Gain ${amount} of every Essence colour`,
  applyFn: (scene) => ['black', 'purple', 'red', 'green']
    .forEach(c => scene.essenceManager?.gain(c, amount, 'ritual')),
});

const DASH_EXTEND = () => ({
  label:   'Ritual of Wind',
  effect:  '+1 max dash charge',
  applyFn: (scene) => {
    const max = (scene.registry.get('maxDashCharges') ?? 2) + 1;
    scene.registry.set('maxDashCharges', max);
    if (scene.player._maxDashCharges !== undefined) {
      scene.player._maxDashCharges = max;
      scene.player._dashCharges = Math.min(scene.player._dashCharges + 1, max);
    }
  },
});

const COMPOUND_HP_ATK = () => ({
  label:   'Warrior\'s Rite',
  effect:  '+3 HP and +2 ATK',
  applyFn: (scene) => {
    scene.player.applyUpgrade({ type: 'hp',     value: 3 });
    scene.player.applyUpgrade({ type: 'attack', value: 2 });
  },
});

const RARE_PLACEHOLDER = (name) => ({
  label:   name,
  effect:  '(Rare — coming in future build)',
  applyFn: (scene) => {
    // Future: grant a special passive or meta modifier
    scene.player.applyUpgrade({ type: 'hp', value: 2 }); // fallback minor reward
  },
});

// ── Lookup table ─────────────────────────────────────────────────────────────

/**
 * Select a reward based on depth and resonance scores.
 * @param {number} depth
 * @param {number} resonance
 * @returns {{ label, effect, applyFn }}
 */
export function getRitualReward(depth, resonance) {
  // High depth (5+)
  if (depth >= 5) {
    if (resonance >= 6) return RARE_PLACEHOLDER('Void Rite — Transcendence');
    if (resonance >= 3) return COMPOUND_HP_ATK();
    return ESSENCE_BONUS_ALL(3);
  }

  // Medium depth (3–4)
  if (depth >= 3) {
    if (resonance >= 6) return COMPOUND_HP_ATK();
    if (resonance >= 3) return DASH_EXTEND();
    return ESSENCE_BONUS_ALL(2);
  }

  // Low depth (1–2)
  if (depth === 2) {
    if (resonance >= 6) return ESSENCE_BONUS_ALL(1);
    if (resonance >= 3) return MINOR_ATTACK(2);
    return MINOR_HP(3);
  }

  if (depth === 1) {
    if (resonance >= 3) return MINOR_FIRERATE(50);
    return MINOR_HP(2);
  }

  // Depth 0 — all skips / bank immediately
  return ESSENCE_BURST(['purple'], 1);
}

/**
 * Human-readable label for a (depth, resonance) outcome.
 * Used by RitualScene to preview consequence before banking.
 */
export function rewardPreviewLabel(depth, resonance) {
  return getRitualReward(depth, resonance).label;
}
