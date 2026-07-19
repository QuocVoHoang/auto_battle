export type ArenaShape = 'square' | 'circle';
export type ProjectileShape = 'circle' | 'wide';
export type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';

export interface Vector {
  x: number;
  y: number;
}

export interface CircleBody extends Vector {
  radius: number;
}

export interface MovingCircleBody extends CircleBody {
  velocityX: number;
  velocityY: number;
}

export interface MapConfig {
  id: string;
  name: string;
  shape: ArenaShape;
  padding: number;
}

export interface RectArenaBounds {
  shape: 'square';
  center: Vector;
  left: number;
  right: number;
  top: number;
  bottom: number;
  size: number;
}

export interface CircleArenaBounds {
  shape: 'circle';
  center: Vector;
  radius: number;
}

export type ArenaBounds = RectArenaBounds | CircleArenaBounds;

export interface ProjectileConfig {
  speed: number;
  radius: number;
  color: string;
  knockback: number;
  shape: ProjectileShape;
  image?: string;
  sound?: string;
}

export interface AttackConfig {
  name: string;
  damage: number;
  cooldown: number;
  range?: number;
  projectile?: ProjectileConfig;
}

export interface UltimateAttackConfig {
  name: string;
  damage: number;
  projectile?: ProjectileConfig;
  guaranteedHit?: boolean;
  avatarImage?: string;
  avatarDuration?: number;
}

export interface CharacterConfig {
  id: string;
  name: string;
  maxHealth: number;
  speed: number;
  radius: number;
  description: string;
  image?: string;
  normalAttack: AttackConfig;
  ultimateAttack: UltimateAttackConfig;
}

export interface CharacterStats {
  normalAttacksLanded: number;
  ultimateAttacksUsed: number;
  totalDamageDealt: number;
}

export interface RuntimeCharacter extends CharacterConfig, MovingCircleBody {
  health: number;
  rage: number;
  nextAttackTime: number;
  overrideImage: string | null;
  overrideImageUntil: number;
  stats: CharacterStats;
}

export interface TextEffect extends Vector {
  type?: undefined;
  text: string;
  label: string;
  age: number;
  duration: number;
  color: string;
}

export interface ImpactRingEffect extends Vector {
  type: 'impact-ring';
  age: number;
  duration: number;
  color: string;
  radius: number;
}

export type Effect = TextEffect | ImpactRingEffect;

export interface GameSettings {
  arenaShape: string;
  playerOne: string;
  playerTwo: string;
}

export interface GameResult {
  winner: RuntimeCharacter;
  loser: RuntimeCharacter;
  characters: RuntimeCharacter[];
}

export interface GameCallbacks {
  onGameOver?: (result: GameResult) => void;
  onPauseToggle?: (isPaused: boolean) => void;
  onMuteToggle?: (isMuted: boolean) => void;
  onStatusChange?: (characters: RuntimeCharacter[]) => void;
}
