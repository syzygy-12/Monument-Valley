export default class Character {
  constructor() {
    const geometry = new THREE.SphereGeometry(1.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0.3, 0); // 初始位置
    this.speed = 4; // 移动速度，单位：单位/秒

    this.currentQuad = null; // 当前所在的 Quad
    this.path = []; // 移动路径, 存的是 quad

    this.targetPosition = this.mesh.position.clone();
  }

  setInitialQuad(quad) {
    this.currentQuad = quad;
    this.mesh.position.copy(quad.getCenter());
    this.targetPosition.copy(quad.getCenter());
  }

  followPath(path) {
    this.path = path; // 设置新的路径
    this.path.shift(); // 移除第一个 Quad，因为当前位置已经在这个 Quad 上
    this.moveToNextQuad(); // 开始移动到第一个目标
  }

  moveToNextQuad() {
    if (this.path.length > 0) {
      // 从路径中取出下一个 Quad 并设置目标位置
      const nextQuad = this.path.shift();
      this.targetPosition.copy(nextQuad.getCenter());
      this.currentQuad = nextQuad; // 更新当前所在的 Quad
    } else {
      this.targetPosition = this.mesh.position.clone(); // 没有更多目标位置
    }
  }

  // 每帧更新位置的 tick 方法
  tick(delta) {
    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position);
    const distance = direction.length();
    if (distance > 0.01) {
        direction.normalize();
        const moveDistance = this.speed * delta;

        if (moveDistance < distance) {
            // 按照固定步长移动
            this.mesh.position.addScaledVector(direction, moveDistance);
        } else {
            // 到达目标位置
            this.mesh.position.copy(this.targetPosition);
            if (this.path.length > 0) {
                // 移动到下一个 Quad
                this.moveToNextQuad();
            }
        }
    } else {
        // 到达目标位置
        if (this.path.length > 0) {
            // 移动到下一个 Quad
            this.moveToNextQuad();
        }
    }
}
}
