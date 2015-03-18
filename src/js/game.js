/*jshint
globalstrict:true,
browser:true,
esnext:true,
undef:true
*/

// Processing globals:
/*global
redraw,
background,
loop, noLoop,
color,
beginShape, endShape, vertex, shape,
colorMode, imageMode, rectMode, ellipseMode, shapeMode,
HSB, CENTER, CLOSE
*/

// environment globals:
/*global
processingIsReady,
jsStartGame,
jsTriggerBell,
jsUpdateScore,
jsIncrementLevel,
jsGameOver
*/

/*global THREE*/
'use strict';

const TWO_PI = 2 * Math.PI;
const HALF_PI = Math.PI / 2;

// Processing functions.
const canvas = document.querySelector( 'canvas' );
const ctx    = ctx.getContext( '2d' );

function size( width, height ) {
  canvas.width  = width;
  canvas.height = height;
}

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

function variadicHsbaToHsla( h, s, b, a ) {
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

const fill = ( ...args ) => ctx.fillStyle = variadicHsbaToHsla( ...args );

function noFill() {
  ctx.fillStyle = 'transparent';
}

const stroke = ( ...args ) => ctx.strokeStyle = variadicHsbaToHsla( ...args );

function noStroke() {
  ctx.strokeStyle = 'transparent';
}

function strokeWeight( weight ) {
  ctx.lineWidth = weight;
}

function triangle( x0, y0, x1, y1, x2, y2 ) {
  ctx.beginPath();
  ctx.moveTo( x0, y0 );
  ctx.lineTo( x1, y1 );
  ctx.lineTo( x2, y2 );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function circle( x, y, r ) {
  ctx.beginPath();
  ctx.arc( x, y, r, 0, TWO_PI );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

const keys = [];

let originX;
let originY;

let paused;

let player;
let game;

function setup() {
  paused = true;
  size( 800, 800 );

  originX = canvas.width  / 2;
  originY = canvas.height / 2;

  colorMode( HSB, 255 );
  imageMode( CENTER );
  rectMode( CENTER );
  shapeMode( CENTER );
  noStroke();
  background( 230 );

  player = new Player();
  game = new Game();
  noLoop();

  processingIsReady();
}

// Utility functions!
function random( min, max ) {
  return min + Math.random() * ( max - min );
}

function dist( x0, y0, x1, y1 ) {
  const dx = x1 - x0;
  const dy = y1 - y0;

  return Math.sqrt( dx * dx + dy * dy );
}

function lerp( a, b, t ) {
  return a + t * ( b - a );
}

function inverseLerp( a, b, x ) {
  return ( x - a ) / ( b - a );
}

function map( x, a, b, c, d ) {
  return lerp( c, d, inverseLerp( a, b, x ) );
}

function angleTo( v0, v1 ) {
  let angle = Math.atan2( v0.y - v1.y, v0.x - v1.x );
  if ( angle < 0 ) { angle += TWO_PI; }
  return angle;
}

function draw() {
  if ( keys[0] || keys[1] || keys[2] || keys[3] ) {
    player.hue += game.speed * 100;
    if ( player.hue > 255 ) {
      player.hue = 0;
    }
  }

  const {
    r,
    vx,
    vy,
    pos: { x, y }
  } = player;

  const halfHeight = canvas.height / 2;
  const distance = halfHeight - r - 8;

  if ( keys[0] || keys[1] ) {
    if ( keys[0] ) {
      if ( vy < 0 && dist( x, y, originX, originY + vy ) > distance ) {
        player.vy = 0;
      }
      player.vy += 0.3;
    }

    if ( keys[1] ) {
      if ( vy > 0 && dist( x, y, originX, originY + vy ) > distance ) {
        player.vy = 0;
      }
      player.vy -= 0.3;
    }
  } else if ( vy ) {
    if ( vy > 0 ) {
      player.vy = Math.max( player.vy - 0.5, 0 );
    } else if ( vy < 0 ) {
      player.vy = Math.min( player.vy + 0.5, 0 );
    }
  }

  if ( keys[2] || keys[3] ) {
    if ( keys[2] ) {
      if ( vx < 0 && dist( x, y, originX + vx, originY ) > distance ) {
        player.vx = 0;
      }
      player.vx += 0.3;
    }

    if ( keys[3] ) {
      if ( vx > 0 && dist( x, y, originX + vx, originY ) > distance ) {
        player.vx = 0;
      }
      player.vx -= 0.3;
    }
  } else if ( vx ) {
    if ( vx > 0 ) {
      player.vx = Math.max( player.vx - 0.5, 0 );
    } else if ( vx < 0 ) {
      player.vx = Math.min( player.vx + 0.5, 0 );
    }
  }

  originX += vx;
  originY += vy;

  if ( dist( x, y, originX, originY ) > distance ) {
    const angle = angleTo( player.pos, new THREE.Vector3( originX, originY ) ) - Math.PI;
    originX = x + distance * Math.cos( angle );
    originY = y + distance * Math.sin( angle );
  }

  background( 255 );
  game.update();
}

function onMouseDown() {
  player.speed++;
}

function onKeyDown( event ) {
  const { keyCode } = event;
  // Up. W.
  if ( keyCode === 38 || keyCode === 87 ) { keys[0] = true; }
  // Down. S.
  if ( keyCode === 40 || keyCode === 83 ) { keys[1] = true; }
  // Left. A.
  if ( keyCode === 37 || keyCode === 65 ) { keys[2] = true; }
  // Right. D.
  if ( keyCode === 39 || keyCode === 68 ) { keys[3] = true; }
}

function onKeyUp( event ) {
  const { keyCode } = event;
  if ( keyCode === 38 || keyCode === 87 ) { keys[0] = false; }
  if ( keyCode === 40 || keyCode === 83 ) { keys[1] = false; }
  if ( keyCode === 37 || keyCode === 65 ) { keys[2] = false; }
  if ( keyCode === 39 || keyCode === 68 ) { keys[3] = false; }
}

function pause() {
  if ( paused ) {
    loop();
    paused = false;
    jsStartGame( true );
  } else {
    noLoop();
    paused = true;
  }
}

function newGame() {
  player.reset();
  game.newGame();
}

function getNextScore( index ) {
  return index < game.scores.length ?
    game.scores[ index ] :
    0;
}

function drawPolygon( cx, cy, r, numSides, weight, color ) {
  const angle = TWO_PI / numSides;
  noFill();

  ctx.strokeStyle = color;
  ctx.lineWidth = weight;

  ctx.beginPath();
  ctx.moveTo( cx + r, cy );
  for ( let i = 1; i < numSides; i++ ) {
    ctx.lineTo(
      cx + r * Math.cos( angle * i ),
      cy + r * Math.sin( angle * i )
    );
  }
  ctx.closePath();
}

function easeInExpo( x, t, b, c, d ) {
  return t === 0 ? b : c * Math.pow( 2, 10 * ( t / d - 1 ) ) + b;
}


function sign( x0, y0, x1, y1, x2, y2 ) {
  return ( x0 - x2 ) * ( y1 - y2 ) - ( x1 - x2 ) * ( y0 - y2 );
}

function pointInTriangle( x, y, x0, y0, x1, y1, x2, y2 ) {
  const b0 = sign( x, y, x0, y0, x1, y1 ) < 0;
  const b1 = sign( x, y, x1, y1, x2, y2 ) < 0;
  const b2 = sign( x, y, x2, y2, x0, y0 ) < 0;

  return ( ( b0 === b1 ) && ( b1 === b2 ) );
}

// Thanks, Casey!! :)
// Code adapted from Paul Bourke:
// http://local.wasp.uwa.edu.au/~pbourke/geometry/sphereline/raysphere.c
function circleLineIntersection( cx, cy, r, x0, y0, x1, y1 ) {
  const dx = x1 - x0;
  const dy = y1 - y0;

  // Transform to circle space.
  x0 -= cx;
  y0 -= cy;

  // Compute coefficients.
  const a = ( dx * dx ) + ( dy * dy );
  const b = 2 * ( x0 * dx + y0 * dy );
  const c = ( x0 * x0 ) + ( y0 * y0 ) - ( r * r );

  // Compute discriminant.
  const d = b * b - 4 * a * c;
  // No intersection.
  if ( d < 0 ) {
    return false;
  }

  // One or two intersections.
  return true;
}

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

class Layer {
  constructor( numSides, width, height, type ) {
    this.numSides = numSides;
    this.layerWidth = width;
    this.layerHeight = height;

    this.startVertex = 0;
    this.ringWeight = 6;

    this.distance = 1;
    this.easedDistance = 0;

    this.passed = false;
    this.type = type;

    if ( this.type === 'active' ) {
      const startVertex = this.startVertex = Math.floor( Math.random() * numSides );

      const halfWidth      = this.layerWidth  / 2;
      const halfHeight     = this.layerHeight / 2;
      const halfRingWeight = this.ringWeight  / 2;

      const angle = TWO_PI / this.numSides;

      const angleA = angle * startVertex;
      const angleB = angle * ( startVertex - 1 );

      const ax = halfWidth  + ( halfWidth  - halfRingWeight ) * Math.cos( angleA );
      const ay = halfHeight + ( halfHeight - halfRingWeight ) * Math.sin( angleA );
      const bx = halfWidth  + ( halfWidth  - halfRingWeight ) * Math.cos( angleB );
      const by = halfHeight + ( halfHeight - halfRingWeight ) * Math.sin( angleB );

      this.tree = new Tree( 11,
        new Branch(
          new THREE.Vector3( ax, ay ),
          new THREE.Vector3( bx, by ),
          new THREE.Vector3(
            lerp( ax, halfWidth,  0.7 ),
            lerp( ay, halfHeight, 0.7 )
          )
        )
      );
    }
    else {
      this.tree = new Tree();
    }
  }

  updateDist( increment ) {
    this.distance += increment;
    this.easedDistance = easeInExpo( this.distance, this.distance, 0, 1, 1 );
    if ( this.easedDistance >= map( game.speed, 0.0025, 0.008, 0.999, 0.9 ) &&
         this.easedDistance <= map( game.speed, 0.0025, 0.008, 1.02, 1.04 ) ) {
      if ( this.type === 'active' ) {
        this.tree.checkCollisions();
      } else if ( this.type === 'level' ) {
        if ( game.speed !== game.speeds[ game.level - 1 ] ) {
          game.speed = game.speeds[ game.level - 1 ];
          jsIncrementLevel();
        }
      }
    } else if ( this.easedDistance > 1 && !this.passed && this.type === 'active' ) {
      this.passed = true;
      game.score += 100;
      jsUpdateScore( game.score );
      jsTriggerBell();
    }
  }

  getNumSides() {
    return this.numSides;
  }

  reset( type ) {
    this.type = type;
    this.distance = 0;
    this.easedDistance = 0;
    this.passed = false;
    this.tree.reset();
  }

  render() {
    if ( this.type === 'active' ) {
      this.tree.render(
        lerp( canvas.width  / 2, originX, this.easedDistance ),
        lerp( canvas.height / 2, originY, this.easedDistance ),
        this.layerWidth  * this.easedDistance,
        this.layerHeight * this.easedDistance,
        this.easedDistance
      );
    }
    else if ( this.type === 'level' ) {
      if ( this.easedDistance < 0.8 ) {
        fill( map( this.easedDistance, 0.0, 0.8, 255, 100 ) );
      }
      else {
        const alpha = ( this.easedDistance > 2 ) ?
          Math.floor( map( this.easedDistance, 2, 8, 255, 0 ) ) :
          255;
        fill( 100, alpha );
      }
      noStroke();
      shape(
        levelText[ game.level - 2 ],
        lerp( canvas.width  / 2, originX, this.easedDistance ),
        lerp( canvas.height / 2, originY, this.easedDistance ),
        levelText[ game.level - 2 ].width  * this.easedDistance,
        levelText[ game.level - 2 ].height * this.easedDistance
      );
    }

    const c = color( 100 );
    drawPolygon(
      lerp( canvas.width  / 2, originX, this.easedDistance ),
      lerp( canvas.height / 2, originY, this.easedDistance ),
      ( this.layerWidth - this.ringWeight ) * this.easedDistance / 2,
      this.numSides,
      this.ringWeight * this.easedDistance,
      c
    );
  }
}

class Tree {
  constructor( numBranches, trunk ) {
    this.numBranches = numBranches;
    this.branches = [];
    for ( let i = 0; i < 16; i++ ) {
      this.branches[i] = new Branch();
    }

    this.index = 0;
    this.trunkLength = 0;

    if ( trunk ) {
      const [ v0, v1, v2 ] = trunk;

      this.branches[ this.index ] = trunk;
      this.index++;
      this.trunkLength = dist(
        lerp( v0.x, v1.x, 0.5 ),
        lerp( v0.y, v1.y, 0.5 ),
        v2.x, v2.y
      );

      this.populateRandomBranches( this.branches[0], Math.random() );
    }
  }

  populateRandomBranches( trunk, sides ) {
    let side;
    if ( sides > 0.2 ) {
      side = 2;
    } else {
      side = Math.floor( Math.random() * 2 );
    }

    const [ v0, v1, v2 ] = trunk.vertices;

    const halfWidth  = canvas.width  / 2;
    const halfHeight = canvas.height / 2;

    if ( ( side === 1 || side === 2 ) && this.index < this.numBranches ) {
      const angle  = angleTo( v2, v0 ) + Math.random() * HALF_PI;
      const length = dist( v2.x, v2.y, v0.x, v0.y ) * 0.7;

      if ( length > ( this.trunkLength * 0.4 ) ) {
        // Check if the random angle will fit inside the circle.
        const xi = v2.x + length * Math.cos( angle );
        const yi = v2.y + length * Math.sin( angle );

        if ( dist( xi, yi, halfWidth, halfHeight ) < halfWidth ) {
          this.branches[ this.index ] = new Branch(
            new THREE.Vector3( v2.x, v2.y ),
            new THREE.Vector3(
              lerp( v2.x, v1.x, 0.3 ),
              lerp( v2.y, v1.y, 0.3 )
            ),
            new THREE.Vector3( xi, yi )
          );

          this.index++;
          this.populateRandomBranches(
            this.branches[ this.index - 1 ],
            Math.random()
          );
          // Check if the min or max angle fit inside the area.
        }
        else if (
          dist(
            v2.x + length * Math.cos( angleTo( v2, v0 ) + HALF_PI ),
            v2.y + length * Math.sin( angleTo( v2, v0 ) + HALF_PI ),
            halfWidth,
            halfHeight
          ) < halfWidth ||
          dist(
            v2.x + length * Math.cos( angleTo( v2, v0 ) ),
            v2.y + length * Math.sin( angleTo( v2, v0 ) ),
            halfWidth,
            halfHeight
          ) < halfWidth
        ) {
          this.populateRandomBranches( trunk, 1 );
        } // Otherwise, don't do it.
      }
    }

    if ( ( side === 0 || side === 2 ) && this.index < this.numBranches ) {
      const angle  = angleTo( v2, v1 ) - Math.random() * HALF_PI;
      const length = dist( v2.x, v2.y, v1.x, v1.y ) * 0.7;

      if ( length > ( this.trunkLength * 0.4 ) ) {
        // Check if the random angle will fit inside the circle.
        const xi = v2.x + length * Math.cos( angle );
        const yi = v2.y + length * Math.sin( angle );

        if ( dist( xi, yi, halfWidth, halfHeight ) < halfWidth ) {
          this.branches[ this.index ] = new Branch(
            new THREE.Vector3(
              lerp( v2.x, v0.x, 0.3 ),
              lerp( v2.y, v0.y, 0.3 )
            ),
            new THREE.Vector3( v2.x, v2.y ),
            new THREE.Vector3( xi, yi )
          );

          this.index++;
          this.populateRandomBranches(
            this.branches[ this.index - 1 ],
            Math.random()
          );
        }
        else if (
          dist(
            v2.x + length * Math.cos( angleTo( v2, v1 ) - HALF_PI ),
            v2.y + length * Math.sin( angleTo( v2, v1 ) - HALF_PI ),
            halfWidth,
            halfHeight
          ) < halfWidth ||
          dist(
            v2.x + length * Math.cos( angleTo( v2, v1 ) ),
            v2.y + length * Math.sin( angleTo( v2, v1 ) ),
            halfWidth,
            halfHeight
          ) < halfWidth
        ) {
          this.populateRandomBranches( trunk, 0 );
        }
      }
    }
  }

  reset() {
    this.index = 1;
    this.numBranches = game.numBranches;

    for ( let i = 1; i < this.numBranches; i++ ) {
      const branch = this.branches[i];
      branch.brightness = Math.floor( random( 50, 200 ) );
      branch.vertices[0].x = 0;
      branch.vertices[0].y = 0;
    }

    const startVertex = this.startVertex = Math.floor( Math.random() * this.numSides );

    const halfWidth      = this.layerWidth  / 2;
    const halfHeight     = this.layerHeight / 2;
    const halfRingWeight = this.ringWeight  / 2;

    const angle = TWO_PI / this.numSides;

    const angleA = angle * startVertex;
    const angleB = angle * ( startVertex - 1 );

    const ax = halfWidth  + ( halfWidth  - halfRingWeight ) * Math.cos( angleA );
    const ay = halfHeight + ( halfHeight - halfRingWeight ) * Math.sin( angleA );
    const bx = halfWidth  + ( halfWidth  - halfRingWeight ) * Math.cos( angleB );
    const by = halfHeight + ( halfHeight - halfRingWeight ) * Math.sin( angleB );

    const branch = this.branches[0] = new Branch(
      new THREE.Vector3( ax, ay ),
      new THREE.Vector3( bx, by ),
      new THREE.Vector3(
        lerp( ax, canvas.width / 2, 0.7 ),
        lerp( ay, canvas.width / 2, 0.7 )
      )
    );

    const [ v0, v1, v2 ] = branch.vertices;

    this.trunkLength = dist(
      lerp( v0.x, v1.x, 0.5 ),
      lerp( v0.y, v1.y, 0.5 ),
      v2.x, v2.y
    );

    this.populateRandomBranches( branch, 2 );
  }

  checkCollisions() {
    for ( let i = 0; i < this.numBranches; i++ ) {
      const branch = this.branches[i];
      if ( branch.vertices[0].x && branch.vertices[0].y ) {
        branch.playerOverlap();
      }
    }
  }

  render( ox, oy, w, h, easedDist ) {
    for ( let i = 0; i < this.numBranches; i++ ) {
      const branch = this.branches[i];
      if ( branch.vertices[0].x && branch.vertices[0].y ) {
        branch.setPos( ox, oy, w, h, easedDist );
        branch.render( ox, oy, w, h, easedDist );
      }
    }
  }
}

class Player {
  constructor() {
    this.pos = new THREE.Vector3(
      canvas.width  / 2,
      canvas.height / 2
    );

    this.r = 20;
    this.hue = 0;

    this.speed = 6;
    this.vx = 0;
    this.vy = 0;
  }

  reset() {
    this.pos.x = canvas.width / 2;
    this.pos.y = canvas.width / 2;
    this.r = 20;

    this.speed = 6;
    this.vx = 0;
    this.vy = 0;
  }
}

const speeds = [
  0.0025,
  0.003,
  0.0035,
  0.004,
  0.0045,
  0.005,
  0.0055,
  0.006,
  0.0065,
  0.007,
  0.0075,
  0.008
];

const scores = [
  0,
  500,
  2000,
  4000,
  6500,
  9500,
  13000,
  18000,
  24000,
  31000,
  39000,
  48000
];

const branches = [
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  18
];


// Tree has been moved inside layer as an internal class.
class Game {
  constructor() {
    this.score = 0;
    this.layers = [];

    this.drawnPlayer = false;
    this.isGameOver = false;
    this.numBranches = 6;
    this.level = 1;
    this.levelUp = 3;
    this.speed = speeds[0];

    // Make layers.
    for ( let i = 0; i < 13; i++ ) {
      this.layers.push(
        new Layer(
          16,
          canvas.width, canvas.height,
          'inactive'
        )
      );
    }

    // Set the distance var for these 6 layers.
    for ( let i = this.layers.length - 1; i >= 0; i-- ) {
      const layer = this.layers[i];
      layer.distance = 1.3 / this.layers.length * i;
      layer.easedDistance = easeInExpo(
        layer.distance,
        layer.distance,
        0, 1, 1
      );
    }
  }

  update() {
    this.drawnPlayer = false;
    if ( this.isGameOver ) {
      return;
    }

    for ( let i = 0; i < this.layers.length; i++ ) {
      const layer = this.layers[i];
      if ( layer.easedDistance > 8 && i === this.layers.length - 1 ) {
        this.layers.unshift( layer );
        this.layers.pop();
        this.checkLevel();

        if ( this.levelUp === 0 || this.levelUp === 2 ) {
          layer.reset( 'inactive' );
          this.levelUp++;
        } else if ( this.levelUp === 1 ) {
          layer.reset( 'level' );
          this.levelUp++;
        } else {
          layer.reset( 'active' );
        }
      } else {
        layer.updateDist( this.speed );
        if ( !this.isGameOver ) {
          if ( layer.easedDistance >= 1 && !this.drawnPlayer ) {
            this.drawPlayer();
          }

          layer.render();
        }
      }
    }
  }

  drawPlayer() {
    noStroke();
    fill( 0, 100, 100, 200 );

    circle(
      canvas.width  / 2,
      canvas.height / 2,
      player.r * 2
    );

    drawPolygon(
      lerp( canvas.width  / 2, originX, 1 ),
      lerp( canvas.height / 2, originY, 1 ),
      canvas.width / 2,
      16,
      6,
      '#000'
    );

    this.drawnPlayer = true;
  }

  checkLevel() {
    for ( let i = scores.length - 1; i >= 0; i++ ) {
      if ( this.score > scores[i] && this.level < ( i + 1 ) ) {
        this.level = i + 1;
        this.numBranches = branches[i];
        this.levelUp = 0;
        break;
      }
    }
  }

  newGame() {
    this.score = 0;
    this.numBranches = 6;
    this.level = 1;
    this.speed = speeds[0];
    this.isGameOver = false;
    this.layers = [];

    originX = canvas.width  / 2;
    originY = canvas.height / 2;

    for ( let i = 0; i < 13; i++ ) {
      this.layers.push(
        new Layer(
          16,
          canvas.width, canvas.height,
          i < 4 ? 'active' : 'inactive'
        )
      );
    }

    // Set the distance var for these 6 layers.
    for ( let i = this.layers.length - 1; i >= 0; i-- ) {
      const layer = this.layers[i];
      layer.distance = 1.3 / this.layers.length * i;
      layer.easedDistance = easeInExpo(
        layer.distance,
        layer.distance,
        0, 1, 1
      );
    }

    redraw();
  }

  gameOver() {
    if ( !this.isGameOver ) {
      jsGameOver( this.score );
      this.isGameOver = true;
      background( 0, 0, 255 );
      for ( let i = 0; i < this.layers.length; i++ ) {
        this.layers[i].render();
      }

      noLoop();
      paused = true;
    }
  }
}
