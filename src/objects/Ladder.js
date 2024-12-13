import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Ladder extends SignalResponsiveObject {
  constructor({ position, normal, color, signalIdList }) {
    const stepWidth = 1.5; // 长方形的长度
    const stepHeight = 0.25; // 长方形的宽度
    const stepSpacing = 0.25; // 每两个长方形之间的垂直间隔

    // 创建一个空的 Group 来存放四个长方形
    const ladderGroup = new THREE.Group();

    if (color) {
      color = parseInt(color, 16);
    }

    const material = new THREE.MeshStandardMaterial({
      color: color || 0x000000,
      side: THREE.DoubleSide,
    });

    // 创建四个长方形并添加到梯子组中
    for (let i = 0; i < 4; i++) {
      const geometry = new THREE.PlaneGeometry(stepWidth, stepHeight);
      const step = new THREE.Mesh(geometry, material);

      // 设置每个长方形的Y轴偏移，使它们垂直排列
      const yOffset = i * (stepHeight + stepSpacing) - 2 * stepHeight - stepSpacing;
      step.position.set(0, yOffset, 0);

      ladderGroup.add(step);
    }

    // 设置梯子整体的位置
    ladderGroup.position.copy(position);

    // 根据 `normal` 参数旋转梯子
    if (normal) {
      const quaternion = new THREE.Quaternion();
      if (normal === "x") {
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      } else if (normal === "y") {
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      } else if (normal === "z") {
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
      }
      ladderGroup.quaternion.copy(quaternion);
    }

    // 调用父类构造函数并设置 `mesh`
    super({
      geometry: null, // 几何体已手动创建
      material: null,
      position,
      signalIdList,
    });
    this.mesh = ladderGroup; // 设置组合好的Group为mesh
  }
}
