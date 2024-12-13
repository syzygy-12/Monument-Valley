export default class Rain {
  constructor({ particlesCount = 10000, areaSize = 200, speed = 0.3, levelManager }) {
    this.levelManager = levelManager;
    console.log(this.levelManager);
    this.scene = this.levelManager.sceneManager.scene; // 引用场景
    this.particlesCount = particlesCount;
    this.areaSize = areaSize;
    this.speed = speed;

    // 初始化粒子系统
    this.particleSystem = new THREE.Group(); // 用于存放所有的雨滴（Mesh对象）
    
    // 初始化雨滴的几何体（长方体）
    this.cubeGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1); // X, Y, Z 尺寸（长方体）

    // 材质
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.5, // 透明度
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
      const particle = new THREE.Mesh(this.cubeGeometry, this.material);
      this.particleSystem.add(particle);
      this.particles.push(particle);

      // 初始化位置和速度
      const x = Math.random() * this.areaSize - this.areaSize / 2;
      const y = Math.random() * this.areaSize - this.areaSize / 2;
      const z = Math.random() * this.areaSize - this.areaSize / 2;
      const velocityX = 0;
      const velocityY = -Math.random() * this.speed - this.speed / 3;
      const velocityZ = 0;

      // 存储粒子的速度和位置
      particle.position.set(x, y, z);
      particle.userData = { velocity: new THREE.Vector3(velocityX, velocityY, velocityZ) };
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
      if (particle.position.y < -this.areaSize / 2) {
        particle.position.y = this.areaSize / 2; // 重置到顶部
        particle.position.x = Math.random() * this.areaSize - this.areaSize / 2; // X 重置
        particle.position.z = Math.random() * this.areaSize - this.areaSize / 2; // Z 重置
      }
    });
  }
}
