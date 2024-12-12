import TriggerObject from "./TriggerObject.js";
import Signal from "./Signal.js";

export default class Plate extends TriggerObject {
  constructor({ width, height, depth, position, signals, color, signalIdList, levelManager }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    if (color) {
      color = parseInt(color, 16);
    }
    const material = new THREE.MeshStandardMaterial({ color: color || 0x00ffff });

    super({ geometry, material, position, signalIdList, levelManager });

    this.addSignals(signals);
  }

  emitSignals() {
    if (this.isEmitted || this.levelManager.isSignalReceived) return;

    super.emitSignals(); // 调用父类的 emitSignals
  }
}
