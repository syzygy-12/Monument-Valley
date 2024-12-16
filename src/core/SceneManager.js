const clock = new THREE.Clock();

export default class SceneManager {
  constructor(container) {
    this.container = container; // 游戏的 div 容器
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.d = 25;
    const d = this.d; // 正交相机范围
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    this.shiftVector = { dx: 0, dy: 0 };
    this.isAnimating = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setClearColor(0x000000, 0); // 背景透明
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.time = 0;

    this.isWaiting = false;
    this.waitTimer = 0;
    this.initialWaitTime = 0;
    this.animationType = null;

    // 摄像机震动参数
    this.cameraShakeDuration = 0; // 震动持续时间
    this.cameraShakeIntensity = 0; // 震动幅度
    this.cameraOriginalPosition = new THREE.Vector3(); // 保存相机初始位置

    this.updatables = [];
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;

    // 将渲染器挂载到游戏容器中
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onWindowResize());
  }

  init() {
    this.scene.background = new THREE.Color(0x87ceeb); // 天蓝色背景

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
    directionalLight.position.set(-10, 15, -7);
    //directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    this.camera.position.set(-50, 50, 50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  shiftCamera(shiftVector) {
    this.shiftVector = shiftVector;
    const dx = shiftVector.dx, dy = shiftVector.dy;
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.normalize(); // 确保方向是单位向量

    const left = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, -1, 0)).normalize();
    this.camera.position.addScaledVector(left, dx); 

    const up = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 1)).normalize();
    this.camera.position.addScaledVector(up, dy); 
  }

  resetCameraPosition() {
    this.controls.reset();
    this.camera.position.set(-50, 50, 50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.shiftCamera(this.shiftVector);
    this.camera.zoom = 1; 
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = this.d;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setSignals(signals) {
    for (const signal of signals) {
      if (signal.toCamera) {
          this.isWaiting = true; // 开启等待
          this.waitTimer = 0;
          this.initialWaitTime = signal.waitTime || 0; // 统一的等待时间
          if (signal.type === "cameraShake") {
            // 摄像机震动，持续时间为 duration
            this.animationType = "cameraShake";
            this.cameraShakeDuration = signal.duration;
            this.cameraShakeIntensity = signal.intensity;

            // 保存相机原始位置
            this.cameraOriginalPosition.copy(this.camera.position);
            this.isAnimating = true;
          } else if (signal.type === "addDirectionalLight") {
            // 添加平行光，亮度从0逐渐变化到intensity
            this.animationType = "addDirectionalLight";
            const light = new THREE.DirectionalLight(signal.color, 0);
            light.position.copy(signal.position);
            this.scene.add(light);
            new TWEEN.Tween(light)
              .to({ intensity: signal.intensity }, signal.duration * 1000)
              .start();

            
          }
      }
    }
  }

  tick() {
    const delta = clock.getDelta();
    this.time += delta;
    for (const object of this.updatables) {
      if (object.tick) object.tick(delta);
    }
    //Tween更新
    TWEEN.update();

    // 等待状态优先
    if (this.isWaiting) {
        this.waitTimer += delta;
        if (this.waitTimer >= this.initialWaitTime) {
            this.isWaiting = false; // 等待完成
        }
        //console.log(this.waitTimer);
        return; // 等待期间不执行动画
    }

    if (!this.isAnimating) return;

    // 摄像机震动逻辑
    if (this.animationType === "cameraShake") {
      this.cameraShakeDuration -= delta;
      //console.log(this.cameraShakeDuration);
      if (this.cameraShakeDuration > 0) {
        const shakeX = (Math.random() * 2 - 1) * this.cameraShakeIntensity;
        const shakeY = (Math.random() * 2 - 1) * this.cameraShakeIntensity;
        const shakeZ = (Math.random() * 2 - 1) * this.cameraShakeIntensity;

        this.camera.position.set(
          this.cameraOriginalPosition.x + shakeX,
          this.cameraOriginalPosition.y + shakeY,
          this.cameraOriginalPosition.z + shakeZ
        );
      } else {
        // 震动结束，重置相机位置
        this.camera.position.copy(this.cameraOriginalPosition);
        this.isAnimating = false;
        this.animationType = null;
      }
    }
  }

  startRendering() {
    const animate = () => {
      this.tick();
      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(animate);
      TWEEN.update();
    };
    animate();
  }

  background(color) {
    if (color) {
      color = parseInt(color, 16);
    }
    this.scene.background = new THREE.Color(color);
  }

}
