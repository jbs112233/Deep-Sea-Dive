
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

const fishSchool = [];

let fishModel = null;
let sceneReference = null;

const SCHOOL_SIZE = 28;

const SCHOOL_MIN_X = -30;
const SCHOOL_MAX_X = 30;

export function createFishSchool(scene) {
  sceneReference = scene;

  loader.load(
    "/models/fish/fish.glb",

    (gltf) => {
      console.log("Realistic fish model loaded!");

      fishModel = gltf.scene;

      console.log("Fish animations:", gltf.animations);

      console.log("===== FISH MODEL STRUCTURE =====");

      fishModel.traverse((child) => {
        console.log(
          "Fish part:",
          child.name,
          "| Type:",
          child.type,
          "| Mesh:",
          child.isMesh,
        );
      });

      console.log("===== END FISH MODEL STRUCTURE =====");

      if (gltf.animations.length > 0) {
        console.log("Swimming animation detected!");
      } else {
        console.log("No built-in fish animation detected.");
      }

      createFishInstances();
    },

    undefined,

    (error) => {
      console.error("Could not load fish model:", error);
    },
  );
}

function createFishInstances() {
  if (!fishModel || !sceneReference) {
    return;
  }

  for (let i = 0; i < SCHOOL_SIZE; i++) {
    const fish = fishModel.clone(true);

    const scale = THREE.MathUtils.randFloat(0.9, 1.8);

    fish.scale.set(scale, scale, scale);

    fish.position.set(
      THREE.MathUtils.randFloat(-24, 24),

      THREE.MathUtils.randFloat(-4, 8),

      THREE.MathUtils.randFloat(-14, 5),
    );

    if (i < 8) {
      fish.position.z = THREE.MathUtils.randFloat(1, 7);

      fish.scale.multiplyScalar(THREE.MathUtils.randFloat(1.1, 1.35));
    }

    const direction = Math.random() > 0.5 ? 1 : -1;

    fish.userData.direction = direction;

    fish.rotation.y = direction === 1 ? Math.PI : 0;

    fish.userData.speed = THREE.MathUtils.randFloat(0.5, 1.35);

    fish.userData.targetSpeed = fish.userData.speed;

    fish.userData.baseY = fish.position.y;

    fish.userData.waveOffset = Math.random() * Math.PI * 2;

    fish.userData.waveSpeed = THREE.MathUtils.randFloat(0.6, 1.2);

    fish.userData.waveHeight = THREE.MathUtils.randFloat(0.15, 0.45);

    fish.userData.turnAmount = 0;

    fish.userData.targetTurn = 0;

    fish.userData.schoolPhase = Math.random() * Math.PI * 2;

    fish.userData.schoolStrength = THREE.MathUtils.randFloat(0.15, 0.5);

    fish.userData.headingOffset = THREE.MathUtils.randFloat(-0.12, 0.12);

    fish.rotation.y += fish.userData.headingOffset;

    fish.rotation.x = THREE.MathUtils.randFloat(-0.05, 0.05);

    fish.rotation.z = THREE.MathUtils.randFloat(-0.04, 0.04);

    fish.userData.swimPhase = Math.random() * Math.PI * 2;

    fish.userData.swimSpeed = THREE.MathUtils.randFloat(5, 8);

    fish.userData.swimStrength = THREE.MathUtils.randFloat(0.025, 0.06);

    prepareFishMesh(fish);

    fish.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    sceneReference.add(fish);

    fishSchool.push(fish);
  }

  console.log(`Created ${fishSchool.length} realistic fish.`);
}

function prepareFishMesh(fish) {
  fish.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.geometry = child.geometry.clone();

    const positionAttribute = child.geometry.attributes.position;

    if (!positionAttribute) {
      return;
    }

    const originalPositions = new Float32Array(positionAttribute.count * 3);

    for (let i = 0; i < positionAttribute.count; i++) {
      originalPositions[i * 3] = positionAttribute.getX(i);

      originalPositions[i * 3 + 1] = positionAttribute.getY(i);

      originalPositions[i * 3 + 2] = positionAttribute.getZ(i);
    }

    child.geometry.computeBoundingBox();

    const box = child.geometry.boundingBox;

    const size = new THREE.Vector3();

    box.getSize(size);

    let swimAxis = "x";

    if (size.y > size.x && size.y > size.z) {
      swimAxis = "y";
    } else if (size.z > size.x && size.z > size.y) {
      swimAxis = "z";
    }

    child.userData.originalPositions = originalPositions;

    child.userData.swimAxis = swimAxis;

    child.userData.vertexCount = positionAttribute.count;

    child.userData.boundingSize = size.clone();

    child.userData.boundingCenter = box.getCenter(new THREE.Vector3());

    console.log(
      "Prepared fish mesh:",
      child.name,
      "| Swim axis:",
      swimAxis,
      "| Size:",
      size,
    );
  });
}

function animateFishMesh(fish, elapsedTime) {
  fish.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    const positionAttribute = child.geometry.attributes.position;

    const originalPositions = child.userData.originalPositions;

    if (!positionAttribute || !originalPositions) {
      return;
    }

    const axis = child.userData.swimAxis;

    const count = child.userData.vertexCount;

    const center = child.userData.boundingCenter;

    const size = child.userData.boundingSize;

    const phase = fish.userData.swimPhase;

    const swimSpeed = fish.userData.swimSpeed;

    const strength = fish.userData.swimStrength;

    for (let i = 0; i < count; i++) {
      const index = i * 3;

      const originalX = originalPositions[index];

      const originalY = originalPositions[index + 1];

      const originalZ = originalPositions[index + 2];

      let longitudinal = 0;

      if (axis === "x") {
        longitudinal = (originalX - center.x) / Math.max(size.x / 2, 0.001);
      }

      if (axis === "y") {
        longitudinal = (originalY - center.y) / Math.max(size.y / 2, 0.001);
      }

      if (axis === "z") {
        longitudinal = (originalZ - center.z) / Math.max(size.z / 2, 0.001);
      }

      const bodyPosition = THREE.MathUtils.clamp((longitudinal + 1) / 2, 0, 1);

      const rearInfluence = Math.pow(bodyPosition, 1.8);

      const wave = Math.sin(elapsedTime * swimSpeed + phase + longitudinal * 3);

      const displacement = wave * strength * rearInfluence;

      if (axis === "x") {
        positionAttribute.setY(i, originalY + displacement);

        positionAttribute.setZ(i, originalZ + displacement * 0.35);
      }

      if (axis === "y") {
        positionAttribute.setX(i, originalX + displacement);

        positionAttribute.setZ(i, originalZ + displacement * 0.35);
      }

      if (axis === "z") {
        positionAttribute.setX(i, originalX + displacement);

        positionAttribute.setY(i, originalY + displacement * 0.35);
      }
    }

    positionAttribute.needsUpdate = true;

    if (child.geometry.attributes.normal) {
      child.geometry.computeVertexNormals();
    }
  });
}

export function updateFishSchool(delta, elapsedTime) {
  for (const fish of fishSchool) {
    const direction = fish.userData.direction;

    const speedWave =
      Math.sin(elapsedTime * 0.35 + fish.userData.schoolPhase) * 0.25;

    fish.userData.targetSpeed = THREE.MathUtils.clamp(
      fish.userData.speed + speedWave,

      0.25,
      1.7,
    );

    fish.userData.speed +=
      (fish.userData.targetSpeed - fish.userData.speed) * delta * 0.7;

    fish.position.x += direction * fish.userData.speed * delta;

    const verticalWave = Math.sin(
      elapsedTime * fish.userData.waveSpeed + fish.userData.waveOffset,
    );

    fish.position.y =
      fish.userData.baseY + verticalWave * fish.userData.waveHeight;

    fish.position.y +=
      Math.sin(elapsedTime * 0.35 + fish.userData.schoolPhase) * 0.12;

    fish.userData.targetTurn =
      Math.sin(elapsedTime * 0.45 + fish.userData.schoolPhase) * 0.06;

    fish.userData.turnAmount +=
      (fish.userData.targetTurn - fish.userData.turnAmount) * delta * 2;

    fish.rotation.z = fish.userData.turnAmount;

    fish.rotation.x =
      Math.sin(elapsedTime * 0.55 + fish.userData.waveOffset) * 0.025;

    const schoolMovement = Math.sin(
      elapsedTime * 0.18 + fish.userData.schoolPhase,
    );

    fish.position.z += schoolMovement * fish.userData.schoolStrength * delta;

    if (fish.position.x > SCHOOL_MAX_X) {
      fish.position.x = SCHOOL_MIN_X;

      fish.userData.baseY = THREE.MathUtils.randFloat(-4, 8);
    }

    if (fish.position.x < SCHOOL_MIN_X) {
      fish.position.x = SCHOOL_MAX_X;

      fish.userData.baseY = THREE.MathUtils.randFloat(-4, 8);
    }

    if (fish.position.z > 7) {
      fish.position.z = 7;
    }

    if (fish.position.z < -16) {
      fish.position.z = -16;
    }

    animateFishMesh(fish, elapsedTime);
  }
}
