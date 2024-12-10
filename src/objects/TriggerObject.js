import SignalResponsiveObject from "./SignalResponsiveObject.js";
import Signal from "./Signal.js";

export default class TriggerObject extends SignalResponsiveObject {
  constructor({
    geometry,
    material,
    glbFile,
    position,
    rotation,
    scale,
    signalIdList,
    levelManager,
  }) {
    super({
      geometry,
      material,
      glbFile,
      position,
      rotation,
      scale,
      signalIdList,
      isHide: false,
    });

    this.levelManager = levelManager;
    this.signals = [];
    this.isEmitted = false;

  }

  onModelReady(mesh) {
    if (!mesh) return;

    this.mesh = mesh;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    // 初始化其他逻辑
  }

  addSignals(signalDataList) {
    this.signals = signalDataList.map((data) => new Signal(data));
  }

  emitSignals() {
    if (this.levelManager?.isSignalReceived) return;

    for (const signal of this.signals) {
      signal.addCount();
    }
    this.levelManager?.setSignals(this.signals);
    this.isEmitted = true;
  }
}
