import { CHARACTER_CHOICES } from '../data/characters';
import type { ArenaShape, CharacterId } from '../engine/types';

export type MatchConfig = {
  character1: CharacterId;
  character2: CharacterId;
  arenaShape: ArenaShape;
};

type StartHandler = (config: MatchConfig) => void;

export class ScreenUI {
  readonly root = document.createElement('div');
  readonly canvas = document.createElement('canvas');
  private readonly overlay = document.createElement('div');
  private readonly panel1 = document.createElement('div');
  private readonly panel2 = document.createElement('div');

  constructor(private readonly onStart: StartHandler) {
    this.root.className = 'game-shell';
    this.root.innerHTML = `<div class="game-card"></div>`;
    const card = this.root.querySelector<HTMLDivElement>('.game-card');
    if (!card) throw new Error('Missing game card');

    const topBars = document.createElement('div');
    topBars.className = 'top-bars';
    this.panel1.className = 'fighter-panel';
    this.panel2.className = 'fighter-panel';
    topBars.append(this.panel1, this.panel2);

    this.canvas.width = 960;
    this.canvas.height = 640;
    this.overlay.className = 'screen-cover';
    card.append(topBars, this.canvas, this.overlay);
    this.showStart();
  }

  showStart() {
    this.overlay.classList.remove('hidden');
    this.overlay.innerHTML = `
      <form class="menu">
        <h1>Auto Battle</h1>
        <p>Pick two fighters and an arena. They fight by themselves.</p>
        ${this.selectField('Character 1', 'character1', 'police')}
        ${this.selectField('Character 2', 'character2', 'thief')}
        <div class="field">
          <label for="arenaShape">Arena Shape</label>
          <select id="arenaShape" name="arenaShape">
            <option value="circle">Circle Arena</option>
            <option value="square">Square Arena</option>
          </select>
        </div>
        <button type="submit">Start Battle</button>
      </form>
    `;

    const form = this.overlay.querySelector<HTMLFormElement>('form');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      this.overlay.classList.add('hidden');
      this.onStart({
        character1: data.get('character1') as CharacterId,
        character2: data.get('character2') as CharacterId,
        arenaShape: data.get('arenaShape') as ArenaShape,
      });
    });
  }

  showGameOver(winner: string, loser: string) {
    this.overlay.classList.remove('hidden');
    this.overlay.innerHTML = `
      <div class="overlay-panel">
        <h1>${winner} wins</h1>
        <p>${loser} was defeated.</p>
        <button type="button">Play Again</button>
      </div>
    `;
    this.overlay.querySelector('button')?.addEventListener('click', () => this.showStart());
  }

  updateTopBars(fighters: Array<{ name: string; hp: number; maxHp: number }>) {
    this.updatePanel(this.panel1, fighters[0]);
    this.updatePanel(this.panel2, fighters[1]);
  }

  private updatePanel(panel: HTMLDivElement, fighter?: { name: string; hp: number; maxHp: number }) {
    if (!fighter) {
      panel.innerHTML = '';
      return;
    }
    const hpRatio = Math.max(0, fighter.hp / fighter.maxHp) * 100;
    panel.innerHTML = `
      <div class="fighter-title"><span>${fighter.name}</span><span>${fighter.hp} / ${fighter.maxHp}</span></div>
      <div class="bar"><div class="bar-fill" style="width: ${hpRatio}%"></div></div>
    `;
  }

  private selectField(label: string, name: string, selected: CharacterId) {
    const options = CHARACTER_CHOICES.map((character) => {
      const isSelected = character.id === selected ? 'selected' : '';
      return `<option value="${character.id}" ${isSelected}>${character.name}</option>`;
    }).join('');

    return `
      <div class="field">
        <label for="${name}">${label}</label>
        <select id="${name}" name="${name}">${options}</select>
      </div>
    `;
  }
}
