import THREE from 'three';

/*
  A tree is composed of trapezoids, with branches terminating with triangles.

  If a trapezoid branches, then a triangular prism joint is added to the distal
  end so that branches can be attached.

  To simplify calculations, geometries are generated so that they lie on the
  x/z plane before being joined together.

  Positive z-axis points outwards.
 */
export default class Tree {
  constructor() {
    this.geometry = new THREE.Geometry();

    const material = new THREE.MeshBasicMaterial({ wireframe: true });
    this.mesh = new THREE.SkinnedMesh( this.geometry, material );
  }

  createTrapezoidalPrism( geometry, bottomWidth, topWidth, height, depth ) {
    const prism = new THREE.Geometry();

    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth    = topWidth    / 2;

    const halfDepth = depth / 2;

    prism.vertices = [
      // Front counter-clockwise from bottom-left.
      new THREE.Vector3( -halfBottomWidth, 0,      halfDepth ),
      new THREE.Vector3(  halfBottomWidth, 0,      halfDepth ),
      new THREE.Vector3(  halfTopWidth,    height, halfDepth ),
      new THREE.Vector3( -halfTopWidth,    height, halfDepth ),
      // Back clockwise from bottom-right.
      new THREE.Vector3(  halfBottomWidth, 0,      -halfDepth ),
      new THREE.Vector3( -halfBottomWidth, 0,      -halfDepth ),
      new THREE.Vector3( -halfTopWidth,    height, -halfDepth ),
      new THREE.Vector3(  halfTopWidth,    height, -halfDepth )
    ];

    prism.faces = [
      // Front.
      new THREE.Face3( 0, 1, 2 ),
      new THREE.Face3( 0, 2, 3 ),
      // Left.
      new THREE.Face3( 0, 3, 5 ),
      new THREE.Face3( 3, 6, 5 ),
      // Back.
      new THREE.Face3( 4, 5, 6 ),
      new THREE.Face3( 4, 6, 7 ),
      // Right.
      new THREE.Face3( 1, 4, 7 ),
      new THREE.Face3( 1, 7, 2 )
    ];

    return prism;
  }

  /*
    Equilateral triangular prism:

                  5
               .-o
          2 .-'   \  back
           o       o
    front / \   .-' 3
         o---o-'
        0     1
    Only the front and back triangles are visible.
   */
  createEquilateralTriangularPrism( geometry, length, depth ) {
    const prism = new THREE.Geometry();

    const height = ( Math.sqrt( 3 ) / 2 ) * length;

    const halfLength = length / 2;
    const halfDepth  = depth  / 2;

    prism.vertices = [
      // Front counter-clockwise from bottom-left.
      new THREE.Vector3( -halfLength, 0,      halfDepth ),
      new THREE.Vector3(  halfLength, 0,      halfDepth ),
      new THREE.Vector3(  0,          height, halfDepth ),
      // Back clockwise from bottom-right.
      new THREE.Vector3(  halfLength, 0,      -halfDepth ),
      new THREE.Vector3( -halfLength, 0,      -halfDepth ),
      new THREE.Vector3(  0,          height, -halfDepth )
    ];

    prism.faces = [
      // Front.
      new THREE.Face3( 0, 1, 2 ),
      // Back.
      new THREE.Face3( 3, 4, 5 )
    ];

    return prism;
  }

  createPyramid( geometry, width, height, depth ) {
    const pyramid = new THREE.Geometry();

    const halfWidth  = width / 2;
    const halfDepth  = depth / 2;

    /*
       4       3
        o-----o
        |     |  right
        |     |
        o-----o
       1       2
         front
     */
    pyramid.vertices = [
      // Top.
      new THREE.Vector3( 0, height, 0 ),
      // Top-down counter-clockwise from front-left.
      new THREE.Vector3( -halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0,  halfDepth ),
      new THREE.Vector3(  halfWidth, 0, -halfDepth ),
      new THREE.Vector3( -halfWidth, 0, -halfDepth )
    ];

    pyramid.faces = [
      // Front.
      new THREE.Face3( 0, 1, 2 ),
      // Right.
      new THREE.Face3( 0, 2, 3 ),
      // Back.
      new THREE.Face3( 0, 3, 4 ),
      // Left.
      new THREE.Face3( 0, 4, 1 )
    ];

    return pyramid;
  }

  update() {}
}
