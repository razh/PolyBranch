import THREE from 'three';

export default class Tree {
  constructor() {
    this.geometry = new THREE.Geometry();
    this.mesh = new THREE.Mesh( this.geometry );
  }

  update() {}

  /*
    +----+
    |    |
    +----+
    |    |
    +----+
   */
  bifurcate() {}

  /*
    +----+----+
    |    |    |
    +----+----+
    |    |    |
    +----+----+
   */
  quadfurcate() {}
}
