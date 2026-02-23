import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MARKET_ITEMS, itemsForTier } from '../data/MarketItems.js';

// ── Data structure ────────────────────────────────────────────────────────────

describe('MARKET_ITEMS', () => {
  it('exports at least 12 items', () => {
    expect(MARKET_ITEMS.length).toBeGreaterThanOrEqual(12);
  });

  it('every item has required fields', () => {
    for (const item of MARKET_ITEMS) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('effect');
      expect(item).toHaveProperty('cost');
      expect(item).toHaveProperty('tier');
      expect(item).toHaveProperty('applyFn');
      expect(typeof item.applyFn).toBe('function');
    }
  });

  it('all tiers are 1, 2, or 3', () => {
    for (const item of MARKET_ITEMS) {
      expect([1, 2, 3]).toContain(item.tier);
    }
  });

  it('cost values are positive integers', () => {
    for (const item of MARKET_ITEMS) {
      for (const [color, amount] of Object.entries(item.cost)) {
        expect(amount).toBeGreaterThan(0);
        expect(Number.isInteger(amount)).toBe(true);
      }
    }
  });

  it('cost colors are valid essence colours', () => {
    const valid = new Set(['black', 'purple', 'red', 'green']);
    for (const item of MARKET_ITEMS) {
      for (const color of Object.keys(item.cost)) {
        expect(valid.has(color)).toBe(true);
      }
    }
  });

  it('all item ids are unique', () => {
    const ids = MARKET_ITEMS.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('spans all four essence colours across the pool', () => {
    const usedColors = new Set(MARKET_ITEMS.flatMap(i => Object.keys(i.cost)));
    expect(usedColors.has('black')).toBe(true);
    expect(usedColors.has('purple')).toBe(true);
    expect(usedColors.has('red')).toBe(true);
    expect(usedColors.has('green')).toBe(true);
  });
});

// ── itemsForTier ──────────────────────────────────────────────────────────────

describe('itemsForTier', () => {
  it('tier 1 returns only tier-1 items', () => {
    const result = itemsForTier(1);
    expect(result.every(i => i.tier === 1)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('tier 2 returns tier 1 and tier 2 items', () => {
    const result = itemsForTier(2);
    expect(result.every(i => i.tier <= 2)).toBe(true);
    expect(result.some(i => i.tier === 1)).toBe(true);
    expect(result.some(i => i.tier === 2)).toBe(true);
  });

  it('tier 3 returns all items', () => {
    const result = itemsForTier(3);
    expect(result.length).toBe(MARKET_ITEMS.length);
  });

  it('tier 1 pool is smaller than tier 3 pool', () => {
    expect(itemsForTier(1).length).toBeLessThan(itemsForTier(3).length);
  });
});

// ── applyFn affordability path ────────────────────────────────────────────────

describe('item applyFn', () => {
  function makeScene(essence = { black: 5, purple: 5, red: 5, green: 5 }) {
    const registry = new Map([
      ['dashCharges', 2], ['maxDashCharges', 2], ['hp', 10],
    ]);
    const player = {
      stats: { hp: 10, maxHp: 10, attack: 2, speed: 200, fireRate: 300 },
      applyUpgrade: vi.fn(({ type, value }) => {
        if (type === 'hp') { player.stats.maxHp += value; player.stats.hp += value; }
        if (type === 'attack') player.stats.attack += value;
        if (type === 'fireRate') player.stats.fireRate -= value;
      }),
      _dashCharges: 2, _maxDashCharges: 2,
    };
    const essenceManager = {
      gain: vi.fn(),
      spend: vi.fn(),
      canAfford: vi.fn((costs) =>
        Object.entries(costs).every(([c, n]) => (essence[c] ?? 0) >= n)
      ),
    };
    return {
      player,
      essenceManager,
      registry: {
        get: (k) => registry.get(k),
        set: (k, v) => registry.set(k, v),
      },
    };
  }

  it('hp_small calls applyUpgrade with hp +2', () => {
    const scene = makeScene();
    const item  = MARKET_ITEMS.find(i => i.id === 'hp_small');
    item.applyFn(scene);
    expect(scene.player.applyUpgrade).toHaveBeenCalledWith({ type: 'hp', value: 2 });
  });

  it('attack_small calls applyUpgrade with attack +1', () => {
    const scene = makeScene();
    const item  = MARKET_ITEMS.find(i => i.id === 'attack_small');
    item.applyFn(scene);
    expect(scene.player.applyUpgrade).toHaveBeenCalledWith({ type: 'attack', value: 1 });
  });

  it('essence_black_x2 calls essenceManager.gain with black, 2, market', () => {
    const scene = makeScene();
    const item  = MARKET_ITEMS.find(i => i.id === 'essence_black_x2');
    item.applyFn(scene);
    expect(scene.essenceManager.gain).toHaveBeenCalledWith('black', 2, 'market');
  });

  it('essence_convert gains 1 of each colour', () => {
    const scene = makeScene();
    const item  = MARKET_ITEMS.find(i => i.id === 'essence_convert');
    item.applyFn(scene);
    for (const c of ['black', 'purple', 'red', 'green']) {
      expect(scene.essenceManager.gain).toHaveBeenCalledWith(c, 1, 'market');
    }
  });

  it('dash_refill increments dashCharges up to max', () => {
    const scene = makeScene();
    scene.registry.set('dashCharges', 1);
    scene.player._dashCharges = 1;
    const item = MARKET_ITEMS.find(i => i.id === 'dash_refill');
    item.applyFn(scene);
    expect(scene.registry.get('dashCharges')).toBe(2);
    expect(scene.player._dashCharges).toBe(2);
  });

  it('dash_refill does not exceed maxDashCharges', () => {
    const scene = makeScene();
    scene.registry.set('dashCharges', 2); // already full
    scene.player._dashCharges = 2;
    const item = MARKET_ITEMS.find(i => i.id === 'dash_refill');
    item.applyFn(scene);
    expect(scene.registry.get('dashCharges')).toBe(2);
  });
});
