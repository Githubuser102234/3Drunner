import * as THREE from 'three';
import { Input } from './Input.js';
import { World } from './World.js';
import { Player } from './Player.js';
import { ObstacleManager } from './ObstacleManager.js';
import { PowerUpManager } from './PowerUpManager.js';
import { clamp } from './Utils.js';
import { AudioManager } from './AudioManager.js';

export class Game {
  constructor(canvas, ui){
    this.canvas = canvas;
    this.ui = ui;
    this.input = new Input();
    this.audio = new AudioManager();

    this.score = 0;
    this.coins = 0;
    this.mult = 1;

    this.clock = new THREE.Clock();
    this.running = false;
    this.paused = false;
    this.timeScale = 1;
    this._bind();

    this._initThree();
    this._build();
    this._loop();
  }

  _bind(){
    window.addEventListener('resize', ()=> this._resize());
    window.addEventListener('keydown', (e)=>{
      if(e.key.toLowerCase()==='p') this.togglePause();
      if(e.key===' ') this.input.jump();
    });
    this.ui.on('start', ()=>{
      this.ui.hideOverlay();
      this.reset();
      this.running = true;
      this.audio.ensure();
    });
    this.ui.chkAudio.addEventListener('change', ()=>{
      this.audio.toggle(this.ui.chkAudio.checked);
    });
    this.ui.chkGfx.addEventListener('change', ()=> this._applyGfx());
    this.ui.chkShadows.addEventListener('change', ()=> this._applyGfx());
    this.ui.rngSens.addEventListener('input', ()=> this.input.sensitivity = parseFloat(this.ui.rngSens.value));
  }

  _initThree(){
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 300);
    this.camera.position.set(0, 2.5, 4.5);
    this.camera.lookAt(0,1,0);
  }

  _build(){
    this.world = new World(this.scene, this.ui.chkGfx.checked, this.ui.chkShadows.checked);
    this.player = new Player(this.scene, this.ui.chkShadows.checked);
    this.obstacles = new ObstacleManager(this.scene, this.ui.chkShadows.checked);
    this.powerups = new PowerUpManager(this.scene);
    this.reset();
  }

  _applyGfx(){
    this.renderer.shadowMap.enabled = this.ui.chkShadows.checked;
  }

  start(){ this.running = true; this.ui.hideOverlay(); }
  togglePause(){
    if(!this.running) return;
    this.paused = !this.paused;
    if(this.paused) this.ui.show('panelMain'); else this.ui.hideOverlay();
  }

  reset(){
    this.score = 0; this.coins = 0; this.mult = 1;
    this.speed = 15;
    this.timeScale = 1;
    this.player.group.position.set(0,0.5,0);
    this.player.y = 0; this.player.vy = 0; this.player.setLane(0);
    this.player.hasShield = false; this.player.magnet = false;
    // clear obstacles/powerups
    for(const arr of [this.obstacles.active, this.powerups.active]){
      for(const m of arr){ m.visible = false; }
      arr.length = 0;
    }
    this.ui.updateScore(this.score);
    this.ui.updateCoins(this.coins);
    this.ui.setMultiplier(this.mult);
    this.ui.setPowerUpActive('shield', false);
    this.ui.setPowerUpActive('magnet', false);
    this.ui.setPowerUpActive('slow', false);
  }

  _loop(){
    requestAnimationFrame(()=> this._loop());
    const dt = Math.min(0.033, this.clock.getDelta()) * (this.paused ? 0 : this.timeScale);
    const t = this.clock.elapsedTime;

    this.world.update(dt, t);
    this.player.update(dt, this.input);

    if(this.running && !this.paused){
      // speed up over time
      this.speed = Math.min(42, this.speed + dt*0.7);
      this.score += dt * (10 + this.speed) * this.mult;
      this.ui.updateScore(this.score);

      this.obstacles.update(dt, this.speed);
      this.powerups.update(dt, this.speed, t);

      // magnet pulls nearby coins/powerups
      if(this.player.magnet){
        for(const m of this.powerups.active){
          if(m.userData.type==='coin'){
            const to = new THREE.Vector3().copy(this.player.group.position).sub(m.position).multiplyScalar(0.06);
            m.position.add(to);
          }
        }
      }

      // collect
      const got = this.powerups.collect(this.player, this.player.magnet);
      if(got){
        if(got==='coin'){
          this.coins += 1; this.score += 5*this.mult; this.ui.updateCoins(this.coins); this.audio.coin();
        }else if(got==='shield'){
          this.player.hasShield = true; this.ui.setPowerUpActive('shield', true); this.audio.power();
          clearTimeout(this._shieldT); this._shieldT = setTimeout(()=>{ this.player.hasShield=false; this.ui.setPowerUpActive('shield', false); }, 5000);
        }else if(got==='magnet'){
          this.player.magnet = true; this.ui.setPowerUpActive('magnet', true); this.audio.power();
          clearTimeout(this._magT); this._magT = setTimeout(()=>{ this.player.magnet=false; this.ui.setPowerUpActive('magnet', false); }, 5000);
        }else if(got==='slow'){
          this.timeScale = 0.5; this.ui.setPowerUpActive('slow', true); this.audio.power();
          clearTimeout(this._slowT); this._slowT = setTimeout(()=>{ this.timeScale=1; this.ui.setPowerUpActive('slow', false); }, 4000);
        }
      }

      // collision
      const hit = this.obstacles.intersects(this.player);
      if(hit){
        if(this.player.hasShield){
          // pop shield and destroy obstacle
          this.player.hasShield = false; this.ui.setPowerUpActive('shield', false);
          hit.visible = false;
          this.audio.hit();
        } else {
          this.audio.hit();
          this.running = false;
          this.paused = true;
          this.ui.gameOver(this.score);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
