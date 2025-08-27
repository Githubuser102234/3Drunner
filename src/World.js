import * as THREE from 'three';
import { rand, lerp } from './Utils.js';

export class World {
  constructor(scene, gfxHigh, shadows){
    this.scene = scene;
    this.gfxHigh = gfxHigh;
    this.shadows = shadows;
    this.group = new THREE.Group();
    scene.add(this.group);

    this.floorZ = 0;
    this.laneOffset = 2;
    this.roadWidth = this.laneOffset * 2;

    this.buildLights();
    this.buildSky();
    this.buildGround();
  }

  buildLights(){
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(amb);
    this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sun.position.set(-5,8,6);
    this.sun.castShadow = this.shadows;
    this.sun.shadow.mapSize.set(1024,1024);
    this.scene.add(this.sun);
  }

  buildSky(){
    const geo = new THREE.SphereGeometry(200, 32, 16);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        top: { value: new THREE.Color(0x001020)},
        bottom: { value: new THREE.Color(0x200040)},
        mixV: { value: 0.5},
        time: { value: 0 }
      },
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 bottom; uniform float mixV; uniform float time;
        varying vec3 vPos;
        void main(){
          float h = normalize(vPos).y*0.5+0.5;
          vec3 col = mix(bottom, top, smoothstep(0.0,1.0,h));
          // subtle twinkle
          float star = step(0.999, fract(sin(dot(vPos.xy, vec2(12.9898,78.233))) * 43758.5453123+time*0.05));
          col += vec3(star)*0.2;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.scene.add(this.sky);
  }

  buildGround(){
    const geo = new THREE.PlaneGeometry(20, 200, 1, 1);
    const mat = new THREE.MeshStandardMaterial({color:0x202020, metalness:0.1, roughness:0.9});
    this.ground = new THREE.Mesh(geo, mat);
    this.ground.rotation.x = -Math.PI/2;
    this.ground.position.z = -100;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Lane markers
    const markerGeo = new THREE.BoxGeometry(0.2, 0.05, 2);
    this.markers = new THREE.Group();
    for(let i=0;i<80;i++){
      const m = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({color:0xffffff}));
      m.position.set(0, 0.01, -i*2.5);
      this.markers.add(m);
    }
    this.scene.add(this.markers);
  }

  update(dt, t){
    // move markers to simulate motion
    const speed = 15;
    for(const m of this.markers.children){
      m.position.z += speed*dt;
      if(m.position.z > 5) m.position.z -= 200;
    }
    this.sky.material.uniforms.time.value = t;
    // day/night cycle on sun light
    const cyc = (Math.sin(t*0.05)*0.5+0.5);
    this.sun.intensity = 0.4 + cyc*0.8;
    this.sun.color.setHSL(0.1+0.1*cyc, 0.6, 0.5+0.2*cyc);
  }
}
