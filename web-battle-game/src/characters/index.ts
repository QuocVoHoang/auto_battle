import { police } from './police.js';
import { thief } from './thief.js';
import { firefighter } from './firefighter.js';
import { cowboy } from './cowboy.js';
import { cr7 } from './cr7.js';
import type { CharacterConfig } from '../types.js';

export const characterConfigs: CharacterConfig[] = [police, thief, firefighter, cowboy, cr7];

export function getCharacterConfig(id: string): CharacterConfig | undefined {
  return characterConfigs.find((character) => character.id === id);
}
