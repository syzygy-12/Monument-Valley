import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class TriangularPrism extends SignalResponsiveObject {
  constructor({ width, height, depth, position, isHide, initialQuaternion, signalIdList }) {
    // 创建三棱柱的几何体
    const geometry = TriangularPrism.createTriangularGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0x8b4513, flatShading: true }); // 棕色材质
    super({ geometry, material, position, isHide, signalIdList });

    // 初始旋转四元数
    if (initialQuaternion) {
      const quat = new THREE.Quaternion(
        initialQuaternion.x, 
        initialQuaternion.y,
        initialQuaternion.z,
        initialQuaternion.w
      );
      this.initialQuaternion = quat.clone();
      this.mesh.quaternion.copy(quat);
    }
  }

  static createTriangularGeometry(width, height, depth) {
    const vertices = [];
    const indices = [];
    vertices.push(
      0 - width / 2, 0 - height / 2, 0 - depth / 2, // 0
      width - width / 2, 0 - height / 2, 0 - depth / 2, // 1
      0 - width / 2, height - height / 2, 0 - depth / 2, // 2
      0 - width / 2, height - height / 2, depth - depth / 2, // 3
      width - width / 2, height - height / 2, depth - depth / 2, // 4
      width - width / 2, height - height / 2, 0 - depth / 2 // 5
    );

    indices.push(
      0, 2, 1,
      2, 5, 1,
      0, 3, 2,
      1, 5, 4,
      3, 4, 5,
      5, 2, 3,
      0, 1, 4,
      4, 3, 0
    );
    // 创建 BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
  
    return geometry; 
  }
}
