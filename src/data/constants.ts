export const GAME = {
  canvasWidth: 960,
  canvasHeight: 640,
  arenaRadius: 235,
  arenaHalfSize: 235,
  characterRadius: 30,
  contactDistance: 60,
  stopAfterAttack: 0.22,
  directionChangeTime: 1.2,
  turnSharpness: 2.4,
  hitFlashTime: 0.14,
  projectileSpeed: 520,
  projectileLife: 0.65,
  particleLife: 0.35,
} as const;

export const COMBAT = {
  startingHp: 1000,
  baseRageMax: 100,
  defenseDamageMultiplier: 0.82,
} as const;
