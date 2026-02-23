import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EssenceManager, ESSENCE_COLORS } from '../systems/EssenceManager.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeScene() {
  const registry = { set: vi.fn() };
  const events   = { emit: vi.fn() };
  return { registry, events };
}

function makeManager() {
  const scene = makeScene();
  return { scene, em: new EssenceManager(scene) };
}

// ── ESSENCE_COLORS export ────────────────────────────────────────────────────

describe('ESSENCE_COLORS', () => {
  it('exports all four colours', () => {
    expect(ESSENCE_COLORS).toEqual(expect.arrayContaining(['black', 'purple', 'red', 'green']));
    expect(ESSENCE_COLORS).toHaveLength(4);
  });
});

// ── gain ─────────────────────────────────────────────────────────────────────

describe('EssenceManager.gain', () => {
  it('increases the amount for the given colour', () => {
    const { em } = makeManager();
    em.gain('red', 3, 'kill');
    expect(em.getAll().red).toBe(3);
  });

  it('accumulates across multiple calls', () => {
    const { em } = makeManager();
    em.gain('black', 2, 'kill');
    em.gain('black', 5, 'market');
    expect(em.getAll().black).toBe(7);
  });

  it('writes the updated amount to the registry', () => {
    const { em, scene } = makeManager();
    em.gain('purple', 2, 'kill');
    expect(scene.registry.set).toHaveBeenCalledWith('essence_purple', 2);
  });

  it('emits essence-gained with color, amount and source', () => {
    const { em, scene } = makeManager();
    em.gain('green', 1, 'ritual');
    expect(scene.events.emit).toHaveBeenCalledWith('essence-gained', {
      color: 'green', amount: 1, source: 'ritual',
    });
  });

  it('does nothing for an unknown colour', () => {
    const { em, scene } = makeManager();
    em.gain('yellow', 5, 'kill');
    expect(scene.registry.set).not.toHaveBeenCalled();
    expect(scene.events.emit).not.toHaveBeenCalled();
  });

  it('does nothing for a non-positive amount', () => {
    const { em, scene } = makeManager();
    em.gain('red', 0, 'kill');
    expect(scene.registry.set).not.toHaveBeenCalled();
  });
});

// ── spend ─────────────────────────────────────────────────────────────────────

describe('EssenceManager.spend', () => {
  it('decreases the amount when affordable', () => {
    const { em } = makeManager();
    em.gain('red', 5, 'kill');
    em.spend('red', 3);
    expect(em.getAll().red).toBe(2);
  });

  it('returns true when spend succeeds', () => {
    const { em } = makeManager();
    em.gain('black', 4, 'kill');
    expect(em.spend('black', 2)).toBe(true);
  });

  it('returns false when balance is insufficient', () => {
    const { em } = makeManager();
    em.gain('green', 1, 'kill');
    expect(em.spend('green', 2)).toBe(false);
  });

  it('does not modify balance when spend fails', () => {
    const { em } = makeManager();
    em.gain('purple', 1, 'kill');
    em.spend('purple', 5);
    expect(em.getAll().purple).toBe(1);
  });

  it('rejects spend that would go below zero', () => {
    const { em } = makeManager();
    expect(em.spend('red', 1)).toBe(false);
    expect(em.getAll().red).toBe(0);
  });

  it('emits essence-spent on success', () => {
    const { em, scene } = makeManager();
    em.gain('black', 3, 'kill');
    em.spend('black', 2);
    expect(scene.events.emit).toHaveBeenCalledWith('essence-spent', { color: 'black', amount: 2 });
  });

  it('does not emit essence-spent on failure', () => {
    const { em, scene } = makeManager();
    em.spend('red', 1);
    const spentCalls = scene.events.emit.mock.calls.filter(([e]) => e === 'essence-spent');
    expect(spentCalls).toHaveLength(0);
  });
});

// ── canAfford ────────────────────────────────────────────────────────────────

describe('EssenceManager.canAfford', () => {
  it('returns true when all colour balances are sufficient', () => {
    const { em } = makeManager();
    em.gain('red', 3, 'kill');
    em.gain('black', 2, 'kill');
    expect(em.canAfford({ red: 2, black: 1 })).toBe(true);
  });

  it('returns false when any colour is insufficient', () => {
    const { em } = makeManager();
    em.gain('red', 3, 'kill');
    em.gain('black', 0, 'kill');
    expect(em.canAfford({ red: 2, black: 1 })).toBe(false);
  });

  it('returns true for empty cost object', () => {
    const { em } = makeManager();
    expect(em.canAfford({})).toBe(true);
  });

  it('treats missing keys as zero balance', () => {
    const { em } = makeManager();
    expect(em.canAfford({ purple: 1 })).toBe(false);
  });
});

// ── getAll ───────────────────────────────────────────────────────────────────

describe('EssenceManager.getAll', () => {
  it('returns all four colours initialised to zero', () => {
    const { em } = makeManager();
    expect(em.getAll()).toEqual({ black: 0, purple: 0, red: 0, green: 0 });
  });

  it('returns a shallow copy — mutations do not affect internal state', () => {
    const { em } = makeManager();
    const snap = em.getAll();
    snap.red = 999;
    expect(em.getAll().red).toBe(0);
  });
});
