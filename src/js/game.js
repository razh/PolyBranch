import THREE from 'three';

import Layer from './layer';
import Player from './player';

import {
  angleTo,
  distanceTo,
  easeInExpo,
  lerp,
  PI2
} from './math';

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
  ctx.arc( x, y, r, 0, PI2 );
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

  background( 230 );

  player = new Player();
  game = new Game();
  noLoop();

  processingIsReady();
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
      if ( vy < 0 && distanceTo( x, y, originX, originY + vy ) > distance ) {
        player.vy = 0;
      }
      player.vy += 0.3;
    }

    if ( keys[1] ) {
      if ( vy > 0 && distanceTo( x, y, originX, originY + vy ) > distance ) {
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
      if ( vx < 0 && distanceTo( x, y, originX + vx, originY ) > distance ) {
        player.vx = 0;
      }
      player.vx += 0.3;
    }

    if ( keys[3] ) {
      if ( vx > 0 && distanceTo( x, y, originX + vx, originY ) > distance ) {
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

  if ( distanceTo( x, y, originX, originY ) > distance ) {
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
  const angle = PI2 / numSides;
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
