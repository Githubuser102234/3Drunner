import * as THREE from 'three';
import { clamp, lerp } from './Utils.js';

export class Player {
  constructor(scene, shadows){
    this.group = new THREE.Group();
    scene.add(this.group);
    this.speedZ = 15;
    this.lane = 0; // -1,0,1
    this.targetX = 0;
    this.y = 0;
    this.vy = 0;
    this.onGround = true;
    this.hasShield = false;
    this.magnet = false;

    // Body (simple shape)
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 0.8, 8, 16),
      new THREE.MeshStandardMaterial({color:0x2ad1ff, metalness:0.2, roughness:0.6, emissive:0x002022, emissiveIntensity:0.02})
    );
    body.castShadow = shadows;
    this.body = body;
    this.group.add(body);

    // Glow ring to show magnet/shield
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.05, 8, 24),
      new THREE.MeshBasicMaterial({color:0x00ffff})
    );
    ring.rotation.x = Math.PI/2;
    ring.position.y = 0.1;
    this.ring = ring;
    this.group.add(ring);
  }

  setLane(l){
    this.lane = clamp(l, -1, 1);
    this.targetX = this.lane * 2;
  }

  update(dt, input){
    // lateral
    if(input.dir !== 0) this.setLane(this.lane + Math.sign(input.dir));
    this.group.position.x = lerp(this.group.position.x, this.targetX, 0.18);

    // jump
    if(input.jumpPressed && this.onGround){
      this.vy = 6.5;
      this.onGround = false;
    }
    this.vy -= 12 * dt;
    this.y += this.vy * dt;
    if(this.y <= 0){ this.y = 0; this.vy = 0; this.onGround = true; }
    this.group.position.y = this.y + 0.5;

    // ring visibility
    this.ring.visible = this.hasShield || this.magnet;
    this.ring.material.color.set(this.hasShield ? 0x00ff66 : (this.magnet ? 0xff00ff : 0x00ffff));
  }
}
