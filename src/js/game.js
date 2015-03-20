import THREE from 'three';
import { EventEmitter } from 'events';

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
export default class Game extends EventEmitter {
  constructor( canvas ) {
    this.canvas = canvas;
    this.ctx    = this.canvas.getContext( '2d' );

    this.canvas.width  = 800;
    this.canvas.height = 800;
    this.background    = color( 230 );

    this.originX = this.canvas.width  / 2;
    this.originY = this.canvas.height / 2;

    this.layers = [];

    this.player = new Player( this );
    this.keys   = [];

    this.drawnPlayer = false;
    this.isGameOver  = false;

    this.score   = 0;
    this.level   = 1;
    this.levelUp = 3;

    this.speed       = speeds[0];
    this.speeds      = speeds;
    this.branchCount = 6;

    this.running = false;

    // Make layers.
    for ( let i = 0; i < 13; i++ ) {
      this.layers.push(
        new Layer(
          this,
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

    this.tick = this.tick.bind( this );

    this.onMouseDown = this.onMouseDown.bind( this );
    this.onKeyDown = this.onKeyDown.bind( this );
    this.onKeyUp = this.onKeyUp.bind( this );

    document.addEventListener( 'mousedown', this.onMouseDown );
    document.addEventListener( 'keydown', this.onKeyDown );
    document.addEventListener( 'keyup', this.onKeyUp );
  }

  tick() {
    this.draw();

    if ( this.running ) {
      requestAnimationFrame( this.tick );
    }
  }

  toggle() {
    if ( !this.running ) {
      this.running = true;
      this.emit( 'start', true );
      this.tick();
    } else {
      this.running = false;
    }
  }

  update() {
    this.drawnPlayer = false;

    for ( let i = 0; i < this.layers.length; i++ ) {
      if ( !this.isGameOver ) {
        const layer = this.layers[i];
        if ( layer.easedDistance > 8 && i === this.layers.length - 1 ) {
          this.layers.unshift( layer );
          this.layers.pop();
          this.checkLevel();

          if ( this.levelUp === 0 || this.levelUp === 2 ) {
            layer.reset( this, 'inactive' );
            this.levelUp++;
          } else if ( this.levelUp === 1 ) {
            layer.reset( this, 'level' );
            this.levelUp++;
          } else {
            layer.reset( this, 'active' );
          }
        } else {
          layer.updateDistance( this );
          if ( !this.isGameOver ) {
            if ( layer.easedDistance >= 1 && !this.drawnPlayer ) {
              this.drawPlayer();
            }

            layer.render( this );
          }
        }
      }
    }
  }

  draw() {
    const {
      canvas,
      ctx,
      player,
      keys,
      speed,
      originX,
      originY
    } = this;

    ctx.fillStyle = this.background;
    ctx.fillRect( 0, 0, canvas.width, canvas.height );

    if ( keys[0] || keys[1] || keys[2] || keys[3] ) {
      player.hue += speed * 100;
      if ( player.hue > 255 ) {
        player.hue = 0;
      }
    }

    const {
      position: { x, y },
      velocity: {
        x: vx,
        y: vy
      },
      radius
    } = player;

    const halfHeight = canvas.height / 2;
    const distance   = halfHeight - radius - 8;

    if ( keys[0] || keys[1] ) {
      if ( keys[0] ) {
        if ( vy < 0 && distanceTo( x, y, originX, originY + vy ) > distance ) {
          player.velocity.y = 0;
        }
        player.velocity.y += 0.3;
      }

      if ( keys[1] ) {
        if ( vy > 0 && distanceTo( x, y, originX, originY + vy ) > distance ) {
          player.velocity.y = 0;
        }
        player.velocity.y -= 0.3;
      }
    } else if ( vy > 0 ) {
      player.velocity.y = Math.max( vy - 0.5, 0 );
    } else if ( vy < 0 ) {
      player.velocity.y = Math.min( vy + 0.5, 0 );
    }

    if ( keys[2] || keys[3] ) {
      if ( keys[2] ) {
        if ( vx < 0 && distanceTo( x, y, originX + vx, originY ) > distance ) {
          player.velocity.x = 0;
        }
        player.velocity.x += 0.3;
      }

      if ( keys[3] ) {
        if ( vx > 0 && distanceTo( x, y, originX + vx, originY ) > distance ) {
          player.velocity.x = 0;
        }
        player.velocity.x -= 0.3;
      }
    } else if ( vx ) {
      player.velocity.x = Math.max( vx - 0.5, 0 );
    } else if ( vx < 0 ) {
      player.velocity.x = Math.min( vx + 0.5, 0 );
    }

    this.originX += player.velocity.x;
    this.originY += player.velocity.y;

    if ( distanceTo( x, y, this.originX, this.originY ) > distance ) {
      const angle = angleTo(
        player.position,
        new THREE.Vector3( this.originX, this.originY )
      ) - Math.PI;

      this.originX = x + distance * Math.cos( angle );
      this.originY = y + distance * Math.sin( angle );
    }

    this.background = color( 255 );
    this.update();
  }

  drawPlayer() {
    const {
      canvas,
      ctx,
      player,
      originX,
      originY
    } = this;

    ctx.strokeStyle = 'transparent';
    ctx.fillStyle = color( 0, 100, 100, 200 );

    circle(
      ctx,
      canvas.width  / 2,
      canvas.height / 2,
      player.radius
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
    for ( let i = scores.length - 1; i >= 0; i-- ) {
      if ( this.score > scores[i] && this.level < ( i + 1 ) ) {
        this.level       = i + 1;
        this.branchCount = branches[i];
        this.levelUp     = 0;
        break;
      }
    }
  }

  getNextScore( index ) {
    return scores[ index ] || 0;
  }

  reset() {
    const { canvas } = this;
    this.player.reset( this );

    this.layers = [];

    this.isGameOver = false;

    this.score = 0;
    this.level = 1;

    this.branchCount = 6;
    this.speed       = speeds[0];

    this.originX = canvas.width  / 2;
    this.originY = canvas.height / 2;

    for ( let i = 0; i < 13; i++ ) {
      this.layers.push(
        this,
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

    this.draw();
  }

  end() {
    if ( !this.isGameOver ) {
      this.emit( 'end', this.score );
      this.isGameOver = true;
      this.background = color( 0, 0, 255 );
      for ( let i = 0; i < this.layers.length; i++ ) {
        this.layers[i].render( this );
      }

      this.running = false;
    }
  }

  onMouseDown() {
    this.player.speed++;
  }

  onKeyDown( event ) {
    const { keyCode } = event;
    // Up. W.
    if ( keyCode === 38 || keyCode === 87 ) { this.keys[0] = true; }
    // Down. S.
    if ( keyCode === 40 || keyCode === 83 ) { this.keys[1] = true; }
    // Left. A.
    if ( keyCode === 37 || keyCode === 65 ) { this.keys[2] = true; }
    // Right. D.
    if ( keyCode === 39 || keyCode === 68 ) { this.keys[3] = true; }
  }

  onKeyUp( event ) {
    const { keyCode } = event;
    if ( keyCode === 38 || keyCode === 87 ) { this.keys[0] = false; }
    if ( keyCode === 40 || keyCode === 83 ) { this.keys[1] = false; }
    if ( keyCode === 37 || keyCode === 65 ) { this.keys[2] = false; }
    if ( keyCode === 39 || keyCode === 68 ) { this.keys[3] = false; }
  }
}
