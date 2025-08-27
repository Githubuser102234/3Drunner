import { Game } from './modules/Game.js';
import { UI } from './modules/UI.js';

const canvas = document.getElementById('c');
const ui = new UI();
const game = new Game(canvas, ui);

ui.on('start', () => game.start());
ui.on('pause', () => game.togglePause());
ui.on('settings', () => ui.show('panelSettings'));
ui.on('help', () => ui.show('panelHelp'));
ui.on('backToMain', () => ui.show('panelMain'));
ui.on('restart', () => { game.reset(); game.start(); });

// Start on load with overlay visible
