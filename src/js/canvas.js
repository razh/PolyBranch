import { PI2 } from './math';

// HSB values are in the [0, 255] range.
function hsbaToHsla( h = 0, s = 0, b = 0, a = 1 ) {
  if ( !b ) {
    return 'hsla(0, 0%, 0%, ' + a + ')';
  }

  s /= 255;
  b /= 255;

  const l = b / 2 * ( 2 - s );
  s = ( b / s ) / ( l < 0.5 ? l * 2 : 1 - l * 2 );
  return `hsla(${ h }, ${ 255 * s }%, ${ 255 * l }%, ${ a / 255 })`;
}

export function color( h, s, b, a ) {
  if ( arguments.length === 1 ) {
    return hsbaToHsla( h, h, h );
  } else if ( arguments.length === 2 ) {
    // s is alpha.
    return hsbaToHsla( h, h, h, s );
  } else if ( arguments.length === 3 ) {
    return hsbaToHsla( h, s, b );
  }

  return hsbaToHsla( h, s, b, a );
}

export function triangle( ctx, x0, y0, x1, y1, x2, y2 ) {
  ctx.beginPath();
  ctx.moveTo( x0, y0 );
  ctx.lineTo( x1, y1 );
  ctx.lineTo( x2, y2 );
  ctx.closePath();

  ctx.fill();
  ctx.stroke();
}

export function circle( ctx, x, y, r ) {
  ctx.beginPath();
  ctx.arc( x, y, r, 0, PI2 );
  ctx.closePath();

  ctx.fill();
  ctx.stroke();
}

export function drawPolygon( ctx, cx, cy, r, sides, weight, color ) {
  const angle = PI2 / sides;

  ctx.fillStyle = 'transparent';
  ctx.strokeStyle = color;
  ctx.lineWidth = weight;

  ctx.beginPath();

  ctx.moveTo( cx + r, cy );
  for ( let i = 1; i < sides; i++ ) {
    ctx.lineTo(
      cx + r * Math.cos( angle * i ),
      cy + r * Math.sin( angle * i )
    );
  }

  ctx.closePath();
}
