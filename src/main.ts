import './style.css';
import { Game } from './engine/Game';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

new Game(app);
