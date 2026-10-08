
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

let reefGroup = null;

export function createCoralReef(scene) {
  reefGroup = new THREE.Group();

  reefGroup.name = "about-coral-reef";

  reefGroup.userData.type = "about";

  reefGroup.position.set(-10, -5, -2);

  scene.add(reefGroup);

  loadStaghornCoral();
  loadPillarCoral();

  return reefGroup;
}

function loadStaghornCoral() {
  loader.load(
    "/models/coral/staghorn-coral.glb",

    (gltf) => {
      console.log("Staghorn coral loaded.");

      const positions = [
        { x: -2.3, y: -0.1, z: -0.4, scale: 1.6, rotation: 0.5 },
        { x: 2.4, y: -0.05, z: -0.5, scale: 1.7, rotation: -0.4 },
        { x: 0.2, y: -0.2, z: -1, scale: 1.3, rotation: 1.4 },
      ];

      positions.forEach((data, index) => {
        const coral = gltf.scene.clone(true);

        coral.name = `staghorn-coral-${index + 1}`;

        coral.position.set(data.x, data.y, data.z);

        coral.scale.setScalar(data.scale);

        coral.rotation.y = data.rotation;

        prepareCoral(coral);

        reefGroup.add(coral);
      });
    },

    undefined,

    (error) => {
      console.error("Could not load staghorn coral:", error);
    },
  );
}

function loadPillarCoral() {
  loader.load(
    "/models/coral/pillar-coral.glb",

    (gltf) => {
      console.log("Pillar coral loaded.");

      const positions = [
        {
          x: -2.3,
          y: -0.1,
          z: -0.4,
          scale: 1.15,
          rotation: 0.5,
        },
        {
          x: 2.4,
          y: -0.05,
          z: -0.5,
          scale: 1.25,
          rotation: -0.4,
        },
        {
          x: 0.2,
          y: -0.2,
          z: -1,
          scale: 0.85,
          rotation: 1.4,
        },
      ];

      positions.forEach((data, index) => {
        const coral = gltf.scene.clone(true);

        coral.name = `pillar-coral-${index + 1}`;

        coral.position.set(data.x, data.y, data.z);

        coral.scale.setScalar(data.scale);

        coral.rotation.y = data.rotation;

        prepareCoral(coral);

        reefGroup.add(coral);
      });
    },

    undefined,

    (error) => {
      console.error("Could not load pillar coral:", error);
    },
  );
}

function prepareCoral(object) {
  object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material) {
      child.material.side = THREE.DoubleSide;
    }
  });
}

export function updateCoralReef(elapsedTime) {
  if (!reefGroup) {
    return;
  }

  reefGroup.rotation.y = Math.sin(elapsedTime * 0.08) * 0.015;

  reefGroup.position.y = -8 + Math.sin(elapsedTime * 0.35) * 0.025;
}
