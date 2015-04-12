const PI2 = 2 * Math.PI;

function createLink() {
  const link = document.createElement( 'link' );
  link.rel = 'icon';
  document.querySelector( 'head' ).appendChild( link );
  return link;
}

const createIcon = (() => {
  const canvas = document.createElement( 'canvas' );
  const ctx    = canvas.getContext( '2d' );

  const count = 8;
  const scale = 0.9;

  const vertices = [];
  const edges    = [];

  for ( let i = 0; i < count; i++ ) {
    vertices.push([
      scale * Math.cos( PI2 * i / count ),
      scale * Math.sin( PI2 * i / count )
    ]);

    // Regular polygon.
    edges.push( [ i, ( i + 1 ) % count ] );
    // First inner polygon.
    edges.push( [ i, ( i + 2 ) % count ] );
    // Second inner polygon.
    edges.push( [ i, ( i + 3 ) % count ] );
  }

  return ( size = 32 ) => {
    canvas.width = size;
    canvas.height = size;

    ctx.save();

    const halfSize = size / 2;

    ctx.translate( halfSize, halfSize );
    ctx.scale( halfSize, halfSize );

    ctx.beginPath();

    for ( let i = 0, il = edges.length; i < il; i++ ) {
      const [ a, b ] = edges[ i ];

      const va = vertices[ a ];
      const vb = vertices[ b ];

      ctx.moveTo( va[0], va[1] );
      ctx.lineTo( vb[0], vb[1] );
    }

    ctx.restore();

    ctx.lineWidth = 0.5;
    ctx.stroke();

    const link = createLink();
    link.href = canvas.toDataURL( 'image/png' );
  };

})();

export default createIcon;
