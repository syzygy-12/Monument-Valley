import SignalResponsiveObject from "./SignalResponsiveObject.js";
import Signal from "./Signal.js";

export default class Button extends SignalResponsiveObject {
  constructor({ width, height, depth, position, signal, signalIdList, levelManager }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });

    super({ geometry, material, position, signalIdList });

    this.signal = new Signal(signal);
    this.levelManager = levelManager;
    this.camera = this.levelManager.sceneManager.camera;

    // 添加点击事件监听
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

      if (intersects.length > 0) {
        this.emitSignal();
      }
    });
  }

  emitSignal() {
    this.levelManager.setSignal(this.signal);
  }
}
