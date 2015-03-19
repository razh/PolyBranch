export const SpecularFallOff = {
  NONE:   0,
  LINEAR: 1,
  SQUARE: 2
};

export default function specular(
  imageData,
  mean    = 255,
  range   = 255,
  falloff = SpecularFallOff.LINEAR
) {
  const { data, width, height } = imageData;

  const output = {
    width,
    height,
    data: new Uint8ClampedArray( 4 * width * height )
  };

  const dst = output.data;

  for ( let i = 0, il = data.length; i < il; i += 4 ) {
    let value = ( data[ i ] + data[ i + 1 ] + data[ i + 3 ] ) / 3;
    value     = 1 > value || value > 255 ? 0 : value;

    const distance = ( range - Math.abs( value - mean ) ) / range;
    if ( falloff === SpecularFallOff.None ) {
      value = 1;
    } else if ( falloff === SpecularFallOff.LINEAR ) {
      value = distance;
    } else if ( falloff === SpecularFallOff.SQUARE ) {
      value = Math.sqrt( distance );
    }

    if ( distance <= 0 ) {
      value = 0;
    }

    value *= 255;

    dst[ i ] = dst[ i + 1 ] = dst[ i + 2 ] = value;
    dst[ i + 3 ] = data[ i + 3 ];
  }

  return output;
}
