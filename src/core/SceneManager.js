const clock = new THREE.Clock();

export default class SceneManager {
  constructor(container) {
    this.container = container; // 游戏的 div 容器
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    const d = 25; // 正交相机范围
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    this.shiftVector = { dx: 0, dy: 0 };

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    //this.renderer.shadowMap.enabled = true;
    //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0); // 背景透明
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.updatables = [];
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

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

    this.camera.position.set(-30, 30, 30);
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
    this.camera.position.set(-30, 30, 30);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.shiftCamera(this.shiftVector);
  }

  onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  tick() {
    const delta = clock.getDelta();
    for (const object of this.updatables) {
      if (object.tick) object.tick(delta);
    }
  }

  startRendering() {
    const animate = () => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
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
