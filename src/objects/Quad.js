export default class Quad {
  constructor({ width, height, position }) {
    const geometry = new THREE.PlaneGeometry(width, height);
    // debug, 使用 MeshStandardMaterial 来查看平面
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });
    // 使用 ShadowMaterial 接收阴影
    // const material = new THREE.ShadowMaterial({
    //   opacity: 0.5, // 控制影子的暗度，范围 [0, 1]
    // });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;

    // 将平面旋转为水平放置，并定位到指定位置
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(position.x, position.y, position.z);

    this.width = width;
    this.height = height;
    this.position = position;
    this.keyPoints = this.calculateKeyPoints();
  }

  // 获取 Quad 的中心
  getCenter() {
    return this.mesh.position.clone();
  }

  // 计算四个关键点（四条边的中心）
  // 注意: 这里只处理了quad是平行于x轴和z轴的情况，其他情况需要再修改！！！
  calculateKeyPoints() {
    const { x, y, z } = this.position;
    const north = new THREE.Vector3(x, y, z + this.height / 2);
    const south = new THREE.Vector3(x, y, z - this.height / 2);
    const east = new THREE.Vector3(x + this.width / 2, y, z);
    const west = new THREE.Vector3(x - this.width / 2, y, z);
    return {
      north: north,
      south: south,
      east: east,
      west: west
    };
  }

}
