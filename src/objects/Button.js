import TriggerObject from "./TriggerObject.js";

export default class Button extends TriggerObject {
  constructor({
    width,
    height,
    depth,
    glbFile,
    position,
    rotation,
    scale,
    signals,
    signalIdList,
    standStop,
    levelManager, 
    color
  }) {
    const geometry = new THREE.BoxGeometry(width || 2, height || 2, depth || 2);
    const material = new THREE.MeshStandardMaterial({ color: color || 0xff6347 });

    super({
      geometry,
      material,
      glbFile,
      position,
      rotation,
      scale,
      signalIdList,
      levelManager,
      color
    });

    this.originalColor = new THREE.Color(color || 0xff6347);
    this.addSignals(signals);
    this.active = true;
    this.standStop = standStop || false;
    this.initInteraction();

    
  }

  initInteraction() {
    window.addEventListener("pointerdown", (event) => {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.levelManager.sceneManager.camera);

      const intersects = raycaster.intersectObject(this.mesh, true);
      if (intersects.length > 0 && this.active) {
        this.emitSignals();
      }
    });
  }

  toggleActive(active) {
    if (this.active === active) return;
    this.active = active;
    if (!this.active && this.originalPositions === undefined) {
      // 存储子物体的原始位置
      this.originalPositions = [];
      for (let i = 2; i <= 10; i++) {
        if (this.mesh.children[i]) {
          this.originalPositions[i] = this.mesh.children[i].position.clone();
        }
      }
    }

    if (this.mesh) {
      const origin = new THREE.Vector3(0, 0.6, 0);
      for (let i = 2; i <= 10; i++) {
        const child = this.mesh.children[i];
        if (child) {
          // Tween过渡子物体位置
          new TWEEN.Tween(child.position)
            .to(this.active ? this.originalPositions[i] : origin, 500) // 500ms过渡时间
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        }
      }
    }
  }
}
