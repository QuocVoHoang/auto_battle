import { police } from './police.js';
import { thief } from './thief.js';
import { firefighter } from './firefighter.js';
import { cowboy } from './cowboy.js';

export const characterConfigs = [police, thief, firefighter, cowboy];

export function getCharacterConfig(id) {
  return characterConfigs.find((character) => character.id === id);
}
