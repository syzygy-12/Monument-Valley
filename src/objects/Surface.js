import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Surface extends SignalResponsiveObject {
  constructor({ width, height, position, normal, color, signalIdList, roughness, metalness }) {
    const geometry = new THREE.PlaneGeometry(width, height);
    // 把color转成16进制，注意color是0x开头的16进制数
    if (color) {
      color = parseInt(color, 16);
    }
    const material = new THREE.MeshStandardMaterial({
      color: color || 0x8b4513,
      side: THREE.DoubleSide,
      roughness: roughness || 0.0,
      metalness: metalness || 0.0,
    });
    console.log(color);
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
      this.initialQuaternion = quaternion.clone();
      this.mesh.quaternion.copy(quaternion);
    }
  }

  // 如果需要对信号添加自定义行为，可重写 setSignal 方法
}