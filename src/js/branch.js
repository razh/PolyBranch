// Create some kind of tree or branch object that takes in an initial triangle
// and a number of limbs.
class Branch {
  constructor(
    a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3()
  ) {
    this.vertices = [ a, b, c ];

    // Initialized eased vertices as blanks.
    this.easedVertices = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];

    this.minBrightness = 50;
    this.maxBrightness = 90;

    this.hue = 0;
    this.saturation = 0;
    this.brightness = random( this.minBrightness, this.maxBrightness );
    this.alpha = 255;
  }

  setPos( ox, oy, w, h, easedDist ) {
    const [ v0,  v1,  v2  ] = this.vertices;
    const [ ev0, ev1, ev2 ] = this.easedVertices;

    ev0.x = v0.x * easedDist + ( ox - w / 2 );
    ev0.y = v0.y * easedDist + ( oy - h / 2 );
    ev1.x = v1.x * easedDist + ( ox - w / 2 );
    ev1.y = v1.y * easedDist + ( oy - h / 2 );
    ev2.x = v2.x * easedDist + ( ox - w / 2 );
    ev2.y = v2.y * easedDist + ( oy - h / 2 );
  }

  render( ox, oy, w, h, easedDist ) {
    const {
      hue,
      saturation,
      brightness
    } = this;

    const alpha = this.alpha = ( easedDist > 2 ) ?
      Math.floor( map( easedDist, 2, 8, 255, 0 ) ) :
      255;

    if ( easedDist <= 0.8 ) {
      fill( hue, saturation, map( easedDist, 0.0, 0.8, 230, brightness ), alpha );
      stroke( 0, map( easedDist, 0.0, 0.8, 0, 255 ) );
    } else if ( easedDist <= 1.02 ) {
      stroke( 0, alpha );
      fill( hue, saturation, brightness, alpha );
    } else {
      stroke( 255, alpha );
      fill( hue, saturation, 300 - brightness, alpha );
    }

    strokeWeight( 0.4 );

    const [ ev0, ev1, ev2 ] = this.easedVertices;
    triangle(
      ev0.x, ev0.y,
      ev1.x, ev1.y,
      ev2.x, ev2.y
    );
  }

  // Collision detection functions.
  playerOverlap() {
    const {
      r,
      pos: { x, y }
    } = player;

    const [
     { x: x0, y: y0 },
     { x: x1, y: y1 },
     { x: x2, y: y2 }
    ] = this.easedVertices;

    if (
      dist( x, y, x0, y0 ) < r ||
      dist( x, y, x1, y1 ) < r ||
      dist( x, y, x2, y2 ) < r ||
      pointInTriangle(
        x, y,
        x2, y2,
        x1, y1,
        x0, y0
      ) ||
      circleLineIntersection( x, y, r, x0, y0, x1, y1 ) ||
      circleLineIntersection( x, y, r, x1, y1, x2, y2 ) ||
      circleLineIntersection( x, y, r, x2, y2, x0, y0 )
    ) {
      this.brightness = this.saturation = 100;
      game.gameOver();
    }
  }
}
