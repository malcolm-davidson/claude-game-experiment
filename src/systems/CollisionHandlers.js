/**
 * CollisionHandlers — pure functions for overlap callbacks and bullet culling.
 *
 * Each function receives plain objects that match the Phaser interface it needs,
 * making them fully testable without a running Phaser instance.
 */

/**
 * Called when a player bullet overlaps an enemy sprite.
 * The EnemyWyvern instance is stored on the sprite via setData('entity').
 *
 * @param {object} bullet       - Phaser sprite with a destroy() method
 * @param {object} enemySprite  - Phaser sprite with getData() and no takeDamage()
 * @param {number} playerAttack - damage to deal
 */
export function onBulletHitEnemy(bullet, enemySprite, playerAttack) {
  bullet.destroy();
  const entity = enemySprite.getData('entity');
  if (entity) entity.takeDamage(playerAttack);
}

/**
 * Called when an enemy bullet overlaps the player sprite.
 *
 * @param {object} playerSprite - Phaser sprite (unused directly)
 * @param {object} bullet       - Phaser sprite with a destroy() method
 * @param {object} player       - Player instance with takeDamage()
 */
export function onEnemyBulletHitPlayer(playerSprite, bullet, player) {
  bullet.destroy();
  player.takeDamage(1);
}

/**
 * Called when the player sprite overlaps a loot item.
 *
 * @param {object} playerSprite - Phaser sprite (unused directly)
 * @param {object} loot         - Phaser sprite representing the loot gem
 * @param {object} lootSystem   - LootSystem instance with collect()
 */
export function onPlayerCollectLoot(playerSprite, loot, lootSystem) {
  lootSystem.collect(loot);
}

/**
 * Destroys bullets that have left the visible game area.
 * Returns an array of destroyed sprites (useful for assertions in tests).
 *
 * @param {object[]} playerBullets - array of upward-moving player bullet sprites
 * @param {object[]} enemyBullets  - array of downward-moving enemy bullet sprites
 * @param {{ top: number, bottom: number }} bounds - y thresholds
 */
export function cullOffscreenBullets(
  playerBullets,
  enemyBullets,
  bounds = { top: -20, bottom: 700 },
) {
  const culled = [];

  // Snapshot the arrays before iterating so that destroy() mutations
  // don't affect the current loop.
  for (const b of [...playerBullets]) {
    if (b.y < bounds.top) { b.destroy(); culled.push(b); }
  }
  for (const b of [...enemyBullets]) {
    if (b.y > bounds.bottom) { b.destroy(); culled.push(b); }
  }

  return culled;
}
