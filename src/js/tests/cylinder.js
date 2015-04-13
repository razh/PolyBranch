import THREE from 'three';

import Cylinder from './../cylinder/cylinder';
import Tree from './../tree/tree';
import renderer from './renderer';

import OrbitControls from './../../../vendor/controls/OrbitControls';

export default function() {
  const clearColor = 0xffffff;

  const render = renderer();
  render.renderer.setClearColor( clearColor );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
  camera.position.set( 0, 0, 32 );
  scene.add( camera );

  scene.fog = new THREE.FogExp2( clearColor, 0.02 );

  const controls = new THREE.OrbitControls( camera, renderer.domElement );

  const cylinder = new Cylinder();
  const material = new THREE.MeshPhongMaterial({
    color: '#f87',
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  });

  const cylinderMesh = new THREE.Mesh( cylinder.geometry, material );
  scene.add( cylinderMesh );
  cylinderMesh.rotation.x = Math.PI / 2;

  const material2 = material.clone();
  material2.color.setHex( 0x0000ff );
  const cylinderMesh2 = new THREE.Mesh( cylinder.geometry, material2 );
  scene.add( cylinderMesh2 );
  cylinderMesh2.position.z += cylinder.length;
  cylinderMesh2.rotation.x = -Math.PI / 2;
  cylinderMesh2.rotation.y = Math.PI;

  const treeMaterial = new THREE.MeshPhongMaterial({
    skinning: true,
    color: '#000',
    ambient: '#000',
    shading: THREE.FlatShading
  });

  const tree = new Tree( treeMaterial );
  const treeMesh = tree.mesh;
  treeMesh.position.y -= cylinder.radius * 0.75;
  treeMesh.scale.setLength( 0.75 );
  scene.add( treeMesh );

  const light = new THREE.PointLight( '#acf' );
  camera.add( light );

  scene.add( new THREE.AmbientLight( '#655' ) );

  function animate() {
    cylinder.update();

    const time = Date.now() * 1e-3;
    const cos = Math.cos( time );
    const t = 0.5 * ( cos + 1 );
    // Length of vector ( 1, 1, 1 ).
    const length = t * Math.sqrt( 3 );

    treeMesh.skeleton.bones.forEach( ( bone, index ) => {
      bone.scale.setLength( length );

      if ( index > 1 ) {
        bone.rotation.z = bone.startAngle * ( 1 - t );
      }

      bone.updateMatrixWorld();
    });

    render( scene, camera );
    requestAnimationFrame( animate );
  }

  animate();
}
