import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const cr7: CharacterConfig = {
  id: CHARACTER_IDS.cr7,
  name: 'CR7',
  maxHealth: 1050,
  speed: 190,
  radius: 30,
  description: 'G.O.A.T',
  color: '#d90429',
  accentColor: '#f8f9fa',
  image: 'assets/characters/cr7_1.png',
  normalAttack: {
    name: 'Football Kick',
    damage: 50,
    cooldown: 600,
    range: 720,
    projectile: {
      speed: 760,
      radius: 12,
      color: '#f8f9fa',
      knockback: 60,
      shape: 'circle',
      image: 'assets/skills/cr7_1.svg',
      sound: 'assets/sounds/cr7_1.mp3',
    },
  },
  ultimateAttack: {
    name: 'Siu',
    damage: 220,
    guaranteedHit: true,
    sound: 'assets/sounds/cr7_2.mp3',
    avatarImage: 'assets/characters/cr7_2.png',
    avatarDuration: 900,
  },
};
