import THREE from 'three';

import Tree from './../tree/tree';

function render3d() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
  camera.position.set( 0, 0, 8 );
  scene.add( camera );

  const meshes = [];

  const material = new THREE.MeshBasicMaterial({ wireframe: true });
  const tree = new Tree();

  (() => {
    const geometry = tree.createTrapezoidalPrism( null, 2, 1, 1, 1 );
    const mesh = new THREE.Mesh( geometry, material );
    meshes.push( mesh );
    scene.add( mesh );
  })();

  (() => {
    const geometry = tree.createEquilateralTriangularPrism( null, 1, 1 );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.y = 1;
    meshes.push( mesh );
    scene.add( mesh );
  })();

  function animate() {
    meshes.map( mesh => mesh.rotation.y += 0.01 );
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
  }

  animate();
}

function render2d() {
  const canvas = document.createElement( 'canvas' );
  const ctx     = canvas.getContext( '2d' );

  const size = 640;
  canvas.width  = size;
  canvas.height = size;
  document.body.appendChild( canvas );

  // Bottom-heavy trapezoid.
  function createTrapezoid( bottomWidth, topWidth, height ) {
    const halfBottomWidth = bottomWidth / 2;
    const halfTopWidth    = topWidth    / 2;

    return {
      draw( ctx ) {
        ctx.beginPath();

        // Counter-clockwise from bottom-left.
        ctx.moveTo( -halfBottomWidth, 0 );
        ctx.lineTo(  halfBottomWidth, 0 );
        ctx.lineTo(  halfTopWidth,    height );
        ctx.lineTo( -halfTopWidth,    height );

        ctx.closePath();

        ctx.fill();
        ctx.stroke();
      },

      transform( ctx ) {
        ctx.save();
        ctx.translate( 0, height );
      }
    };
  }

  function createEquilateralTriangle( length ) {
    const height = ( Math.sqrt( 3 ) / 2 ) * length;

    const halfLength = length / 2;
    const halfHeight = height / 2;

    return {
      draw( ctx ) {
        ctx.beginPath();

        // Counter-clockwise from bottom-left.
        ctx.moveTo( -halfLength, 0 );
        ctx.lineTo(  halfLength, 0 );
        ctx.lineTo(  0,          height );

        ctx.fill();
        ctx.stroke();
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
    const halfWidth  = width / 2;

    return {
      draw( ctx ) {
        ctx.beginPath();

        ctx.moveTo( -halfWidth, 0 );
        ctx.lineTo(  halfWidth, 0 );
        ctx.lineTo(  0,         height );

        ctx.fill();
        ctx.stroke();
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
