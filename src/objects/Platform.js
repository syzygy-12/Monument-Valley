import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Platform extends SignalResponsiveObject {
  constructor({ width, height, depth, position, isHide, signalIdList }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    // 调用父类构造函数
    super({ geometry, material, position, isHide, signalIdList });
  }

  // 如果需要对信号添加自定义行为，可重写 setSignal 方法
}