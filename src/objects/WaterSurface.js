class WaterSurface {
    constructor({ position, size, levelManager }) {
      this.scene = levelManager.sceneManager.scene;
      this.camera = levelManager.sceneManager.camera;
      this.renderer = levelManager.sceneManager.renderer;
  
      // 水面的几何体（平面）
      const geometry = new THREE.PlaneGeometry(size, size);
  
      // 创建 Water 实例
      const water = new THREE.Water(geometry, {
        textureWidth: 512,
        textureHeight: 512,
        alpha: 0.5,  // 水面的透明度
        sunDirection: new THREE.Vector3(1, 1, 1).normalize(),  // 光源方向
        sunColor: 0xffffff,  // 光源颜色
        waterColor: 0x001e0f,  // 水面颜色
        distortionScale: 37,  // 波动的强度
      });
  
      // 设置水面的位置和旋转（使水面水平）
      water.position.set(position.x, position.y, position.z);
      water.rotation.x = - Math.PI / 2;  // 使水面平行于地面
  
      // 将水面添加到场景
      this.scene.add(water);
      console.log(water);
  
      // 保存对水面的引用，方便在渲染循环中更新
      this.water = water;
  
      // 创建反射和折射材质
      const renderTarget = new THREE.WebGLCubeRenderTarget(512, {
        format: THREE.RGBAFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
      });
  
      // 创建 CubeCamera
      this.reflectionCamera = new THREE.CubeCamera(1, 1000, renderTarget);
      this.reflectionCamera.position.copy(this.camera.position);
      this.scene.add(this.reflectionCamera);
    }
  
    tick(delta) {
      // 更新水面材质的反射
      this.reflectionCamera.update(this.renderer, this.scene);
  
      // 确保 'time' Uniform 正确更新
      if (this.water.material.uniforms['time']) {
        this.water.material.uniforms['time'].value += delta;  // 每帧增加 'time' 的值
      }
  
      // 可以在这里调节波动的强度，测试不同的 'distortionScale' 值
      if (this.water.material.uniforms['distortionScale']) {
        this.water.material.uniforms['distortionScale'].value = 37;  // 保持波动强度
      }
    }
  }
  
  export default WaterSurface;
  