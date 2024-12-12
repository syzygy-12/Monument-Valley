import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Platform extends SignalResponsiveObject {
  constructor({ width, height, depth, position, isHide, signalIdList, color }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    if (color) {
      color = parseInt(color, 16);
    }
    const material = new THREE.MeshStandardMaterial({ color: color || 0x8b4513 });

    // 调用父类构造函数
    super({ geometry, material, position, isHide, signalIdList, color });
  }

  // 如果需要对信号添加自定义行为，可重写 setSignal 方法
}