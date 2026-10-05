import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Neutral studio HDR (three's RoomEnvironment: a softly lit white room),
 * pre-filtered once. It gives clay its soft, even fill and puts clean window
 * reflections in the glass, with no colour cast.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const texture = pmrem.fromScene(room, 0.035).texture;
  room.dispose();
  pmrem.dispose();
  return texture;
}
