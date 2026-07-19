import { Game } from './game.js';
import { createStartMenu, showGameOver, showPlayingUI, hideGameUI } from './ui.js';

const canvas = document.querySelector('#game-canvas');
const menu = document.querySelector('#start-menu');

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
});

function renderMenu() {
  hideGameUI(menu);
  createStartMenu(menu, {
    onStart: (settings) => {
      lastSettings = settings;
      game.start(settings);

      showPlayingUI(menu, {
        onPause: () => game.togglePause(),
        onMute: () => game.toggleMute(),
      });
    },
  });
}

window.addEventListener('resize', () => game.render());

renderMenu();
game.render();
