import sobel from './sobel';
import grayscale from './grayscale';
import createImageData from './image-data';

export default function ao( imageData ) {
  const { data, width, height } = imageData;

  // TODO: Pass in parameters.
  const sobelImageData     = sobel( data );
  const grayscaleImageData = grayscale( data );

  const sobelData     = sobelImageData.data;
  const grayscaleData = grayscaleImageData.data;

  const output = createImageData( width, height );
  const dst    = output.data;

  for ( let i = 0; i < sobelData.length && i < grayscaleData.length; i += 4 ) {
    let value = sobelData[ i ] + sobelData[ i + 1 ] - grayscaleData[ i ] + 255;
    value    *= 0.5;
    value     = Math.min( Math.max( value, 0 ), 255 );

    dst[ i ] = dst[ i + 1 ] = dst[ i + 2 ] = value;
    dst[ i + 3 ] = grayscaleData[ i + 3 ];
  }

  return output;
}
