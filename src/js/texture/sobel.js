function mod( m, n ) {
  return ( ( m % n ) + n ) % n;
}

export default function sobel( imageData, strength, level ) {
  const { data, width, height } = imageData;

  const size = width * height;
  const output = {
    width,
    height,
    data: new Float32Array( 4 * size )
  };

  const dst = output.data;

  let topLeft, top, topRight,
    left, right,
    bottomLeft, bottom, bottomRight;

  let dx, dy;
  let length;

  strength = Math.max( strength, 1e-4 );

  const dz = ( 1 + Math.pow( 2, level ) ) / strength;
  const dzdz = dz * dz;

  for ( let y = 0; y < height; y++ ) {
     for ( let x = 0; x < width; x++ ) {
      let index = y * width + x;

      if ( !x || x === width  - 1 ||
           !y || y === height - 1 ) {
        topLeft     = data[ 4 * mod( ( index - width - 1 ), size ) ];
        top         = data[ 4 * mod( ( index - width     ), size ) ];
        topRight    = data[ 4 * mod( ( index - width + 1 ), size ) ];

        left        = data[ 4 * mod( ( index         - 1 ), size ) ];
        right       = data[ 4 * mod( ( index         + 1 ), size ) ];

        bottomLeft  = data[ 4 * mod( ( index + width - 1 ), size ) ];
        bottom      = data[ 4 * mod( ( index + width     ), size ) ];
        bottomRight = data[ 4 * mod( ( index + width + 1 ), size ) ];
      } else {
        topLeft     = data[ 4 * ( index - width - 1 ) ];
        top         = data[ 4 * ( index - width     ) ];
        topRight    = data[ 4 * ( index - width + 1 ) ];

        left        = data[ 4 * ( index         - 1 ) ];
        right       = data[ 4 * ( index         + 1 ) ];

        bottomLeft  = data[ 4 * ( index + width - 1 ) ];
        bottom      = data[ 4 * ( index + width     ) ];
        bottomRight = data[ 4 * ( index + width + 1 ) ];
      }

      dx = topLeft    + 2 * left   + bottomLeft -
           topRight   - 2 * right  - bottomRight;

      dy = topLeft    + 2 * top    + topRight -
           bottomLeft - 2 * bottom - bottomRight;

      length = Math.sqrt( dx * dx + dy * dy + dzdz );

      dst[ 4 * index     ] = 255 * ( dx / length * 0.5 + 0.5 );
      dst[ 4 * index + 1 ] = 255 * ( dy / length * 0.5 + 0.5 );
      dst[ 4 * index + 2 ] = 255 * dz / length;
      dst[ 4 * index + 3 ] = data[ 4 * index + 3 ];
    }
  }

  return output;
}
