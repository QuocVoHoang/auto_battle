import { GAME } from '../data/constants';
import { CHARACTER_DEFINITIONS } from '../data/characters';
import { Character } from '../entities/Character';
import { keepInsideArena } from '../systems/arena';
import { resolveCombat } from '../systems/combat';
import { updateMovement } from '../systems/movement';
import { updateParticles, updateProjectiles } from '../systems/skills';
import { Renderer } from './Renderer';
import type { ArenaShape, GameState, Particle, Projectile } from './types';
import type { MatchConfig } from '../ui/screen';
import { ScreenUI } from '../ui/screen';

export class Game {
  private readonly ui: ScreenUI;
  private readonly renderer: Renderer;
  private state: GameState = 'start';
  private arenaShape: ArenaShape = 'circle';
  private characters: Character[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private lastTime = 0;

  constructor(root: HTMLElement) {
    this.ui = new ScreenUI((config) => this.startMatch(config));
    root.append(this.ui.root);

    const context = this.ui.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not supported');
    this.renderer = new Renderer(context);
    requestAnimationFrame((time) => this.loop(time));
  }

  private startMatch(config: MatchConfig) {
    this.state = 'playing';
    this.arenaShape = config.arenaShape;
    this.projectiles = [];
    this.particles = [];
    this.characters = [
      new Character(CHARACTER_DEFINITIONS[config.character1], { x: GAME.canvasWidth / 2 - 125, y: GAME.canvasHeight / 2 }),
      new Character(CHARACTER_DEFINITIONS[config.character2], { x: GAME.canvasWidth / 2 + 125, y: GAME.canvasHeight / 2 }),
    ];
    this.updateUi();
  }

  private loop(time: number) {
    const delta = Math.min(0.033, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;

    if (this.state === 'playing') this.update(delta);
    this.renderer.draw(this.arenaShape, this.characters, this.projectiles, this.particles);
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  private update(delta: number) {
    for (const character of this.characters) {
      if (!character.isAlive) continue;
      updateMovement(character, delta);
      keepInsideArena(character, this.arenaShape);
    }

    resolveCombat(this.characters, this.projectiles, this.particles);
    updateProjectiles(this.projectiles, this.characters, this.particles, delta);
    updateParticles(this.particles, delta);
    this.updateUi();
    this.checkGameOver();
  }

  private updateUi() {
    this.ui.updateTopBars(this.characters.map((character) => ({
      name: character.name,
      hp: character.hp,
      maxHp: character.definition.maxHp,
    })));
  }

  private checkGameOver() {
    const loser = this.characters.find((character) => !character.isAlive);
    if (!loser) return;

    const winner = this.characters.find((character) => character.isAlive);
    if (!winner) return;

    this.state = 'gameOver';
    this.ui.showGameOver(winner.name, loser.name);
  }
}
