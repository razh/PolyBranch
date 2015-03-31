import { PI2 } from './../math';
import createImageData from './image-data';

export default function fbm( width, height, noise, {
  octaves    = 16,
  period     = 256,
  lacunarity = 2,
  gain       = 0.5
} = {} ) {

  const imageData = createImageData( width, height );
  const { data }  = imageData;

  let index = 0;
  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    let frequency = 1 / period;
    let amplitude = gain;

    const x = index % width;
    const y = Math.floor( index / width );
    index++;

    let sum = 0;

    for ( let j = 0; j < octaves; j++ ) {
      sum += amplitude * noise( x * frequency, y * frequency );
      frequency *= lacunarity;
      amplitude *= gain;
    }

    sum = 0.5 * ( sum + 1 ) * 255;

    data[ i ] = data[ i + 1 ] = data[ i + 2 ] = sum;
    data[ i + 3 ] = 255;
  }

  return imageData;
}

export function fbm4d( width, height, noise4d, {
  octaves    = 6,
  period     = 4,
  lacunarity = 2,
  gain       = 0.5
} = {} ) {

  const imageData = createImageData( width, height );
  const { data }  = imageData;

  let index = 0;
  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    let frequency = 1 / period;
    let amplitude = gain;

    const x = ( index % width ) / width;
    const y = Math.floor( index / width ) / width;
    index++;

    const nx = Math.cos( x * PI2 );
    const ny = Math.sin( x * PI2 );
    const nz = Math.cos( y * PI2 );
    const nw = Math.sin( y * PI2 );

    let sum = 0;

    for ( let j = 0; j < octaves; j++ ) {
      sum += amplitude * noise4d(
        nx * frequency,
        ny * frequency,
        nz * frequency,
        nw * frequency
      );

      frequency *= lacunarity;
      amplitude *= gain;
    }

    sum = 0.5 * ( sum + 1 ) * 255;

    data[ i ] = data[ i + 1 ] = data[ i + 2 ] = sum;
    data[ i + 3 ] = 255;
  }

  return imageData;
}
