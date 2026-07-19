import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const messi: CharacterConfig = {
  id: CHARACTER_IDS.messi,
  name: 'Messi',
  maxHealth: 800,
  speed: 150,
  radius: 30,
  description: 'Vice G.O.A.T',
  image: 'assets/characters/messi_1.png',
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
      sound: '',
    },
  },
  ultimateAttack: {
    name: 'Wo Wo',
    damage: 220,
    guaranteedHit: false,
    avatarImage: 'assets/characters/messi_2.png',
    avatarDuration: 900,
    projectile: {
      speed: 500,
      radius: 50,
      color: '#f8f9fa',
      knockback: 60,
      shape: 'circle',
      image: 'assets/skills/messi_2.png',
      sound: 'assets/sounds/messi_2.mp3',
    },
  },
};
