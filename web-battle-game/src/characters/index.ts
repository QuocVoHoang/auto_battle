import { police } from './police.js';
import { thief } from './thief.js';
import { firefighter } from './firefighter.js';
import { cowboy } from './cowboy.js';
import { cr7 } from './cr7.js';
import { messi } from './messi.js'
import type { CharacterConfig } from '../types.js';

export const characterConfigs: CharacterConfig[] = [cr7, messi, firefighter, police, thief, cowboy,];

export function getCharacterConfig(id: string): CharacterConfig | undefined {
  return characterConfigs.find((character) => character.id === id);
}
