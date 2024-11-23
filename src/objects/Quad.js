import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Quad extends SignalResponsiveObject {
  constructor({ width, height, position, signalIdList }) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });

    super({ geometry, material, position, signalIdList });
    //console.log(this);

    // 旋转平面到水平位置，注意四元数的更新
    // TODO: 增加不同方向的旋转
    this.initialQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    this.mesh.quaternion.copy(this.initialQuaternion);



    // 计算四个关键点
    this.width = width;
    this.height = height;
    this.keyPoints = this.calculateKeyPoints();
  }

  getCenter() {
    return this.mesh.position.clone();
  }

  // 计算四个关键点
    // TODO: 增加不同方向的旋转
    // TODO: 改为每条边的中点
  calculateKeyPoints() {
    const { x, y, z } = this.position;
    return {
      north: new THREE.Vector3(x, y, z + this.height / 2),
      south: new THREE.Vector3(x, y, z - this.height / 2),
      east: new THREE.Vector3(x + this.width / 2, y, z),
      west: new THREE.Vector3(x - this.width / 2, y, z),
    };
  }

  tick(delta) {
    if (!this.isAnimating) return;
  
    // 计算旋转增量
    this.angleDelta = this.animationSpeed * delta;
  
    // 剩余角度计算
    const remainingAngle = this.targetAngle - this.currentAngle;
    const angleThreshold = Math.PI / 180; // 阈值（1度）
  
    if (remainingAngle <= angleThreshold) {
      this.angleDelta = remainingAngle; // 直接到目标角度
      this.currentAngle = this.targetAngle; // 更新为目标角度
  
      // 更新位置和旋转到目标
      this.startPositionOffset.applyQuaternion(
        new THREE.Quaternion().setFromAxisAngle(this.axis, remainingAngle)
      );
      const finalPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);
      this.mesh.position.copy(finalPosition);
      this.mesh.quaternion.copy(this.initialQuaternion);
      this.mesh.quaternion.premultiply(this.targetQuaternion);
      this.position.copy(finalPosition); // 更新逻辑位置
      this.keyPoints = this.calculateKeyPoints(); // 更新关键点
      this.isAnimating = false; // 动画完成
      return; // 动画结束
    }
  
    // 累计旋转角度
    this.currentAngle += this.angleDelta;
  
    // 应用旋转
    const quaternion = new THREE.Quaternion().setFromAxisAngle(this.axis, this.angleDelta);
    this.startPositionOffset.applyQuaternion(quaternion);
  
    // 计算新的位置
    const newPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);
  
    // 应用位置和旋转
    this.mesh.position.copy(newPosition);
    this.mesh.quaternion.premultiply(quaternion);
  
    // 更新逻辑位置
    this.position.copy(this.mesh.position);
  }
}
