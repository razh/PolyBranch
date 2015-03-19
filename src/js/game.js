import THREE from 'three';

import Layer from './layer';
import Player from './player';

import {
  angleTo,
  distanceTo,
  easeInExpo,
  lerp
} from './math';

import {
  color,
  circle,
  drawPolygon
} from './canvas';

const keys = [];

let paused;

let player;
let game;

function setup() {
  paused = true;

  background( 230 );

  game = new Game();
  player = new Player( game );
  noLoop();

  processingIsReady();
}

function draw( game ) {
  const {
    canvas,
    originX,
    originY
  } = game;

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
  player.reset( game );
  game.newGame();
}

function getNextScore( index ) {
  return index < game.scores.length ?
    game.scores[ index ] :
    0;
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
    this.canvas = document.querySelector( 'canvas' );
    this.ctx    = this.canvas.getContext( '2d' );

    this.canvas.width  = 800;
    this.canvas.height = 800;

    this.originX = this.canvas.width  / 2;
    this.originY = this.canvas.height / 2;

    this.score  = 0;
    this.layers = [];

    this.drawnPlayer = false;
    this.isGameOver  = false;
    this.numBranches = 6;

    this.level   = 1;
    this.levelUp = 3;
    this.speed   = speeds[0];

    // Make layers.
    for ( let i = 0; i < 13; i++ ) {
      this.layers.push(
        new Layer(
          16,
          this.canvas.width, this.canvas.height,
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
        layer.updateDistance( this, player, this.speed );
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
    const {
      canvas,
      ctx,
      originX,
      originY
    } = this;

    ctx.strokeStyle = 'transparent';
    ctx.fillStyle = color( 0, 100, 100, 200 );

    circle(
      canvas.width  / 2,
      canvas.height / 2,
      player.r * 2
    );

    drawPolygon(
      ctx,
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
    const { canvas } = this;

    this.score = 0;
    this.numBranches = 6;
    this.level = 1;
    this.speed = speeds[0];
    this.isGameOver = false;
    this.layers = [];

    this.originX = canvas.width  / 2;
    this.originY = canvas.height / 2;

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
