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
    const { x, y, z } = this.mesh.position;
    return {
      north: new THREE.Vector3(x, y, z + this.height / 2),
      south: new THREE.Vector3(x, y, z - this.height / 2),
      east: new THREE.Vector3(x + this.width / 2, y, z),
      west: new THREE.Vector3(x - this.width / 2, y, z),
    };
  }

  animationComplete() {
    this.keyPoints = this.calculateKeyPoints(); // 更新关键点
    console.log(this.keyPoints);
  }

}
