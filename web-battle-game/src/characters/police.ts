import { CHARACTER_IDS } from '../config.js';
import type { CharacterConfig } from '../types.js';

export const police: CharacterConfig = {
  id: CHARACTER_IDS.police,
  name: 'Police Officer',
  maxHealth: 1000,
  speed: 170,
  radius: 30,
  normalAttack: 'Baton Strike',
  normalDamage: 65,
  attackCooldown: 700,
  specialSkill: 'Pistol Shot',
  specialDamage: 180,
  description: 'Balanced fighter with medium baton damage and a fast, accurate pistol shot.',
  color: '#4f8cff',
  accentColor: '#ffe066',
  image: 'assets/characters/police.png',
  special: {
    type: 'pistol',
    label: 'Pistol Shot',
    speed: 560,
    radius: 5,
    color: '#ffe066',
    knockback: 0,
    shape: 'circle',
    flash: 'muzzle flash',
  },
};
