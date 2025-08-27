import * as THREE from 'three';
export class TrailManager {
  constructor(scene){
    this.scene = scene;
    this.pool = [];
    this.active = [];
  }
  spawn(pos, color=0x00ffff){
    const geo = new THREE.PlaneGeometry(0.8,0.2);
    const mat = new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.35, depthWrite:false, blending:THREE.AdditiveBlending});
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI/2;
    m.position.copy(pos);
    m.position.y = 0.1;
    this.scene.add(m);
    this.active.push({mesh:m,life:0.6});
  }
  update(dt){
    for(let i=this.active.length-1;i>=0;i--){
      const o=this.active[i];
      o.life-=dt;
      o.mesh.material.opacity = Math.max(0, o.life/0.6 * 0.35);
      o.mesh.position.z += 8*dt; // drift back
      if(o.life<=0){
        this.scene.remove(o.mesh);
        this.active.splice(i,1);
      }
    }
  }
}
