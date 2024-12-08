import TriggerObject from "./TriggerObject.js";
import Signal from "./Signal.js";

export default class Plate extends TriggerObject {
  constructor({ width, height, depth, position, signals, signalIdList, levelManager }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });

    super({ geometry, material, position, signalIdList, levelManager });

    this.addSignals(signals);
  }

  emitSignals() {
    if (this.isEmitted || this.levelManager.isSignalReceived) return;

    super.emitSignals(); // 调用父类的 emitSignals
  }
}
