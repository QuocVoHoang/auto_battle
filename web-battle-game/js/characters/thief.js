import { CHARACTER_IDS } from '../config.js';

export const thief = {
  id: CHARACTER_IDS.thief,
  name: 'Thief',
  maxHealth: 850,
  speed: 230,
  radius: 25,
  normalAttack: 'Punch',
  normalDamage: 45,
  attackCooldown: 500,
  specialSkill: 'Rock Throw',
  specialDamage: 140,
  description: 'Fastest fighter with low health, quick punches, and a rock that causes small knockback.',
  color: '#b066ff',
  accentColor: '#9b7653',
  image: 'thief.png',
  special: {
    type: 'rock',
    label: 'Rock Throw',
    speed: 310,
    radius: 9,
    color: '#9b7653',
    knockback: 90,
    shape: 'circle',
    flash: 'rock throw',
  },
};
