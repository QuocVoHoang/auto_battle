import { GAME } from '../data/constants';
import type { Character } from '../entities/Character';
import type { Particle, Projectile, Vec2 } from '../engine/types';

export function castSpecial(caster: Character, target: Character, projectiles: Projectile[], particles: Particle[]) {
  caster.rage = 0;
  const direction = directionTo(caster.position, target.position);
  const kind = caster.definition.id === 'police' ? 'bullet' : caster.definition.id === 'thief' ? 'rock' : 'water';
  const radius = kind === 'bullet' ? 7 : kind === 'rock' ? 11 : 15;

  projectiles.push({
    ownerId: caster.id,
    kind,
    position: { ...caster.position },
    velocity: {
      x: direction.x * GAME.projectileSpeed,
      y: direction.y * GAME.projectileSpeed,
    },
    radius,
    damage: caster.definition.specialDamage,
    life: GAME.projectileLife,
  });

  spawnParticles(particles, caster.position, kind === 'water' ? '#77d9ff' : '#ffd166', 5);
}

export function updateProjectiles(projectiles: Projectile[], characters: Character[], particles: Particle[], delta: number) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.life -= delta;
    projectile.position.x += projectile.velocity.x * delta;
    projectile.position.y += projectile.velocity.y * delta;

    const target = characters.find((character) => character.id !== projectile.ownerId && character.isAlive);
    if (target && distance(projectile.position, target.position) <= projectile.radius + GAME.characterRadius) {
      target.takeDamage(projectile.damage);
      spawnParticles(particles, projectile.position, colorForProjectile(projectile.kind), 10);
      projectiles.splice(i, 1);
      continue;
    }

    if (projectile.life <= 0) projectiles.splice(i, 1);
  }
}

export function updateParticles(particles: Particle[], delta: number) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.life -= delta;
    particle.position.x += particle.velocity.x * delta;
    particle.position.y += particle.velocity.y * delta;
    if (particle.life <= 0) particles.splice(i, 1);
  }
}

export function spawnParticles(particles: Particle[], position: Vec2, color: string, count: number) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 45 + Math.random() * 120;
    particles.push({
      position: { ...position },
      velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      color,
      radius: 2 + Math.random() * 4,
      life: GAME.particleLife,
      maxLife: GAME.particleLife,
    });
  }
}

function directionTo(from: Vec2, to: Vec2): Vec2 {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function distance(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function colorForProjectile(kind: Projectile['kind']) {
  if (kind === 'water') return '#77d9ff';
  if (kind === 'rock') return '#c08457';
  return '#ffe66d';
}
