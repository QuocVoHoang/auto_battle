import { DEBUG_DRAW_VELOCITY, GAME_STATES } from './config.js';
import {
  correctCharacterPosition,
  drawArena,
  getArenaBounds,
  getStartingPositions,
  getWallNormal,
  isInsideArena,
} from './arena.js';
import { getCharacterConfig } from './characters/index.js';
import { applyDamage, gainRage, handleContactAttacks } from './combat.js';
import { circlesOverlap } from './collision.js';
import { getMapConfig, mapConfigs } from './maps/index.js';
import { Projectile } from './projectile.js';
import type {
  ArenaBounds,
  CharacterConfig,
  CircleBody,
  Effect,
  GameCallbacks,
  GameSettings,
  GameState,
  MapConfig,
  RuntimeCharacter,
  UltimateAttackConfig,
  Vector,
} from './types.js';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  onGameOver?: GameCallbacks['onGameOver'];
  onPauseToggle?: GameCallbacks['onPauseToggle'];
  onMuteToggle?: GameCallbacks['onMuteToggle'];
  onStatusChange?: GameCallbacks['onStatusChange'];
  state: GameState;
  paused: boolean;
  muted: boolean;
  settings: GameSettings | null;
  characters: RuntimeCharacter[];
  projectiles: Projectile[];
  effects: Effect[];
  shakeX: number;
  shakeY: number;
  shakeIntensity: number;
  animationFrameId: number | null;
  lastFrameTime: number;
  characterImages: Map<string, HTMLImageElement>;
  projectileImages: Map<string, HTMLImageElement>;
  sounds: Map<string, HTMLAudioElement>;

  constructor(canvas: HTMLCanvasElement, { onGameOver, onPauseToggle, onMuteToggle, onStatusChange }: GameCallbacks = {}) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context is not available.');
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.onGameOver = onGameOver;
    this.onPauseToggle = onPauseToggle;
    this.onMuteToggle = onMuteToggle;
    this.onStatusChange = onStatusChange;
    this.state = GAME_STATES.MENU;
    this.paused = false;
    this.muted = false;
    this.settings = null;
    this.characters = [];
    this.projectiles = [];
    this.effects = [];
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.characterImages = new Map();
    this.projectileImages = new Map();
    this.sounds = new Map();
  }

  start(settings: GameSettings): void {
    const map = getMapConfig(settings.arenaShape);

    if (!map || !getCharacterConfig(settings.playerOne) || !getCharacterConfig(settings.playerTwo)) {
      return;
    }

    if (settings.playerOne === settings.playerTwo) {
      return;
    }

    this.stopLoop();
    this.state = GAME_STATES.PLAYING;
    this.paused = false;
    this.settings = { ...settings };
    this.projectiles = [];
    this.effects = [];
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.createCharacters();
    this.notifyStatusChange();
    this.startLoop();
  }

  returnToMenu(): void {
    this.stopLoop();
    this.state = GAME_STATES.MENU;
    this.paused = false;
    this.settings = null;
    this.characters = [];
    this.projectiles = [];
    this.effects = [];
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.notifyStatusChange();
    this.draw();
  }

  togglePause(): void {
    if (this.state !== GAME_STATES.PLAYING) {
      return;
    }

    this.paused = !this.paused;

    if (!this.paused) {
      this.lastFrameTime = performance.now();
    }

    this.onPauseToggle?.(this.paused);
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.onMuteToggle?.(this.muted);
  }

  render(): void {
    this.draw();
  }

  notifyStatusChange(): void {
    this.onStatusChange?.(this.characters);
  }

  startLoop(): void {
    this.stopLoop();
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame((time) => this.loop(time));
  }

  stopLoop(): void {
    if (!this.animationFrameId) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  loop(time: number): void {
    if (this.state !== GAME_STATES.PLAYING) {
      this.animationFrameId = null;
      return;
    }

    const deltaTime = Math.min((time - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = time;

    if (!this.paused) {
      this.update(deltaTime, time);
      this.updateShake(deltaTime);
      this.notifyStatusChange();
    }

    this.draw();

    if (this.state === GAME_STATES.PLAYING) {
      this.animationFrameId = requestAnimationFrame((nextTime) => this.loop(nextTime));
    }
  }

  updateShake(deltaTime: number): void {
    if (this.shakeIntensity <= 0) {
      return;
    }

    this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
    this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * 80);
  }

  triggerShake(intensity: number): void {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      return;
    }

    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  createCharacters(): void {
    const map = this.getCurrentMap();
    const left = getCharacterConfig(this.settings?.playerOne ?? '');
    const right = getCharacterConfig(this.settings?.playerTwo ?? '');

    if (!left || !right) {
      this.characters = [];
      return;
    }

    const arena = getArenaBounds(this.canvas, map);
    const positions = getStartingPositions(arena, left.radius, right.radius);

    this.characters = [
      this.createCharacter(left, positions[0], createVelocity(1, 0.35, left.speed)),
      this.createCharacter(right, positions[1], createVelocity(-1, -0.25, right.speed)),
    ].map((character) => correctCharacterPosition(character, arena));
  }

  createCharacter(config: CharacterConfig, position: CircleBody, velocity: { velocityX: number; velocityY: number }): RuntimeCharacter {
    return {
      ...config,
      ...position,
      ...velocity,
      health: config.maxHealth,
      rage: 0,
      nextAttackTime: 0,
      overrideImage: null,
      overrideImageUntil: 0,
      stats: {
        normalAttacksLanded: 0,
        ultimateAttacksUsed: 0,
        totalDamageDealt: 0,
      },
    };
  }

  update(deltaTime: number, time: number): void {
    if (this.state !== GAME_STATES.PLAYING) {
      return;
    }

    const arena = getArenaBounds(this.canvas, this.getCurrentMap());
    this.updateTemporaryImages(time);

    for (const character of this.characters) {
      if (character.health <= 0) {
        continue;
      }

      character.x += character.velocityX * deltaTime;
      character.y += character.velocityY * deltaTime;

      if (!isInsideArena(character, arena)) {
        this.bounceOffWall(character, arena);
        correctCharacterPosition(character, arena);
      }
    }

    const [left, right] = this.characters;

    if (!left || !right) {
      return;
    }

    if (circlesOverlap(left, right)) {
      if (!left.normalAttack.range) this.handleNormalAttack(left, right, time);
      if (!right.normalAttack.range) this.handleNormalAttack(right, left, time);
    }

    for (const character of [left, right]) {
      if (character.health <= 0 || !character.normalAttack.range) continue;
      const target = character === left ? right : left;
      if (target.health <= 0) continue;
      const dx = target.x - character.x;
      const dy = target.y - character.y;
      if (Math.hypot(dx, dy) <= character.normalAttack.range) {
        this.handleRangedNormalAttack(character, target, time);
      }
    }

    if (this.endIfNeeded()) {
      return;
    }

    for (const character of this.characters) {
      correctCharacterPosition(character, arena);
    }

    this.updateProjectiles(deltaTime, arena);

    if (this.endIfNeeded()) {
      return;
    }

    this.activateReadyUltimates(time);

    if (this.endIfNeeded()) {
      return;
    }

    this.updateEffects(deltaTime);
  }

  handleNormalAttack(attacker: RuntimeCharacter, defender: RuntimeCharacter, time: number): void {
    const damageDealt = handleContactAttacks(attacker, defender, time, this.effects);

    if (damageDealt <= 0) {
      return;
    }

    attacker.stats.normalAttacksLanded += 1;
    attacker.stats.totalDamageDealt += damageDealt;

    this.effects.push({
      type: 'impact-ring',
      x: defender.x,
      y: defender.y,
      age: 0,
      duration: 0.25,
      color: '#ffffff',
      radius: Math.max(defender.radius, attacker.radius) * 0.6,
    });
  }

  handleRangedNormalAttack(attacker: RuntimeCharacter, defender: RuntimeCharacter, time: number): void {
    if (attacker.normalAttack.projectile) {
      this.fireNormalProjectile(attacker, defender, time);
      return;
    }

    const damageDealt = handleContactAttacks(attacker, defender, time, this.effects);

    if (damageDealt <= 0) {
      return;
    }

    attacker.stats.normalAttacksLanded += 1;
    attacker.stats.totalDamageDealt += damageDealt;

    this.effects.push({
      type: 'impact-ring',
      x: defender.x,
      y: defender.y,
      age: 0,
      duration: 0.25,
      color: '#ffffff',
      radius: Math.max(defender.radius, attacker.radius) * 0.6,
    });

  }

  fireNormalProjectile(attacker: RuntimeCharacter, defender: RuntimeCharacter, time: number): void {
    if (attacker.health <= 0 || defender.health <= 0 || time < attacker.nextAttackTime || !attacker.normalAttack.projectile) {
      return;
    }

    const projectile = attacker.normalAttack.projectile;
    const direction = getDirection(attacker, defender);
    const spawnDistance = attacker.radius + projectile.radius + 6;
    const projectileImg = projectile.image ? this.getProjectileImage(projectile.image) : null;

    attacker.nextAttackTime = time + attacker.normalAttack.cooldown;
    this.playSound(projectile.sound);

    this.projectiles.push(new Projectile({
      x: attacker.x + direction.x * spawnDistance,
      y: attacker.y + direction.y * spawnDistance,
      velocityX: direction.x * projectile.speed,
      velocityY: direction.y * projectile.speed,
      radius: projectile.radius,
      damage: attacker.normalAttack.damage,
      owner: attacker.id,
      label: attacker.normalAttack.name,
      color: projectile.color,
      knockback: projectile.knockback,
      shape: projectile.shape,
      img: projectileImg,
      isNormalAttack: true,
    }));
  }

  updateProjectiles(deltaTime: number, arena: ArenaBounds): void {
    for (const projectile of this.projectiles) {
      projectile.update(deltaTime);

      if (!isInsideArena(projectile, arena)) {
        projectile.active = false;
        continue;
      }

      for (const character of this.characters) {
        if (
          character.id === projectile.owner ||
          character.health <= 0 ||
          !circlesOverlap(projectile, character)
        ) {
          continue;
        }

        const damageDealt = applyDamage(character, projectile.damage);
        this.addDamageToOwner(projectile.owner, damageDealt);

        if (projectile.isNormalAttack && damageDealt > 0) {
          const owner = this.characters.find((candidate) => candidate.id === projectile.owner);

          this.addNormalHitToOwner(projectile.owner);
          if (owner) {
            gainRage(owner, 20);
          }
          gainRage(character, 10);
        }

        this.applyKnockback(character, projectile);
        projectile.active = false;

        this.effects.push({
          text: `-${damageDealt}`,
          label: projectile.label,
          x: character.x,
          y: character.y - character.radius,
          age: 0,
          duration: 0.7,
          color: projectile.color,
        });

        this.effects.push({
          type: 'impact-ring',
          x: character.x,
          y: character.y,
          age: 0,
          duration: 0.35,
          color: projectile.color,
          radius: projectile.radius * 3,
        });

        if (projectile.knockback > 0) {
          this.triggerShake(projectile.knockback * 0.04);
        }

        break;
      }
    }

    this.projectiles = this.projectiles.filter((projectile) => projectile.active);
  }

  addDamageToOwner(ownerId: string, damageDealt: number): void {
    const owner = this.characters.find((character) => character.id === ownerId);

    if (owner) {
      owner.stats.totalDamageDealt += damageDealt;
    }
  }

  addNormalHitToOwner(ownerId: string): void {
    const owner = this.characters.find((character) => character.id === ownerId);

    if (owner) {
      owner.stats.normalAttacksLanded += 1;
    }
  }

  activateReadyUltimates(time: number): void {
    const [left, right] = this.characters;

    if (!left || !right) {
      return;
    }

    for (const character of this.characters) {
      if (character.health <= 0 || character.rage < 100) {
        continue;
      }

      const target = character === left ? right : left;

      if (target.health <= 0) {
        continue;
      }

      character.rage = 0;
      character.stats.ultimateAttacksUsed += 1;
      this.fireUltimate(character, target, time);
    }
  }

  fireUltimate(character: RuntimeCharacter, target: RuntimeCharacter, time: number): void {
    const direction = getDirection(character, target);
    const skill = character.ultimateAttack;

    this.playSound(skill.sound);

    if (skill.avatarImage) {
      character.overrideImage = skill.avatarImage;
      character.overrideImageUntil = time + (skill.avatarDuration ?? 900);
    }

    if (skill.guaranteedHit) {
      this.applyGuaranteedUltimate(character, target, skill);
      return;
    }

    const projectile = skill.projectile;

    if (!projectile) {
      return;
    }

    const spawnDistance = character.radius + projectile.radius + 6;
    const projectileImg = projectile.image ? this.getProjectileImage(projectile.image) : null;

    this.projectiles.push(new Projectile({
      x: character.x + direction.x * spawnDistance,
      y: character.y + direction.y * spawnDistance,
      velocityX: direction.x * projectile.speed,
      velocityY: direction.y * projectile.speed,
      radius: projectile.radius,
      damage: skill.damage,
      owner: character.id,
      label: skill.name,
      color: projectile.color,
      knockback: projectile.knockback,
      shape: projectile.shape,
      img: projectileImg,
    }));

    this.effects.push({
      text: skill.name,
      label: skill.name,
      x: character.x + direction.x * (character.radius + 12),
      y: character.y + direction.y * (character.radius + 12),
      age: 0,
      duration: 0.35,
      color: projectile.color,
    });

    this.effects.push({
      type: 'impact-ring',
      x: character.x,
      y: character.y,
      age: 0,
      duration: 0.3,
      color: projectile.color,
      radius: character.radius * 1.2,
    });
  }

  applyGuaranteedUltimate(character: RuntimeCharacter, target: RuntimeCharacter, skill: UltimateAttackConfig): void {
    const damageDealt = applyDamage(target, skill.damage);
    character.stats.totalDamageDealt += damageDealt;
    const knockback = skill.projectile?.knockback ?? 0;
    const color = skill.projectile?.color ?? character.accentColor;
    this.applyKnockback(target, { knockback, velocityX: target.x - character.x, velocityY: target.y - character.y });

    this.effects.push({
      text: `-${damageDealt}`,
      label: skill.name,
      x: target.x,
      y: target.y - target.radius,
      age: 0,
      duration: 0.7,
      color,
    });

    this.effects.push({
      type: 'impact-ring',
      x: target.x,
      y: target.y,
      age: 0,
      duration: 0.35,
      color,
      radius: target.radius * 1.4,
    });

    this.effects.push({
      text: skill.name,
      label: skill.name,
      x: character.x,
      y: character.y - character.radius,
      age: 0,
      duration: 0.6,
      color,
    });
  }

  updateTemporaryImages(time: number): void {
    for (const character of this.characters) {
      if (character.overrideImage && time >= character.overrideImageUntil) {
        character.overrideImage = null;
        character.overrideImageUntil = 0;
      }
    }
  }

  endIfNeeded(): boolean {
    const loser = this.characters.find((character) => character.health <= 0);

    if (!loser) {
      return false;
    }

    const winner = this.characters.find((character) => character !== loser);

    if (!winner) {
      return false;
    }

    this.endGame(winner, loser);
    return true;
  }

  endGame(winner: RuntimeCharacter, loser: RuntimeCharacter): void {
    this.state = GAME_STATES.GAME_OVER;
    this.stopLoop();
    this.projectiles = [];

    this.draw();
    this.notifyStatusChange();

    this.onGameOver?.({
      winner,
      loser,
      characters: this.characters,
    });
  }

  applyKnockback(character: RuntimeCharacter, projectile: { knockback: number; velocityX: number; velocityY: number }): void {
    if (projectile.knockback <= 0 || this.state !== GAME_STATES.PLAYING) {
      return;
    }

    const speed = Math.hypot(projectile.velocityX, projectile.velocityY) || 1;
    const directionX = projectile.velocityX / speed;
    const directionY = projectile.velocityY / speed;

    character.velocityX += directionX * projectile.knockback;
    character.velocityY += directionY * projectile.knockback;
  }

  updateEffects(deltaTime: number): void {
    this.effects = this.effects
      .map((effect) => ({
        ...effect,
        age: effect.age + deltaTime,
        y: effect.y - 35 * deltaTime,
      }))
      .filter((effect) => effect.age < effect.duration);
  }

  bounceOffWall(character: RuntimeCharacter, arena: ArenaBounds): void {
    if (arena.shape === 'circle') {
      const normal = getWallNormal(character, arena);
      const dot = character.velocityX * normal.x + character.velocityY * normal.y;

      if (dot > 0) {
        character.velocityX -= 2 * dot * normal.x;
        character.velocityY -= 2 * dot * normal.y;
      }

      return;
    }

    if (character.x - character.radius <= arena.left && character.velocityX < 0) {
      character.velocityX = Math.abs(character.velocityX);
    }

    if (character.x + character.radius >= arena.right && character.velocityX > 0) {
      character.velocityX = -Math.abs(character.velocityX);
    }

    if (character.y - character.radius <= arena.top && character.velocityY < 0) {
      character.velocityY = Math.abs(character.velocityY);
    }

    if (character.y + character.radius >= arena.bottom && character.velocityY > 0) {
      character.velocityY = -Math.abs(character.velocityY);
    }
  }

  draw(): void {
    const { ctx, canvas } = this;

    ctx.save();

    if (this.shakeIntensity > 0 && this.state === GAME_STATES.PLAYING) {
      ctx.translate(this.shakeX, this.shakeY);
    }

    ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);
    ctx.fillStyle = '#0a0f1c';
    ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);

    drawArena(ctx, canvas, this.getCurrentMap());

    for (const projectile of this.projectiles) {
      projectile.draw(ctx);
    }

    for (const character of this.characters) {
      this.drawFighter(character);
    }

    for (const effect of this.effects) {
      if (effect.type === 'impact-ring') {
        this.drawImpactRing(effect);
      } else {
        this.drawEffect(effect);
      }
    }

    if (this.state === GAME_STATES.GAME_OVER) {
      this.drawGameOverOverlay();
    }

    if (this.paused) {
      this.drawPausedOverlay();
    }

    ctx.restore();
  }

  getCharacterImage(character: RuntimeCharacter): HTMLImageElement | null {
    const image = character.overrideImage || character.image;

    if (!image) {
      return null;
    }

    if (this.characterImages.has(image)) {
      const img = this.characterImages.get(image);

      if (img?.complete && img.naturalWidth > 0) {
        return img;
      }

      return null;
    }

    const img = new Image();
    img.src = image;
    this.characterImages.set(image, img);

    return null;
  }

  getProjectileImage(src: string): HTMLImageElement | null {
    if (this.projectileImages.has(src)) {
      const img = this.projectileImages.get(src);

      if (img?.complete && img.naturalWidth > 0) {
        return img;
      }

      return null;
    }

    const img = new Image();
    img.src = src;
    this.projectileImages.set(src, img);

    return null;
  }

  playSound(src?: string): void {
    if (!src || this.muted) {
      return;
    }

    if (!this.sounds.has(src)) {
      this.sounds.set(src, new Audio(src));
    }

    const audio = this.sounds.get(src);
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  drawFighter(character: RuntimeCharacter): void {
    const { ctx } = this;

    this.drawHealthBar(character);
    this.drawRageBar(character);

    const img = this.getCharacterImage(character);

    if (img) {
      const size = character.radius * 2.8;

      ctx.save();
      ctx.beginPath();
      ctx.arc(character.x, character.y, character.radius * 0.9, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, character.x - size / 2, character.y - size / 2, size, size);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(character.x, character.y, character.radius, 0, Math.PI * 2);
      ctx.fillStyle = character.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(character.x, character.y, character.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = character.accentColor;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (DEBUG_DRAW_VELOCITY && this.state === GAME_STATES.PLAYING) {
      this.drawVelocityLine(character);
    }

    ctx.fillStyle = '#f4f7fb';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(character.name, character.x, character.y + character.radius + 28);
  }

  drawHealthBar(character: RuntimeCharacter): void {
    const { ctx } = this;
    const width = Math.max(72, character.radius * 2.2);
    const height = 8;
    const x = character.x - width / 2;
    const y = character.y - character.radius - 24;
    const healthRatio = character.health / character.maxHealth;

    ctx.fillStyle = '#2a3652';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = healthRatio > 0.35 ? '#50e38a' : '#ff5a4f';
    ctx.fillRect(x, y, width * Math.max(0, healthRatio), height);

    ctx.strokeStyle = '#f4f7fb';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  drawRageBar(character: RuntimeCharacter): void {
    const { ctx } = this;
    const width = Math.max(72, character.radius * 2.2);
    const height = 5;
    const x = character.x - width / 2;
    const y = character.y - character.radius - 13;

    ctx.fillStyle = '#2a3652';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = character.accentColor;
    ctx.fillRect(x, y, width * (character.rage / 100), height);
  }

  drawEffect(effect: Effect): void {
    if (effect.type === 'impact-ring') {
      return;
    }

    const { ctx } = this;
    const progress = effect.age / effect.duration;

    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = effect.color;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(effect.text, effect.x, effect.y);
    ctx.font = 'bold 12px Arial';
    ctx.fillText(effect.label, effect.x, effect.y + 16);
    ctx.globalAlpha = 1;
  }

  drawImpactRing(effect: Extract<Effect, { type: 'impact-ring' }>): void {
    const { ctx } = this;
    const progress = effect.age / effect.duration;
    const currentRadius = effect.radius * (0.2 + progress * 0.8);

    ctx.save();
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 2 * (1 - progress);
    ctx.globalAlpha = 1 - progress;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawGameOverOverlay(): void {
    const { ctx, canvas } = this;
    const winner = this.characters.find((character) => character.health > 0);

    ctx.fillStyle = 'rgba(10, 15, 28, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f4f7fb';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);

    if (winner) {
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = winner.accentColor;
      ctx.fillText(`${winner.name} wins!`, canvas.width / 2, canvas.height / 2 + 20);
    }
  }

  drawPausedOverlay(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = 'rgba(10, 15, 28, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f4f7fb';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  }

  drawVelocityLine(character: RuntimeCharacter): void {
    const { ctx } = this;
    const length = 40;
    const speed = Math.hypot(character.velocityX, character.velocityY);

    if (speed === 0) {
      return;
    }

    const directionX = character.velocityX / speed;
    const directionY = character.velocityY / speed;

    ctx.beginPath();
    ctx.moveTo(character.x, character.y);
    ctx.lineTo(character.x + directionX * length, character.y + directionY * length);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  getCurrentMap(): MapConfig {
    const fallback = mapConfigs[0];

    if (!this.settings) {
      return fallback;
    }

    return getMapConfig(this.settings.arenaShape) ?? fallback;
  }
}

function createVelocity(directionX: number, directionY: number, speed: number): { velocityX: number; velocityY: number } {
  const length = Math.hypot(directionX, directionY);

  return {
    velocityX: (directionX / length) * speed,
    velocityY: (directionY / length) * speed,
  };
}

function getDirection(from: Vector, to: Vector): Vector {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;

  return {
    x: dx / distance,
    y: dy / distance,
  };
}
