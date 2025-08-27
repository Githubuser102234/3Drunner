import { clamp } from './Utils.js';

export class Input {
  constructor(){
    this.dir = 0; // -1, 0, 1
    this.jumpPressed = false;
    this.sensitivity = 1;
    this.keyState = new Set();
    window.addEventListener('keydown', (e)=>this.onKey(e,true));
    window.addEventListener('keyup', (e)=>this.onKey(e,false));
    // Touch swipe
    let sx=0, sy=0, active=false;
    window.addEventListener('touchstart', (e)=>{ active=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; }, {passive:true});
    window.addEventListener('touchmove', (e)=>{
      if(!active) return;
      const dx = e.touches[0].clientX - sx;
      if(Math.abs(dx) > 30) this.dir = clamp(dx/100 * this.sensitivity, -1, 1);
    }, {passive:true});
    window.addEventListener('touchend', ()=>{ active=false; this.dir=0; });
  }
  onKey(e, down){
    const k = e.key.toLowerCase();
    if(down) this.keyState.add(k); else this.keyState.delete(k);
    if(k==='arrowleft' || k==='a') this.dir = down ? -1 : 0;
    if(k==='arrowright' || k==='d') this.dir = down ? 1 : 0;
    if(k===' ') this.jumpPressed = down;
  }
  nudge(sign){ this.dir = sign; setTimeout(()=> this.dir = 0, 120); }
  jump(){ this.jumpPressed = true; setTimeout(()=> this.jumpPressed = false, 60); }
}
