import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  onBulletHitEnemy,
  onEnemyBulletHitPlayer,
  onPlayerCollectLoot,
  cullOffscreenBullets,
} from '../systems/CollisionHandlers.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeBullet(y = 0) {
  return { y, destroy: vi.fn() };
}

function makeEnemySprite({ entity } = {}) {
  const data = new Map();
  if (entity) data.set('entity', entity);
  return {
    getData: vi.fn((key) => data.get(key) ?? null),
    destroy: vi.fn(),
  };
}

function makeEnemyWyvern() {
  return { takeDamage: vi.fn() };
}

function makePlayer() {
  return { stats: { attack: 3 }, takeDamage: vi.fn() };
}

function makeLootSystem() {
  return { collect: vi.fn() };
}

// ── onBulletHitEnemy ─────────────────────────────────────────────────────────

describe('onBulletHitEnemy', () => {
  it('destroys the bullet', () => {
    const bullet = makeBullet();
    const wyvern = makeEnemyWyvern();
    const sprite = makeEnemySprite({ entity: wyvern });

    onBulletHitEnemy(bullet, sprite, 2);

    expect(bullet.destroy).toHaveBeenCalledOnce();
  });

  it('reads the EnemyWyvern instance from sprite data, not the sprite itself', () => {
    // This is the bug: previously the code called sprite.takeDamage() which
    // doesn't exist. The entity must be fetched via getData('entity').
    const bullet  = makeBullet();
    const wyvern  = makeEnemyWyvern();
    const sprite  = makeEnemySprite({ entity: wyvern });

    onBulletHitEnemy(bullet, sprite, 2);

    expect(sprite.getData).toHaveBeenCalledWith('entity');
  });

  it('calls takeDamage on the entity with the correct attack value', () => {
    const bullet = makeBullet();
    const wyvern = makeEnemyWyvern();
    const sprite = makeEnemySprite({ entity: wyvern });

    onBulletHitEnemy(bullet, sprite, 5);

    expect(wyvern.takeDamage).toHaveBeenCalledWith(5);
  });

  it('does not throw when entity data is missing', () => {
    const bullet = makeBullet();
    const sprite = makeEnemySprite(); // no entity stored

    expect(() => onBulletHitEnemy(bullet, sprite, 2)).not.toThrow();
  });
});

// ── onEnemyBulletHitPlayer ───────────────────────────────────────────────────

describe('onEnemyBulletHitPlayer', () => {
  it('destroys the bullet', () => {
    const bullet = makeBullet();
    const player = makePlayer();

    onEnemyBulletHitPlayer({}, bullet, player);

    expect(bullet.destroy).toHaveBeenCalledOnce();
  });

  it('calls player.takeDamage(1)', () => {
    const bullet = makeBullet();
    const player = makePlayer();

    onEnemyBulletHitPlayer({}, bullet, player);

    expect(player.takeDamage).toHaveBeenCalledWith(1);
  });
});

// ── onPlayerCollectLoot ──────────────────────────────────────────────────────

describe('onPlayerCollectLoot', () => {
  it('passes the loot sprite to lootSystem.collect()', () => {
    const loot = { getData: vi.fn() };
    const ls   = makeLootSystem();

    onPlayerCollectLoot({}, loot, ls);

    expect(ls.collect).toHaveBeenCalledWith(loot);
  });
});

// ── cullOffscreenBullets ─────────────────────────────────────────────────────

describe('cullOffscreenBullets', () => {
  it('destroys player bullets that have left the top of the screen', () => {
    const offscreen = makeBullet(-21);
    const onscreen  = makeBullet(100);

    cullOffscreenBullets([offscreen, onscreen], []);

    expect(offscreen.destroy).toHaveBeenCalledOnce();
    expect(onscreen.destroy).not.toHaveBeenCalled();
  });

  it('destroys enemy bullets that have left the bottom of the screen', () => {
    const offscreen = makeBullet(701);
    const onscreen  = makeBullet(400);

    cullOffscreenBullets([], [offscreen, onscreen]);

    expect(offscreen.destroy).toHaveBeenCalledOnce();
    expect(onscreen.destroy).not.toHaveBeenCalled();
  });

  it('does not destroy bullets exactly on the boundary', () => {
    const atTop    = makeBullet(-20);
    const atBottom = makeBullet(700);

    cullOffscreenBullets([atTop], [atBottom]);

    expect(atTop.destroy).not.toHaveBeenCalled();
    expect(atBottom.destroy).not.toHaveBeenCalled();
  });

  it('returns all culled bullets', () => {
    const p = makeBullet(-100);
    const e = makeBullet(800);

    const culled = cullOffscreenBullets([p], [e]);

    expect(culled).toHaveLength(2);
    expect(culled).toContain(p);
    expect(culled).toContain(e);
  });

  it('does not mutate the input arrays during iteration', () => {
    // Verifies the snapshot copy (spread) prevents iteration bugs when
    // destroy() would otherwise remove items from the live array.
    const bullets = [makeBullet(-50), makeBullet(-60), makeBullet(10)];

    expect(() => cullOffscreenBullets(bullets, [])).not.toThrow();
    expect(bullets[0].destroy).toHaveBeenCalledOnce();
    expect(bullets[1].destroy).toHaveBeenCalledOnce();
    expect(bullets[2].destroy).not.toHaveBeenCalled();
  });
});
