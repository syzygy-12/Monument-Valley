import SignalResponsiveObject from "./SignalResponsiveObject.js";
import Signal from "./Signal.js";

export default class DoublePlate extends SignalResponsiveObject {
  constructor({ width, height, depth, position, signalOn, signalOff, signalIdList, levelManager }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });

    super({ geometry, material, position, signalIdList });

    this.signalOn = new Signal(signalOn);
    this.signalOff = new Signal(signalOff);
    this.levelManager = levelManager;
    this.isCharacterOn = false;

  }
  emitSignal(signal) {
    if (this.levelManager.isSignalReceived) {
      return;
    }
    signal.addCount();
    this.levelManager.setSignal(signal);
  }
  
  toggleCharacterOn() {
    if (this.isCharacterOn) {
      this.isCharacterOn = false;
      this.emitSignal(this.signalOff);
    } else {
      this.isCharacterOn = true;
      this.emitSignal(this.signalOn);
    }
  }
}
