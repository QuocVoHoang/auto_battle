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
import { applyDamage, handleContactAttacks } from './combat.js';
import { circlesOverlap } from './collision.js';
import { Projectile } from './projectile.js';

export class Game {
  constructor(canvas, { onGameOver, onPauseToggle, onMuteToggle } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onGameOver = onGameOver;
    this.onPauseToggle = onPauseToggle;
    this.onMuteToggle = onMuteToggle;
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
  }

  start(settings) {
    if (!settings) {
      return;
    }

    if (!getCharacterConfig(settings.playerOne) || !getCharacterConfig(settings.playerTwo)) {
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
    this.startLoop();
  }

  returnToMenu() {
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
    this.draw();
  }

  togglePause() {
    if (this.state !== GAME_STATES.PLAYING) {
      return;
    }

    this.paused = !this.paused;

    if (!this.paused) {
      this.lastFrameTime = performance.now();
    }

    if (this.onPauseToggle) {
      this.onPauseToggle(this.paused);
    }
  }

  toggleMute() {
    this.muted = !this.muted;

    if (this.onMuteToggle) {
      this.onMuteToggle(this.muted);
    }
  }

  render() {
    this.draw();
  }

  startLoop() {
    this.stopLoop();
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame((time) => this.loop(time));
  }

  stopLoop() {
    if (!this.animationFrameId) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  loop(time) {
    if (this.state !== GAME_STATES.PLAYING) {
      this.animationFrameId = null;
      return;
    }

    const deltaTime = Math.min((time - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = time;

    if (!this.paused) {
      this.update(deltaTime, time);
      this.updateShake(deltaTime);
    }

    this.draw();

    if (this.state === GAME_STATES.PLAYING) {
      this.animationFrameId = requestAnimationFrame((nextTime) => this.loop(nextTime));
    }
  }

  updateShake(deltaTime) {
    if (this.shakeIntensity <= 0) {
      return;
    }

    this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
    this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * 80);
  }

  triggerShake(intensity) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      return;
    }

    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  createCharacters() {
    const arena = getArenaBounds(this.canvas, this.settings.arenaShape);
    const left = getCharacterConfig(this.settings.playerOne);
    const right = getCharacterConfig(this.settings.playerTwo);
    const positions = getStartingPositions(arena, left.radius, right.radius);

    this.characters = [
      this.createCharacter(left, positions[0], createVelocity(1, 0.35, left.speed)),
      this.createCharacter(right, positions[1], createVelocity(-1, -0.25, right.speed)),
    ].map((character) => correctCharacterPosition(character, arena));
  }

  createCharacter(config, position, velocity) {
    return {
      ...config,
      ...position,
      ...velocity,
      health: config.maxHealth,
      rage: 0,
      nextAttackTime: 0,
      stats: {
        normalAttacksLanded: 0,
        specialSkillsUsed: 0,
        totalDamageDealt: 0,
      },
    };
  }

  update(deltaTime, time) {
    if (this.state !== GAME_STATES.PLAYING) {
      return;
    }

    const arena = getArenaBounds(this.canvas, this.settings.arenaShape);

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

    if (circlesOverlap(left, right)) {
      if (!left.normalRange) this.handleNormalAttack(left, right, time);
      if (!right.normalRange) this.handleNormalAttack(right, left, time);
    }

    for (const character of [left, right]) {
      if (character.health <= 0 || !character.normalRange) continue;
      const target = character === left ? right : left;
      if (target.health <= 0) continue;
      const dx = target.x - character.x;
      const dy = target.y - character.y;
      if (Math.hypot(dx, dy) <= character.normalRange) {
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

    this.activateReadySpecials();
    this.updateEffects(deltaTime);
  }

  handleNormalAttack(attacker, defender, time) {
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

  handleRangedNormalAttack(attacker, defender, time) {
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

  updateProjectiles(deltaTime, arena) {
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

  addDamageToOwner(ownerId, damageDealt) {
    const owner = this.characters.find((character) => character.id === ownerId);

    if (owner) {
      owner.stats.totalDamageDealt += damageDealt;
    }
  }

  activateReadySpecials() {
    const [left, right] = this.characters;

    for (const character of this.characters) {
      if (character.health <= 0 || character.rage < 100) {
        continue;
      }

      const target = character === left ? right : left;

      if (target.health <= 0) {
        continue;
      }

      character.rage = 0;
      character.stats.specialSkillsUsed += 1;
      this.fireSpecial(character, target);
    }
  }

  fireSpecial(character, target) {
    const direction = getDirection(character, target);
    const skill = character.special;
    const spawnDistance = character.radius + skill.radius + 6;

    const projectileImg = skill.image ? this.getProjectileImage(skill.image) : null;

    this.projectiles.push(new Projectile({
      x: character.x + direction.x * spawnDistance,
      y: character.y + direction.y * spawnDistance,
      velocityX: direction.x * skill.speed,
      velocityY: direction.y * skill.speed,
      radius: skill.radius,
      damage: character.specialDamage,
      owner: character.id,
      type: skill.type,
      label: skill.label,
      color: skill.color,
      knockback: skill.knockback,
      shape: skill.shape,
      img: projectileImg,
    }));

    this.effects.push({
      text: character.specialSkill,
      label: skill.flash,
      x: character.x + direction.x * (character.radius + 12),
      y: character.y + direction.y * (character.radius + 12),
      age: 0,
      duration: 0.35,
      color: skill.color,
    });

    this.effects.push({
      type: 'impact-ring',
      x: character.x,
      y: character.y,
      age: 0,
      duration: 0.3,
      color: skill.color,
      radius: character.radius * 1.2,
    });
  }

  endIfNeeded() {
    const loser = this.characters.find((character) => character.health <= 0);

    if (!loser) {
      return false;
    }

    const winner = this.characters.find((character) => character !== loser);
    this.endGame(winner, loser);
    return true;
  }

  endGame(winner, loser) {
    this.state = GAME_STATES.GAME_OVER;
    this.stopLoop();
    this.projectiles = [];

    this.draw();

    if (this.onGameOver) {
      this.onGameOver({
        winner,
        loser,
        characters: this.characters,
      });
    }
  }

  applyKnockback(character, projectile) {
    if (projectile.knockback <= 0 || this.state !== GAME_STATES.PLAYING) {
      return;
    }

    const speed = Math.hypot(projectile.velocityX, projectile.velocityY) || 1;
    const directionX = projectile.velocityX / speed;
    const directionY = projectile.velocityY / speed;

    character.velocityX += directionX * projectile.knockback;
    character.velocityY += directionY * projectile.knockback;
  }

  updateEffects(deltaTime) {
    this.effects = this.effects
      .map((effect) => ({
        ...effect,
        age: effect.age + deltaTime,
        y: effect.y - 35 * deltaTime,
      }))
      .filter((effect) => effect.age < effect.duration);
  }

  bounceOffWall(character, arena) {
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

  draw() {
    const { ctx, canvas } = this;

    ctx.save();

    if (this.shakeIntensity > 0 && this.state === GAME_STATES.PLAYING) {
      ctx.translate(this.shakeX, this.shakeY);
    }

    ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20);
    ctx.fillStyle = '#0a0f1c';
    ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);

    const arenaShape = this.settings?.arenaShape ?? 'square';
    drawArena(ctx, canvas, arenaShape);

    ctx.fillStyle = '#f4f7fb';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Battle Arena', canvas.width / 2, 56);

    if (this.state === GAME_STATES.MENU || !this.settings) {
      ctx.font = '18px Arial';
      ctx.fillStyle = '#b8c3d9';
      ctx.fillText('Select fighters and start a game.', canvas.width / 2, 92);
      ctx.restore();
      return;
    }

    this.drawHud();

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

  drawHud() {
    const { ctx, canvas } = this;
    const [left, right] = this.characters;

    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4f7fb';
    ctx.fillText(left.name, canvas.width / 2 - 210, 86);
    ctx.fillText(right.name, canvas.width / 2 + 210, 86);

    this.drawHudHealthBar(left, canvas.width / 2 - 260, 92, left.health / left.maxHealth, '#50e38a');
    this.drawHudHealthBar(right, canvas.width / 2 + 90, 92, right.health / right.maxHealth, '#50e38a');

    ctx.font = '12px Arial';
    ctx.fillStyle = '#b8c3d9';
    ctx.fillText(`${left.health}/${left.maxHealth}`, canvas.width / 2 - 210, 104);
    ctx.fillText(`${right.health}/${right.maxHealth}`, canvas.width / 2 + 210, 104);

    this.drawHudRageBar(left, canvas.width / 2 - 260, 110);
    this.drawHudRageBar(right, canvas.width / 2 + 90, 110);
  }

  drawHudHealthBar(character, x, y, ratio, color) {
    const { ctx } = this;
    const width = 170;
    const height = 10;

    ctx.fillStyle = '#2a3652';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = ratio > 0.35 ? color : '#ff5a4f';
    ctx.fillRect(x, y, width * Math.max(0, ratio), height);

    ctx.strokeStyle = '#f4f7fb';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  }

  drawHudRageBar(character, x, y) {
    const { ctx } = this;
    const width = 170;
    const height = 6;

    ctx.fillStyle = '#2a3652';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = character.accentColor;
    ctx.fillRect(x, y, width * (character.rage / 100), height);
  }

  getCharacterImage(character) {
    if (!character.image) {
      return null;
    }

    if (this.characterImages.has(character.id)) {
      const img = this.characterImages.get(character.id);

      if (img.complete && img.naturalWidth > 0) {
        return img;
      }

      return null;
    }

    const img = new Image();
    img.src = character.image;
    this.characterImages.set(character.id, img);

    return null;
  }

  getProjectileImage(src) {
    if (!src) {
      return null;
    }

    if (this.projectileImages.has(src)) {
      const img = this.projectileImages.get(src);

      if (img.complete && img.naturalWidth > 0) {
        return img;
      }

      return null;
    }

    const img = new Image();
    img.src = src;
    this.projectileImages.set(src, img);

    return null;
  }

  drawFighter(character) {
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

  drawHealthBar(character) {
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

  drawRageBar(character) {
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

  drawEffect(effect) {
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

  drawImpactRing(effect) {
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

  drawGameOverOverlay() {
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

  drawPausedOverlay() {
    const { ctx, canvas } = this;

    ctx.fillStyle = 'rgba(10, 15, 28, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f4f7fb';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  }

  drawVelocityLine(character) {
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
}

function createVelocity(directionX, directionY, speed) {
  const length = Math.hypot(directionX, directionY);

  return {
    velocityX: (directionX / length) * speed,
    velocityY: (directionY / length) * speed,
  };
}

function getDirection(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;

  return {
    x: dx / distance,
    y: dy / distance,
  };
}
