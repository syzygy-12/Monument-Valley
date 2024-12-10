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
    levelManager
  }) {
    const geometry = new THREE.BoxGeometry(width || 2, height || 2, depth || 2);
    const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });

    super({
      geometry,
      material,
      glbFile,
      position,
      rotation,
      scale,
      signalIdList,
      levelManager
    });

    this.originalColor = new THREE.Color(0xff6347);
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
      //console.log(this.mesh, intersects);
      if (intersects.length > 0 && this.active) {
        this.emitSignals();
      }
    });
  }
    /**
   * 激活/非激活状态切换
   * 非激活时将颜色灰度化，激活时恢复原始颜色
   * TODO:这里有问题，模型并没有material
   */
    toggleActive(active) {
      this.active = active;
      return;
      if (this.mesh) {
        if (active) {
          // 恢复彩色
          console.log(this.mesh);
          this.mesh.material.color.copy(this.originalColor);
        } else {
          // 灰度化颜色
          const gray = this.getGrayscale(this.originalColor);
          this.mesh.material.color.setRGB(gray, gray, gray);
        }
      }
    }
  
    /**
     * 计算颜色的灰度值
     * @param {THREE.Color} color 原始颜色
     * @returns {number} 灰度值
     */
    getGrayscale(color) {
      return 0.3 * color.r + 0.59 * color.g + 0.11 * color.b;
    }
}
