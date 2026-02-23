import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RitualManager } from '../systems/RitualManager.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a manager where spendFn always succeeds. */
function makeManager({ spendAlways = true, sequence = null } = {}) {
  const events  = [];
  const emit    = (event, payload) => events.push({ event, payload });
  const spendFn = vi.fn(() => spendAlways);
  const rm      = new RitualManager(emit, spendFn);

  if (sequence) {
    // Inject a fixed sequence for deterministic tests
    rm.startRitual(3);
    rm.sequence  = sequence;
    rm.stepIndex = 0;
    // Re-emit first step
    rm._emitCurrentStep();
    events.length = 0; // clear setup noise
  }

  return { rm, events, spendFn };
}

function startWith(sequence, threadCount = 3) {
  const { rm, events, spendFn } = makeManager();
  rm.startRitual(threadCount);
  rm.sequence  = sequence;
  rm.stepIndex = 0;
  rm._emitCurrentStep();
  events.length = 0;
  return { rm, events, spendFn };
}

// ── startRitual ───────────────────────────────────────────────────────────────

describe('RitualManager.startRitual', () => {
  it('transitions state to waiting_input', () => {
    const { rm } = makeManager();
    rm.startRitual(3);
    expect(rm.state).toBe('waiting_input');
  });

  it('generates a sequence of 5–8 steps', () => {
    const { rm } = makeManager();
    rm.startRitual(3);
    expect(rm.sequence.length).toBeGreaterThanOrEqual(5);
    expect(rm.sequence.length).toBeLessThanOrEqual(8);
  });

  it('sets thread to the provided count', () => {
    const { rm } = makeManager();
    rm.startRitual(5);
    expect(rm.thread).toBe(5);
  });

  it('resets depth and resonance to 0', () => {
    const { rm } = makeManager();
    rm.startRitual(3);
    expect(rm.depth).toBe(0);
    expect(rm.resonance).toBe(0);
  });

  it('emits step-revealed for the first step', () => {
    const { rm, events } = makeManager();
    rm.startRitual(3);
    expect(events.some(e => e.event === 'step-revealed')).toBe(true);
  });
});

// ── match ─────────────────────────────────────────────────────────────────────

describe('RitualManager.match', () => {
  it('increments depth by 1 on correct match', () => {
    const { rm } = startWith(['red', 'black']);
    rm.match('red');
    expect(rm.depth).toBe(1);
  });

  it('returns false and does not spend for wrong colour', () => {
    const { rm, spendFn } = startWith(['red', 'black']);
    const result = rm.match('black'); // wrong colour
    expect(result).toBe(false);
    expect(spendFn).not.toHaveBeenCalled();
  });

  it('returns false when spendFn returns false (can\'t afford)', () => {
    const { rm } = makeManager({ spendAlways: false });
    rm.startRitual(3);
    rm.sequence  = ['red'];
    rm.stepIndex = 0;
    rm._emitCurrentStep();
    const result = rm.match('red');
    expect(result).toBe(false);
    expect(rm.depth).toBe(0);
  });

  it('calls spendFn with the correct colour', () => {
    const { rm, spendFn } = startWith(['green', 'red']);
    rm.match('green');
    expect(spendFn).toHaveBeenCalledWith('green');
  });

  it('emits match-success with current depth and resonance', () => {
    const { rm, events } = startWith(['red', 'black']);
    rm.match('red');
    const ev = events.find(e => e.event === 'match-success');
    expect(ev).toBeDefined();
    expect(ev.payload.depth).toBe(1);
  });

  it('advances to the next step after a match', () => {
    const { rm } = startWith(['red', 'black', 'green']);
    rm.match('red');
    expect(rm.stepIndex).toBe(1);
    expect(rm.currentColor).toBe('black');
  });
});

// ── Resonance ────────────────────────────────────────────────────────────────

describe('Resonance scoring', () => {
  it('gives +1 resonance for a single match', () => {
    const { rm } = startWith(['red', 'black']);
    rm.match('red');
    expect(rm.resonance).toBe(1);
  });

  it('gives increasing resonance bonus for consecutive same-colour matches', () => {
    const { rm } = startWith(['red', 'red', 'red', 'black']);
    rm.match('red'); // resonance = 1 (run start)
    rm.match('red'); // run = 2, bonus = 2, resonance = 3
    rm.match('red'); // run = 3, bonus = 3, resonance = 6
    expect(rm.resonance).toBe(6);
  });

  it('resets run on colour change', () => {
    const { rm } = startWith(['red', 'red', 'black', 'black']);
    rm.match('red');  // resonance = 1
    rm.match('red');  // resonance = 3
    rm.match('black'); // new colour, resonance += 1 → 4
    expect(rm.resonance).toBe(4);
  });

  it('resets run on skip', () => {
    const { rm } = startWith(['red', 'red', 'black']);
    rm.match('red');
    rm.skip();
    // After skip, runColor reset
    expect(rm._runColor).toBeNull();
  });
});

// ── skip ─────────────────────────────────────────────────────────────────────

describe('RitualManager.skip', () => {
  it('decrements thread by 1', () => {
    const { rm } = startWith(['red', 'black'], 3);
    rm.skip();
    expect(rm.thread).toBe(2);
  });

  it('returns false when no thread remaining', () => {
    const { rm } = startWith(['red', 'black'], 0);
    expect(rm.skip()).toBe(false);
  });

  it('emits thread-depleted when last thread is used', () => {
    const { rm, events } = startWith(['red', 'black', 'green'], 1);
    rm.skip();
    expect(events.some(e => e.event === 'thread-depleted')).toBe(true);
  });

  it('completes the ritual when thread is depleted', () => {
    const { rm } = startWith(['red', 'black'], 1);
    rm.skip();
    expect(rm.state).toBe('done');
  });

  it('emits skip-success with remaining thread count', () => {
    const { rm, events } = startWith(['red', 'black', 'green'], 3);
    rm.skip();
    const ev = events.find(e => e.event === 'skip-success');
    expect(ev.payload.threadRemaining).toBe(2);
  });

  it('records skip in history', () => {
    const { rm } = startWith(['red', 'black'], 3);
    rm.skip();
    expect(rm.history[0].action).toBe('skip');
    expect(rm.history[0].color).toBe('red');
  });
});

// ── bank ─────────────────────────────────────────────────────────────────────

describe('RitualManager.bank', () => {
  it('transitions state to done', () => {
    const { rm } = startWith(['red', 'black', 'green']);
    rm.bank();
    expect(rm.state).toBe('done');
  });

  it('emits ritual-complete with current depth, resonance, history', () => {
    const { rm, events } = startWith(['red', 'black', 'green']);
    rm.match('red');
    rm.bank();
    const ev = events.find(e => e.event === 'ritual-complete');
    expect(ev).toBeDefined();
    expect(ev.payload.depth).toBe(1);
    expect(ev.payload.history).toHaveLength(1);
  });

  it('returns current depth on early bank (before sequence ends)', () => {
    const { rm } = startWith(['red', 'black', 'green', 'purple']);
    rm.match('red');
    rm.match('black');
    rm.bank();
    expect(rm.depth).toBe(2);
  });

  it('does nothing if state is not waiting_input', () => {
    const { rm, events } = makeManager();
    // state is 'idle'
    rm.bank();
    expect(events.some(e => e.event === 'ritual-complete')).toBe(false);
  });
});

// ── Full sequence completion ──────────────────────────────────────────────────

describe('sequence completion', () => {
  it('auto-completes when all steps are matched', () => {
    const { rm, events } = startWith(['red', 'green']);
    rm.match('red');
    rm.match('green');
    expect(rm.state).toBe('done');
    expect(events.some(e => e.event === 'ritual-complete')).toBe(true);
  });

  it('history length equals number of steps taken', () => {
    const { rm } = startWith(['red', 'green', 'black']);
    rm.match('red');
    rm.skip();
    rm.match('black');
    expect(rm.history).toHaveLength(3);
  });
});
