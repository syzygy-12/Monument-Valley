export default class Snow {
  constructor( {particlesCount = 10000, size = 0.2, areaSize = 200, speed = 0.3, levelManager}) {
    this.levelManager = levelManager;
    console.log(this.levelManager);
    this.scene = this.levelManager.sceneManager.scene; // 引用场景
    this.particlesCount = particlesCount;
    this.areaSize = areaSize;
    this.speed = speed;


    // 初始化几何体、材质和粒子系统
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particlesCount * 3);
    this.velocities = new Float32Array(this.particlesCount * 3);

    this.initParticles();

    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: size,
      transparent: true,
    });

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particleSystem);
  }

  // 初始化粒子的位置和速度
  initParticles() {
    for (let i = 0; i < this.particlesCount; i++) {
      const index = i * 3;

      // 随机初始化位置
      this.positions[index] = Math.random() * this.areaSize - this.areaSize / 2; // X
      this.positions[index + 1] = Math.random() * this.areaSize - this.areaSize / 2; // Y
      this.positions[index + 2] = Math.random() * this.areaSize - this.areaSize / 2; // Z

      // 设置随机向下速度
      this.velocities[index] = (Math.random() - 0.5) * this.speed / 3; // X 速度
      this.velocities[index + 1] = -Math.random() * this.speed - this.speed / 3; // Y 速度
      this.velocities[index + 2] = (Math.random() - 0.5) * this.speed / 3; // Z 速度
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
  }

  // 更新粒子动画
  tick(delta) {
    const positions = this.geometry.attributes.position.array;

    for (let i = 0; i < this.particlesCount; i++) {
      const index = i * 3;
        // 更新粒子位置
        positions[index] += this.velocities[index] * delta;
        positions[index + 1] += this.velocities[index + 1] * delta;
        positions[index + 2] += this.velocities[index + 2] * delta;

      // 如果粒子超出范围，重置到顶部
      if (positions[index + 1] < -this.areaSize / 2) {
        positions[index + 1] = this.areaSize / 2; // 重置到顶部
        positions[index] = Math.random() * this.areaSize - this.areaSize / 2; // X 重置
        positions[index + 2] = Math.random() * this.areaSize - this.areaSize / 2; // Z 重置
      }
    }

    // 通知 Three.js 更新位置数据
    this.geometry.attributes.position.needsUpdate = true;
  }
}
