import THREE from 'three';

import { PI2 } from './../math';
import Tree from './../tree/tree';
import renderer from './renderer';

import OrbitControls from './../../../vendor/controls/OrbitControls';

function createSphereMesh( radius ) {
  const geometry = new THREE.SphereGeometry( radius, 32, 32 );
  const material = new THREE.MeshBasicMaterial({
    color: '#333'
  });
  return new THREE.Mesh( geometry, material );
}

function render3d() {
  const render = renderer();
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
  camera.position.set( 0, 0, 12 );
  scene.add( camera );

  const controls = new THREE.OrbitControls( camera, renderer.domElement );

  scene.add( new THREE.AmbientLight( '#222' ) );

  const light = new THREE.DirectionalLight( '#fff' );
  light.position.set( 0, 4, 4 );
  scene.add( light );

  const tree = new Tree();
  const { mesh } = tree;
  scene.add( mesh );

  const skeletonHelper = new THREE.SkeletonHelper( mesh );
  skeletonHelper.material.linewidth = 4;
  mesh.add( skeletonHelper );

  const boundingBoxHelper = new THREE.BoundingBoxHelper( mesh );
  mesh.add( boundingBoxHelper );

  const radius = 1;
  const sphereMesh = createSphereMesh( radius );
  const sphere = new THREE.Sphere( sphereMesh.position.clone(), radius );
  scene.add( sphereMesh );

  function animate() {
    // Rotate camera instead of mesh to prevent problems with SkeletonHelper
    // transforms.
    const time = Date.now() * 1e-3;

    const cos = Math.cos( time );
    const sin = Math.sin( time );

    const t = 0.5 * ( cos + 1 );
    // Length of vector ( 1, 1, 1 ).
    const length = t * Math.sqrt( 3 );

    mesh.skeleton.bones.forEach( ( bone, index ) => {
      bone.scale.setLength( length );

      if ( index > 1 ) {
        bone.rotation.z = bone.startAngle * ( 1 - t );
      }

      bone.updateMatrixWorld();
    });

    // Collision.
    sphereMesh.position.set( 4 * cos, 2, 4 * sin );
    sphereMesh.material.color.set( '#fff' );
    sphere.center.copy( sphereMesh.position );
    if ( tree.collides( sphere ) ) {
      sphereMesh.material.color.set( '#fcc' );
    }

    skeletonHelper.update();
    boundingBoxHelper.update();

    render( scene, camera );
    requestAnimationFrame( animate );
  }

  animate();
}

function render2d() {
  const canvas = document.createElement( 'canvas' );
  const ctx    = canvas.getContext( '2d' );

  const size = 640;
  canvas.width  = size;
  canvas.height = size;
  document.body.appendChild( canvas );

  function drawPolygon( ctx, vertices ) {
    if ( !vertices.length ) {
      return;
    }

    ctx.beginPath();

    ctx.moveTo( vertices[0][0], vertices[0][1] );
    for ( let i = 1, il = vertices.length; i < il; i++ ) {
      ctx.lineTo( vertices[i][0], vertices[i][1] );
    }

    ctx.closePath();

    ctx.fill();
    ctx.stroke();
  }

  // Bottom-heavy trapezoid.
  function createTrapezoid( bottomWidth, topWidth, height ) {
    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth    = topWidth    / 2;

    // Counter-clockwise from bottom-left.
    const vertices = [
      [ -halfBottomWidth, 0      ],
      [  halfBottomWidth, 0      ],
      [  halfTopWidth,    height ],
      [ -halfTopWidth,    height ]
    ];

    return {
      vertices,

      draw( ctx ) {
        drawPolygon( ctx, vertices );
      },

      transform( ctx ) {
        ctx.save();
        ctx.translate( 0, height );
      }
    };
  }

  function createEquilateralTriangle( length ) {
    const halfLength = length / 2;

    const height = Math.sqrt( 3 ) * halfLength;
    const halfHeight = height / 2;

    // Counter-clockwise from bottom-left.
    const vertices = [
      [ -halfLength, 0      ],
      [  halfLength, 0      ],
      [  0,          height ]
    ];

    return {
      vertices,

      draw( ctx ) {
        drawPolygon( ctx, vertices );
      },

      transformLeft( ctx ) {
        ctx.save();
        // Move to side bisector.
        ctx.translate( -halfLength / 2, halfHeight );
        ctx.rotate( THREE.Math.degToRad( 60 ) );
      },

      transformRight( ctx ) {
        ctx.save();
        ctx.translate( halfLength / 2, halfHeight );
        ctx.rotate( THREE.Math.degToRad( -60 ) );
      }
    };
  }

  // Branches.
  function createIsocelesTriangle( width, height ) {
    const halfWidth = width / 2;

    const vertices = [
      [ -halfWidth, 0      ],
      [  halfWidth, 0      ],
      [  0,         height ]
    ];

    return {
      vertices,

      draw( ctx ) {
        drawPolygon( ctx, vertices );
      }
    };
  }

  const trapA = createTrapezoid( 120, 70, 120 );
  const triA  = createEquilateralTriangle( 70 );
  const triB  = createIsocelesTriangle( 70, 180 );
  const trapB = createTrapezoid( 70, 30, 80 );
  const triC  = createEquilateralTriangle( 30 );
  const triD  = createIsocelesTriangle( 30, 100 );

  // Center and flip y-axis.
  ctx.translate( size / 2, size / 2 );
  ctx.scale( 1, -1 );

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  trapA.draw( ctx );

  trapA.transform( ctx );
  triA.draw( ctx );

  triA.transformLeft( ctx );
  triB.draw( ctx );
  ctx.restore();

  triA.transformRight( ctx );
  trapB.draw( ctx );

  trapB.transform( ctx );
  triC.draw( ctx );

  triC.transformRight( ctx );
  triD.draw( ctx );
}

export default function() {
  render3d();
}
