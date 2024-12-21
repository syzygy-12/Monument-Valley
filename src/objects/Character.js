import SignalResponsiveObject from "./SignalResponsiveObject.js";
import { fadeIn, fadeOut } from "../utils/AudioUtils.js";

// 注意:角色的SignalResponse是错误的，需要修改
export default class Character extends SignalResponsiveObject{
  constructor(sceneManager, levelManager, signalIdList) {

    // TODO: 增加角色响应signal的功能
    super({ signalIdList });

    this.sceneManager = sceneManager;
    this.levelManager = levelManager;
    this.mesh = null; // 3D 模型
    this.speed = 6; // 移动速度，单位：单位/秒
    this.mixer = null; // 动画混合器，用于控制动画
    this.animations = {}; // 存储动画动作

    this.currentQuad = null; // 当前所在的 Quad
    this.path = []; // 移动路径, 存的是 quad

    this.targetPosition = new THREE.Vector3(); // 目标位置
    this.currentKeypoint = null; // 当前 Quad 的关键点
    this.targetKeypoint = null; // 下一个 Quad 的关键点
    this.targetQuad = null; // 目标 Quad

    this.movementPhase = null; // 移动阶段: TO_KEYPOINT, TELEPORT, TO_CENTER
    
    this.loadModel();
    this.audio = new Audio("./assets/audio/walking.wav");
    this.audio.loop = true;
  }

  loadModel() {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      const basePath = window.location.pathname.replace(/\/[^/]*$/, '/');
      loader.load(
        `${basePath}assets/character1.glb`,
        (gltf) => {
          const model = gltf.scene.children[0];
          this.mesh = model;
          
          //修改geometry的位置,y轴增加35单位
          this.mesh.traverse((child) => {
            if (child.isMesh) {
              child.geometry.translate(0, 0, 0);
            }
          }
          );
          this.mesh.position.set(0, 0, 0);
          this.mesh.scale.set(1, 1, 1);
          this.mesh.castShadow = true;
          //console.log(this.animations); 
          
  
          if (gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.mesh);
            gltf.animations.forEach((clip) => {
              this.animations[clip.name] = this.mixer.clipAction(clip);
            });
  
            // 播放默认动画
            if (this.animations["Cylinder.002_Florida_0动作"]) {
              this.animations["Cylinder.002_Florida_0动作"].play();
            }
          }
          resolve(this.mesh); // 加载完成时 resolve 模型
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          reject(error); // 加载失败时 reject 错误
        }
      );
    });
  }  

  setInitialQuad(quad) {
    this.currentQuad = quad;
    this.mesh.position.copy(quad.getCenter());
    this.targetPosition.copy(quad.getCenter());
    this.targetQuad = quad;
    this.currentQuad.toggleCharacterOn();
  }

  followPath(path) {
    fadeIn(this.audio, 1, 0.16);
    this.path = path; // 设置新的路径
    //console.log("path", path);
    this.path.shift(); // 移除第一个 Quad，因为当前位置已经在这个 Quad 上
    this.moveToNextPhase(); // 开始移动到第一个目标
  }

  moveToNextPhase() {
    if (this.path.length > 0) {
      const nextQuad = this.path[0]; // 获取目标 Quad
      
      // 获取当前 Quad 和目标 Quad 的交点
      const tuple = this.findKeypoints(this.currentQuad, nextQuad);
      if (!tuple) {
        this.terminateMovement();
        return
      }
      if ( this.levelManager.totem && 
          (nextQuad.occupied 
          || nextQuad === this.levelManager.totem.targetQuad
          || nextQuad === this.levelManager.totem.currentQuad 
          || this.currentQuad === this.levelManager.totem.currentQuad
          || this.currentQuad === this.levelManager.totem.targetQuad)) {
        this.terminateMovement();
        return
      }
      this.targetQuad = nextQuad;
      const { currentKeypoint, targetKeypoint } = tuple;
      this.currentKeypoint = currentKeypoint;
      this.targetKeypoint = targetKeypoint;

      // 设置目标位置为当前 Quad 的交点
      this.targetPosition.copy(currentKeypoint);
      this.movementPhase = "TO_KEYPOINT";
    } else {
      this.targetPosition = this.mesh.position.clone();
      this.targetQuad = this.currentQuad;
      this.movementPhase = null; // 停止移动
      fadeOut(this.audio, 1);
    }
  }

  findKeypoints(quadA, quadB) {
    const threshold = 1; // 阈值，两个关键点之间的距离小于这个值时认为是同一个点
    for (const key in quadA.keyPoints) {
      for (const otherKey in quadB.keyPoints) {
        const width = window.innerWidth; // 屏幕宽度
        const height = window.innerHeight; // 屏幕高度

        // 获取 quadA 的屏幕位置
        const ndcPointA = quadA.keyPoints[key].clone().project(this.sceneManager.camera);
        const pointPixelA = new THREE.Vector2(
          (ndcPointA.x + 1) * 0.5 * width, // 转换到 [0, width]
          (1 - ndcPointA.y) * 0.5 * height // 转换到 [0, height]，注意 Y 轴反转
        );

        // 获取 quadB 的屏幕位置
        const ndcPointB = quadB.keyPoints[otherKey].clone().project(this.sceneManager.camera);
        const pointPixelB = new THREE.Vector2(
          (ndcPointB.x + 1) * 0.5 * width,
          (1 - ndcPointB.y) * 0.5 * height
        );
        
        const point = new THREE.Vector2(pointPixelA.x, pointPixelA.y);
        const otherPoint = new THREE.Vector2(pointPixelB.x, pointPixelB.y);
          
        if (point.distanceTo(otherPoint) < threshold) {
          return {
            currentKeypoint: quadA.keyPoints[key],
            targetKeypoint: quadB.keyPoints[otherKey]
          };
        }
        
      }
    }
    return null;
  }

  terminateMovement() {
    this.path = [];
    this.movementPhase = null;
    this.keypoint = null;
    this.targetKeypoint = null;
    this.targetPosition.copy(this.currentQuad.getCenter());
    this.targetQuad = this.currentQuad;
  }

  // 每帧更新位置的 tick 方法
  tick(delta) {
    //console.log(this.path, this.currentQuad, this.targetPosition);
    if (this.mixer) this.mixer.update(delta); // 更新动画混合器
    // 如果当前 Quad 正在动画中，跟随移动
    if (!this.currentQuad) return;
    if (this.currentQuad.isAnimating) {
      this.mesh.position.copy(this.currentQuad.mesh.position);
      this.targetPosition.copy(this.currentQuad.mesh.position);
      return;
    }
    
    if (this.currentQuad.plate && !this.currentQuad.plate.isEmitted) {
      this.terminateMovement();
      this.currentQuad.plate.emitSignals();      
    }

    const direction = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position);
    const distance = direction.length();
    //console.log(this.direction, this.movementPhase, this.currentQuad, this.path, this.currentKeypoint, this.targetKeypoint, this.targetPosition);

    if (distance > 0.01) {
        direction.normalize();
        const moveDistance = this.speed * delta;

        // 更新位置
        if (moveDistance < distance) {
            this.mesh.position.addScaledVector(direction, moveDistance);
        } else {
            this.mesh.position.copy(this.targetPosition);
            this.handlePhaseCompletion(); // 当前阶段完成
        }

        // 平滑调整朝向
        if (Math.abs(direction.y) < 0.99) { // 忽略接近 Y 轴方向的运动
          const targetAngle = Math.atan2(direction.x, -direction.z); // 计算目标方向的角度（使用 x 和 z 作为输入）
          const currentAngle = this.mesh.rotation.z; // 当前角色绕 Z 轴的旋转角度
          let angleDifference = targetAngle - currentAngle;  // 计算目标角度和当前角度之间的差值
      
          // 确保角度差在 [-π, π] 范围内
          angleDifference = (angleDifference + Math.PI) % (2 * Math.PI) - Math.PI;
      
          // 线性插值到目标角度
          const turnSpeed = 8; // 控制转弯速度
          this.mesh.rotation.z += angleDifference * Math.min(delta * turnSpeed, 1); // 绕 Z 轴旋转
      }
                } 
    else {
        this.handlePhaseCompletion(); // 当前阶段完成
    }
  }

  handlePhaseCompletion() {
    if (this.movementPhase === "TO_KEYPOINT") {
      // 瞬移到目标 Quad 的 keypoint
      this.mesh.position.copy(this.targetKeypoint);
      this.targetPosition.copy(this.path[0].getCenter());
      this.targetQuad = this.path[0];
      this.movementPhase = "TO_CENTER";
    } else if (this.movementPhase === "TO_CENTER") {
      // 移动到目标 Quad 的中心
      this.currentQuad.toggleCharacterOn();
      this.currentQuad = this.path.shift();
      this.currentQuad.toggleCharacterOn();
      this.moveToNextPhase();
    }
  }
}
