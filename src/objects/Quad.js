import SignalResponsiveObject from "./SignalResponsiveObject.js";
import Plate from "./Plate.js";
import DoublePlate from "./DoublePlate.js";

export default class Quad extends SignalResponsiveObject {
  constructor({ width, height, position, normal, initialQuaternion, plate, doublePlate, signalIdList, levelManager }) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });

    super({ geometry, material, position, signalIdList });
    this.mesh.visible = false;
    this.mesh.receiveShadow = true;
    this.mesh.position.x += 1e-3;
    this.mesh.position.y += 1e-3;
    this.mesh.position.z += 1e-3;


    // 旋转平面到水平位置，注意四元数的更新
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
    else if (initialQuaternion) {
      const quat = new THREE.Quaternion(initialQuaternion.x, 
            initialQuaternion.y, initialQuaternion.z, initialQuaternion.w);
      this.initialQuaternion = quat.clone();
      this.mesh.quaternion.copy(quat);
    }

    if (plate) {
      this.plate = new Plate({...plate, levelManager});
    }
    if (doublePlate) {
      this.doublePlate = new DoublePlate({...doublePlate, levelManager});
    }

    // 计算四个关键点
    this.width = width;
    this.height = height;
    this.keyPoints = this.calculateKeyPoints();
  }

  getCenter() {
    return this.mesh.position.clone();
  }

  // 计算四个关键点
  calculateKeyPoints() {
    const mesh = this.mesh;
    const geometry = mesh.geometry;
    mesh.updateMatrixWorld(true);
    
    // 获取网格的顶点数据
    const vertices = geometry.attributes.position.array;
    const index = geometry.index.array;


    // 获取四边形的四个角点
    const v0 = new THREE.Vector3(vertices[0], vertices[1], vertices[2]); 
    const v1 = new THREE.Vector3(vertices[3], vertices[4], vertices[5]); 
    const v2 = new THREE.Vector3(vertices[6], vertices[7], vertices[8]); 
    const v3 = new THREE.Vector3(vertices[9], vertices[10], vertices[11]);  
    // 将顶点从局部坐标转换到世界坐标
    const worldV0 = v0.clone().applyMatrix4(mesh.matrixWorld);
    const worldV1 = v1.clone().applyMatrix4(mesh.matrixWorld);
    const worldV2 = v2.clone().applyMatrix4(mesh.matrixWorld);
    const worldV3 = v3.clone().applyMatrix4(mesh.matrixWorld);
  
    // 计算每条边的中点
    const midNorth = new THREE.Vector3().addVectors(worldV0, worldV1).multiplyScalar(0.5);  // 北边
    const midSouth = new THREE.Vector3().addVectors(worldV2, worldV3).multiplyScalar(0.5);  // 南边
    const midEast = new THREE.Vector3().addVectors(worldV1, worldV3).multiplyScalar(0.5);   // 东边
    const midWest = new THREE.Vector3().addVectors(worldV2, worldV0).multiplyScalar(0.5);   // 西边
  
    // 返回特定边的中点
    return {
      north: midNorth,
      south: midSouth,
      east: midEast,
      west: midWest,
    };
  }

  animationComplete() {
    this.keyPoints = this.calculateKeyPoints(); // 更新关键点
  }

  toggleCharacterOn() {
    if (this.doublePlate) {
      this.doublePlate.toggleCharacterOn();
    }
  }

}
