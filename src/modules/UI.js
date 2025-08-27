import { EventBus } from './Utils.js';

export class UI extends EventBus {
  constructor(){
    super();
    this.overlay = document.getElementById('overlay');
    this.panels = {
      panelMain: document.getElementById('panelMain'),
      panelSettings: document.getElementById('panelSettings'),
      panelHelp: document.getElementById('panelHelp'),
      panelGameOver: document.getElementById('panelGameOver'),
    };
    this.scoreEl = document.getElementById('score');
    this.coinsEl = document.getElementById('coins');
    this.multEl = document.getElementById('mult');
    this.puEls = {
      shield: document.getElementById('puShield'),
      magnet: document.getElementById('puMagnet'),
      slow: document.getElementById('puSlow'),
    };

    // Buttons
    document.getElementById('btnStart').addEventListener('click', () => this.emit('start'));
    document.getElementById('btnPause').addEventListener('click', () => this.emit('pause'));
    document.getElementById('btnSettings').addEventListener('click', () => this.emit('settings'));
    document.getElementById('btnHelp').addEventListener('click', () => this.show('panelHelp'));
    document.getElementById('btnBackFromSettings').addEventListener('click', () => this.show('panelMain'));
    document.getElementById('btnBackFromHelp').addEventListener('click', () => this.show('panelMain'));
    document.getElementById('btnRestart').addEventListener('click', () => this.emit('restart'));

    // Settings
    this.chkGfx = document.getElementById('chkGfx');
    this.chkShadows = document.getElementById('chkShadows');
    this.chkAudio = document.getElementById('chkAudio');
    this.rngSens = document.getElementById('rngSens');

    this.best = Number(localStorage.getItem('bestScore') || 0);
    this.updateScore(0);
    this.updateCoins(0);
    this.setMultiplier(1);
    this.show('panelMain');
    // ensure UI is visible after mobile resizes
    window.addEventListener('resize', ()=> { this.overlay.style.display = ''; });
  }

  show(name){
    this.overlay.classList.remove('hidden');
    for(const k in this.panels){
      this.panels[k].classList.toggle('hidden', k !== name);
    }
  }
  hideOverlay(){ this.overlay.classList.add('hidden'); }

  updateScore(n){ this.scoreEl.textContent = `Score: ${n|0}`; }
  updateCoins(n){ this.coinsEl.textContent = `Coins: ${n|0}`; }
  setMultiplier(m){ this.multEl.textContent = `x${m}`; }

  setPowerUpActive(name, active){
    const map = { shield: 'puShield', magnet: 'puMagnet', slow: 'puSlow' };
    const el = document.getElementById(map[name]);
    if(!el) return;
    el.classList.toggle('active', !!active);
  }

  gameOver(finalScore){
    this.show('panelGameOver');
    document.getElementById('finalScore').textContent = `Your score: ${finalScore|0}`;
    if(finalScore > this.best){ this.best = finalScore; localStorage.setItem('bestScore', String(finalScore)); }
    document.getElementById('bestScore').textContent = `Best: ${this.best|0}`;
  }
}
