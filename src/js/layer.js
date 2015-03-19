import THREE from 'three';

import Tree from './tree';
import Branch from './branch';

import {
  easeInExpo,
  lerp,
  map,
  PI2
} from './math';

export default class Layer {
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

      const angle = PI2 / this.numSides;

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
