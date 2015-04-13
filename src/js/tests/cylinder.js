import THREE from 'three';

import Cylinder from './../cylinder/cylinder';
import renderer from './renderer';

import OrbitControls from './../../../vendor/controls/OrbitControls';

export default function() {
  const clearColor = 0x665555;

  const render = renderer();
  render.renderer.setClearColor( clearColor );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
  camera.position.set( 0, 0, 32 );
  scene.add( camera );

  scene.fog = new THREE.FogExp2( clearColor, 0.005 );

  const controls = new THREE.OrbitControls( camera, renderer.domElement );

  const cylinder = new Cylinder();
  const material = new THREE.MeshPhongMaterial({
    color: '#f87',
    side: THREE.DoubleSide,
    shading: THREE.FlatShading
  });
  const mesh = new THREE.Mesh( cylinder.geometry, material );
  scene.add( mesh );

  const light = new THREE.PointLight( '#acf' );
  scene.add( light );

  scene.add( new THREE.AmbientLight( clearColor ) );

  function animate() {
    cylinder.update();
    light.position.copy( camera.position );
    render( scene, camera );
    requestAnimationFrame( animate );
  }

  animate();
}
