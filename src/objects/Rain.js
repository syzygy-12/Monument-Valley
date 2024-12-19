export default class Rain {
  constructor({ particlesCount = 10000, areaSize = 200, speed = 0.3, signalIdList, levelManager }) {
    this.levelManager = levelManager;
    this.scene = this.levelManager.sceneManager.scene; // 引用场景
    this.particlesCount = particlesCount;
    this.areaSize = areaSize;
    this.speed = speed;

    this.animationType = null; // 动画类型
    this.isAnimating = false; // 是否正在执行动画
    this.isWaiting = false; // 是否在等待
    this.waitTimer = 0; // 等待时间
    this.initialWaitTime = 0; // 初始等待时间
    this.duration = 0; // 动画持续时间
    this.signalIdList = signalIdList || [];

    // 初始化粒子系统
    this.particleSystem = new THREE.Group(); // 用于存放所有的雨滴（Mesh对象）

    // 初始化雨滴的几何体（长方体）
    this.cubeGeometry = new THREE.BoxGeometry(0.04, 3.8, 0.04); // X, Y, Z 尺寸（长方体）

    // 材质
    this.material = new THREE.MeshBasicMaterial({
      color: 0x808080,
      transparent: true,
      opacity: 1, // 透明度
    });

    // 初始化雨滴
    this.initParticles();

    // 将粒子系统添加到场景中
    this.scene.add(this.particleSystem);
  }

  // 初始化粒子的位置和速度
  initParticles() {
    this.particles = [];

    for (let i = 0; i < this.particlesCount; i++) {
      // 创建每个雨滴的 Mesh 对象（长方体）
      let particle = new THREE.Mesh(this.cubeGeometry, this.material);
      // 旋转60度
      particle.rotation.x = Math.PI / 6;
      this.particleSystem.add(particle);
      this.particles.push(particle);

      // 初始化位置和速度
      const x = Math.random() * this.areaSize - this.areaSize / 2;
      const y = (Math.random() * this.areaSize - this.areaSize / 2) / 2;
      const z = Math.random() * this.areaSize - this.areaSize / 2;
      const velocityY = -Math.random() * this.speed - this.speed / 2;
      const velocityX = velocityY;
      const velocityZ = 0;

      // 存储粒子的速度和位置
      particle.position.set(x, y, z);
      particle.userData = { velocity: new THREE.Vector3(velocityX, velocityY, velocityZ) };
    }
  }

  setSignals(signals) {
    for (const signal of signals) {
      if (this.signalIdList.includes(signal.id)) {
        this.isWaiting = true; // 开启等待
        this.waitTimer = 0;
        this.initialWaitTime = signal.waitTime || 0; // 统一的等待时间
        if (signal.type === "stopRain") {
          this.animationType = "stopRain";
          this.duration = signal.duration || 1;
        }
        this.isAnimating = true;
      }
    }
  }

  // 更新粒子动画
  tick(delta) {
    // 遍历所有粒子，更新它们的位置
    this.particles.forEach((particle) => {
      const velocity = particle.userData.velocity;

      // 更新位置
      particle.position.addScaledVector(velocity, delta);

      // 如果粒子超出范围，重置到顶部
      if (particle.position.y < -this.areaSize / 4) {
        particle.position.y = this.areaSize / 4; // 重置到顶部
        particle.position.x = Math.random() * this.areaSize - this.areaSize / 2; // X 重置
        particle.position.z = Math.random() * this.areaSize - this.areaSize / 2; // Z 重置
      }
    });

    if (this.isWaiting) {
      this.waitTimer += delta;
      if (this.waitTimer >= this.initialWaitTime) {
        this.isWaiting = false; // 等待完成
      }
      return; // 等待期间不执行动画
    }
    if (!this.isAnimating) return;
    if (this.animationType === "stopRain") {
      // 把particle数量逐渐减少到0，每个tick移除一些particle
      this.duration -= delta;
      if (this.duration > 0) {
        // 移除x个particle，x = particlesCount / duration
        const removeCount = this.particlesCount / this.duration * delta;
        for (let i = 0; i < removeCount; i++) {
          const particle = this.particles.pop();
          this.particleSystem.remove(particle);
        }
      } else {
        this.isAnimating = false;
      }
      
    }
  }

}
