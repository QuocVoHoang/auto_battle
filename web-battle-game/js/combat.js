export function handleContactAttacks(attacker, defender, time, effects) {
  if (attacker.health <= 0 || defender.health <= 0 || time < attacker.nextAttackTime) {
    return 0;
  }

  const damageDealt = applyDamage(defender, attacker.normalDamage);

  if (damageDealt <= 0) {
    return 0;
  }

  gainRage(attacker, 20);
  gainRage(defender, 10);
  attacker.nextAttackTime = time + attacker.attackCooldown;

  effects.push({
    text: `-${damageDealt}`,
    label: attacker.normalAttack,
    x: defender.x,
    y: defender.y - defender.radius,
    age: 0,
    duration: 0.6,
    color: attacker.color,
  });

  return damageDealt;
}

export function applyDamage(character, damage) {
  const previousHealth = character.health;
  character.health = Math.max(0, character.health - damage);

  return previousHealth - character.health;
}

export function gainRage(character, amount) {
  character.rage = Math.min(100, character.rage + amount);
}
