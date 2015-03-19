import THREE from 'three';

import Branch from './branch';

import {
  angleTo,
  HALF_PI,
  distanceTo,
  lerp,
  random,
  PI2
} from './math';

export default class Tree {
  constructor( game, branchCount, trunk ) {
    this.branchCount = branchCount;
    this.branches    = [];

    for ( let i = 0; i < 16; i++ ) {
      this.branches[i] = new Branch();
    }

    this.index  = 0;
    this.trunkLength = 0;

    if ( trunk ) {
      const [ v0, v1, v2 ] = trunk.vertices;

      this.branches[ this.index ] = trunk;
      this.index++;
      this.trunkLength = distanceTo(
        lerp( v0.x, v1.x, 0.5 ),
        lerp( v0.y, v1.y, 0.5 ),
        v2.x, v2.y
      );

      this.populateRandomBranches( game, this.branches[0], Math.random() );
    }
  }

  populateRandomBranches( game, trunk, sides ) {
    const { canvas } = game;

    const side = sides > 0.2 ? 2 : Math.floor( Math.random() * 2 );

    const [ v0, v1, v2 ] = trunk.vertices;

    const halfWidth  = canvas.width  / 2;
    const halfHeight = canvas.height / 2;

    if ( ( side === 1 || side === 2 ) && this.index < this.branchCount ) {
      const angle  = angleTo( v2, v0 ) + Math.random() * HALF_PI;
      const length = distanceTo( v2.x, v2.y, v0.x, v0.y ) * 0.7;

      if ( length > ( this.trunkLength * 0.4 ) ) {
        // Check if the random angle will fit inside the circle.
        const xi = v2.x + length * Math.cos( angle );
        const yi = v2.y + length * Math.sin( angle );

        if ( distanceTo( xi, yi, halfWidth, halfHeight ) < halfWidth ) {
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
            game,
            this.branches[ this.index - 1 ],
            Math.random()
          );
          // Check if the min or max angle fit inside the area.
        }
        else if (
          distanceTo(
            v2.x + length * Math.cos( angleTo( v2, v0 ) + HALF_PI ),
            v2.y + length * Math.sin( angleTo( v2, v0 ) + HALF_PI ),
            halfWidth,
            halfHeight
          ) < halfWidth ||
          distanceTo(
            v2.x + length * Math.cos( angleTo( v2, v0 ) ),
            v2.y + length * Math.sin( angleTo( v2, v0 ) ),
            halfWidth,
            halfHeight
          ) < halfWidth
        ) {
          this.populateRandomBranches( game, trunk, 1 );
        } // Otherwise, don't do it.
      }
    }

    if ( ( side === 0 || side === 2 ) && this.index < this.branchCount ) {
      const angle  = angleTo( v2, v1 ) - Math.random() * HALF_PI;
      const length = distanceTo( v2.x, v2.y, v1.x, v1.y ) * 0.7;

      if ( length > ( this.trunkLength * 0.4 ) ) {
        // Check if the random angle will fit inside the circle.
        const xi = v2.x + length * Math.cos( angle );
        const yi = v2.y + length * Math.sin( angle );

        if ( distanceTo( xi, yi, halfWidth, halfHeight ) < halfWidth ) {
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
            game,
            this.branches[ this.index - 1 ],
            Math.random()
          );
        }
        else if (
          distanceTo(
            v2.x + length * Math.cos( angleTo( v2, v1 ) - HALF_PI ),
            v2.y + length * Math.sin( angleTo( v2, v1 ) - HALF_PI ),
            halfWidth,
            halfHeight
          ) < halfWidth ||
          distanceTo(
            v2.x + length * Math.cos( angleTo( v2, v1 ) ),
            v2.y + length * Math.sin( angleTo( v2, v1 ) ),
            halfWidth,
            halfHeight
          ) < halfWidth
        ) {
          this.populateRandomBranches( game, trunk, 0 );
        }
      }
    }
  }

  reset( game, layer, sideCount ) {
    const { canvas } = game;

    this.index = 1;
    this.branchCount = game.branchCount;

    for ( let i = 1; i < this.branchCount; i++ ) {
      const branch = this.branches[i];
      branch.brightness = Math.floor( random( 50, 200 ) );
      branch.vertices[0].x = 0;
      branch.vertices[0].y = 0;
    }

    const startVertex = this.startVertex = Math.floor( Math.random() * sideCount );

    const halfWidth      = layer.layerWidth  / 2;
    const halfHeight     = layer.layerHeight / 2;
    const halfRingWeight = layer.ringWeight  / 2;

    const angle = PI2 / sideCount;

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

    this.trunkLength = distanceTo(
      lerp( v0.x, v1.x, 0.5 ),
      lerp( v0.y, v1.y, 0.5 ),
      v2.x, v2.y
    );

    this.populateRandomBranches( game, branch, 2 );
  }

  checkCollisions( game ) {
    for ( let i = 0; i < this.branchCount; i++ ) {
      const branch = this.branches[i];
      if ( branch.vertices[0].x && branch.vertices[0].y ) {
        branch.playerOverlap( game );
      }
    }
  }

  render( ctx, originX, originY, width, height, easedDistance ) {
    for ( let i = 0; i < this.branchCount; i++ ) {
      const branch = this.branches[i];
      if ( branch.vertices[0].x && branch.vertices[0].y ) {
        branch.setPosition( originX, originY, width, height, easedDistance );
        branch.render( ctx, originX, originY, width, height, easedDistance );
      }
    }
  }
}
