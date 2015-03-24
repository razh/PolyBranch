import createImageData from './image-data';

export default function grayscale( imageData, invert ) {
  const { data, width, height } = imageData;

  const output = createImageData( width, height );
  const dst    = output.data;

  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    const r = data[ i     ];
    const g = data[ i + 1 ];
    const b = data[ i + 2 ];

    // CIE RGB luminance.
    const value = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    dst[ i ] = dst[ i + 1 ] = dst[ i + 2 ] = invert ? ( 255 - value ) : value;
    dst[ i + 3 ] = data[ i + 3 ];
  }

  return output;
}
