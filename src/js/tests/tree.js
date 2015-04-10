import THREE from 'three';

import Tree, {
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

  const trapezoid = new TrapezoidalPrism( 2, 1, 1.5, 1 );
  const triangle = new EquilateralTriangularPrism( 1, 1, 'right' );
  const trapezoidA = new TrapezoidalPrism( 1, 0.75, 1.5, 1 );
  const pyramid = new Pyramid( 1, 5, 1 );
  const pyramidA = new Pyramid( 0.75, 2, 1 );

  trapezoid.add( triangle );
  triangle.add( trapezoidA, 'left' );
  triangle.add( pyramid, 'right' );
  trapezoidA.add( pyramidA );

  const geometry = new THREE.Geometry();

  geometry.bones = [
    {
      parent: -1,
      name: 'root',
      pos: [ 0, 0, 0 ],
      rotq: [ 0, 0, 0, 1 ]
    }
  ];

  trapezoid.traverse( object => {
    const offset = geometry.vertices.length;
    const tempGeometry = object.createGeometry( offset );
    geometry.merge( tempGeometry );
    object.createBone( geometry );
  });

  const material = new THREE.MeshBasicMaterial({
    skinning: true,
    wireframe: true
  });

  const mesh = new THREE.SkinnedMesh( geometry, material );
  scene.add( mesh );

  const skeletonHelper = new THREE.SkeletonHelper( mesh );
  skeletonHelper.material.linewidth = 4;
  mesh.add( skeletonHelper );

  function animate() {
    // Rotate camera instead of mesh to prevent problems with SkeletonHelper
    // transforms.
    const time = Date.now() * 1e-3;
    camera.position.x = cameraRadius * Math.cos( time );
    camera.position.z = cameraRadius * Math.sin( time );
    camera.lookAt( mesh.position );
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
