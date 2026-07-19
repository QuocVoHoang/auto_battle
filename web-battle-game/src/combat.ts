import type { Effect, RuntimeCharacter } from './types.js';

const DEFAULT_HIT_COLOR = '#ffffff';

export function handleContactAttacks(attacker: RuntimeCharacter, defender: RuntimeCharacter, time: number, effects: Effect[]): number {
  if (attacker.health <= 0 || defender.health <= 0 || time < attacker.nextAttackTime) {
    return 0;
  }

  const damageDealt = applyDamage(defender, attacker.normalAttack.damage);

  if (damageDealt <= 0) {
    return 0;
  }

  gainRage(attacker, 20);
  gainRage(defender, 10);
  attacker.nextAttackTime = time + attacker.normalAttack.cooldown;

  effects.push({
    text: `-${damageDealt}`,
    label: attacker.normalAttack.name,
    x: defender.x,
    y: defender.y - defender.radius,
    age: 0,
    duration: 0.6,
    color: DEFAULT_HIT_COLOR,
  });

  return damageDealt;
}

export function applyDamage(character: RuntimeCharacter, damage: number): number {
  const previousHealth = character.health;
  character.health = Math.max(0, character.health - damage);

  return previousHealth - character.health;
}

export function gainRage(character: RuntimeCharacter, amount: number): void {
  character.rage = Math.min(100, character.rage + amount);
}
