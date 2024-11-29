import SignalResponsiveObject from "./SignalResponsiveObject.js";
import Signal from "./Signal.js";

export default class Plate extends SignalResponsiveObject {
  constructor({ width, height, depth, position, signal, signalIdList, levelManager }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });

    super({ geometry, material, position, signalIdList });

    this.signal = new Signal(signal);
    this.levelManager = levelManager;
    this.isEmitted = false;

  }

  emitSignal() {
    if (this.levelManager.isSignalReceived) {
      return;
    }
    if (this.isEmitted) {
      return;
    }
    //console.log("Plate emit");
    this.isEmitted = true;
    this.signal.addCount();
    this.levelManager.setSignal(this.signal);
  }
}
