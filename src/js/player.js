import THREE from 'three';

export default class Player {
  constructor( game ) {
    const { canvas } = game;

    this.position = new THREE.Vector3(
      canvas.width  / 2,
      canvas.height / 2
    );

    this.velocity = new THREE.Vector3();
    this.speed = 6;

    this.radius = 40;
    this.hue = 0;
  }

  reset( game ) {
    const { canvas } = game;

    this.position.x = canvas.width / 2;
    this.position.y = canvas.width / 2;
    this.velocity.set( 0, 0, 0 );

    this.radius = 40;
    this.speed = 6;
  }
}
