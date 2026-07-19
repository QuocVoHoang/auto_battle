import { ARENA_SHAPES, CHARACTER_IDS } from './config.js';
import { characterConfigs } from './characters/index.js';

export function getCharacters() {
  return characterConfigs;
}

export function createStartMenu(container, characterList, { onStart }) {
  container.innerHTML = `
    <div class="field">
      <label for="arena-shape">Arena shape</label>
      <select id="arena-shape" aria-label="Select arena shape">
        ${Object.entries(ARENA_SHAPES)
          .map(([value, label]) => `<option value="${value}">${label}</option>`)
          .join('')}
      </select>
    </div>

    <div class="field">
      <label for="player-one">Player 1 character</label>
      <select id="player-one" aria-label="Select Player 1 character">
        ${characterOptions(CHARACTER_IDS.police)}
      </select>
    </div>

    <div class="field">
      <label for="player-two">Player 2 character</label>
      <select id="player-two" aria-label="Select Player 2 character">
        ${characterOptions(CHARACTER_IDS.thief)}
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

  const arenaShape = container.querySelector('#arena-shape');
  const playerOne = container.querySelector('#player-one');
  const playerTwo = container.querySelector('#player-two');
  const startButton = container.querySelector('#start-button');
  const message = container.querySelector('#menu-message');

  function updateSelectedCards() {
    const cards = characterList.querySelectorAll('.character-card');

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

export function showGameOver(container, result, { onPlayAgain, onReturnToMenu }) {
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

  container.querySelector('#play-again-button').addEventListener('click', onPlayAgain);
  container.querySelector('#return-menu-button').addEventListener('click', onReturnToMenu);
}

export function showPlayingUI(container, { onPause, onMute, onStop }) {
  const pauseBtn = document.getElementById('pause-button');
  const muteBtn = document.getElementById('mute-button');
  const stopBtn = document.getElementById('stop-button');

  if (pauseBtn) {
    pauseBtn.removeAttribute('hidden');
    pauseBtn.textContent = 'Pause';
    pauseBtn.setAttribute('aria-pressed', 'false');

    pauseBtn.replaceWith(pauseBtn.cloneNode(true));
    const newPause = document.getElementById('pause-button');
    newPause.addEventListener('click', onPause);
  }

  if (muteBtn) {
    muteBtn.removeAttribute('hidden');
    muteBtn.textContent = 'Mute';
    muteBtn.setAttribute('aria-pressed', 'false');

    muteBtn.replaceWith(muteBtn.cloneNode(true));
    const newMute = document.getElementById('mute-button');
    newMute.addEventListener('click', onMute);
  }

  if (stopBtn) {
    stopBtn.removeAttribute('hidden');

    stopBtn.replaceWith(stopBtn.cloneNode(true));
    const newStop = document.getElementById('stop-button');
    newStop.addEventListener('click', onStop);
  }

  container.innerHTML = '';
}

export function hideGameUI(container) {
  const pauseBtn = document.getElementById('pause-button');
  const muteBtn = document.getElementById('mute-button');
  const stopBtn = document.getElementById('stop-button');

  if (pauseBtn) {
    pauseBtn.hidden = true;
  }

  if (muteBtn) {
    muteBtn.hidden = true;
  }

  if (stopBtn) {
    stopBtn.hidden = true;
  }
}

export function renderMatchStatus(container, characters = []) {
  if (!characters.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = characters.map(matchStatusCard).join('');
}

function characterOptions(selectedId) {
  return characterConfigs
    .map((character) => {
      const selected = character.id === selectedId ? ' selected' : '';
      return `<option value="${character.id}"${selected}>${character.name}</option>`;
    })
    .join('');
}

function characterCard(character) {
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
        <div><dt>Normal attack</dt><dd>${character.normalAttack} (${character.normalDamage})</dd></div>
        <div><dt>Cooldown</dt><dd>${character.attackCooldown}ms</dd></div>
        <div><dt>Special</dt><dd>${character.specialSkill} (${character.specialDamage})</dd></div>
        <div><dt>Special effect</dt><dd>${character.special.knockback ? `${character.special.knockback} knockback` : 'Fast projectile'}</dd></div>
      </dl>
    </article>
  `;
}

function matchStatusCard(character) {
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

function characterStats(character) {
  return `
    <article class="stat-card">
      <h4>${character.name}</h4>
      <dl>
        <div><dt>Normal attacks landed</dt><dd>${character.stats.normalAttacksLanded}</dd></div>
        <div><dt>Special skills used</dt><dd>${character.stats.specialSkillsUsed}</dd></div>
        <div><dt>Total damage dealt</dt><dd>${character.stats.totalDamageDealt}</dd></div>
      </dl>
    </article>
  `;
}
