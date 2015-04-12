import THREE from 'three';

import { PI2 } from './../math';

import Tree, {
  Base,
  TrapezoidalPrism,
  EquilateralTriangularPrism,
  Pyramid
} from './../tree/tree';

function render3d() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
  const cameraRadius = 8;
  camera.position.set( 0, 0, cameraRadius );
  scene.add( camera );

  scene.add( new THREE.AmbientLight( '#222' ) );

  const light = new THREE.DirectionalLight( '#fff' );
  light.position.set( 0, 4, 4 );
  scene.add( light );

  // Geometry.
  const base = new Base( 2 );
  const trapezoid = new TrapezoidalPrism( 1, 1.5, 1.5 );
  const triangle = new EquilateralTriangularPrism( 1, 1 );

  const pyramidRight = new Pyramid( 5 );

  const trapezoidLeft = new TrapezoidalPrism( 0.75, 1.5, 0.5 );
  const triangleLeft = new EquilateralTriangularPrism( 1, 1 );
  const pyramidLeftLeft = new Pyramid( 2 );
  const pyramidLeftRight = new Pyramid( 3 );

  base.add( trapezoid );
  trapezoid.add( triangle );
  triangle.add( trapezoidLeft, 'left' );
  triangle.add( pyramidRight, 'right' );
  trapezoidLeft.add( triangleLeft );
  triangleLeft.add( pyramidLeftLeft, 'left' );
  triangleLeft.add( pyramidLeftRight, 'right' );

  const geometry = new THREE.Geometry();
  geometry.bones = [];

  base.traverse( object => {
    const offset = geometry.vertices.length;
    const tempGeometry = object.createGeometry( offset );
    geometry.vertices.push( ...tempGeometry.vertices );
    geometry.faces.push( ...tempGeometry.faces );
    object.createBone( geometry );
  });

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhongMaterial({
    // wireframe: true,
    skinning: true,
    shading: THREE.FlatShading
  });

  const mesh = new THREE.SkinnedMesh( geometry, material );
  scene.add( mesh );

  const skeletonHelper = new THREE.SkeletonHelper( mesh );
  skeletonHelper.material.linewidth = 4;
  mesh.add( skeletonHelper );

  // Traverse bones and determine start heading angle.
  const vector = new THREE.Vector3();

  mesh.skeleton.bones.forEach( bone => {
    bone.startAngle = 0;

    const { parent } = bone;
    if ( !parent ) {
      return;
    }

    const grandparent = parent.parent;
    if ( !grandparent ) {
      return;
    }

    /*
      (x, y)
        o
          \
           \  (x1, y1)
            o
            |
            |
            o (x0, y0)
     */

    const { x, y } = vector.setFromMatrixPosition( bone.matrixWorld );
    const { x: x1, y: y1 } = vector.setFromMatrixPosition( parent.matrixWorld );
    const { x: x0, y: y0 } = vector.setFromMatrixPosition( grandparent.matrixWorld );

    const cross = ( x - x0 ) * ( y1 - y0 ) - ( y - y0 ) * ( x1 - x0 );

    // Left.
    if ( cross < 0 ) { bone.startAngle = -Math.PI / 3; }
    // Right.
    if ( cross > 0 ) { bone.startAngle =  Math.PI / 3; }
  });

  function animate() {
    // Rotate camera instead of mesh to prevent problems with SkeletonHelper
    // transforms.
    const time = Date.now() * 1e-3;
    camera.position.x = cameraRadius * Math.cos( time );
    camera.position.z = cameraRadius * Math.sin( time );
    camera.lookAt( mesh.position );

    const cos = Math.cos( time );

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

    skeletonHelper.update();
    renderer.render( scene, camera );
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
