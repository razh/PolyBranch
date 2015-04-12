import times from 'lodash/utility/times';
import THREE from 'three';

const matrix = new THREE.Matrix4();
const vector = new THREE.Vector3();

function rotateWorld( object, vector ) {
  const { parent } = object;
  if ( !parent ) {
    return vector;
  }

  if ( parent.type === 'EquilateralTriangularPrism' ) {
    if ( object === parent.left  ) { parent.transformLeft();  }
    if ( object === parent.right ) { parent.transformRight(); }
  }

  return vector.applyMatrix4( matrix.extractRotation( parent.matrixWorld ) );
}

function getParentBoneIndex( object ) {
  const { parent } = object;
  // Default to first bone.
  if ( !parent ) {
    return 0;
  }

  if ( parent.type === 'EquilateralTriangularPrism' ) {
    if ( object === parent.left )  { return parent.leftIndex;  }
    if ( object === parent.right ) { return parent.rightIndex; }
  }

  return parent.index;
}


function transformVertices( object, geometry ) {
  const { parent } = object;
  if ( !parent ) {
    return geometry;
  }

  if ( parent.type === 'EquilateralTriangularPrism' ) {
    if ( object === parent.left  ) { parent.transformLeft();  }
    if ( object === parent.right ) { parent.transformRight(); }
  }

  const {
    parent: grandparent,
    matrix,
    matrixWorld
  } = parent;

  if ( !grandparent ) {
    matrixWorld.copy( matrix );
  } else {
    matrixWorld.multiplyMatrices( grandparent.matrixWorld, matrix );
  }

  geometry.applyMatrix( matrixWorld );
  return geometry;
}

function transformFaces( object, geometry ) {
  const { parent } = object;

  if ( !parent ) {
    return geometry;
  }

  // Ignore first four vertices which are from ancestor geometry.
  const offset = object.offset - 4;
  const parentOffset = parent.offset;

  // Determine vertex offset.
  let addOffset;

  if ( parent.type === 'EquilateralTriangularPrism' ) {
    const grandparent = parent.parent;

    if ( grandparent ) {
      const grandparentOffset = grandparent.offset;
      let indices;

      if ( object === parent.left ) {
        // Vertices 0 and 3 are grandparent vertices 0 and 3.
        // Vertices 1 and 2 are parent vertices 0 and 1.
        indices = [
          grandparentOffset,
          parentOffset,
          parentOffset + 1,
          grandparentOffset + 3
        ];
      }

      if ( object === parent.right ) {
        // Vertices 0 and 3 are parent vertices 0 and 1.
        // Vertices 1 and 2 are grandparent vertices 1 and 2.
        indices = [
          parentOffset,
          grandparentOffset + 1,
          grandparentOffset + 2,
          parentOffset + 1
        ];
      }

      // Reference parent and grandparent indices.
      if ( indices ) {
        addOffset = index => index < 4 ? indices[ index ] : index + offset;
      }
    }
  }

  addOffset = addOffset ||
    ( index => index + ( index < 4 ? parentOffset : offset ) );

  geometry.faces.forEach( face => {
    face.a = addOffset( face.a );
    face.b = addOffset( face.b );
    face.c = addOffset( face.c );
  });

  return geometry;
}


export class Base extends THREE.Object3D {
  constructor( size ) {
    super();

    this.type = 'Base';
    this.size = size;

    // Vertex offset.
    this.offset = 0;

    // Bone index.
    this.index = 0;
  }

  createGeometry() {
    const geometry = new THREE.Geometry();
    const halfSize = this.size / 2;

    geometry.vertices = [
      // Top-down counter-clockwise from front-left.
      new THREE.Vector3( -halfSize, 0,  halfSize ),
      new THREE.Vector3(  halfSize, 0,  halfSize ),
      new THREE.Vector3(  halfSize, 0, -halfSize ),
      new THREE.Vector3( -halfSize, 0, -halfSize )
    ];

    return geometry;
  }

  createBone( geometry ) {
    geometry.bones = [
      {
        parent: -1,
        name: 'root',
        pos: [ 0, 0, 0 ],
        rotq: [ 0, 0, 0, 1 ]
      }
    ];

    times( 4, () => {
      geometry.skinIndices.push( new THREE.Vector4( 0, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }
}

/*
  A tree is composed of trapezoids, with branches terminating with triangles.

  If a trapezoid branches, then a triangular prism joint is added to the distal
  end so that branches can be attached.

  To simplify calculations, geometries are generated so that they lie on the
  x/z plane before being joined together.

  Positive z-axis points outwards.
 */
export class TrapezoidalPrism extends THREE.Object3D {
  constructor( width = 1, height = 1, depth = 1 ) {
    super();

    this.type = 'TrapezoidalPrism';

    this.width  = width;
    this.height = height;
    this.depth  = depth;

    // Vertex offset.
    this.offset = 0;

    // Bone index.
    this.index = 0;

    this.position.set( 0, height, 0 );
    this.updateMatrixWorld();
  }

  createGeometry( offset = 0 ) {
    const geometry = new THREE.Geometry();

    const {
      width,
      height,
      depth
    } = this;

    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    this.offset = offset;

    geometry.vertices = [
      // Top counter-clockwise from front-left.
      new THREE.Vector3( -halfWidth, height,  halfDepth ),
      new THREE.Vector3(  halfWidth, height,  halfDepth ),
      new THREE.Vector3(  halfWidth, height, -halfDepth ),
      new THREE.Vector3( -halfWidth, height, -halfDepth )
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

    transformVertices( this, geometry );
    transformFaces( this, geometry );

    return geometry;
  }

  createBone( geometry ) {
    vector.set( 0, this.height, 0 );
    rotateWorld( this, vector );

    const index = geometry.bones.push({
      parent: getParentBoneIndex( this ),
      name: 'trapezoidal',
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    this.index = index;

    times( 4, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }
}


export class EquilateralTriangularPrism extends THREE.Object3D {
  constructor( width = 1, depth = 1 ) {
    super();

    this.type = 'EquilateralTriangularPrism';

    this.width = width;
    this.depth = depth;

    this.halfWidth = width / 2;
    this.halfDepth = depth / 2;

    this.height = Math.sqrt( 3 ) * this.halfWidth;
    this.halfHeight = this.height / 2;

    this.x = 0;
    this.angle = 0;

    // Vertex offset.
    this.offset = 0;

    // Branching slots.
    this.left  = undefined;
    this.right = undefined;

    // Bone offsets.
    this.leftIndex  = undefined;
    this.rightIndex = undefined;

    // Default to left.
    this.transformLeft();
  }

  add( object, direction ) {
    super.add( object );

    if ( direction === 'left'  ) { this.left  = object; }
    if ( direction === 'right' ) { this.right = object; }
  }

  updateTransform() {
    this.position.set( this.x, this.halfHeight, 0 );
    this.rotation.z = this.angle;
    this.updateMatrixWorld();
  }

  setLeft() {
    this.x = -this.halfWidth / 2;
    this.angle = Math.PI / 3;
  }

  setRight() {
    this.x = this.halfWidth / 2;
    this.angle = -Math.PI / 3;
  }

  transformLeft() {
    this.setLeft();
    this.updateTransform();
  }

  transformRight() {
    this.setRight();
    this.updateTransform();
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
  createGeometry( offset = 0 ) {
    const geometry = new THREE.Geometry();

    const {
      height,
      halfDepth
    } = this;

    this.offset = offset;

    geometry.vertices = [
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

    // No left branch. Show left side.
    if ( !this.left ) {
      geometry.faces.push( new THREE.Face3( 0, 4, 3 ) );
      geometry.faces.push( new THREE.Face3( 4, 5, 3 ) );
    }

    // No right branch. Show right side.
    if ( !this.right ) {
      geometry.faces.push( new THREE.Face3( 1, 2, 5 ) );
      geometry.faces.push( new THREE.Face3( 1, 5, 4 ) );
    }

    transformVertices( this, geometry );
    transformFaces( this, geometry );

    return geometry;
  }

  createDirectionalBone( geometry ) {
    vector.set( this.x, this.halfHeight, 0 );
    rotateWorld( this, vector );

    // Return bone index.
    return geometry.bones.push({
      parent: getParentBoneIndex( this ),
      name: 'equilateral-triangular',
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;
  }

  createBone( geometry ) {
    // No bones are created if there are no branches.
    if ( this.left ) {
      this.setLeft();
      this.leftIndex = this.createDirectionalBone( geometry );
    }

    if ( this.right ) {
      this.setRight();
      this.rightIndex = this.createDirectionalBone( geometry );
    }

    // Compute bone weights.
    let leftWeight  = 0;
    let rightWeight = 0;

    const finiteLeftIndex  = isFinite( this.leftIndex  );
    const finiteRightIndex = isFinite( this.rightIndex );
    if ( finiteLeftIndex && finiteRightIndex ) {
      leftWeight  = 0.5;
      rightWeight = 0.5;
    } else if ( finiteLeftIndex ) {
      leftWeight  = 1;
    } else if ( finiteRightIndex ) {
      rightWeight = 1;
    }

    const {
      leftIndex  = 0,
      rightIndex = 0
    } = this;

    times( 2, () => {
      geometry.skinIndices.push( new THREE.Vector4( leftIndex,  rightIndex,  0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( leftWeight, rightWeight, 0, 0 ) );
    });

    return geometry;
  }
}


export class Pyramid extends THREE.Object3D {
  constructor( height = 1 ) {
    super();

    this.type = 'Pyramid';
    this.height = height;

    // Vertex offset.
    this.offset = 0;

    // Bone index.
    this.index = 0;
  }

  createGeometry( offset = 0 ) {
    const geometry = new THREE.Geometry();
    const { height } = this;

    this.offset = offset;

    // Top.
    geometry.vertices = [
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

    transformVertices( this, geometry );
    transformFaces( this, geometry );

    return geometry;
  }

  createBone( geometry ) {
    vector.set( 0, this.height, 0 );
    rotateWorld( this, vector );

    const index = geometry.bones.push({
      parent: getParentBoneIndex( this ),
      name: 'pyramid',
      pos: vector.toArray(),
      rotq: [ 0, 0, 0, 1 ]
    }) - 1;

    this.index = index;

    times( 1, () => {
      geometry.skinIndices.push( new THREE.Vector4( index, 0, 0 ) );
      geometry.skinWeights.push( new THREE.Vector4( 1, 0, 0, 0 ) );
    });

    return geometry;
  }
}


export default class Tree {
  constructor() {
    const geometry = new THREE.Geometry();
    geometry.bones = [];

    const base = new Base( 2 );
    const trapezoid = new TrapezoidalPrism( 1, 1.5, 1.5 );
    const triangle = new EquilateralTriangularPrism( 1, 1 );

    const pyramidRight = new Pyramid( 5 );

    const trapezoidLeft = new TrapezoidalPrism( 0.75, 1.5, 0.5 );
    const triangleLeft = new EquilateralTriangularPrism( 1, 1 );
    const pyramidLeftLeft = new Pyramid( 2 );
    const pyramidLeftRight = new Pyramid( 3 );

    base.add( trapezoid );
    trapezoid.add( triangle );
    triangle.add( trapezoidLeft, 'left' );
    triangle.add( pyramidRight, 'right' );
    trapezoidLeft.add( triangleLeft );
    triangleLeft.add( pyramidLeftLeft, 'left' );
    triangleLeft.add( pyramidLeftRight, 'right' );

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
