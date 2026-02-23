/**
 * ZoneManager — vertical risk zone constants and player zone tracking.
 *
 * The 480×640 battlefield is split into three screen-space bands:
 *
 *   Top    (y   0–200) — high danger, high reward, shorter telegraphs
 *   Middle (y 200–430) — balanced density and telegraphing
 *   Bottom (y 430–640) — safer, lower reward, more information
 *
 * Each zone has a label, y-range, and a reward multiplier that other
 * systems (loot, essence drop rate, etc.) can read.
 */
export const ZONES = {
  top: {
    id: 'top',
    label: 'Chaos',
    yMin: 0,
    yMax: 200,
    rewardMultiplier: 1.5,
  },
  middle: {
    id: 'middle',
    label: 'Balanced',
    yMin: 200,
    yMax: 430,
    rewardMultiplier: 1.0,
  },
  bottom: {
    id: 'bottom',
    label: 'Safe',
    yMin: 430,
    yMax: 640,
    rewardMultiplier: 0.75,
  },
};

export class ZoneManager {
  /**
   * Returns the zone object for a given y coordinate.
   * Clamps to bottom zone for values outside the field.
   */
  static getZone(y) {
    if (y <= ZONES.top.yMax)    return ZONES.top;
    if (y <= ZONES.middle.yMax) return ZONES.middle;
    return ZONES.bottom;
  }

  /**
   * Returns the zone the player is currently in.
   * @param {Player} player
   */
  static getPlayerZone(player) {
    return ZoneManager.getZone(player.sprite.y);
  }
}
