import TriggerObject from "./TriggerObject.js";
import Signal from "./Signal.js";

export default class DoublePlate extends TriggerObject {
  constructor({ width, height, depth, position, signalOn, signalOff, signalIdList, levelManager }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });

    super({ geometry, material, position, signalIdList, levelManager });

    this.signalOn = new Signal(signalOn);
    this.signalOff = new Signal(signalOff);
    this.isCharacterOn = false;
  }

  toggleCharacterOn() {
    this.signals = this.isCharacterOn ? [this.signalOff] : [this.signalOn];
    this.emitSignals();
    this.isCharacterOn = !this.isCharacterOn; // 切换状态
  }
}
