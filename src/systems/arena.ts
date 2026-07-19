import { GAME } from '../data/constants';
import type { ArenaShape, Vec2 } from '../engine/types';
import type { Character } from '../entities/Character';

export const ARENA_CENTER: Vec2 = {
  x: GAME.canvasWidth / 2,
  y: GAME.canvasHeight / 2,
};

export function keepInsideArena(character: Character, shape: ArenaShape) {
  if (shape === 'circle') {
    keepInsideCircle(character);
    return;
  }

  keepInsideSquare(character);
}

function keepInsideCircle(character: Character) {
  const dx = character.position.x - ARENA_CENTER.x;
  const dy = character.position.y - ARENA_CENTER.y;
  const distance = Math.hypot(dx, dy);
  const maxDistance = GAME.arenaRadius - GAME.characterRadius;

  if (distance <= maxDistance) return;

  const nx = dx / distance;
  const ny = dy / distance;
  character.position.x = ARENA_CENTER.x + nx * maxDistance;
  character.position.y = ARENA_CENTER.y + ny * maxDistance;
  bounce(character.velocity, { x: nx, y: ny });
  bounce(character.targetVelocity, { x: nx, y: ny });
}

function keepInsideSquare(character: Character) {
  const minX = ARENA_CENTER.x - GAME.arenaHalfSize + GAME.characterRadius;
  const maxX = ARENA_CENTER.x + GAME.arenaHalfSize - GAME.characterRadius;
  const minY = ARENA_CENTER.y - GAME.arenaHalfSize + GAME.characterRadius;
  const maxY = ARENA_CENTER.y + GAME.arenaHalfSize - GAME.characterRadius;

  if (character.position.x < minX || character.position.x > maxX) {
    character.position.x = clamp(character.position.x, minX, maxX);
    character.velocity.x *= -1;
    character.targetVelocity.x *= -1;
  }

  if (character.position.y < minY || character.position.y > maxY) {
    character.position.y = clamp(character.position.y, minY, maxY);
    character.velocity.y *= -1;
    character.targetVelocity.y *= -1;
  }
}

function bounce(velocity: Vec2, normal: Vec2) {
  const dot = velocity.x * normal.x + velocity.y * normal.y;
  velocity.x -= 2 * dot * normal.x;
  velocity.y -= 2 * dot * normal.y;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
