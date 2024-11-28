import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Surface extends SignalResponsiveObject {
  constructor({ width, height, position, normal, signalIdList }) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({ color: 0x8b4513, side: THREE.DoubleSide });

    // 调用父类构造函数
    super({ geometry, material, position, signalIdList });

    // 设置法向量
    if (normal) {
      const quaternion = new THREE.Quaternion();
    if (normal === "x") {
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    } else if (normal === "y") {
      quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    } else if (normal === "z") {
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
    }
      this.mesh.quaternion.copy(quaternion);
    }
  }

  // 如果需要对信号添加自定义行为，可重写 setSignal 方法
}