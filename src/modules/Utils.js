export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (min, max) => Math.random() * (max - min) + min;
export const choice = arr => arr[(Math.random() * arr.length) | 0];

export class EventBus {
  constructor(){ this.map = new Map(); }
  on(name, fn){ if(!this.map.has(name)) this.map.set(name, new Set()); this.map.get(name).add(fn); }
  emit(name, payload){ const s = this.map.get(name); if(!s) return; for(const fn of s) fn(payload); }
}
