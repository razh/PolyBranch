import THREE from 'three';
import SimplexNoise from 'simplex-noise';
import NormalDisplacementShader from './../../../vendor/shaders/NormalDisplacementShader';

import ao from './../texture/ao';
import displacement from './../texture/displacement';
import grayscale from './../texture/grayscale';
import fbm from './../texture/fbm';
import normal from './../texture/normal';
import sobel from './../texture/sobel';
import specular from './../texture/specular';

import renderToImage from './../texture/render-to-image';

const glslify = require( 'glslify' );

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

  return {
    displacementCanvas,
    displacementBias: bias
  };
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
  displacementBias,
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

  function createMaterial() {
    return new THREE.MeshPhongMaterial({
      map:         texture,
      lightMap:    aoTexture,
      normalMap:   normalTexture,
      specularMap: specularTexture
    });
  }

  function createNormalDisplacementShaderMaterial() {
    const shader = THREE.NormalDisplacementShader;
    const uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    uniforms.enableDiffuse.value      = true;
    uniforms.enableAO.value           = true;
    uniforms.enableSpecular.value     = true;
    uniforms.enableDisplacement.value = true;

    uniforms.tDiffuse.value  = texture;
    uniforms.tAO.value       = aoTexture;
    uniforms.tNormal.value   = normalTexture;
    uniforms.tSpecular.value = specularTexture;

    uniforms.tDisplacement.value = displacementTexture;

    const scale = 0.25;
    uniforms.uDisplacementBias.value  = scale * -displacementBias;
    uniforms.uDisplacementScale.value = scale;

    return new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader:   shader.vertexShader,
      uniforms,
      lights: true
    });
  }

  const material = createNormalDisplacementShaderMaterial();

  function createMesh( geometry ) {
    geometry.computeTangents();
    const mesh = new THREE.Mesh( geometry, material );
    mesh.visible = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add( mesh );
    return mesh;
  }

  const meshes = [];

  const sphereGeometry = new THREE.SphereGeometry( 1, 32, 24 );
  const sphereMesh = createMesh( sphereGeometry );
  meshes.push( sphereMesh );

  const boxGeometry = new THREE.BoxGeometry( 1.5, 1.5, 1.5, 96, 96, 96 );
  const boxMesh = createMesh( boxGeometry );
  boxMesh.rotation.x = boxMesh.rotation.y = Math.PI / 4;
  meshes.push( boxMesh );

  const planeGeometry = new THREE.PlaneBufferGeometry( 1.5, 1.5, 96, 96 );
  const planeMesh = createMesh( planeGeometry );
  planeMesh.rotation.x = -Math.PI / 4;
  meshes.push( planeMesh );

  const cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 8, 48, 8, true );
  const cylinderMesh = createMesh( cylinderGeometry );
  cylinderMesh.material = createNormalDisplacementShaderMaterial();
  cylinderMesh.material.side = THREE.BackSide;
  cylinderMesh.rotation.x = Math.PI / 2;
  cylinderMesh.position.z = -2;
  meshes.push( cylinderMesh );

  const light = new THREE.DirectionalLight( 0xffffff, 1.5 );
  light.position.set( 3, 3, 3 );
  light.castShadow = true;
  scene.add( light );

  renderer.domElement.addEventListener( 'mousedown', (() => {
    let index = 0;

    function toggle( index ) {
      meshes.forEach( ( mesh, i ) => mesh.visible = i === index );
    }

    toggle( index );

    return () => {
      index = ( index + 1 ) % meshes.length;
      toggle( index );
      renderer.render( scene, camera );
    };
  })() );

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

  const { displacementCanvas, displacementBias } = displacementTest( ctx );

  const texture             = createTexture( image );
  const aoTexture           = createTexture( aoTest( ctx ) );
  const displacementTexture = createTexture( displacementCanvas );
  const normalTexture       = createTexture( normalTest( ctx ) );
  const specularTexture     = createTexture( specularTest( ctx ) );

  return {
    texture,
    aoTexture,
    displacementTexture,
    displacementBias,
    normalTexture,
    specularTexture
  };
}

function renderToImageTest() {
  console.time( 'renderToImage' );
  const fragmentShader = glslify(`
    #pragma glslify: noise = require(glsl-noise/simplex/2d);

    uniform vec2 resolution;

    float fbm( vec2 position, float lacunarity, float gain ) {
      vec2 p = position;
      float amplitude = gain;
      float sum = 0.0;

      for ( int i = 0; i < 16; i++ ) {
        sum += amplitude * noise( p );
        p *= lacunarity;
        amplitude *= gain;
      }

      return sum;
    }

    void main() {
      vec2 position = 2.0 * ( gl_FragCoord.xy / resolution ) - 1.0;
      float brightness = 0.5 * ( fbm( position, 2.0, 0.5 ) + 1.0 );
      gl_FragColor = vec4( vec3( brightness ), 1.0 );
    }
  `, { inline: true } );

  const image = document.createElement( 'img' );
  image.src = renderToImage( fragmentShader, 256 );
  document.body.appendChild( image );
  console.timeEnd( 'renderToImage' );

  return image;
}

function renderToImageTilingTest() {
  console.time( 'renderToImageTiling' );

  const fragmentShader = glslify(`
    #pragma glslify: noise4d = require(glsl-noise/simplex/4d);

    uniform vec2 resolution;

    #define PI2 6.283185307179586
    #define scale 2.0

    float noise( vec2 p ) {
      float radius = scale / PI2;
      vec2 q = p / radius;
      float nx = cos( q.x );
      float ny = cos( q.y );
      float nz = sin( q.x );
      float nw = sin( q.y );
      return noise4d( radius * vec4( nx, ny, nz, nw ) );
    }

    float fbm( vec2 position, float lacunarity, float gain ) {
      vec2 p = position;
      float amplitude = gain;
      float sum = 0.0;

      for ( int i = 0; i < 16; i++ ) {
        sum += amplitude * noise( p );
        p *= lacunarity;
        amplitude *= gain;
      }

      return sum;
    }

    void main() {
      vec2 position = 2.0 * ( gl_FragCoord.xy / resolution ) - 1.0;
      float brightness = 0.5 * ( fbm( position, 2.0, 0.5 ) + 1.0 );
      gl_FragColor = vec4( vec3( brightness ), 1.0 );
    }
  `, { inline: true } );

  const src = renderToImage( fragmentShader, 256 );

  const imageA = document.createElement( 'img' );
  imageA.src = src;
  document.body.appendChild( imageA );

  const imageB = document.createElement( 'img' );
  imageB.src = src;
  document.body.appendChild( imageB );

  console.timeEnd( 'renderToImageTiling' );

  return imageA;
}

export default function() {
  createViewer( createTextures( noiseTest() ) );
  renderToImageTest();
  renderToImageTilingTest();

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
