import * as THREE from 'three';
import { rand, choice } from './Utils.js';

export class ObstacleManager {
  constructor(scene, shadows){
    this.scene = scene;
    this.pool = [];
    this.active = [];
    this.shadows = shadows;
    this.spawnZ = -30;
  }

  makeObstacle(){
    const type = choice(['box','gate','pillar']);
    let mesh;
    if(type === 'box'){
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.MeshStandardMaterial({color:0xff3b3b, metalness:0.1, roughness:0.8})
      );
    } else if(type === 'gate'){
      const g = new THREE.Group();
      const left = new THREE.Mesh(new THREE.BoxGeometry(0.5,2,0.5), new THREE.MeshStandardMaterial({color:0xffaa00}));
      const right = left.clone();
      left.position.x = -0.8; right.position.x = 0.8;
      left.position.y = right.position.y = 1;
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6,0.4,0.5), new THREE.MeshStandardMaterial({color:0xffaa00}));
      top.position.y = 2;
      g.add(left,right,top);
      mesh = g;
    } else {
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,2,12), new THREE.MeshStandardMaterial({color:0x9a66ff}));
    }
    mesh.castShadow = this.shadows;
    mesh.visible = false;
    this.scene.add(mesh);
    return mesh;
  }

  spawn(){
    const lane = [-2, 0, 2][(Math.random()*3)|0];
    const o = this.pool.pop() || this.makeObstacle();
    o.position.set(lane, 0.6, this.spawnZ);
    o.visible = true;
    this.active.push(o);
  }

  update(dt, speed){
    // spawn chance increases with speed
    if(Math.random() < (0.02 + speed*0.0015)) this.spawn();

    for(let i=this.active.length-1; i>=0; i--){
      const o = this.active[i];
      o.position.z += speed * dt;
      if(o.position.z > 5){
        o.visible = false;
        this.pool.push(o);
        this.active.splice(i,1);
      }
    }
  }

  intersects(player){
    const p = player.group.position;
    for(const o of this.active){
      if(Math.abs(o.position.z - p.z) < 0.8 && Math.abs(o.position.x - p.x) < 0.8 && player.y < 1.0){
        return o;
      }
    }
    return null;
  }
}
