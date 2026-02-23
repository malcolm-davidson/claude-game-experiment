/**
 * MarketItems — pool of purchasable items for the Market Tile.
 *
 * Each item:
 *   id       — unique string key
 *   label    — display name
 *   effect   — one-line description shown in the panel
 *   cost     — { color: amount } — essence cost
 *   tier     — 1 (cheap/common) | 2 (moderate) | 3 (top-zone, expensive)
 *   applyFn  — (scene) => void — called on purchase
 *
 * Tier availability:
 *   Tier 1  — all zones
 *   Tier 2  — middle + top zones
 *   Tier 3  — top zone only
 */

export const MARKET_ITEMS = [
  // ── Tier 1 — cheap, broadly useful ──────────────────────────────────

  {
    id:     'hp_small',
    label:  'Mending Draught',
    effect: '+2 max HP, restore 2 HP',
    cost:   { red: 1 },
    tier:   1,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'hp', value: 2 }),
  },
  {
    id:     'firerate_small',
    label:  'Quicken Wings',
    effect: 'Fire rate +50ms faster',
    cost:   { green: 1 },
    tier:   1,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'fireRate', value: 50 }),
  },
  {
    id:     'attack_small',
    label:  'Ember Shard',
    effect: '+1 attack damage',
    cost:   { red: 1, black: 1 },
    tier:   1,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'attack', value: 1 }),
  },
  {
    id:     'dash_refill',
    label:  'Windstone',
    effect: 'Restore 1 dash charge now',
    cost:   { purple: 1 },
    tier:   1,
    applyFn: (scene) => {
      const current = scene.registry.get('dashCharges') ?? 0;
      const max     = scene.registry.get('maxDashCharges') ?? 2;
      scene.registry.set('dashCharges', Math.min(current + 1, max));
      if (scene.player._dashCharges !== undefined) {
        scene.player._dashCharges = Math.min(scene.player._dashCharges + 1, scene.player._maxDashCharges);
      }
    },
  },
  {
    id:     'essence_black_x2',
    label:  'Grave Dust',
    effect: '+2 Black Essence',
    cost:   { green: 1 },
    tier:   1,
    applyFn: (scene) => scene.essenceManager?.gain('black', 2, 'market'),
  },
  {
    id:     'essence_green_x2',
    label:  'Wildbloom',
    effect: '+2 Green Essence',
    cost:   { red: 1 },
    tier:   1,
    applyFn: (scene) => scene.essenceManager?.gain('green', 2, 'market'),
  },

  // ── Tier 2 — moderate cost, stronger effects ─────────────────────────

  {
    id:     'hp_medium',
    label:  'Dragon\'s Blood Flask',
    effect: '+4 max HP, restore 4 HP',
    cost:   { red: 2 },
    tier:   2,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'hp', value: 4 }),
  },
  {
    id:     'attack_medium',
    label:  'Scorched Talon',
    effect: '+2 attack damage',
    cost:   { red: 2, black: 1 },
    tier:   2,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'attack', value: 2 }),
  },
  {
    id:     'firerate_medium',
    label:  'Tempest Feather',
    effect: 'Fire rate +100ms faster',
    cost:   { green: 2 },
    tier:   2,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'fireRate', value: 100 }),
  },
  {
    id:     'dash_extra',
    label:  'Storm Vial',
    effect: '+1 max dash charge',
    cost:   { purple: 2, green: 1 },
    tier:   2,
    applyFn: (scene) => {
      const max = (scene.registry.get('maxDashCharges') ?? 2) + 1;
      scene.registry.set('maxDashCharges', max);
      if (scene.player._maxDashCharges !== undefined) {
        scene.player._maxDashCharges = max;
        scene.player._dashCharges    = Math.min(scene.player._dashCharges + 1, max);
      }
    },
  },
  {
    id:     'essence_convert',
    label:  'Alchemist\'s Stone',
    effect: '+1 of each Essence colour',
    cost:   { black: 1, purple: 1 },
    tier:   2,
    applyFn: (scene) => {
      for (const c of ['black', 'purple', 'red', 'green']) {
        scene.essenceManager?.gain(c, 1, 'market');
      }
    },
  },

  // ── Tier 3 — top-zone only, powerful ────────────────────────────────

  {
    id:     'hp_large',
    label:  'Ancient Scale',
    effect: '+6 max HP, full restore',
    cost:   { red: 3, green: 1 },
    tier:   3,
    applyFn: (scene) => {
      scene.player.applyUpgrade({ type: 'hp', value: 6 });
      // Also top up to new max
      scene.player.stats.hp = scene.player.stats.maxHp;
      scene.registry.set('hp', scene.player.stats.hp);
    },
  },
  {
    id:     'attack_large',
    label:  'Void Fang',
    effect: '+3 attack damage',
    cost:   { black: 3, red: 1 },
    tier:   3,
    applyFn: (scene) => scene.player.applyUpgrade({ type: 'attack', value: 3 }),
  },
  {
    id:     'full_refill',
    label:  'Tempest Core',
    effect: 'Restore all dash charges + max +1',
    cost:   { purple: 3 },
    tier:   3,
    applyFn: (scene) => {
      const max = (scene.registry.get('maxDashCharges') ?? 2) + 1;
      scene.registry.set('maxDashCharges', max);
      scene.registry.set('dashCharges', max);
      if (scene.player._maxDashCharges !== undefined) {
        scene.player._maxDashCharges = max;
        scene.player._dashCharges    = max;
      }
    },
  },
];

/** Return items available for a given zone tier. */
export function itemsForTier(zoneTier) {
  return MARKET_ITEMS.filter(item => item.tier <= zoneTier);
}

/** Pick 2–3 random items for display, respecting zone tier. */
export function pickMarketItems(zoneTier, count = 3) {
  const pool     = itemsForTier(zoneTier);
  // Use Phaser shuffle when available (in-game), fall back to Fisher-Yates (tests)
  const shuffled = (typeof Phaser !== 'undefined')
    ? Phaser.Utils.Array.Shuffle([...pool])
    : [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
