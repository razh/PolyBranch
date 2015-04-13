import THREE from 'three';
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();
const noise3D = simplex.noise3D.bind( simplex );

export function fbm( x, y, z, {
  octaves    = 6,
  period     = 4,
  lacunarity = 2,
  gain       = 0.5
}) {
  let frequency = 1 / period;
  let amplitude = gain;

  let sum = 0;

  for ( let j = 0; j < octaves; j++ ) {
    sum += amplitude * noise3D(
      x * frequency,
      y * frequency,
      z * frequency
    );

    frequency *= lacunarity;
    amplitude *= gain;
  }

  return sum;
}

export default class Cylinder {
  constructor() {
    this.radius = 4;
    this.length = 64;
    this.count  = 16;

    // Height map scale.
    this.scale  = 0.5;

    const geometry = new THREE.CylinderGeometry(
      this.radius, this.radius,
      this.length,
      this.count - 1, this.count - 1,
      true
    );

    this.geometry = geometry;

    // Precompute angles and positions.
    this.staticGeometry = geometry.clone();
    this.angles = [];
    for ( let i = 0, il = this.geometry.vertices.length; i < il; i++ ) {
      const vertex = this.geometry.vertices[i];
      this.angles.push( Math.atan2( vertex.x, vertex.z ) );
    }
  }

  update() {
    const t = Date.now() * 2e-4;

    for ( let i = 0, il = this.geometry.vertices.length; i < il; i++ ) {
      const vertex = this.geometry.vertices[i];
      const staticVertex = this.staticGeometry.vertices[i];
      const noise = fbm(
        staticVertex.x,
        staticVertex.y,
        staticVertex.z + t,
        {
          period: 2
        }
      );

      const radius = this.radius * ( this.scale * noise + 1 ) / ( this.scale + 1 );
      const angle = this.angles[i];

      vertex.x = radius * Math.sin( angle );
      vertex.z = radius * Math.cos( angle );
    }

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
    this.geometry.verticesNeedUpdate = true;
  }
}
