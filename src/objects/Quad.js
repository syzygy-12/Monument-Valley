export default class Quad {
  constructor({ width, height, position }) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);

    // 将平面旋转为水平放置，并定位到指定位置
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(position.x, position.y + 0.001, position.z);

    this.width = width;
    this.height = height;
    this.position = position;
    this.keyPoints = this.calculateKeyPoints();
    //console.log(this.keyPoints);
  }

  // 获取 Quad 的中心
  getCenter() {
    return this.mesh.position.clone();
  }

  // 计算四个关键点（四条边的中心）
  // 注意: 这里只处理了quad是平行于x轴和z轴的情况，其他情况需要再修改！！！
  calculateKeyPoints() {
    const { x, y, z } = this.position;
    return {
      north: new THREE.Vector3(x, y, z + this.height / 2),
      south: new THREE.Vector3(x, y, z - this.height / 2),
      east: new THREE.Vector3(x + this.width / 2, y, z),
      west: new THREE.Vector3(x - this.width / 2, y, z),
    };
  }

  // 检查两个 Quad 是否有公共边
  isConnectedTo(otherQuad) {
    const threshold = 0.1;
    for (const key in this.keyPoints) {
      for (const otherKey in otherQuad.keyPoints) {
        if (this.keyPoints[key].distanceTo(otherQuad.keyPoints[otherKey]) < threshold) {
          return true;
        }
      }
    }
  }
}
