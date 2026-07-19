import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const thief: CharacterConfig = {
  id: CHARACTER_IDS.thief,
  name: 'Thief',
  maxHealth: 850,
  speed: 230,
  radius: 25,
  description: 'Fastest fighter with low health, quick punches, and a rock that causes small knockback.',
  image: 'assets/characters/thief.png',
  normalAttack: {
    name: 'Punch',
    damage: 45,
    cooldown: 500,
  },
  ultimateAttack: {
    name: 'Rock Throw',
    damage: 140,
    projectile: {
      speed: 310,
      radius: 9,
      color: '#9b7653',
      knockback: 90,
      shape: 'circle',
    },
  },
};
