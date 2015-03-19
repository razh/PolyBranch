import THREE from 'three';

import {
  circleLineIntersection,
  distanceTo,
  map,
  pointInTriangle,
  random
} from './math';

import {
  color,
  triangle
} from './canvas';

// Create some kind of tree or branch object that takes in an initial triangle
// and a number of limbs.
export default class Branch {
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

  setPosition( x, y, width, height, easedDistance ) {
    const [ v0,  v1,  v2  ] = this.vertices;
    const [ ev0, ev1, ev2 ] = this.easedVertices;

    // Translate to center.
    x -= width  / 2;
    y -= height / 2;

    ev0.x = x + v0.x * easedDistance;
    ev0.y = y + v0.y * easedDistance;
    ev1.x = x + v1.x * easedDistance;
    ev1.y = y + v1.y * easedDistance;
    ev2.x = x + v2.x * easedDistance;
    ev2.y = y + v2.y * easedDistance;
  }

  render( ctx, x, y, w, h, easedDistance ) {
    const {
      hue,
      saturation,
      brightness
    } = this;

    const alpha = this.alpha = ( easedDistance > 2 ) ?
      Math.floor( map( easedDistance, 2, 8, 255, 0 ) ) :
      255;

    if ( easedDistance <= 0.8 ) {
      ctx.strokeStyle = color( 0, map( easedDistance, 0.0, 0.8, 0, 255 ) );
      ctx.fillStyle   = color(
        hue,
        saturation,
        map( easedDistance, 0.0, 0.8, 230, brightness ),
        alpha
      );
    } else if ( easedDistance <= 1.02 ) {
      ctx.strokeStyle = color( 0, alpha );
      ctx.fillSTyle   = color( hue, saturation, brightness, alpha );
    } else {
      ctx.strokeStyle = color( 255, alpha );
      ctx.fillSTyle   = color( hue, saturation, 300 - brightness, alpha );
    }

    ctx.lineWidth = 0.4;

    const [ ev0, ev1, ev2 ] = this.easedVertices;
    triangle(
      ev0.x, ev0.y,
      ev1.x, ev1.y,
      ev2.x, ev2.y
    );
  }

  // Collision detection functions.
  playerOverlap( game ) {
    const {
      player: {
        position: { x, y },
        radius
      }
    } = game;

    const [
     { x: x0, y: y0 },
     { x: x1, y: y1 },
     { x: x2, y: y2 }
    ] = this.easedVertices;

    if (
      distanceTo( x, y, x0, y0 ) < radius ||
      distanceTo( x, y, x1, y1 ) < radius ||
      distanceTo( x, y, x2, y2 ) < radius ||
      pointInTriangle(
        x, y,
        x2, y2,
        x1, y1,
        x0, y0
      ) ||
      circleLineIntersection( x, y, radius, x0, y0, x1, y1 ) ||
      circleLineIntersection( x, y, radius, x1, y1, x2, y2 ) ||
      circleLineIntersection( x, y, radius, x2, y2, x0, y0 )
    ) {
      this.brightness = this.saturation = 100;
      game.gameOver();
    }
  }
}
