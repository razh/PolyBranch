import THREE from 'three';

const geometry = new THREE.PlaneBufferGeometry( 2, 2 );

const vertexShader = `
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
`;

const renderer = new THREE.WebGLRenderer({ preserveDepthBuffer: true });

const camera = new THREE.OrthographicCamera(
  -1, 1,
  -1, 1,
  -1, 1
);

const scene = new THREE.Scene();

export default function renderToImage( fragmentShader, size ) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      resolution: {
        type: 'v2',
        value: new THREE.Vector2( size, size )
      }
    },
    vertexShader,
    fragmentShader
  });

  const mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  renderer.setSize( size, size );
  renderer.render( scene, camera );
  scene.remove( mesh );

  return renderer.domElement.toDataURL();
}
