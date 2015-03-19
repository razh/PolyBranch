import THREE from 'three';

export default class Player {
  constructor( game ) {
    const { canvas } = game;

    this.pos = new THREE.Vector3(
      canvas.width  / 2,
      canvas.height / 2
    );

    this.r = 20;
    this.hue = 0;

    this.speed = 6;
    this.vx = 0;
    this.vy = 0;
  }

  reset( game ) {
    const { canvas } = game;

    this.pos.x = canvas.width / 2;
    this.pos.y = canvas.width / 2;
    this.r = 20;

    this.speed = 6;
    this.vx = 0;
    this.vy = 0;
  }
}
