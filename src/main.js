
import "./style.css";

import * as THREE from "three";

import { createAmbientSystem, updateAmbientSystem } from "./ambient.js";

import { createRealisticRocks } from "./environment.js";

import { createFishSchool, updateFishSchool } from "./fish.js";

import { createShipwreck, updateShip } from "./ship.js";

import {
  createLandmarks,
  updateLandmarks,
  updateEnvironmentFocus,
  animateEnvironmentFocus,
} from "./landmarks.js";

import { setupInteractions } from "./interactions.js";

import { createCoralReef, updateCoralReef } from "./reef.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x02131d);

scene.fog = new THREE.FogExp2(0x02131d, 0.022);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);

camera.position.set(0, 1, 18);

const mouse = {
  x: 0,

  y: 0,
};

const cameraDrift = {
  x: 0,

  y: 0,
};

const cameraFocusTargets = {
  default: {
    x: 0,

    y: 1,

    z: 0,
  },

  about: {
    x: -3.5,

    y: -1.5,

    z: 0,
  },

  projects: {
    x: 4,

    y: -1.5,

    z: -1,
  },

  contact: {
    x: 0,

    y: -2.5,

    z: -1,
  },

  social: {
    x: 4,

    y: -0.5,

    z: -1,
  },
};

const renderer = new THREE.WebGLRenderer({
  antialias: true,

  alpha: false,
});

renderer.setSize(
  window.innerWidth,

  window.innerHeight,
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,

    2,
  ),
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.1;

document.body.appendChild(renderer.domElement);

const hemisphereLight = new THREE.HemisphereLight(
  0x6bbbd6,

  0x020b10,

  1.45,
);

scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(
  0x9bdcff,

  4.2,
);

directionalLight.position.set(
  -15,

  35,

  8,
);

directionalLight.castShadow = true;

scene.add(directionalLight);

const seabedGeometry = new THREE.PlaneGeometry(
  120,

  120,

  40,

  40,
);

const seabedMaterial = new THREE.MeshStandardMaterial({
  color: 0x0d2528,

  roughness: 1,

  metalness: 0,
});

const seabed = new THREE.Mesh(
  seabedGeometry,

  seabedMaterial,
);

seabed.rotation.x = -Math.PI / 2;

seabed.position.y = -14.5;

seabed.receiveShadow = true;

scene.add(seabed);

const particleCount = 2500;

const particleGeometry = new THREE.BufferGeometry();

const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = THREE.MathUtils.randFloat(
    -45,

    45,
  );

  particlePositions[i * 3 + 1] = THREE.MathUtils.randFloat(
    -15,

    25,
  );

  particlePositions[i * 3 + 2] = THREE.MathUtils.randFloat(
    -40,

    20,
  );
}

particleGeometry.setAttribute(
  "position",

  new THREE.BufferAttribute(
    particlePositions,

    3,
  ),
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0x9ddfea,

  size: 0.035,

  transparent: true,

  opacity: 0.42,

  depthWrite: false,
});

const particles = new THREE.Points(
  particleGeometry,

  particleMaterial,
);

scene.add(particles);

const bubbleCount = 80;

const bubbleGeometry = new THREE.BufferGeometry();

const bubblePositions = new Float32Array(bubbleCount * 3);

for (let i = 0; i < bubbleCount; i++) {
  bubblePositions[i * 3] = THREE.MathUtils.randFloat(
    -25,

    25,
  );

  bubblePositions[i * 3 + 1] = THREE.MathUtils.randFloat(
    -14,

    18,
  );

  bubblePositions[i * 3 + 2] = THREE.MathUtils.randFloat(
    -25,

    5,
  );
}

bubbleGeometry.setAttribute(
  "position",

  new THREE.BufferAttribute(
    bubblePositions,

    3,
  ),
);

const bubbleMaterial = new THREE.PointsMaterial({
  color: 0xb8edf5,

  size: 0.08,

  transparent: true,

  opacity: 0.25,

  depthWrite: false,
});

const bubbles = new THREE.Points(
  bubbleGeometry,

  bubbleMaterial,
);

scene.add(bubbles);

const lightRays = new THREE.Group();

for (let i = 0; i < 14; i++) {
  const rayGeometry = new THREE.CylinderGeometry(
    0.35,

    1.2,

    35,

    16,

    1,

    true,
  );

  const rayMaterial = new THREE.MeshBasicMaterial({
    color: 0x75d9ed,

    transparent: true,

    opacity: THREE.MathUtils.randFloat(
      0.006,

      0.018,
    ),

    side: THREE.DoubleSide,

    depthWrite: false,
  });

  const ray = new THREE.Mesh(
    rayGeometry,

    rayMaterial,
  );

  ray.position.set(
    THREE.MathUtils.randFloat(
      -25,

      25,
    ),

    15,

    THREE.MathUtils.randFloat(
      -20,

      5,
    ),
  );

  ray.rotation.z = THREE.MathUtils.randFloat(
    -0.18,

    0.18,
  );

  ray.rotation.x = THREE.MathUtils.randFloat(
    -0.12,

    0.12,
  );

  lightRays.add(ray);
}

scene.add(lightRays);

const backgroundCoral = new THREE.Group();

for (let i = 0; i < 40; i++) {
  const coralHeight = THREE.MathUtils.randFloat(
    1,

    4,
  );

  const coralGeometry = new THREE.ConeGeometry(
    THREE.MathUtils.randFloat(
      0.15,

      0.5,
    ),

    coralHeight,

    6,
  );

  const coralMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d3435,

    roughness: 1,

    metalness: 0,
  });

  const coral = new THREE.Mesh(
    coralGeometry,

    coralMaterial,
  );

  coral.position.set(
    THREE.MathUtils.randFloat(
      -30,

      30,
    ),

    -12.5,

    THREE.MathUtils.randFloat(
      -25,

      2,
    ),
  );

  coral.rotation.y = Math.random() * Math.PI * 2;

  backgroundCoral.add(coral);
}

scene.add(backgroundCoral);

createRealisticRocks(scene);
createFishSchool(scene);
createShipwreck(scene);

const coralReef = createCoralReef(scene);

const landmarks = createLandmarks(scene);

landmarks.unshift(coralReef);

let activeSection = null;

function openPanel(section) {
  const panels = document.querySelectorAll(".info-panel");

  panels.forEach((panel) => {
    panel.classList.remove("active");
  });

  const targetPanel = document.getElementById(`${section}-panel`);

  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  activeSection = section;

  updateEnvironmentFocus(
    scene,

    landmarks,

    activeSection,
  );
}

function closePanel() {
  const panels = document.querySelectorAll(".info-panel");

  panels.forEach((panel) => {
    panel.classList.remove("active");
  });

  activeSection = null;

  updateEnvironmentFocus(
    scene,

    landmarks,

    null,
  );
}

document.querySelectorAll(".close-panel").forEach((button) => {
  button.addEventListener(
    "click",

    closePanel,
  );
});

window.addEventListener(
  "keydown",

  (event) => {
    if (event.key === "Escape") {
      closePanel();
    }
  },
);

const interactions = setupInteractions(
  camera,

  renderer,

  landmarks,

  openPanel,
);

document.querySelectorAll(".world-nav-button").forEach((button) => {
  button.addEventListener(
    "click",

    () => {
      const section = button.dataset.section;

      openPanel(section);
    },
  );
});

let lastTime = performance.now();

let elapsedTime = 0;

window.addEventListener(
  "mousemove",

  (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;

    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  },
);

window.addEventListener(
  "resize",

  () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,

      window.innerHeight,
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,

        2,
      ),
    );
  },
);

function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();

  const delta = Math.min(
    (currentTime - lastTime) / 1000,

    0.1,
  );

  lastTime = currentTime;

  elapsedTime += delta;

  particles.rotation.y += delta * 0.004;

  particles.position.y = Math.sin(elapsedTime * 0.08) * 0.15;

  bubbles.position.y += delta * 0.15;

  if (bubbles.position.y > 4) {
    bubbles.position.y = -4;
  }

  lightRays.children.forEach((ray, index) => {
    ray.rotation.z += Math.sin(elapsedTime * 0.15 + index) * delta * 0.01;
  });

  updateFishSchool(
    delta,

    elapsedTime,
  );

  updateCoralReef(elapsedTime);

  updateShip(elapsedTime);

  updateLandmarks(
    landmarks,

    elapsedTime,
  );

  animateEnvironmentFocus(
    scene,

    landmarks,

    activeSection,

    elapsedTime,
  );

  interactions.update();

  const focusTarget = cameraFocusTargets[activeSection || "default"];

  cameraDrift.x = Math.sin(elapsedTime * 0.12) * 0.35;

  cameraDrift.y = Math.sin(elapsedTime * 0.17) * 0.18;

  const mouseOffsetX = mouse.x * 2.2;

  const mouseOffsetY = mouse.y * 1.2;

  const targetCameraX = focusTarget.x + mouseOffsetX + cameraDrift.x;

  const targetCameraY = focusTarget.y + mouseOffsetY + cameraDrift.y;

  const targetCameraZ = 18 + focusTarget.z;

  camera.position.x += (targetCameraX - camera.position.x) * 0.012;

  camera.position.y += (targetCameraY - camera.position.y) * 0.012;

  camera.position.z += (targetCameraZ - camera.position.z) * 0.008;

  const lookTargetX = focusTarget.x * 0.45 + mouse.x * 0.5;

  const lookTargetY =
    focusTarget.y * 0.35 - 1 + Math.sin(elapsedTime * 0.12) * 0.08;

  const lookTargetZ = focusTarget.z;

  camera.lookAt(
    lookTargetX,

    lookTargetY,

    lookTargetZ,
  );

  renderer.render(
    scene,

    camera,
  );
}

let loadingProgress = 0;

function updateLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");

  const progressBar = document.getElementById("loading-progress");

  const percentText = document.getElementById("loading-percent");

  const statusText = document.getElementById("loading-status");

  if (!loadingScreen || !progressBar || !percentText || !statusText) {
    return;
  }

  loadingProgress += (100 - loadingProgress) * 0.012;

  if (loadingProgress > 99) {
    loadingProgress = 100;
  }

  progressBar.style.width = `${loadingProgress}%`;

  percentText.textContent = `${Math.floor(loadingProgress)}%`;

  if (loadingProgress < 30) {
    statusText.textContent = "DESCENDING INTO THE DEEP";
  } else if (loadingProgress < 60) {
    statusText.textContent = "INITIALIZING ENVIRONMENT";
  } else if (loadingProgress < 85) {
    statusText.textContent = "LOADING WORLD";
  } else if (loadingProgress < 100) {
    statusText.textContent = "FINALIZING EXPERIENCE";
  }

  if (loadingProgress >= 100) {
    setTimeout(
      () => {
        loadingScreen.classList.add("loaded");
      },

      400,
    );

    return;
  }

  requestAnimationFrame(updateLoadingScreen);
}

updateLoadingScreen();

animate();
