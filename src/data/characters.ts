import { COMBAT } from './constants';
import type { CharacterDefinition, CharacterId } from '../engine/types';

export const CHARACTER_DEFINITIONS: Record<CharacterId, CharacterDefinition> = {
  police: {
    id: 'police',
    name: 'Police',
    sprite: '/characters/police.svg',
    maxHp: COMBAT.startingHp,
    damage: 72,
    speed: 118,
    rageMax: COMBAT.baseRageMax,
    rageGain: 25,
    attackCooldown: 0.85,
    specialDamage: 165,
    specialName: 'Pistol Shot',
    normalName: 'Baton Strike',
    defenseMultiplier: 1,
  },
  thief: {
    id: 'thief',
    name: 'Thief',
    sprite: '/characters/thief.svg',
    maxHp: 850,
    damage: 58,
    speed: 155,
    rageMax: COMBAT.baseRageMax,
    rageGain: 38,
    attackCooldown: 0.72,
    specialDamage: 125,
    specialName: 'Rock Throw',
    normalName: 'Punch',
    defenseMultiplier: 1,
  },
  firefighter: {
    id: 'firefighter',
    name: 'Firefighter',
    sprite: '/characters/firefighter.svg',
    maxHp: 1150,
    damage: 82,
    speed: 92,
    rageMax: COMBAT.baseRageMax,
    rageGain: 22,
    attackCooldown: 0.95,
    specialDamage: 190,
    specialName: 'Water Cannon',
    normalName: 'Water Spray',
    defenseMultiplier: COMBAT.defenseDamageMultiplier,
  },
};

export const CHARACTER_CHOICES = Object.values(CHARACTER_DEFINITIONS);
