import { Game } from './game.js';
import { createStartMenu, showGameOver, showPlayingUI, hideGameUI, renderMatchStatus } from './ui.js';

const canvas = document.querySelector('#game-canvas');
const menu = document.querySelector('#start-menu');
const characterList = document.querySelector('#character-list');
const matchStatus = document.querySelector('#match-status');

let lastSettings = null;

const game = new Game(canvas, {
  onGameOver: (result) => {
    hideGameUI(menu);
    showGameOver(menu, result, {
      onPlayAgain: () => {
        game.start(lastSettings);
        showPlayingUI(menu, {
          onPause: () => game.togglePause(),
          onMute: () => game.toggleMute(),
          onStop: stopGame,
        });
      },
      onReturnToMenu: () => {
        game.returnToMenu();
        renderMenu();
      },
    });
  },
  onPauseToggle: (isPaused) => {
    const pauseBtn = document.getElementById('pause-button');

    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
      pauseBtn.setAttribute('aria-pressed', String(isPaused));
    }
  },
  onMuteToggle: (isMuted) => {
    const muteBtn = document.getElementById('mute-button');

    if (muteBtn) {
      muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
      muteBtn.setAttribute('aria-pressed', String(isMuted));
    }
  },
  onStatusChange: (characters) => renderMatchStatus(matchStatus, characters),
});

function renderMenu() {
  hideGameUI(menu);
  renderMatchStatus(matchStatus);
  createStartMenu(menu, characterList, {
    onStart: (settings) => {
      lastSettings = settings;
      game.start(settings);

      showPlayingUI(menu, {
        onPause: () => game.togglePause(),
        onMute: () => game.toggleMute(),
        onStop: stopGame,
      });
    },
  });
}

function stopGame() {
  game.returnToMenu();
  renderMenu();
}

window.addEventListener('resize', () => game.render());

renderMenu();
game.render();
