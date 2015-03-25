import grayscale from './grayscale';
import sobel from './sobel';
import createImageData from './image-data';
import { blur, sharpen } from './gaussian-blur';

export default function normal( imageData, {
  smoothing = 0,
  strength  = 2.5,
  level     = 7
} = {} ) {
  const { width, height } = imageData;

  const grayscaleImageData = grayscale( imageData, true );
  const sobelImageData     = sobel( grayscaleImageData, strength, level );
  const sobelData          = sobelImageData.data;

  if ( smoothing > 0 ) {
    sharpen( sobelImageData, Math.abs( smoothing ) );
  } else if ( smoothing < 0 ) {
    blur( sobelImageData, Math.abs( smoothing ) );
  }

  const output = createImageData( width, height );
  output.data.set( sobelData );
  return output;
}
