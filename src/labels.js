
import * as THREE from "three";

function createTextSprite(text, position) {
  const canvas = document.createElement("canvas");

  canvas.width = 512;
  canvas.height = 128;

  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.font = "600 36px Arial";

  context.textAlign = "center";

  context.textBaseline = "middle";

  context.fillStyle = "rgba(210, 240, 250, 0.9)";

  context.shadowColor = "rgba(80, 190, 230, 0.65)";

  context.shadowBlur = 12;

  context.fillText(
    text,

    canvas.width / 2,

    canvas.height / 2,
  );

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,

    transparent: true,

    depthWrite: false,

    depthTest: true,
  });

  const sprite = new THREE.Sprite(material);

  sprite.position.copy(position);

  sprite.scale.set(3.5, 0.875, 1);

  return sprite;
}

export function createLabels(scene, landmarks) {
  const labelData = [
    {
      text: "ABOUT ME",
      type: "about",
      x: -4.5,
      y: 5.5,
      z: 0,
    },

    {
      text: "PROJECTS",
      type: "projects",
      x: 4.5,
      y: 6.0,
      z: 0,
    },

    {
      text: "CONTACT",
      type: "contact",
      x: -4.5,
      y: 2.5,
      z: 0,
    },

    {
      text: "SOCIAL",
      type: "social",
      x: 4.5,
      y: 3.5,
      z: 0,
    },
  ];

  labelData.forEach((data) => {
    const landmark = landmarks.find((item) => item.userData.type === data.type);

    if (!landmark) {
      return;
    }

    const position = landmark.position.clone();

    position.x += data.x;

    position.y += data.y;

    position.z += data.z;

    const label = createTextSprite(
      data.text,

      position,
    );

    scene.add(label);
  });
}
