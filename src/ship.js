
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

let ship = null;

export function createShipwreck(scene) {
  loader.load(
    "/models/ship/dutch_ship_medium_4k.gltf",

    (gltf) => {
      console.log("Realistic ship loaded!");

      ship = gltf.scene;

      ship.name = "projects-ship";

      ship.scale.set(0.55, 0.55, 0.55);

      ship.position.set(13, -10, -7);

      ship.rotation.x = THREE.MathUtils.degToRad(8);

      ship.rotation.y = THREE.MathUtils.degToRad(-20);

      ship.rotation.z = THREE.MathUtils.degToRad(8);

      ship.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;

          child.receiveShadow = true;
        }
      });

      const shipLight = new THREE.PointLight(0x4db9e8, 18, 18);

      shipLight.position.set(0, 3, 2);

      ship.add(shipLight);

      scene.add(ship);
    },

    undefined,

    (error) => {
      console.error("Could not load realistic ship:", error);
    },
  );
}

export function updateShip(elapsedTime) {
  if (!ship) return;

  ship.rotation.x =
    THREE.MathUtils.degToRad(8) + Math.sin(elapsedTime * 0.2) * 0.005;
}
