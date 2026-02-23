/**
 * RitualManager — Fourfold Rite sigil sequence engine.
 *
 * Pure logic class: no Phaser dependencies. Communicates via an event
 * callback passed at construction so it can be tested in isolation.
 *
 * State machine:
 *   idle → revealing → waiting_input → (result | done)
 *
 * Sequence flow:
 *   1. startRitual(threadCount) — generates 5-8 colour sigils, enters revealing
 *   2. For each step, emit 'step-revealed' with the current sigil colour
 *   3. Player calls match(color) or skip()
 *      match — spends 1 Essence of that colour (via spendFn), gains +1 Depth
 *      skip  — spends 1 Thread, no Depth gain
 *   4. After all steps (or Thread depleted), auto-bank
 *   5. bank() at any time finalises and emits 'ritual-complete' with outcome
 *
 * Resonance scoring:
 *   Consecutive matches of the same colour = +1 bonus per extra match in run
 *   (e.g. 3 consecutive red = +2 resonance bonus on top of base)
 *
 * Events emitted via emit(event, payload):
 *   'step-revealed'    { step, color, stepIndex, totalSteps }
 *   'match-success'    { color, depth, resonance }
 *   'skip-success'     { threadRemaining, resonance }
 *   'thread-depleted'  {}
 *   'ritual-complete'  { depth, resonance, history }
 */

export const RITUAL_COLORS = ['black', 'purple', 'red', 'green'];

export class RitualManager {
  /**
   * @param {(event: string, payload: object) => void} emit  event callback
   * @param {(color: string) => boolean} spendEssenceFn  returns false if can't afford
   */
  constructor(emit, spendEssenceFn) {
    this._emit     = emit;
    this._spendFn  = spendEssenceFn;

    this.state     = 'idle';
    this.sequence  = [];      // generated colour sigils
    this.stepIndex = 0;       // current position in sequence
    this.depth     = 0;       // match count
    this.resonance = 0;       // colour-run bonus score
    this.thread    = 0;       // skip charges remaining
    this.history   = [];      // { color, action: 'match'|'skip' } per step

    this._runColor = null;    // last matched colour (for resonance runs)
    this._runLen   = 0;       // current consecutive same-colour run length
  }

  // ── Public API ───────────────────────────────────────────────────────

  /**
   * Begin a new ritual.
   * @param {number} threadCount  number of Thread (skip charges) available
   */
  startRitual(threadCount) {
    if (this.state !== 'idle') return;

    const len      = Math.floor(Math.random() * 4) + 5; // 5–8 steps
    this.sequence  = Array.from({ length: len }, () =>
      RITUAL_COLORS[Math.floor(Math.random() * RITUAL_COLORS.length)]);
    this.stepIndex = 0;
    this.depth     = 0;
    this.resonance = 0;
    this.thread    = threadCount;
    this.history   = [];
    this._runColor = null;
    this._runLen   = 0;

    this.state = 'waiting_input';
    this._emitCurrentStep();
  }

  /** Current sigil colour the player must respond to. */
  get currentColor() {
    return this.sequence[this.stepIndex] ?? null;
  }

  /**
   * Match the revealed sigil by spending 1 Essence of its colour.
   * @param {string} color  must equal currentColor
   * @returns {boolean} false if wrong colour or Essence unavailable
   */
  match(color) {
    if (this.state !== 'waiting_input') return false;
    if (color !== this.currentColor)    return false;
    if (!this._spendFn(color))          return false;

    this.depth++;

    // Resonance: consecutive same-colour run
    if (color === this._runColor) {
      this._runLen++;
      this.resonance += this._runLen; // bonus grows with run length
    } else {
      this._runColor = color;
      this._runLen   = 1;
      this.resonance += 1; // base +1 per match
    }

    this.history.push({ color, action: 'match' });
    this._emit('match-success', { color, depth: this.depth, resonance: this.resonance });
    this._advance();
    return true;
  }

  /**
   * Skip the current step by spending 1 Thread.
   * @returns {boolean} false if no Thread remaining
   */
  skip() {
    if (this.state !== 'waiting_input') return false;
    if (this.thread <= 0)               return false;

    this.thread--;
    // Reset colour run on skip
    this._runColor = null;
    this._runLen   = 0;

    this.history.push({ color: this.currentColor, action: 'skip' });
    this._emit('skip-success', { threadRemaining: this.thread, resonance: this.resonance });

    if (this.thread === 0) {
      this._emit('thread-depleted', {});
      this._complete();
      return true;
    }

    this._advance();
    return true;
  }

  /**
   * Bank the current outcome — finalises and emits 'ritual-complete'.
   * Can be called any time during waiting_input.
   */
  bank() {
    if (this.state !== 'waiting_input') return;
    this._complete();
  }

  // ── Private ──────────────────────────────────────────────────────────

  _advance() {
    this.stepIndex++;
    if (this.stepIndex >= this.sequence.length) {
      this._complete();
    } else {
      this._emitCurrentStep();
    }
  }

  _emitCurrentStep() {
    this._emit('step-revealed', {
      step:       this.currentColor,
      color:      this.currentColor,
      stepIndex:  this.stepIndex,
      totalSteps: this.sequence.length,
    });
  }

  _complete() {
    this.state = 'done';
    this._emit('ritual-complete', {
      depth:     this.depth,
      resonance: this.resonance,
      history:   [...this.history],
    });
  }
}
