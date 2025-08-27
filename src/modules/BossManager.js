import * as THREE from 'three';
export class BossManager {
  constructor(scene, obstacles){
    this.scene = scene;
    this.obstacles = obstacles;
    this.nextAt = 1000; // score threshold
  }
  trySpawn(score){
    if(score >= this.nextAt){
      this.spawnWave();
      this.nextAt += 1000 + Math.floor(Math.random()*600);
    }
  }
  spawnWave(){
    // create denser obstacle wave across lanes that the player must dodge
    for(let i=0;i<8;i++){
      const lane = [-2,0,2][i%3];
      this.obstacles.spawnAt(lane, -50 - i*3);
    }
  }
}
