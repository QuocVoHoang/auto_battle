import { CHARACTER_IDS } from './config.js';
import { characterConfigs } from './characters/index.js';
import { mapConfigs } from './maps/index.js';
import type { CharacterConfig, GameResult, GameSettings, RuntimeCharacter } from './types.js';

export function getCharacters(): CharacterConfig[] {
  return characterConfigs;
}

export function createStartMenu(container: HTMLElement, characterList: HTMLElement, { onStart }: { onStart: (settings: GameSettings) => void }): void {
  container.innerHTML = `
    <div class="field">
      <label for="arena-shape">Arena map</label>
      <select id="arena-shape" aria-label="Select arena map">
        ${mapConfigs.map((map) => `<option value="${map.id}">${map.name}</option>`).join('')}
      </select>
    </div>

    <div class="field">
      <label for="player-one">Player 1 character</label>
      <select id="player-one" aria-label="Select Player 1 character">
        ${characterOptions(CHARACTER_IDS.cr7)}
      </select>
    </div>

    <div class="field">
      <label for="player-two">Player 2 character</label>
      <select id="player-two" aria-label="Select Player 2 character">
        ${characterOptions(CHARACTER_IDS.firefighter)}
      </select>
    </div>

    <button id="start-button" type="button">Start Game</button>
    <div id="menu-message" class="message" aria-live="polite"></div>
  `;

  characterList.innerHTML = `
    <section class="character-info" aria-label="Character information">
      <h2>Character Legend</h2>
      <div class="character-cards">
        ${characterConfigs.map(characterCard).join('')}
      </div>
    </section>
  `;

  const arenaShape = requiredElement<HTMLSelectElement>(container, '#arena-shape');
  const playerOne = requiredElement<HTMLSelectElement>(container, '#player-one');
  const playerTwo = requiredElement<HTMLSelectElement>(container, '#player-two');
  const startButton = requiredElement<HTMLButtonElement>(container, '#start-button');
  const message = requiredElement<HTMLElement>(container, '#menu-message');

  function updateSelectedCards(): void {
    const cards = characterList.querySelectorAll<HTMLElement>('.character-card');

    for (const card of cards) {
      card.classList.toggle('is-player-one', card.dataset.characterId === playerOne.value);
      card.classList.toggle('is-player-two', card.dataset.characterId === playerTwo.value);
    }
  }

  playerOne.addEventListener('change', updateSelectedCards);
  playerTwo.addEventListener('change', updateSelectedCards);

  startButton.addEventListener('click', () => {
    if (playerOne.value === playerTwo.value) {
      message.textContent = 'Choose two different characters.';
      return;
    }

    message.textContent = '';
    onStart({
      arenaShape: arenaShape.value,
      playerOne: playerOne.value,
      playerTwo: playerTwo.value,
    });
  });

  updateSelectedCards();
}

export function showGameOver(container: HTMLElement, result: GameResult, { onPlayAgain, onReturnToMenu }: { onPlayAgain: () => void; onReturnToMenu: () => void }): void {
  container.innerHTML = `
    <section class="game-over">
      <h2>Game Over</h2>
      <p><strong>Winner:</strong> ${result.winner.name}</p>
      <p><strong>Loser:</strong> ${result.loser.name}</p>
      <p><strong>Remaining health:</strong> ${result.winner.health}/${result.winner.maxHealth}</p>

      <h3>Match Statistics</h3>
      <div class="stat-list">
        ${result.characters.map(characterStats).join('')}
      </div>

      <button id="play-again-button" type="button">Play Again with Same Setup</button>
      <button id="return-menu-button" type="button" class="secondary-button">Return to Character Selection</button>
    </section>
  `;

  requiredElement<HTMLButtonElement>(container, '#play-again-button').addEventListener('click', onPlayAgain);
  requiredElement<HTMLButtonElement>(container, '#return-menu-button').addEventListener('click', onReturnToMenu);
}

export function showPlayingUI(container: HTMLElement, { onPause, onMute, onStop }: { onPause: () => void; onMute: () => void; onStop: () => void }): void {
  const pauseBtn = document.getElementById('pause-button');
  const muteBtn = document.getElementById('mute-button');
  const stopBtn = document.getElementById('stop-button');

  if (pauseBtn) {
    pauseBtn.removeAttribute('hidden');
    pauseBtn.textContent = 'Pause';
    pauseBtn.setAttribute('aria-pressed', 'false');

    pauseBtn.replaceWith(pauseBtn.cloneNode(true));
    document.getElementById('pause-button')?.addEventListener('click', onPause);
  }

  if (muteBtn) {
    muteBtn.removeAttribute('hidden');
    muteBtn.textContent = 'Mute';
    muteBtn.setAttribute('aria-pressed', 'false');

    muteBtn.replaceWith(muteBtn.cloneNode(true));
    document.getElementById('mute-button')?.addEventListener('click', onMute);
  }

  if (stopBtn) {
    stopBtn.removeAttribute('hidden');

    stopBtn.replaceWith(stopBtn.cloneNode(true));
    document.getElementById('stop-button')?.addEventListener('click', onStop);
  }

  container.innerHTML = '';
}

export function hideGameUI(container: HTMLElement): void {
  const pauseBtn = document.getElementById('pause-button') as HTMLButtonElement | null;
  const muteBtn = document.getElementById('mute-button') as HTMLButtonElement | null;
  const stopBtn = document.getElementById('stop-button') as HTMLButtonElement | null;

  if (pauseBtn) pauseBtn.hidden = true;
  if (muteBtn) muteBtn.hidden = true;
  if (stopBtn) stopBtn.hidden = true;
}

export function renderMatchStatus(container: HTMLElement, characters: RuntimeCharacter[] = []): void {
  if (!characters.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = characters.map(matchStatusCard).join('');
}

function characterOptions(selectedId: string): string {
  return characterConfigs
    .map((character) => {
      const selected = character.id === selectedId ? ' selected' : '';
      return `<option value="${character.id}"${selected}>${character.name}</option>`;
    })
    .join('');
}

function characterCard(character: CharacterConfig): string {
  return `
    <article class="character-card" data-character-id="${character.id}">
      <div class="character-avatar" style="--character-color: ${character.color}; --accent-color: ${character.accentColor}">
        ${character.image ? `<img src="${character.image}" alt="">` : ''}
      </div>
      <h3>${character.name}</h3>
      <p>${character.description}</p>
      <dl>
        <div><dt>Max health</dt><dd>${character.maxHealth}</dd></div>
        <div><dt>Speed</dt><dd>${character.speed} px/s</dd></div>
        <div><dt>Size</dt><dd>${character.radius}px radius</dd></div>
        <div><dt>Normal attack</dt><dd>${character.normalAttack.name} (${character.normalAttack.damage})</dd></div>
        <div><dt>Cooldown</dt><dd>${character.normalAttack.cooldown}ms</dd></div>
        <div><dt>Ultimate</dt><dd>${character.ultimateAttack.name} (${character.ultimateAttack.damage})</dd></div>
        <div><dt>Ultimate effect</dt><dd>${character.ultimateAttack.projectile?.knockback ? `${character.ultimateAttack.projectile.knockback} knockback` : 'Fast projectile'}</dd></div>
      </dl>
    </article>
  `;
}

function matchStatusCard(character: RuntimeCharacter): string {
  const healthRatio = character.health / character.maxHealth;
  const manaRatio = character.rage / 100;

  return `
    <article class="match-status-card">
      <h3>${character.name}</h3>
      <div class="match-meter">
        <span>HP</span>
        <strong>${character.health}/${character.maxHealth}</strong>
        <div class="match-meter-track"><div class="match-meter-fill health" style="width: ${Math.max(0, healthRatio) * 100}%"></div></div>
      </div>
      <div class="match-meter">
        <span>Mana</span>
        <strong>${character.rage}/100</strong>
        <div class="match-meter-track"><div class="match-meter-fill mana" style="width: ${manaRatio * 100}%; --mana-color: ${character.accentColor}"></div></div>
      </div>
    </article>
  `;
}

function characterStats(character: RuntimeCharacter): string {
  return `
    <article class="stat-card">
      <h4>${character.name}</h4>
      <dl>
        <div><dt>Normal attacks landed</dt><dd>${character.stats.normalAttacksLanded}</dd></div>
        <div><dt>Ultimate attacks used</dt><dd>${character.stats.ultimateAttacksUsed}</dd></div>
        <div><dt>Total damage dealt</dt><dd>${character.stats.totalDamageDealt}</dd></div>
      </dl>
    </article>
  `;
}

function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element;
}
