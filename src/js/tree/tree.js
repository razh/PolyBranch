import THREE from 'three';

/*
  A tree is composed of trapezoids, with branches terminating with triangles.

  If a trapezoid branches, then a triangular prism joint is added to the distal
  end so that branches can be attached.

  To simplify calculations, geometries are generated so that they lie on the
  x/z plane before being joined together.
 */
export default class Tree {
  constructor() {
    this.geometry = new THREE.Geometry();

    const material = new THREE.MeshBasicMaterial({ wireframe: true });
    this.mesh = new THREE.SkinnedMesh( this.geometry, material );
    return this.mesh;
  }

  createPrism( geometry, faceIndex, ratio ) {
    const prism = new THREE.Geometry();

    // z-axis positive points outwards.
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
