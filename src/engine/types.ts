export type ArenaShape = 'circle' | 'square';
export type CharacterId = 'police' | 'thief' | 'firefighter';
export type GameState = 'start' | 'playing' | 'gameOver';

export type Vec2 = {
  x: number;
  y: number;
};

export type CharacterDefinition = {
  id: CharacterId;
  name: string;
  sprite: string;
  maxHp: number;
  damage: number;
  speed: number;
  rageMax: number;
  rageGain: number;
  attackCooldown: number;
  specialDamage: number;
  specialName: string;
  normalName: string;
  defenseMultiplier: number;
};

export type Projectile = {
  ownerId: number;
  kind: 'bullet' | 'rock' | 'water';
  position: Vec2;
  velocity: Vec2;
  radius: number;
  damage: number;
  life: number;
};

export type Particle = {
  position: Vec2;
  velocity: Vec2;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
};
