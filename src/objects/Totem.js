import SignalResponsiveObject from "./SignalResponsiveObject.js";

export default class Totem extends SignalResponsiveObject {
  constructor(quad, sceneManager, levelManager, signalIdList) {
    super({ signalIdList });

    this.sceneManager = sceneManager;
    this.levelManager = levelManager;
    this.mesh = null; // 3D 模型
    this.speed = 6; // 移动速度，单位：单位/秒

    this.currentQuad = quad; // 当前所在的 Quad
    this.headQuad = this.shiftHead(quad); // 头部 Quad
    this.targetQuad = null; // 目标 Quad
    this.isMoving = false; // 是否正在移动

    const { scene, updatables } = this.sceneManager;
    scene.add(this.headQuad.mesh);
    updatables.push(this.headQuad);
    this.levelManager.quads.push(this.headQuad);
    this.levelManager.buildGraph();

    this.currentQuad.toggleCharacterOn();

    this.loadModel().then(() => {
      this.initKeyboardControls(); // 初始化键盘控制
    });
  }

  loadModel() {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
      loader.load(
        `${basePath}assets/totem.glb`,
        (gltf) => {
          const model = gltf.scene.children[0];
          this.mesh = model;
          this.mesh.traverse((child) => {
            if (child.isMesh) {
              child.geometry.translate(0, 0, 0);
              // 模型太暗了，要加亮一点，注意不要让整个场景变量，只让totem变亮
              child.material.color.multiplyScalar(1.5); // 提亮颜色（1.5倍强度）
            }
          });
          // 设为当前quad的位置
          this.mesh.position.copy(this.currentQuad.mesh.position);
          this.mesh.scale.set(0.112, 0.112, 0.1065);
          
          resolve(this.mesh);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * 初始化键盘控制
   */
  initKeyboardControls() {
    window.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "w":
        case "W":
          this.tryMove(2, 0, 0); // 向前移动 (+z)
          break;
        case "s":
        case "S":
          this.tryMove(-2, 0, 0); // 向后移动 (-z)
          break;
        case "a":
        case "A":
          this.tryMove(0, 0, -2); // 向左移动 (-x)
          break;
        case "d":
        case "D":
          this.tryMove(0, 0, 2); // 向右移动 (+x)
          break;
      }
    });
  }

  tryMove(dx, dy, dz) {
    // 检查是否正在移动，防止重复触发
    if (this.isMoving) return;
  
    // 计算目标位置
    const targetPosition = this.currentQuad.position.clone().add(new THREE.Vector3(dx, dy, dz));

    // 初始化投影坐标
    const camera = this.sceneManager.camera;
    const targetScreenPosition = targetPosition.clone().project(camera);
    // 这里需要舍弃z坐标
    targetScreenPosition.z = 0;
    console.log("targetScreenPosition", targetScreenPosition);

    // 查找目标 Quad，屏幕空间比较 + 法线比较
    const targetQuad = this.levelManager.quads.find((quad) => {
      // 将 Quad 位置投影到屏幕空间
      const quadScreenPosition = quad.position.clone().project(camera);
      // 这里需要舍弃z坐标
      quadScreenPosition.z = 0;

      // 检查屏幕空间坐标是否接近（解决浮点误差）
      const screenClose = quadScreenPosition.distanceTo(targetScreenPosition) < 0.01;

      // 检查法线方向是否一致
      const normalMatch = quad.normal === this.currentQuad.normal;

      return screenClose && normalMatch;
    });
  
    if (targetQuad) {
      //console.log(this.currentQuad.position, targetQuad.position);
      //console.log(this.levelManager.character.currentQuad.position, this.levelManager.character.targetQuad.position);
      if (targetQuad.occupied || targetQuad === this.levelManager.character.targetQuad
        || targetQuad === this.levelManager.character.currentQuad 
        || this.currentQuad === this.levelManager.character.currentQuad
        || this.currentQuad === this.levelManager.character.targetQuad) {
        return;
      }
      // 更新状态，开始移动
      this.isMoving = true;
      this.targetQuad = targetQuad;
      this.startPosition = this.mesh.position.clone(); // 起始位置
      this.targetPosition = targetQuad.mesh.position.clone(); // 目标位置
      this.movementProgress = 0; // 动画进度重置
    } else {
      //console.log("Cannot move: Target position has no Quad or normals do not match.");
    }
  }
  

  shiftHead(quad) {
    const headQuad = quad.clone();
    const normal = quad.normal;
    const shift = 8;
    if (normal === "x") {
      headQuad.position.x += shift;
    } else if (normal === "y") {
      headQuad.position.y += shift;
    } else if (normal === "z") {
      headQuad.position.z += shift;
    }
    headQuad.mesh.position.copy(headQuad.position);
    headQuad.keyPoints = headQuad.calculateKeyPoints();
    return headQuad;
  }

  updateHeadPosition() {
    this.headQuad.position.copy(this.mesh.position);
    const normal = this.currentQuad.normal;
    const shift = 8;
    if (normal === "x") {
      this.headQuad.position.x += shift;
    } else if (normal === "y") {
      this.headQuad.position.y += shift;
    } else if (normal === "z") {
      this.headQuad.position.z += shift;
    }
    this.headQuad.mesh.position.copy(this.headQuad.position);
    this.headQuad.keyPoints = this.headQuad.calculateKeyPoints();
    //console.log("headQuad", this.headQuad);
  }

  tick(delta) {
    // 如果当前 Quad 正在动画中，跟随移动
    if (!this.currentQuad) return;
    if (this.currentQuad.isAnimating) {
      this.headQuad.isAnimating = true;
      this.mesh.position.copy(this.currentQuad.mesh.position);
      this.updateHeadPosition();
      //this.targetPosition.copy(this.currentQuad.mesh.position);
      return;
    }
    
    if (this.currentQuad.plate && !this.currentQuad.plate.isEmitted) {
      this.currentQuad.plate.emitSignals();      
    }

    // 如果正在移动，执行平滑动画
    if (this.isMoving) {
      this.headQuad.isAnimating = true;
      this.movementProgress += this.speed * delta; // 进度更新（速度 * 时间）

      // 计算当前插值位置
      const currentPosition = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.targetPosition,
        Math.min(this.movementProgress, 1) // 限制进度最大为 1
      );
      this.mesh.position.copy(currentPosition);
      this.updateHeadPosition();

      // 检查是否到达目标
      if (this.movementProgress >= 1) {
        this.finishMove();
      }
    }
    else {
      this.headQuad.isAnimating = false;
    }

  }

  finishMove() {
    // 结束移动，更新状态
    this.isMoving = false;
    this.currentQuad.toggleCharacterOn();
    this.currentQuad = this.targetQuad;
    this.currentQuad.toggleCharacterOn();
    this.targetQuad = null;
  
    // 更新 headQuad 位置（如果有）
    this.updateHeadPosition();
    this.levelManager.buildGraph();
  }
}
