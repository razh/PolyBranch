import grayscale from './grayscale';
import createImageData from './image-data';

// Grayscale contrast.
function contrastImageData( imageData, contrast ) {
  const { data } = imageData;
  const factor = ( 259 * ( contrast + 255 ) ) / ( 255 * ( 259 - contrast ) );

  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    const value = factor * ( data[i] - 128 ) + 128;
    data[ i ] = data[ i + 1 ] = data[ i + 2 ] = value;
  }

  return imageData;
}

export default function displacement( imageData, {
  contrast = -0.5
} = {} ) {
  const { data, width, height } = imageData;

  const grayscaleImageData = grayscale( imageData );
  const grayscaleData      = grayscaleImageData.data;

  const output = createImageData( width, height );
  const dst    = output.data;

  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    // Average grayscale data.
    let value = (
      grayscaleData[ i     ] +
      grayscaleData[ i + 1 ] +
      grayscaleData[ i + 2 ]
    ) / 3;

    // Clamp.
    value = ( 1 > value || value > 255 ) ? 0 : value;

    dst[ i ] = dst[ i + 1 ] = dst[ i + 2 ] = value;
    dst[ i + 3 ] = data[ i + 3 ];
  }

  // Add contrast.
  contrastImageData( output, contrast * 255 );

  // Calculate displacement bias.
  // Average value at height map border.
  const topLeft     = 0;
  const topRight    = 4 * ( width - 1 );
  const bottomLeft  = 4 * ( ( width - 1 ) * ( height - 1 ) - ( width - 1 ) );
  const bottomRight = 4 * ( ( width - 1 ) * ( height - 1 ) );

  const bias = (
    dst[ topLeft     ] +
    dst[ topRight    ] +
    dst[ bottomLeft  ] +
    dst[ bottomRight ]
  ) / 4 / 255;

  return {
    imageData: output,
    bias
  };
}
