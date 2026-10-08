
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const fishLoader = new GLTFLoader();

let socialFishModel = null;

export function createLandmarks(scene) {
  const landmarks = [];

  const projectsMarker = createInvisibleMarker(12, 8, 10);

  projectsMarker.position.set(13, -9, -7);

  projectsMarker.userData.type = "projects";

  scene.add(projectsMarker);

  landmarks.push(projectsMarker);

  const pearl = createPearl();

  pearl.position.set(0, -6.5, -3);

  pearl.userData.type = "contact";

  pearl.userData.baseY = pearl.position.y;

  scene.add(pearl);

  landmarks.push(pearl);

  const social = createSocialMarker();

  social.position.set(15, -4, -6);

  social.userData.type = "social";

  social.userData.baseY = social.position.y;

  scene.add(social);

  landmarks.push(social);

  return landmarks;
}

function createInvisibleMarker(width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);

  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const marker = new THREE.Mesh(geometry, material);

  return marker;
}

function createPearl() {
  const group = new THREE.Group();

  const shellGeometry = new THREE.SphereGeometry(1.05, 32, 32);

  const shellMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8f6f7,

    roughness: 0.12,

    metalness: 0.05,

    emissive: 0x214c5a,

    emissiveIntensity: 0.15,
  });

  const pearl = new THREE.Mesh(shellGeometry, shellMaterial);

  group.add(pearl);

  const glow = new THREE.PointLight(0x8fe8ff, 2.5, 7);

  group.add(glow);

  group.userData.isPearl = true;

  return group;
}

function createSocialMarker() {
  const group = new THREE.Group();

  group.userData.socialFish = [];

  group.userData.socialFishLoaded = false;

  const glowGeometry = new THREE.SphereGeometry(0.18, 16, 16);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x6edff5,

    transparent: true,

    opacity: 0.18,

    depthWrite: false,
  });

  const centerGlow = new THREE.Mesh(glowGeometry, glowMaterial);

  centerGlow.name = "social-center-glow";

  group.add(centerGlow);

  const socialLight = new THREE.PointLight(0x4fc8e8, 1.2, 5);

  socialLight.name = "social-focus-light";

  group.add(socialLight);

  fishLoader.load(
    "/models/fish/fish.glb",

    (gltf) => {
      socialFishModel = gltf.scene;

      createSocialFishInstances(group);

      group.userData.socialFishLoaded = true;

      console.log("Realistic Social Media fish loaded!");
    },

    undefined,

    (error) => {
      console.error("Could not load Social Media fish:", error);
    },
  );

  return group;
}

function createSocialFishInstances(group) {
  if (!socialFishModel) {
    return;
  }

  const fishCount = 5;

  for (let i = 0; i < fishCount; i++) {
    const fish = socialFishModel.clone(true);

    const scale = THREE.MathUtils.randFloat(6, 4.5);

    fish.scale.set(scale, scale, scale);

    const angle = (i / fishCount) * Math.PI * 2;

    const radius = THREE.MathUtils.randFloat(1.7, 2.2);

    fish.userData.socialAngle = angle;

    fish.userData.socialRadius = radius;

    fish.userData.socialSpeed = THREE.MathUtils.randFloat(0.12, 0.22);

    fish.userData.socialHeight = THREE.MathUtils.randFloat(0.12, 0.3);

    fish.userData.socialPhase = Math.random() * Math.PI * 2;

    fish.userData.socialScale = scale;

    fish.position.set(
      Math.cos(angle) * radius,

      Math.sin(angle * 1.5) * 0.4,

      Math.sin(angle) * radius,
    );

    fish.rotation.y = -angle;

    fish.rotation.x = THREE.MathUtils.randFloat(-0.05, 0.05);

    fish.rotation.z = THREE.MathUtils.randFloat(-0.04, 0.04);

    fish.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;

        child.receiveShadow = true;
      }
    });

    fish.name = `social-fish-${i + 1}`;

    group.add(fish);

    group.userData.socialFish.push(fish);
  }
}

export function updateLandmarks(landmarks, elapsedTime) {
  for (const landmark of landmarks) {
    const type = landmark.userData.type;

    if (type === "contact") {
      const baseY = landmark.userData.baseY;

      landmark.position.y = baseY + Math.sin(elapsedTime * 0.8) * 0.18;

      landmark.rotation.y = elapsedTime * 0.25;
    }

    if (type === "social") {
      const baseY = landmark.userData.baseY;

      landmark.position.y = baseY + Math.sin(elapsedTime * 0.45) * 0.12;

      const centerGlow = landmark.getObjectByName("social-center-glow");

      if (centerGlow) {
        const pulse = 1 + Math.sin(elapsedTime * 1.8) * 0.12;

        centerGlow.scale.setScalar(pulse);

        centerGlow.material.opacity =
          0.15 + Math.sin(elapsedTime * 1.8) * 0.035;
      }

      const socialFish = landmark.userData.socialFish || [];

      socialFish.forEach((fish) => {
        fish.userData.socialAngle += fish.userData.socialSpeed * 0.01;

        const angle = fish.userData.socialAngle;

        const radius = fish.userData.socialRadius;

        fish.position.x = Math.cos(angle) * radius;

        fish.position.z = Math.sin(angle) * radius;

        fish.position.y =
          Math.sin(elapsedTime * 0.8 + fish.userData.socialPhase) *
          fish.userData.socialHeight;

        fish.rotation.y = -angle;

        fish.rotation.z =
          Math.sin(elapsedTime * 0.9 + fish.userData.socialPhase) * 0.05;

        fish.rotation.x =
          Math.sin(elapsedTime * 0.7 + fish.userData.socialPhase) * 0.025;
      });
    }
  }
}

export function updateEnvironmentFocus(scene, landmarks, activeSection) {
  for (const landmark of landmarks) {
    landmark.userData.focusAmount =
      activeSection === null
        ? 0
        : landmark.userData.type === activeSection
          ? 1
          : 0;
  }

  const reef = landmarks.find((landmark) => landmark.userData.type === "about");

  if (reef) {
    reef.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive
            ? child.material.emissive.clone()
            : new THREE.Color(0x000000);
        }

        if (child.userData.originalEmissiveIntensity === undefined) {
          child.userData.originalEmissiveIntensity =
            child.material.emissiveIntensity || 0;
        }

        const focused = activeSection === "about";

        if (child.material.emissive) {
          child.material.emissive.set(
            focused ? 0x164c52 : child.userData.originalEmissive,
          );

          child.material.emissiveIntensity = focused
            ? 0.35
            : child.userData.originalEmissiveIntensity;
        }
      }
    });
  }

  const pearl = landmarks.find(
    (landmark) => landmark.userData.type === "contact",
  );

  if (pearl) {
    const pearlLight = pearl.children.find((child) => child.isLight);

    if (pearlLight) {
      pearlLight.intensity = activeSection === "contact" ? 7 : 2.5;

      pearlLight.distance = activeSection === "contact" ? 12 : 7;
    }

    const pearlMesh = pearl.children.find((child) => child.isMesh);

    if (pearlMesh && pearlMesh.material) {
      pearlMesh.material.emissive.set(
        activeSection === "contact" ? 0x5acde5 : 0x214c5a,
      );

      pearlMesh.material.emissiveIntensity =
        activeSection === "contact" ? 0.5 : 0.15;
    }
  }

  const social = landmarks.find(
    (landmark) => landmark.userData.type === "social",
  );

  if (social) {
    const socialLight = social.getObjectByName("social-focus-light");

    if (socialLight) {
      socialLight.intensity = activeSection === "social" ? 5 : 1.2;

      socialLight.distance = activeSection === "social" ? 10 : 5;
    }

    const centerGlow = social.getObjectByName("social-center-glow");

    if (centerGlow) {
      centerGlow.material.color.setHex(
        activeSection === "social" ? 0x9cefff : 0x6edff5,
      );

      centerGlow.material.opacity = activeSection === "social" ? 0.35 : 0.18;
    }
  }

  const ship = scene.getObjectByName("projects-ship");

  if (ship) {
    let shipLight = ship.getObjectByName("projects-focus-light");

    if (!shipLight) {
      shipLight = new THREE.PointLight(0x62d7f5, 0, 22);

      shipLight.name = "projects-focus-light";

      shipLight.position.set(0, 3, 2);

      ship.add(shipLight);
    }

    shipLight.intensity = activeSection === "projects" ? 12 : 0;
  }
}

export function animateEnvironmentFocus(
  scene,
  landmarks,
  activeSection,
  elapsedTime,
) {
  const ship = scene.getObjectByName("projects-ship");

  if (ship) {
    const shipLight = ship.getObjectByName("projects-focus-light");

    if (shipLight) {
      const pulse = Math.sin(elapsedTime * 1.5) * 1.5;

      shipLight.intensity = activeSection === "projects" ? 12 + pulse : 0;
    }
  }

  const social = landmarks.find(
    (landmark) => landmark.userData.type === "social",
  );

  if (social) {
    const socialLight = social.getObjectByName("social-focus-light");

    if (socialLight && activeSection === "social") {
      socialLight.intensity = 5 + Math.sin(elapsedTime * 2) * 1;
    }

    const centerGlow = social.getObjectByName("social-center-glow");

    if (centerGlow && activeSection === "social") {
      centerGlow.material.opacity = 0.3 + Math.sin(elapsedTime * 2) * 0.05;
    }
  }
}
