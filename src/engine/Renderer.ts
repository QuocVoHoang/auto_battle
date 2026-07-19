import { GAME } from '../data/constants';
import type { Character } from '../entities/Character';
import type { ArenaShape, Particle, Projectile } from './types';
import { ARENA_CENTER } from '../systems/arena';

export class Renderer {
  constructor(private readonly context: CanvasRenderingContext2D) {}

  draw(shape: ArenaShape, characters: Character[], projectiles: Projectile[], particles: Particle[]) {
    this.context.clearRect(0, 0, GAME.canvasWidth, GAME.canvasHeight);
    this.drawBackground();
    this.drawArena(shape);
    particles.forEach((particle) => this.drawParticle(particle));
    projectiles.forEach((projectile) => this.drawProjectile(projectile));
    characters.forEach((character) => this.drawCharacter(character));
  }

  private drawBackground() {
    const gradient = this.context.createRadialGradient(ARENA_CENTER.x, ARENA_CENTER.y, 60, ARENA_CENTER.x, ARENA_CENTER.y, 480);
    gradient.addColorStop(0, '#263a5c');
    gradient.addColorStop(1, '#111827');
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, GAME.canvasWidth, GAME.canvasHeight);
  }

  private drawArena(shape: ArenaShape) {
    this.context.save();
    this.context.lineWidth = 8;
    this.context.strokeStyle = '#f8d56a';
    this.context.fillStyle = 'rgba(255, 255, 255, 0.045)';

    if (shape === 'circle') {
      this.context.beginPath();
      this.context.arc(ARENA_CENTER.x, ARENA_CENTER.y, GAME.arenaRadius, 0, Math.PI * 2);
      this.context.fill();
      this.context.stroke();
    } else {
      const size = GAME.arenaHalfSize * 2;
      this.context.beginPath();
      this.context.roundRect(ARENA_CENTER.x - GAME.arenaHalfSize, ARENA_CENTER.y - GAME.arenaHalfSize, size, size, 18);
      this.context.fill();
      this.context.stroke();
    }

    this.context.restore();
  }

  private drawCharacter(character: Character) {
    const { x, y } = character.position;
    this.context.save();
    this.context.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.context.shadowBlur = 18;
    this.context.fillStyle = character.hitFlash > 0 ? '#fff' : 'rgba(0, 0, 0, 0.25)';
    this.context.beginPath();
    this.context.arc(x, y + 7, GAME.characterRadius, 0, Math.PI * 2);
    this.context.fill();
    this.context.shadowBlur = 0;

    if (character.sprite.complete) {
      this.context.drawImage(character.sprite, x - 28, y - 35, 56, 70);
    } else {
      this.context.fillStyle = '#8ecae6';
      this.context.beginPath();
      this.context.arc(x, y, GAME.characterRadius, 0, Math.PI * 2);
      this.context.fill();
    }

    if (character.hitFlash > 0) {
      this.context.globalAlpha = 0.45;
      this.context.fillStyle = '#fff';
      this.context.beginPath();
      this.context.arc(x, y, GAME.characterRadius, 0, Math.PI * 2);
      this.context.fill();
    }
    this.context.restore();

    this.drawNameAndBars(character);
  }

  private drawNameAndBars(character: Character) {
    const x = character.position.x;
    const y = character.position.y - 58;
    const barWidth = 78;

    this.context.save();
    this.context.textAlign = 'center';
    this.context.font = '700 13px sans-serif';
    this.context.fillStyle = '#ffffff';
    this.context.fillText(character.name, x, y - 9);
    this.drawSmallBar(x - barWidth / 2, y, barWidth, 7, character.hp / character.definition.maxHp, '#53d769');
    this.drawSmallBar(x - barWidth / 2, y + 10, barWidth, 6, character.rage / character.definition.rageMax, '#f7c948');
    this.context.font = '700 11px sans-serif';
    this.context.fillText(`${character.hp} HP`, x, y + 30);
    this.context.restore();
  }

  private drawSmallBar(x: number, y: number, width: number, height: number, ratio: number, color: string) {
    this.context.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.context.fillRect(x, y, width, height);
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width * Math.max(0, Math.min(1, ratio)), height);
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    this.context.strokeRect(x, y, width, height);
  }

  private drawProjectile(projectile: Projectile) {
    this.context.save();
    this.context.fillStyle = projectile.kind === 'water' ? '#77d9ff' : projectile.kind === 'rock' ? '#a1623a' : '#ffe66d';
    this.context.beginPath();
    this.context.arc(projectile.position.x, projectile.position.y, projectile.radius, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  private drawParticle(particle: Particle) {
    this.context.save();
    this.context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    this.context.fillStyle = particle.color;
    this.context.beginPath();
    this.context.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }
}
