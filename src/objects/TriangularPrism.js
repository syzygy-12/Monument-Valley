import Platform from "./Platform.js";

export default class TriangularPrism extends Platform {

  constructor({ width, height, depth, position, cutDirection, initialQuaternion, signalIdList }) {
    super({ width, height, depth, position, signalIdList }); // 继承 Platform 的属性和方法

    this.cutDirection = cutDirection; // 保存切割方向

    // 根据切割方向生成几何体
    const geometry = this.createTriangularGeometry(width, height, depth, cutDirection);
    const material = new THREE.MeshStandardMaterial({ color: 0x8b4513, flatShading: true }); // 和父类保持一致的材质
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
    
    if (initialQuaternion) {
      const quat = new THREE.Quaternion(initialQuaternion.x, 
                initialQuaternion.y, initialQuaternion.z, initialQuaternion.w);
      this.initialQuaternion = quat.clone();
      this.mesh.quaternion.copy(quat);
    }
    //绕y轴逆时针90，再z轴逆时针180的四元数
    // const quat = new THREE.Quaternion();
    // quat.setFromEuler(new THREE.Euler(Math.PI / 2, Math.PI , Math.PI / 2 ));
    // console.log(quat);
    // this.initialQuaternion = quat.clone();
    // this.mesh.quaternion.copy(quat);
  }

  createTriangularGeometry(width, height, depth, cutDirection) {
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
  
    if (cutDirection === "x") {
      // 沿 X 轴切割（对角切成三角体）
      
    } else if (cutDirection === "y") {
      // 沿 Y 轴切割
      vertices.push(
        // 左侧矩形
        0, 0, 0, // 0
        width, 0, 0, // 1
        0, height, depth, // 2
        // 顶部三角面
        width, height, depth // 3
      );
  
      indices.push(
        // 底面三角形
        0, 1, 2,
        // 两侧面
        0, 1, 3,
        1, 2, 3,
        2, 0, 3
      );
    } else if (cutDirection === "z") {
      // 沿 Z 轴切割
      vertices.push(
        // 前侧矩形
        0, 0, 0, // 0
        width, 0, 0, // 1
        0, height, 0, // 2
        // 顶部三角面
        width, height, depth // 3
      );
  
      indices.push(
        // 底面三角形
        0, 1, 2,
        // 两侧面
        0, 1, 3,
        1, 2, 3,
        2, 0, 3
      );
    }
  
    
  }
}
