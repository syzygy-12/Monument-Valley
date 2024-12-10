import TriggerObject from "./TriggerObject.js";

export default class Button extends TriggerObject {
  constructor({ width, height, depth, glbFile, rotation,scale, position, signals, signalIdList, standStop, levelManager }) {
    let geometry, material;

    // 判断是否有 GLBFile
    if (!glbFile) {
      geometry = new THREE.BoxGeometry(width, height, depth);  
      material = new THREE.MeshStandardMaterial({ color: 0xff6347 });  
    } else {
      // super({ rotation, scale, glbFile, position, signalIdList, levelManager });
      // this.loadButtons(glbFile, rotation, scale, position);
      //load glbfile here
    }
    super({ geometry, material, position, signalIdList, levelManager });

    this.originalColor = new THREE.Color(0xff6347); // 保存原始颜色
    this.addSignals(signals);
    this.camera = this.levelManager.sceneManager.camera;
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

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObject(this.mesh);

      if (intersects.length > 0 && this.active) {
        this.emitSignals();
      }
    });
  }

  emitSignals() {
    if (this.levelManager.isSignalReceived || !this.active) {
      return;
    }

    super.emitSignals(); // 调用父类的 emitSignals
  }

  /**
   * 激活/非激活状态切换
   * 非激活时将颜色灰度化，激活时恢复原始颜色
   */
  toggleActive(active) {
    this.active = active;

    if (this.mesh) {
      if (active) {
        // 恢复彩色
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

  async loadButtons(glbFile, rotation, scale, position) {

      try {
        const gltf = await loader.loadAsync(glbFile); // 使用 loadAsync 异步加载 GLB 模型
        const button = gltf.scene;
        
        // 设置模型位置、缩放、旋转
        button.position.set(position.x, position.y, position.z);
        button.scale.set(scale.x, scale.y, scale.z);
        button.rotation.set(rotation.x, rotation.y, rotation.z);

        
        console.log(`Loaded model: button from ${path}`);
      } catch (error) {
        console.error(`Failed to load model from ${path}:`, error);
      }
  }

}
