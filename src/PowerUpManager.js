import * as THREE from 'three';
import { rand, choice } from './Utils.js';

export class PowerUpManager {
  constructor(scene){
    this.scene = scene;
    this.pool = [];
    this.active = [];
    this.spawnZ = -35;
  }

  make(type){
    const geo = new THREE.IcosahedronGeometry(0.35, 1);
    const color = type==='shield' ? 0x00ff88 : type==='magnet' ? 0xff44ff : 0x66aaff;
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color, emissive: color, emissiveIntensity:0.2, metalness:0.2, roughness:0.4}));
    mesh.userData.type = type;
    mesh.visible = false;
    this.scene.add(mesh);
    return mesh;
  }

  spawn(){
    const type = choice(['shield','magnet','slow','coin','coin','coin']);
    const m = this.pool.pop() || this.make(type);
    m.userData.type = type;
    m.position.set([-2,0,2][(Math.random()*3)|0], 0.5, this.spawnZ + Math.random()*10);
    m.visible = true;
    this.active.push(m);
  }

  update(dt, speed, t){
    if(Math.random() < (0.015 + speed*0.001)) this.spawn();
    for(let i=this.active.length-1; i>=0; i--){
      const m = this.active[i];
      m.position.z += speed * dt;
      m.rotation.x += dt*2;
      m.rotation.y += dt*3;
      if(m.position.z > 5){
        m.visible = false;
        this.pool.push(m);
        this.active.splice(i,1);
      }
    }
  }

  collect(player, magnet){
    const p = player.group.position;
    let got = null;
    for(let i=this.active.length-1; i>=0; i--){
      const m = this.active[i];
      const dz = Math.abs(m.position.z - p.z);
      const dx = Math.abs(m.position.x - p.x);
      const radius = magnet ? 2.2 : 0.8;
      if(dx < radius && dz < radius){
        got = m.userData.type;
        m.visible = false;
        this.pool.push(m);
        this.active.splice(i,1);
        break;
      }
    }
    return got;
  }
}
