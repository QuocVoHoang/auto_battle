import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const police: CharacterConfig = {
  id: CHARACTER_IDS.police,
  name: 'Police Officer',
  maxHealth: 1000,
  speed: 170,
  radius: 30,
  description: 'Balanced fighter with medium baton damage and a fast, accurate pistol shot.',
  image: 'assets/characters/police.png',
  normalAttack: {
    name: 'Baton Strike',
    damage: 65,
    cooldown: 700,
  },
  ultimateAttack: {
    name: 'Pistol Shot',
    damage: 180,
    projectile: {
      speed: 560,
      radius: 5,
      color: '#ffe066',
      knockback: 0,
      shape: 'circle',
    },
  },
};
