import { Game } from './game.js';
import { createStartMenu, hideGameUI, renderMatchStatus, showGameOver, showPlayingUI } from './ui.js';
import type { GameSettings } from './types.js';

const canvas = requiredElement<HTMLCanvasElement>(document, '#game-canvas');
const menu = requiredElement<HTMLElement>(document, '#start-menu');
const characterList = requiredElement<HTMLElement>(document, '#character-list');
const matchStatus = requiredElement<HTMLElement>(document, '#match-status');

let lastSettings: GameSettings | null = null;

const game = new Game(canvas, {
  onGameOver: (result) => {
    hideGameUI(menu);
    showGameOver(menu, result, {
      onPlayAgain: () => {
        if (!lastSettings) return;

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

function renderMenu(): void {
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

function stopGame(): void {
  game.returnToMenu();
  renderMenu();
}

function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element;
}

window.addEventListener('resize', () => game.render());

renderMenu();
game.render();
