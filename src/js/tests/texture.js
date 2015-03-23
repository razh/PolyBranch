import THREE from 'three';
import SimplexNoise from 'simplex-noise';

import ao from './../texture/ao';
import grayscale from './../texture/grayscale';
import fbm from './../texture/fbm';
import sobel from './../texture/sobel';
import specular from './../texture/specular';

const WIDTH  = 256;
const HEIGHT = 256;

function noiseTest() {
  const canvas = document.createElement( 'canvas' );
  const ctx    = canvas.getContext( '2d' );
  document.body.appendChild( canvas );

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const simplex = new SimplexNoise();
  const noise2D = simplex.noise2D.bind( simplex );

  console.time( 'noise' );
  const imageData = fbm( canvas.width, canvas.height, noise2D, {
    octaves: Math.ceil( Math.log2( canvas.width ) ),
    period:  canvas.width / 2
  });
  console.timeEnd( 'noise' );

  ctx.putImageData( imageData, 0, 0 );

  return ctx;
}

export default function() {
  noiseTest();
}

