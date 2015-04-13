import THREE from 'three';

import WAGNER from './../../../vendor/Wagner/Wagner'
import {} from './../../../vendor/Wagner/Wagner.base'

export default function create() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const composer = new WAGNER.Composer( renderer, { useRGBA: false });
  composer.setSize( renderer.domElement.width, renderer.domElement.height );

  const fxaaPass = new WAGNER.FXAAPass();
  const rgbSplitPass = new WAGNER.RGBSplitPass();
  rgbSplitPass.params.delta.set( 32, 32 );

  window.addEventListener( 'resize', () => {
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( renderer.domElement.width, renderer.domElement.height );
  });

  return function render( scene, camera ) {
    composer.reset();
    composer.render( scene, camera );
    composer.pass( fxaaPass );
    composer.pass( rgbSplitPass );
    composer.toScreen();
  };
}
