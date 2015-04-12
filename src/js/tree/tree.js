import THREE from 'three';
import generate from './generate';

import {
  Base,
  TrapezoidalPrism,
  EquilateralTriangularPrism,
  Pyramid
} from './geometry';

const vector = new THREE.Vector3();

export default class Tree {
  constructor() {
    const geometry = new THREE.Geometry();
    geometry.bones = [];

    const base = new Base( 2 );
    const trapezoid = generate();
    base.add( trapezoid );

    base.traverse( object => {
      const offset = geometry.vertices.length;
      const tempGeometry = object.createGeometry( offset );
      geometry.vertices.push( ...tempGeometry.vertices );
      geometry.faces.push( ...tempGeometry.faces );
      object.createBone( geometry );
    });

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      skinning: true,
      shading: THREE.FlatShading
    });

    const mesh = new THREE.SkinnedMesh( geometry, material );

    // Traverse bones and determine start heading angle.
    mesh.skeleton.bones.forEach( bone => {
      bone.startAngle = 0;

      const { parent } = bone;
      if ( !parent ) {
        return;
      }

      const grandparent = parent.parent;
      if ( !grandparent ) {
        return;
      }

      /*
        (x, y)
          o
            \
             \  (x1, y1)
              o
              |
              |
              o (x0, y0)
       */

      const { x, y } = vector.setFromMatrixPosition( bone.matrixWorld );
      const { x: x1, y: y1 } = vector.setFromMatrixPosition( parent.matrixWorld );
      const { x: x0, y: y0 } = vector.setFromMatrixPosition( grandparent.matrixWorld );

      const cross = ( x - x0 ) * ( y1 - y0 ) - ( y - y0 ) * ( x1 - x0 );

      // Left.
      if ( cross < 0 ) { bone.startAngle = -Math.PI / 3; }
      // Right.
      if ( cross > 0 ) { bone.startAngle =  Math.PI / 3; }
    });

    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
  }

  update() {}
}
