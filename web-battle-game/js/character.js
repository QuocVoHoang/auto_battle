export class Character {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.maxHealth = config.maxHealth;
    this.health = config.maxHealth;
    this.speed = config.speed;
    this.radius = config.radius;
    this.normalAttack = config.normalAttack;
    this.normalDamage = config.normalDamage;
    this.attackCooldown = config.attackCooldown;
    this.specialSkill = config.specialSkill;
    this.specialDamage = config.specialDamage;
    this.special = config.special;
    this.color = config.color;
    this.accentColor = config.accentColor;
    this.image = config.image;
    this.rage = 0;
  }
}
