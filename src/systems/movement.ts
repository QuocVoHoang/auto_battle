import { GAME } from '../data/constants';
import { randomVelocity, type Character } from '../entities/Character';

export function updateMovement(character: Character, delta: number) {
  character.attackTimer = Math.max(0, character.attackTimer - delta);
  character.stopTimer = Math.max(0, character.stopTimer - delta);
  character.hitFlash = Math.max(0, character.hitFlash - delta);
  character.directionTimer -= delta;

  if (character.directionTimer <= 0) {
    character.directionTimer = GAME.directionChangeTime * (0.65 + Math.random() * 0.7);
    character.targetVelocity = randomVelocity(character.definition.speed);
  }

  if (character.stopTimer > 0) return;

  const turn = Math.min(1, delta * GAME.turnSharpness);
  character.velocity.x += (character.targetVelocity.x - character.velocity.x) * turn;
  character.velocity.y += (character.targetVelocity.y - character.velocity.y) * turn;
  character.position.x += character.velocity.x * delta;
  character.position.y += character.velocity.y * delta;
}
