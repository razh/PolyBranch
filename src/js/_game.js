import times from 'lodash/utility/times';
import THREE from 'three';
import CANNON from 'cannon';
import { EventEmitter } from 'events';

import renderer from './tests/renderer';
import Cylinder from './cylinder/cylinder';
import Tree from './tree/tree';

import OrbitControls from './../../vendor/controls/OrbitControls';

const vec2 = new THREE.Vector2();
const vec3 = new THREE.Vector3();

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

function convertVertices( threeVertices ) {
  const vertices = [];

  for ( let i = 0, il = threeVertices.length; i < il; i++ ) {
    const { x, y, z } = threeVertices[i];
    vertices.push( x );
    vertices.push( y );
    vertices.push( z );
  }

  return vertices;
}

function convertFaces( threeFaces ) {
  const faces = [];

  for ( let i = 0, il = threeFaces.length; i < il; i++ ) {
    const { a, b, c } = threeFaces[i];
    faces.push( a );
    faces.push( b );
    faces.push( c );
  }

  return faces;
}


function enableBody( body ) {
  body.collisionFilterGroup = 1;
  body.collisionFilterMask = 1;
}

function disableBody( body ) {
  body.collisionFilterGroup = 0;
  body.collisionFilterMask = 0;
}

export default class Game extends EventEmitter {
  constructor( container ) {
    super();

    const clearColor = 0xFFDDEE;
    this.render = renderer( container );
    this.renderer = this.render.renderer;
    this.renderer.setClearColor( clearColor );

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
    camera.position.set( 0, 0, 4 );
    scene.add( camera );

    scene.fog = new THREE.FogExp2( clearColor, 0.02 );

    const cylinder = new Cylinder();
    const material = new THREE.MeshPhongMaterial({
      color: '#f87',
      side: THREE.DoubleSide,
      shading: THREE.FlatShading
    });

    const cylinderMesh = new THREE.Mesh( cylinder.geometry, material );
    scene.add( cylinderMesh );
    cylinderMesh.rotation.x = Math.PI / 2;

    const cylinderMesh2 = new THREE.Mesh( cylinder.geometry, material );
    scene.add( cylinderMesh2 );
    cylinderMesh2.position.z -= cylinder.length;
    cylinderMesh2.rotation.x = -Math.PI / 2;
    cylinderMesh2.rotation.y = Math.PI;

    // Lighting.
    this.light = new THREE.PointLight( '#acf' );

    scene.add( new THREE.AmbientLight( '#556' ) );

    this.scene = scene;
    this.camera = camera;

    this.cylinder = cylinder;
    this.cylinderMeshes = [ cylinderMesh, cylinderMesh2 ];

    // Setup physics.
    this.clock = new THREE.Clock( true );
    this.dt = 1 / 60;

    const world = new CANNON.World();
    this.world = world;

    this.trees = [];

    const treeMaterial = new THREE.MeshPhongMaterial({
      skinning: true,
      color: '#000',
      ambient: '#000',
      shading: THREE.FlatShading
    });

    const scale = 0.6;
    const scaleMatrix = new THREE.Matrix4().makeScale( scale, scale, scale );
    times( 18, () => {
      const tree = new Tree( treeMaterial );
      const { mesh } = tree;
      mesh.geometry.applyMatrix( scaleMatrix );
      mesh.geometry.computeFaceNormals();
      mesh.geometry.computeVertexNormals();

      const angle = Math.random() * 2 * Math.PI;
      mesh.rotation.z = angle + Math.PI / 2;
      mesh.position.x = 0.75 * this.cylinder.radius * Math.cos( angle );
      mesh.position.y = 0.75 * this.cylinder.radius * Math.sin( angle );
      mesh.position.z = -2 * Math.random() * this.cylinder.length;

      scene.add( mesh );

      const { geometry } = tree;
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Trimesh(
          convertVertices( geometry.vertices ),
          convertFaces( geometry.faces )
        )
      });
      body.position.copy( mesh.position );
      body.quaternion.copy( mesh.quaternion );
      world.addBody( body );

      this.trees.push( tree );
    });


    this.createPlayer();
    this.player.add( this.light );
    scene.add( this.player );
    scene.add( this.wireframe );
    world.addBody( this.playerBody );

    this.running = false;
    this.tick = this.tick.bind( this );

    this.keys = [];
    this.onKeyDown = this.onKeyDown.bind( this );
    this.onKeyUp = this.onKeyUp.bind( this );

    document.addEventListener( 'keydown', this.onKeyDown );
    document.addEventListener( 'keyup', this.onKeyUp );

    window.addEventListener( 'resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    this.reset();
  }

  tick() {
    this.update();
    this.render( this.scene, this.camera );

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
    this.cylinder.update();
    this.cylinderMeshes.map( mesh => {
      const { length } = this.cylinder;
      if ( this.player.position.z < mesh.position.z - length / 2 ) {
        mesh.position.z -= 2 * length;
      }
    });

    const delta = this.clock.getDelta();
    this.world.step( this.dt, delta );

    const dv = 20 * delta;
    if ( this.keys[0] ) { this.player.position.y += dv; }
    if ( this.keys[1] ) { this.player.position.y -= dv; }
    if ( this.keys[2] ) { this.player.position.x -= dv; }
    if ( this.keys[3] ) { this.player.position.x += dv; }
    if ( this.keys[4] ) { this.player.position.z -= dv; }
    if ( this.keys[5] ) { this.player.position.z += dv; }

    const radius = vec2.copy( this.player.position ).length();
    if ( radius > 0.6 * this.cylinder.radius - this.playerRadius ) {
      vec2.setLength( 0.6 * this.cylinder.radius - this.playerRadius );
      this.player.position.x = vec2.x;
      this.player.position.y = vec2.y;
    }

    this.player.rotation.x += this.speed * delta * 1e3;

    this.playerBody.position.copy( this.player.position );
    this.camera.position.z = this.player.position.z + 4;
    vec3.copy( this.player.position ).multiplyScalar( 0.25 );
    vec3.z = this.player.position.z;
    this.camera.lookAt( vec3 );

    // Length of vector ( 1, 1, 1 ).
    const sqrt3 = Math.sqrt( 3 );

    this.trees.forEach( tree => {
      const distance = tree.mesh.position.distanceTo( this.player.position );
      const t = THREE.Math.clamp( ( 64 - distance ) / 64, 0.01, 1 );
      const length = t * sqrt3;
      tree.mesh.skeleton.bones.forEach( ( bone, index ) => {
        bone.scale.setLength( length );

        if ( index > 1 ) {
          bone.rotation.z = bone.startAngle * ( 1 - t );
        }

        bone.updateMatrixWorld();
      });
    });
  }

  createPlayer() {
    const radius = 0.3;
    const geometry = new THREE.IcosahedronGeometry( radius, 1 );
    const material = new THREE.MeshBasicMaterial({
      color: '#222'
    });
    const mesh = new THREE.Mesh( geometry, material );
    this.wireframe = new THREE.WireframeHelper( mesh, 0xdddddd );
    this.wireframe.material.linewidth = 2;

    this.player = mesh;
    this.playerRadius = radius;
    this.playerBody = new CANNON.Body({
      mass: 1,
      // Bump up radius to increase difficulty.
      shape: new CANNON.Sphere( 1.25 * radius )
    });

    this.playerBody.addEventListener( 'collide', () => this.end() );
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

  end() {
    if ( !this.isGameOver ) {
      this.emit( 'end', this.score );
      this.isGameOver = true;
      this.running = false;
    }
  }

  getNextScore( index ) {
    return scores[ index ] || 0;
  }

  reset() {
    this.player.position.set( 0, 0, 0 );
    this.playerBody.position.set( 0, 0, 0 );
    this.speed = speeds[0];
    this.isGameOver = false;
    this.score = 0;
    this.level = 1;
  }

  /*
    Up. W.
    Down. S.
    Left. A.
    Right. D.
   */
  onKeyDown( event ) {
    const { keyCode } = event;
    if ( keyCode === 38 || keyCode === 87 ) { this.keys[0] = true; }
    if ( keyCode === 40 || keyCode === 83 ) { this.keys[1] = true; }
    if ( keyCode === 37 || keyCode === 65 ) { this.keys[2] = true; }
    if ( keyCode === 39 || keyCode === 68 ) { this.keys[3] = true; }
    if ( keyCode === 32 ) { this.keys[4] = true; }
    if ( keyCode === 16 ) { this.keys[5] = true; }
  }

  onKeyUp( event ) {
    const { keyCode } = event;
    if ( keyCode === 38 || keyCode === 87 ) { this.keys[0] = false; }
    if ( keyCode === 40 || keyCode === 83 ) { this.keys[1] = false; }
    if ( keyCode === 37 || keyCode === 65 ) { this.keys[2] = false; }
    if ( keyCode === 39 || keyCode === 68 ) { this.keys[3] = false; }
    if ( keyCode === 32 ) { this.keys[4] = false; }
    if ( keyCode === 16 ) { this.keys[5] = false; }
  }
}
