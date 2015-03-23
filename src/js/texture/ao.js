import sobel from './sobel';
import grayscale from './grayscale';
import createImageData from './image-data';
import { blur, sharpen } from './gaussian-blur';

export default function ao( imageData, {
  smoothing = -10,
  strength  = 0.5,
  level     = 7
} = {} ) {
  const { data, width, height } = imageData;

  const grayscaleImageData = grayscale( imageData );
  const sobelImageData     = sobel( grayscaleImageData, strength, level );

  if ( smoothing > 0 ) {
    sharpen( sobelImageData, Math.abs( smoothing ) );
  } else if ( smoothing < 0 ) {
    blur( sobelImageData, Math.abs( smoothing ) );
  }

  const sobelData     = sobelImageData.data;
  const grayscaleData = grayscaleImageData.data;

  const output = createImageData( width, height );
  const dst    = output.data;

  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    let value = sobelData[ i ] + sobelData[ i + 1 ] - grayscaleData[ i ] + 255;
    value    *= 0.5;
    value     = Math.min( Math.max( value, 0 ), 255 );

    dst[ i ] = dst[ i + 1 ] = dst[ i + 2 ] = value;
    dst[ i + 3 ] = data[ i + 3 ];
  }

  return output;
}
