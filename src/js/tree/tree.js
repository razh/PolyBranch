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
      new THREE.Face3( 2, 3, 0 ),
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

  createPrism( geometry, faceIndex, ratio ) {
    const prism = new THREE.Geometry();

    const face = geometry.faces[ faceIndex ];

    // Vertex indices.
    const { a, b, c } = face;

    // Vertices.
    const va = geometry.vertices[ a ];
    const vb = geometry.vertices[ b ];
    const vc = geometry.vertices[ c ];

    /*
      Equilateral triangular prism:

                 .-o
              .-'   \  back
             o       o
      front / \   .-'
           o---o-'

      Only the front and back triangles are visible.
     */

    // Front triangle.
    geometry.faces.push( new THREE.Face() );
    // Back triangle.
    geometry.faces.push( new THREE.Face() );
  }

  update() {}
}
