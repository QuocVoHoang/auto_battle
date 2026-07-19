import type { CharacterConfig } from '../types.js';

export const templateCharacter: CharacterConfig = {
  id: 'new-character',
  name: 'New Character',
  maxHealth: 1000,
  speed: 180,
  radius: 30,
  description: 'Short description.',
  image: 'assets/characters/new-character.png',

  // guaranteedHit: true,
  // avatarImage: 'assets/characters/new-character-ultimate.png',
  // avatarDuration: 900,

  normalAttack: {
    name: 'Punch',
    damage: 50,
    cooldown: 800,
    // range: 500, // uncomment for ranged normal attack
    // projectile: {
    //   speed: 600,
    //   radius: 8,
    //   color: '#ffffff',
    //   knockback: 0,
    //   shape: 'circle',
    //   image: 'assets/skills/new-character-normal.svg',
    //   sound: 'assets/sounds/new-character-normal.mp3',
    // },
  },

  ultimateAttack: {
    name: 'Ultimate',
    damage: 150,
    projectile: {
      speed: 420,
      radius: 14,
      color: '#ffcc00',
      knockback: 120,
      shape: 'circle',
      image: 'assets/skills/new-character-ultimate.png',
      sound: 'assets/sounds/new-character-ultimate.mp3',
    },
  },
};
