import times from 'lodash/utility/times';
import THREE from 'three';

const matrix = new THREE.Matrix4();
const vector = new THREE.Vector3();

/*
  A tree is composed of trapezoids, with branches terminating with triangles.

  If a trapezoid branches, then a triangular prism joint is added to the distal
  end so that branches can be attached.

  To simplify calculations, geometries are generated so that they lie on the
  x/z plane before being joined together.

  Positive z-axis points outwards.
 */
export class TrapezoidalPrism extends THREE.Object3D {
  constructor( bottomWidth = 1, topWidth = 1, height = 1, depth = 1 ) {
    super();

    this.bottomWidth = bottomWidth;
    this.topWidth    = topWidth;
    this.height      = height;
    this.depth       = depth;

    this.index = 0;

    this.position.set( 0, height, 0 );
    this.updateMatrixWorld();
  }

  createGeometry() {
    const geometry = new THREE.Geometry();

    const {
      bottomWidth,
      topWidth,
      height,
      depth
    } = this;

    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth    = topWidth    / 2;

    const halfDepth = depth / 2;

    geometry.vertices = [
      // Bottom counter-clockwise from front-left.
      new THREE.Vector3( -halfBottomWidth, 0,       halfDepth ),
      new THREE.Vector3(  halfBottomWidth, 0,       halfDepth ),
      new THREE.Vector3(  halfBottomWidth, 0,      -halfDepth ),
      new THREE.Vector3( -halfBottomWidth, 0,      -halfDepth ),
      // Top counter-clockwise from front-left.
      new THREE.Vector3( -halfTopWidth,    height,  halfDepth ),
      new THREE.Vector3(  halfTopWidth,    height,  halfDepth ),
      new THREE.Vector3(  halfTopWidth,    height, -halfDepth ),
      new THREE.Vector3( -halfTopWidth,    height, -halfDepth )
    ];

    geometry.faces = [
      // Front.
      new THREE.Face3( 0, 1, 5 ),
      new THREE.Face3( 0, 5, 4 ),
      // Left.
      new THREE.Face3( 0, 4, 3 ),
      new THREE.Face3( 4, 7, 3 ),
      // Back.
      new THREE.Face3( 2, 3, 7 ),
      new THREE.Face3( 2, 7, 6 ),
      // Right.
      new THREE.Face3( 1, 2, 6 ),
      new THREE.Face3( 1, 6, 5 )
    ];

    return geometry;
  }

  createBone( geometry ) {
    const parent = ( this.parent && this.parent.index ) || 0;

    vector.set( 0, this.height, 0 );
    if ( this.parent ) {
      vector.applyMatrix4( matrix.extractRotation( this.parent.matrixWorld ) );
    }

    const index = geometry.bones.push({
      parent,
      name: 'trapezoidal',
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    this.index = index;

    times( 8, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }
}


export class EquilateralTriangularPrism extends THREE.Object3D {
  constructor( width = 1, depth = 1, direction ) {
    super();

    this.width = width;
    this.depth = depth;
    this.direction = direction;

    this.halfWidth = width / 2;
    this.halfDepth = depth / 2;

    this.height = Math.sqrt( 3 ) * this.halfWidth;
    this.halfHeight = this.height / 2;

    this.x = 0;
    if ( direction === 'left'  ) { this.x = -this.halfWidth / 2; }
    if ( direction === 'right' ) { this.x =  this.halfWidth / 2; }

    this.angle = 0;
    if ( direction === 'left'  ) { this.angle =  Math.PI / 3; }
    if ( direction === 'right' ) { this.angle = -Math.PI / 3; }

    this.index = 0;

    this.position.set( this.x, this.halfHeight, 0 );
    this.rotation.z = this.angle;
    this.updateMatrixWorld();
  }

  /*
    Equilateral triangular prism:

                  5
               .-o
          4 .-'   \  back
           o       o
    front / \   .-' 2
         o---o-'
        0     1
    Only the front and back triangles are visible.
   */
  createGeometry() {
    const geometry = new THREE.Geometry();

    const {
      height,
      halfWidth,
      halfDepth,
      direction
    } = this;

    geometry.vertices = [
      // Bottom counter-clockwise from bottom-left.
      new THREE.Vector3( -halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0, -halfDepth ),
      new THREE.Vector3( -halfWidth, 0, -halfDepth ),
      // Top, front-to-back.
      new THREE.Vector3( 0, height,  halfDepth ),
      new THREE.Vector3( 0, height, -halfDepth )
    ];

    geometry.faces = [
      // Front.
      new THREE.Face3( 0, 1, 4 ),
      // Back.
      new THREE.Face3( 2, 3, 5 )
    ];

    // Left-only rotation. Show right side.
    if ( direction === 'left' ) {
      geometry.faces.push( new THREE.Face3( 1, 2, 5 ) );
      geometry.faces.push( new THREE.Face3( 1, 5, 4 ) );
    }

    // Right-only rotation. Show left side.
    if ( direction === 'right' ) {
      geometry.faces.push( new THREE.Face3( 0, 4, 3 ) );
      geometry.faces.push( new THREE.Face3( 4, 5, 3 ) );
    }

    return geometry;
  }

  createBone( geometry ) {
    const parent = ( this.parent && this.parent.index ) || 0;

    vector.set( this.x, this.halfHeight, 0 );
    if ( this.parent ) {
      vector.applyMatrix4( matrix.extractRotation( this.parent.matrixWorld ) );
    }

    const index = geometry.bones.push({
      parent,
      name: 'equilateral-triangular',
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    this.index = index;

    times( 6, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }
}


export class Pyramid extends THREE.Object3D {
  constructor( width = 1, height = 1, depth = 1 ) {
    super();

    this.width  = width;
    this.height = height;
    this.depth  = depth;

    this.halfWidth  = width  / 2;
    this.halfHeight = height / 2;
    this.halfDepth  = depth  / 2;

    this.index = 0;
  }

  createGeometry() {
    const geometry = new THREE.Geometry();

    const {
      height,
      halfWidth,
      halfDepth
    } = this;

    /*
       3       2
        o-----o
        |     |  right
        |     |
        o-----o
       0       1
         front
     */
    geometry.vertices = [
      // Top-down counter-clockwise from front-left.
      new THREE.Vector3( -halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0, -halfDepth ),
      new THREE.Vector3( -halfWidth, 0, -halfDepth ),
      // Top.
      new THREE.Vector3( 0, height, 0 )
    ];

    geometry.faces = [
      // Front.
      new THREE.Face3( 0, 1, 4 ),
      // Right.
      new THREE.Face3( 1, 2, 4 ),
      // Back.
      new THREE.Face3( 2, 3, 4 ),
      // Left.
      new THREE.Face3( 3, 0, 4 )
    ];

    return geometry;
  }

  createBone( geometry ) {
    const parent = ( this.parent && this.parent.index ) || 0;

    vector.set( 0, this.height, 0 );
    if ( this.parent ) {
      vector.applyMatrix4( matrix.extractRotation( this.parent.matrixWorld ) );
    }

    const index = geometry.bones.push({
      parent,
      name: 'pyramid',
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    this.index = index;

    times( 5, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }
}


export function transformGeometry( object, geometry ) {
  const {
    parent,
    matrix,
    matrixWorld
  } = object;

  if ( !parent ) {
    matrixWorld.copy( matrix );
  } else {
    matrixWorld.multiplyMatrices( parent.matrixWorld, matrix );
  }

  geometry.applyMatrix( matrixWorld );
  return geometry;
}


export default class Tree {
  constructor() {
    this.geometry = new THREE.Geometry();

    const material = new THREE.MeshBasicMaterial({ wireframe: true });
    this.mesh = new THREE.SkinnedMesh( this.geometry, material );
  }

  createTrapezoidalPrism( bottomWidth, topWidth, height, depth ) {
    const prism = new THREE.Geometry();

    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth    = topWidth    / 2;

    const halfDepth = depth / 2;

    prism.vertices = [
      // Bottom counter-clockwise from front-left.
      new THREE.Vector3( -halfBottomWidth, 0,       halfDepth ),
      new THREE.Vector3(  halfBottomWidth, 0,       halfDepth ),
      new THREE.Vector3(  halfBottomWidth, 0,      -halfDepth ),
      new THREE.Vector3( -halfBottomWidth, 0,      -halfDepth ),
      // Top counter-clockwise from front-left.
      new THREE.Vector3( -halfTopWidth,    height,  halfDepth ),
      new THREE.Vector3(  halfTopWidth,    height,  halfDepth ),
      new THREE.Vector3(  halfTopWidth,    height, -halfDepth ),
      new THREE.Vector3( -halfTopWidth,    height, -halfDepth )
    ];

    prism.faces = [
      // Front.
      new THREE.Face3( 0, 1, 5 ),
      new THREE.Face3( 0, 5, 4 ),
      // Left.
      new THREE.Face3( 0, 4, 3 ),
      new THREE.Face3( 4, 7, 3 ),
      // Back.
      new THREE.Face3( 2, 3, 7 ),
      new THREE.Face3( 2, 7, 6 ),
      // Right.
      new THREE.Face3( 1, 2, 6 ),
      new THREE.Face3( 1, 6, 5 )
    ];

    return prism;
  }

  applyTrapezoidalPrismTransform( geometry, height ) {
    geometry.applyMatrix( matrix.makeTranslation( 0, height, 0 ) );
    return geometry;
  }

  createTrapezoidalPrismBone( geometry, parent = -1, height ) {
    const index = geometry.bones.push({
      parent,
      name: 'trapezoidal',
      pos: [ 0, height, 0 ],
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    times( 4, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    times( 4, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }

  /*
    Equilateral triangular prism:

                  5
               .-o
          4 .-'   \  back
           o       o
    front / \   .-' 2
         o---o-'
        0     1
    Only the front and back triangles are visible.
   */
  createEquilateralTriangularPrism( length, depth, rotation ) {
    const prism = new THREE.Geometry();

    const halfLength = length / 2;
    const halfDepth  = depth  / 2;

    const height = Math.sqrt( 3 ) * halfLength;

    prism.vertices = [
      // Bottom counter-clockwise from bottom-left.
      new THREE.Vector3( -halfLength, 0,  halfDepth ),
      new THREE.Vector3(  halfLength, 0,  halfDepth ),
      new THREE.Vector3(  halfLength, 0, -halfDepth ),
      new THREE.Vector3( -halfLength, 0, -halfDepth ),
      // Top, front-to-back.
      new THREE.Vector3( 0, height,  halfDepth ),
      new THREE.Vector3( 0, height, -halfDepth )
    ];

    prism.faces = [
      // Front.
      new THREE.Face3( 0, 1, 4 ),
      // Back.
      new THREE.Face3( 2, 3, 5 )
    ];

    // Left-only rotation. Show right side.
    if ( rotation === 'left' ) {
      prism.faces.push( new THREE.Face3( 1, 2, 5 ) );
      prism.faces.push( new THREE.Face3( 1, 5, 4 ) );
    }

    // Right-only rotation. Show left side.
    if ( rotation === 'right' ) {
      prism.faces.push( new THREE.Face3( 0, 4, 3 ) );
      prism.faces.push( new THREE.Face3( 4, 5, 3 ) );
    }

    return prism;
  }

  applyEquilateralTriangularPrismTransform( geometry, length, rotation ) {
    const halfLength = length / 2;

    const height = Math.sqrt( 3 ) * halfLength;
    const halfHeight = height / 2;

    let x = 0;
    if ( rotation === 'left'  ) { x = -halfLength / 2; }
    if ( rotation === 'right' ) { x =  halfLength / 2; }

    let angle = 0;
    if ( rotation === 'left'  ) { angle =  Math.PI / 3; }
    if ( rotation === 'right' ) { angle = -Math.PI / 3; }

    geometry.applyMatrix( matrix.makeRotationZ( angle ) );
    geometry.applyMatrix( matrix.makeTranslation( x, halfHeight, 0 ) );

    return geometry;
  }

  createEquilateralTriangularPrismBone( geometry, parent = -1, length, rotation ) {
    const halfLength = length / 2;

    const height = Math.sqrt( 3 ) * halfLength;
    const halfHeight = height / 2;

    let x = 0;
    if ( rotation === 'left'  ) { x = -halfLength / 2; }
    if ( rotation === 'right' ) { x =  halfLength / 2; }

    let angle = 0;
    if ( rotation === 'left'  ) { angle =  Math.PI / 3; }
    if ( rotation === 'right' ) { angle = -Math.PI / 3; }

    const index = geometry.bones.push({
      parent,
      name: 'equilateral-triangular',
      pos: vector.set( -x, halfHeight, 0 )
        .applyMatrix4( matrix.makeRotationZ( angle ) )
        .toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    times( 4, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    times( 2, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }

  createPyramid( width, height, depth ) {
    const pyramid = new THREE.Geometry();

    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    /*
       3       2
        o-----o
        |     |  right
        |     |
        o-----o
       0       1
         front
     */
    pyramid.vertices = [
      // Top-down counter-clockwise from front-left.
      new THREE.Vector3( -halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0, -halfDepth ),
      new THREE.Vector3( -halfWidth, 0, -halfDepth ),
      // Top.
      new THREE.Vector3( 0, height, 0 )
    ];

    pyramid.faces = [
      // Front.
      new THREE.Face3( 0, 1, 4 ),
      // Right.
      new THREE.Face3( 1, 2, 4 ),
      // Back.
      new THREE.Face3( 2, 3, 4 ),
      // Left.
      new THREE.Face3( 3, 0, 4 )
    ];

    return pyramid;
  }

  createPyramidBone( geometry, parent = -1, height ) {
    const index = geometry.bones.push({
      parent,
      name: 'pyramid',
      pos: [ 0, height, 0 ],
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    times( 4, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
    geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );

    return geometry;
  }

  update() {}
}
