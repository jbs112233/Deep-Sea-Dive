import * as THREE from "three";

const ambientBubbles = [];

let ambientScene = null;

export function createAmbientSystem(scene) {
  ambientScene = scene;

  createAmbientBubbles(scene);

  console.log("Ambient underwater system initialized.");
}

function createAmbientBubbles(scene) {
  const bubbleCount = 35;

  for (let i = 0; i < bubbleCount; i++) {
    const radius = THREE.MathUtils.randFloat(0.025, 0.11);

    const geometry = new THREE.SphereGeometry(
      radius,

      10,

      10,
    );

    const material = new THREE.MeshPhysicalMaterial({
      color: 0xb9edf4,

      transparent: true,

      opacity: THREE.MathUtils.randFloat(0.18, 0.42),

      roughness: 0.05,

      metalness: 0,

      transmission: 0.1,

      depthWrite: false,
    });

    const bubble = new THREE.Mesh(
      geometry,

      material,
    );

    bubble.position.set(
      THREE.MathUtils.randFloat(-24, 24),

      THREE.MathUtils.randFloat(-13, 8),

      THREE.MathUtils.randFloat(-18, 4),
    );

    bubble.userData.speed = THREE.MathUtils.randFloat(0.15, 0.45);

    bubble.userData.driftSpeed = THREE.MathUtils.randFloat(0.25, 0.7);

    bubble.userData.driftAmount = THREE.MathUtils.randFloat(0.08, 0.35);

    bubble.userData.phase = Math.random() * Math.PI * 2;

    bubble.userData.baseX = bubble.position.x;

    bubble.userData.baseZ = bubble.position.z;

    scene.add(bubble);

    ambientBubbles.push(bubble);
  }
}

export function updateAmbientSystem(delta, elapsedTime) {
  if (!ambientScene) {
    return;
  }

  ambientBubbles.forEach((bubble) => {
    bubble.position.y += bubble.userData.speed * delta;

    bubble.position.x =
      bubble.userData.baseX +
      Math.sin(
        elapsedTime * bubble.userData.driftSpeed + bubble.userData.phase,
      ) *
        bubble.userData.driftAmount;

    bubble.position.z =
      bubble.userData.baseZ +
      Math.cos(
        elapsedTime * bubble.userData.driftSpeed * 0.7 + bubble.userData.phase,
      ) *
        bubble.userData.driftAmount *
        0.35;

    if (bubble.position.y > 18) {
      bubble.position.y = THREE.MathUtils.randFloat(-14, -8);

      bubble.userData.baseX = THREE.MathUtils.randFloat(-24, 24);

      bubble.userData.baseZ = THREE.MathUtils.randFloat(-18, 4);

      bubble.position.x = bubble.userData.baseX;

      bubble.position.z = bubble.userData.baseZ;
    }
  });
}
