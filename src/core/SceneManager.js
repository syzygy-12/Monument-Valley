const clock = new THREE.Clock();

export default class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    
    const aspect = window.innerWidth / window.innerHeight; // 启用正交投影
    const d = 20;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.outputEncoding = THREE.sRGBEncoding; // 确保正确的颜色空间
    this.renderer.physicallyCorrectLights = true; // 启用物理光照
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 可选：更柔和的阴影
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.zIndex = "-1"; // 确保在背景层
    this.renderer.domElement.style.backgroundColor = 'transparent'; // 避免黑色背景
    this.renderer.setClearColor(0x000000, 0);
    document.body.appendChild(this.renderer.domElement);


    this.camera.position.set(-10, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // 让相机指向场景中心
    this.updatables = [];
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
    this.controls.enableDamping = true;

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", () => this.onWindowResize());
  }

  init() {
    
    this.scene.background = new THREE.Color(0x87ceeb);
    this.renderer.domElement.style.zIndex = "0"; // 确保在背景层
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // 环境光
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // 方向光
    directionalLight.position.set(-10, 10, 0); // 设置光源位置
    // 启用方向光的影子
    directionalLight.castShadow = true;

    // 可选：调整影子的分辨率和范围（影响性能）
    directionalLight.shadow.mapSize.width = 1024; // 默认 512
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10; // 调整阴影投射范围
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;

    this.scene.add(directionalLight);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls.enableDamping = true;
  }

  shiftCamera(shiftVector) {
    const dx = shiftVector.dx, dy = shiftVector.dy;
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.normalize(); // 确保方向是单位向量

    const left = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, -1, 0)).normalize();
    this.camera.position.addScaledVector(left, dx); 

    const up = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 1)).normalize();
    this.camera.position.addScaledVector(up, dy); 
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    // 更新相机的投影矩阵
    const d = 20;  // 这里d的值可以根据需要动态调整
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;

    // 更新相机的投影矩阵
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  tick() {
    const delta = clock.getDelta();

    for (const object of this.updatables) {
      if (object.tick) {
        object.tick(delta);
      }
    }
  }

  // 启动渲染循环
  startRendering() {
    const animate = () => {
      this.tick();
      //console.log(this.camera.position);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    };
    animate();
  }
}
