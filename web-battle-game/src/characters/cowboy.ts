import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const cowboy: CharacterConfig = {
  id: CHARACTER_IDS.cowboy,
  name: 'Cowboy',
  maxHealth: 950,
  speed: 155,
  radius: 30,
  description: 'Ranged fighter with low-damage pistol shots from distance. Calls a train for devastating damage.',
  image: 'assets/characters/cowboy.svg',
  normalAttack: {
    name: 'Pistol Shot',
    damage: 20,
    cooldown: 1500,
    range: 520,
    projectile: {
      speed: 760,
      radius: 5,
      color: '#D2B48C',
      knockback: 0,
      shape: 'circle',
      sound: 'assets/sounds/gun.mp3',
    },
  },
  ultimateAttack: {
    name: 'Train Strike',
    damage: 210,
    projectile: {
      speed: 520,
      radius: 32,
      color: '#8B0000',
      knockback: 220,
      shape: 'wide',
      image: 'assets/skills/train.png',
      sound: 'assets/sounds/train.mp3',
    },
  },
};
