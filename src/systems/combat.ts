import { GAME } from '../data/constants';
import type { Character } from '../entities/Character';
import type { Particle, Projectile } from '../engine/types';
import { castSpecial, spawnParticles } from './skills';

export function resolveCombat(characters: Character[], projectiles: Projectile[], particles: Particle[]) {
  const [a, b] = characters;
  if (!a?.isAlive || !b?.isAlive) return;

  const touching = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y) <= GAME.contactDistance;
  if (!touching) return;

  tryAttack(a, b, projectiles, particles);
  tryAttack(b, a, projectiles, particles);
}

function tryAttack(attacker: Character, defender: Character, projectiles: Projectile[], particles: Particle[]) {
  if (attacker.attackTimer > 0) return;

  attacker.attackTimer = attacker.definition.attackCooldown;
  attacker.stopTimer = GAME.stopAfterAttack;
  defender.stopTimer = GAME.stopAfterAttack;
  defender.takeDamage(attacker.definition.damage);
  attacker.rage = Math.min(attacker.definition.rageMax, attacker.rage + attacker.definition.rageGain);
  spawnParticles(particles, defender.position, '#ff6b6b', 8);

  if (attacker.rage >= attacker.definition.rageMax && defender.isAlive) {
    castSpecial(attacker, defender, projectiles, particles);
  }
}
