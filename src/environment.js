
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export function createRealisticRocks(scene) {
  loader.load(
    "/models/rocks/coast_rocks_05_4k.gltf",

    (gltf) => {
      console.log("Realistic rock model loaded!");

      const rockModel = gltf.scene;

      for (let i = 0; i < 18; i++) {
        const rock = rockModel.clone(true);

        const scale = THREE.MathUtils.randFloat(0.25, 0.8);

        const side = Math.random() < 0.5 ? -1 : 1;

        rock.position.set(
          THREE.MathUtils.randFloat(8, 34) * side,

          -14.2,

          THREE.MathUtils.randFloat(-24, 2),
        );

        rock.rotation.set(
          THREE.MathUtils.randFloat(-0.15, 0.15),

          THREE.MathUtils.randFloat(0, Math.PI * 2),

          THREE.MathUtils.randFloat(-0.15, 0.15),
        );

        rock.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;

            child.receiveShadow = true;
          }
        });

        scene.add(rock);
      }

      console.log("Created 18 realistic rocks.");
    },

    undefined,

    (error) => {
      console.error("Could not load realistic rocks:", error);
    },
  );
}
