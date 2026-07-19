import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const firefighter: CharacterConfig = {
  id: CHARACTER_IDS.firefighter,
  name: 'Firefighter',
  maxHealth: 1350,
  speed: 135,
  radius: 36,
  description: 'Largest and toughest fighter. Slow movement, medium spray damage, huge knockback blast.',
  image: 'assets/characters/firefighter.png',
  normalAttack: {
    name: 'Water Spray',
    damage: 58,
    cooldown: 800,
  },
  ultimateAttack: {
    name: 'Powerful Water Blast',
    damage: 160,
    projectile: {
      speed: 380,
      radius: 18,
      color: '#66d9ff',
      knockback: 180,
      shape: 'wide',
    },
  },
};
