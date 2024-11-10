const clock = new THREE.Clock();

export default class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.renderer = new THREE.WebGLRenderer();
    this.camera.position.set(0, 5, 10);
    this.updatables = [];
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement,
    );

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", () => this.onWindowResize());
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls.enableDamping = true;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
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
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    };
    animate();
  }
}
