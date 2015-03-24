import THREE from 'three';
import SimplexNoise from 'simplex-noise';

import ao from './../texture/ao';
import displacement from './../texture/displacement';
import grayscale from './../texture/grayscale';
import fbm from './../texture/fbm';
import normal from './../texture/normal';
import sobel from './../texture/sobel';
import specular from './../texture/specular';

const WIDTH  = 256;
const HEIGHT = 256;

function createCanvas( width, height ) {
  const canvas = document.createElement( 'canvas' );
  const ctx    = canvas.getContext( '2d' );
  document.body.appendChild( canvas );

  canvas.width  = width;
  canvas.height = height;

  return { canvas, ctx };
}

function noiseTest() {
  const { canvas, ctx } = createCanvas( WIDTH, HEIGHT );

  const simplex = new SimplexNoise();
  const noise2D = simplex.noise2D.bind( simplex );

  console.time( 'noise' );
  const imageData = fbm( canvas.width, canvas.height, noise2D, {
    octaves: Math.ceil( Math.log2( canvas.width ) ),
    period:  canvas.width / 2
  });
  console.timeEnd( 'noise' );

  ctx.putImageData( imageData, 0, 0 );

  return canvas;
}

function aoTest( ctx ) {
  const { canvas } = ctx;
  const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

  console.time( 'ao' );
  const aoImageData = ao( imageData, {
    strength: 2.5
  });
  console.timeEnd( 'ao' );

  const {
    canvas: aoCanvas,
    ctx:    aoCtx
  } = createCanvas( canvas.width, canvas.height );
  aoCtx.putImageData( aoImageData, 0, 0 );

  return aoCanvas;
}

function displacementTest( ctx ) {
  const { canvas } = ctx;
  const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

  console.time( 'displacement' );
  const {
    imageData: displacementImageData,
    bias
  } = displacement( imageData );
  console.timeEnd( 'displacement' );

  const {
    canvas: displacementCanvas,
    ctx:    displacementCtx
  } = createCanvas( canvas.width, canvas.height );
  displacementCtx.putImageData( displacementImageData, 0, 0 );
  console.log( 'displacement bias:', bias );

  return displacementCanvas;
}

function normalTest( ctx ) {
  const { canvas } = ctx;
  const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

  console.time( 'normal' );
  const normalImageData = normal( imageData );
  console.timeEnd( 'normal' );

  const {
    canvas: normalCanvas,
    ctx:    normalCtx
  } = createCanvas( canvas.width, canvas.height );
  normalCtx.putImageData( normalImageData, 0, 0 );

  return normalCanvas;
}

function specularTest( ctx ) {
  const { canvas } = ctx;
  const imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

  console.time( 'specular' );
  const specularImageData = specular( imageData );
  console.timeEnd( 'specular' );

  const {
    canvas: specularCanvas,
    ctx:    specularCtx
  } = createCanvas( canvas.width, canvas.height );
  specularCtx.putImageData( specularImageData, 0, 0 );

  return specularCanvas;
}


function createViewer({
  width  = 512,
  height = 512,
  texture,
  aoTexture,
  displacementTexture,
  normalTexture,
  specularTexture
}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( width, height );
  renderer.shadowMapEnabled = true;
  document.body.appendChild( renderer.domElement );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 60, width / height );
  camera.position.set( 0, 0, 3 );
  scene.add( camera );

  const material = new THREE.MeshPhongMaterial({
    map:         texture,
    lightMap:    aoTexture,
    normalMap:   normalTexture,
    specularMap: specularTexture
  });

  const sphereGeometry = new THREE.SphereGeometry( 1, 32, 24 );
  const sphereMesh = new THREE.Mesh( sphereGeometry, material );
  sphereMesh.castShadow    = true;
  sphereMesh.receiveShadow = true;
  scene.add( sphereMesh );

  const light = new THREE.DirectionalLight( 0xffffff, 1.5 );
  light.position.set( 3, 3, 3 );
  light.castShadow = true;
  scene.add( light );

  renderer.domElement.addEventListener( 'mousemove', event => {
    const rect = renderer.domElement.getBoundingClientRect();

    const x = ( ( event.clientX - rect.left ) / rect.width ) - 0.5;
    const y = 0.5 - ( ( event.clientY - rect.top ) / rect.height );

    light.position.x = 6 * x;
    light.position.y = 6 * y;

    renderer.render( scene, camera );
  });

  renderer.render( scene, camera );
}

function createTexture( image ) {
  const texture = new THREE.Texture( image );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 2;
  texture.needsUpdate = true;
  return texture;
}

function createTextures( image ) {
  const canvas = document.createElement( 'canvas' );
  const ctx    = canvas.getContext( '2d' );

  canvas.width  = image.naturalWidth  || image.width;
  canvas.height = image.naturalHeight || image.height;

  ctx.drawImage( image, 0, 0 );

  const texture             = createTexture( image );
  const aoTexture           = createTexture( aoTest( ctx ) );
  const displacementTexture = createTexture( displacementTest( ctx ) );
  const normalTexture       = createTexture( normalTest( ctx ) );
  const specularTexture     = createTexture( specularTest( ctx ) );

  return {
    texture,
    aoTexture,
    displacementTexture,
    normalTexture,
    specularTexture
  };
}

export default function() {
  createViewer( createTextures( noiseTest() ) );

  document.addEventListener( 'dragover', event => {
    event.preventDefault();
    event.stopPropagation();
  });

  document.addEventListener( 'drop', event => {
    event.preventDefault();
    event.stopPropagation();

    const { files } = event.dataTransfer;

    if ( files.length ) {
      const image = new Image();
      image.onload = () => createViewer( createTextures( image ) );
      image.src = URL.createObjectURL( files[0] );
    }
  });
}
