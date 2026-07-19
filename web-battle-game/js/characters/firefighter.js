import { CHARACTER_IDS } from '../config.js';

export const firefighter = {
  id: CHARACTER_IDS.firefighter,
  name: 'Firefighter',
  maxHealth: 1350,
  speed: 135,
  radius: 36,
  normalAttack: 'Water Spray',
  normalDamage: 58,
  attackCooldown: 800,
  specialSkill: 'Powerful Water Blast',
  specialDamage: 160,
  description: 'Largest and toughest fighter. Slow movement, medium spray damage, huge knockback blast.',
  color: '#ff5a4f',
  accentColor: '#66d9ff',
  image: 'assets/characters/firefighter.png',
  special: {
    type: 'water',
    label: 'Powerful Water Blast',
    speed: 380,
    radius: 18,
    color: '#66d9ff',
    knockback: 180,
    shape: 'wide',
    flash: 'water blast',
  },
};
