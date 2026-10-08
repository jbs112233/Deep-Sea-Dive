
import * as THREE from "three";

export function setupInteractions(camera, renderer, landmarks, openPanel) {
  const raycaster = new THREE.Raycaster();

  const pointer = new THREE.Vector2(2, 2);

  let hoveredLandmark = null;

  function getClickableMeshes() {
    const meshes = [];

    landmarks.forEach((landmark) => {
      landmark.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
        }
      });
    });

    return meshes;
  }

  function findLandmarkRoot(object) {
    let current = object;

    while (current) {
      if (current.userData && current.userData.type) {
        return current;
      }

      current = current.parent;
    }

    return null;
  }

  function setHighlight(landmark, enabled) {
    if (!landmark) {
      return;
    }

    landmark.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (material.emissive) {
          material.emissiveIntensity = enabled ? 0.5 : 0;
        }
      });
    });
  }

  function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function handleClick() {
    raycaster.setFromCamera(pointer, camera);

    const intersections = raycaster.intersectObjects(
      getClickableMeshes(),
      true,
    );

    if (intersections.length === 0) {
      return;
    }

    const landmark = findLandmarkRoot(intersections[0].object);

    if (landmark && landmark.userData.type) {
      openPanel(landmark.userData.type);
    }
  }

  renderer.domElement.addEventListener("pointermove", updatePointer);

  renderer.domElement.addEventListener("click", handleClick);

  function update() {
    raycaster.setFromCamera(pointer, camera);

    const intersections = raycaster.intersectObjects(
      getClickableMeshes(),
      true,
    );

    let newHovered = null;

    if (intersections.length > 0) {
      newHovered = findLandmarkRoot(intersections[0].object);
    }

    if (newHovered !== hoveredLandmark) {
      setHighlight(hoveredLandmark, false);

      hoveredLandmark = newHovered;

      setHighlight(hoveredLandmark, true);

      renderer.domElement.style.cursor = hoveredLandmark
        ? "pointer"
        : "default";
    }

    landmarks.forEach((landmark) => {
      const targetScale = landmark === hoveredLandmark ? 1.08 : 1;

      landmark.scale.x += (targetScale - landmark.scale.x) * 0.08;

      landmark.scale.y += (targetScale - landmark.scale.y) * 0.08;

      landmark.scale.z += (targetScale - landmark.scale.z) * 0.08;
    });
  }

  return {
    update,
  };
}
