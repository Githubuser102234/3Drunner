export class AudioManager {
  constructor(){
    this.enabled = true;
    this.ctx = null;
  }
  ensure(){
    if(!this.enabled) return;
    if(this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  toggle(on){ this.enabled = on; if(!on && this.ctx){ try{ this.ctx.close(); }catch{} this.ctx=null; } }
  tone(freq=440, dur=0.1, type='sine', gain=0.05){
    if(!this.enabled) return;
    this.ensure();
    const ctx = this.ctx; if(!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }
  coin(){ this.tone(880, 0.08, 'triangle', 0.04); }
  hit(){ this.tone(120, 0.15, 'sawtooth', 0.06); }
  power(){ this.tone(660, 0.2, 'square', 0.05); }
  jump(){ this.tone(500, 0.12, 'triangle', 0.04); }
}
