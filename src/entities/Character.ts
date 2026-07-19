import { GAME } from '../data/constants';
import type { CharacterDefinition, Vec2 } from '../engine/types';

let nextCharacterId = 1;

export class Character {
  readonly id = nextCharacterId++;
  readonly definition: CharacterDefinition;
  readonly sprite = new Image();
  position: Vec2;
  velocity: Vec2;
  targetVelocity: Vec2;
  hp: number;
  rage = 0;
  attackTimer = 0;
  stopTimer = 0;
  directionTimer = 0;
  hitFlash = 0;

  constructor(definition: CharacterDefinition, position: Vec2) {
    this.definition = definition;
    this.position = { ...position };
    this.velocity = randomVelocity(definition.speed);
    this.targetVelocity = { ...this.velocity };
    this.hp = definition.maxHp;
    this.sprite.src = definition.sprite;
  }

  get name() {
    return this.definition.name;
  }

  get isAlive() {
    return this.hp > 0;
  }

  takeDamage(amount: number) {
    const finalDamage = Math.round(amount * this.definition.defenseMultiplier);
    this.hp = Math.max(0, this.hp - finalDamage);
    this.hitFlash = GAME.hitFlashTime;
  }
}

export function randomVelocity(speed: number): Vec2 {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
  };
}
