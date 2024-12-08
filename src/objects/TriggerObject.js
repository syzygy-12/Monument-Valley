import SignalResponsiveObject from "./SignalResponsiveObject.js";
import Signal from "./Signal.js";

export default class TriggerObject extends SignalResponsiveObject {
  constructor({ geometry, material, position, signalIdList, levelManager }) {
    super({ geometry, material, position, signalIdList });
    this.levelManager = levelManager;
    this.signals = [];
    this.isEmitted = false; // 统一控制信号是否已触发
  }

  addSignals(signalDataList) {
    this.signals = signalDataList.map((data) => new Signal(data));
  }

  /**
   * 触发所有信号
   */
  emitSignals() {
    if (this.levelManager.isSignalReceived) return;

    for (const signal of this.signals) {
      signal.addCount();
    }
    this.levelManager.setSignals(this.signals);
    this.isEmitted = true; // 标记为已触发，适用于单次触发
  }

}
