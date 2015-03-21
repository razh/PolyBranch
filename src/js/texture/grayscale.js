import createImageData from './image-data';

export function grayscale( imageData ) {
  const { data, width, height } = imageData;

  const output = createImageData( width, height );
  const dst    = output.data;

  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    const r = data[ i     ];
    const g = data[ i + 1 ];
    const b = data[ i + 2 ];

    // CIE RGB luminance.
    const value = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    dst[ i ] = dst[ i + 1 ] = dst[ i + 2 ] = value;
  }

  return output;
}
