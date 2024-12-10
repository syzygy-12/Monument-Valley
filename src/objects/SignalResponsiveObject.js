export default class SignalResponsiveObject {
    constructor({ geometry, material, glbFile, position, rotation, scale, isHide, signalIdList }) {
        this.signalIdList = signalIdList || [];
        this.isHide = isHide || false;
        this.mesh = null;

        if (geometry && material) {
            this.mesh = new THREE.Mesh(geometry, material);
            this.initMesh(position, rotation, scale, isHide);
            this.mesh.receiveShadow = false;
        }

        this.initialQuaternion = new THREE.Quaternion().set(0, 0, 0, 1);
        this.position = position
            ? new THREE.Vector3(position.x, position.y, position.z)
            : new THREE.Vector3();

        if (this.isHide && this.mesh) {
            this.mesh.visible = false;
        }

        // 动画控制变量
        this.pivot = new THREE.Vector3();
        this.axis = new THREE.Vector3(0, 1, 0);
        this.startPositionOffset = new THREE.Vector3();
        this.angleDelta = 0;
        this.currentAngle = 0;
        this.targetAngle = 0;
        this.targetQuaternion = new THREE.Quaternion();
        this.translateTarget = new THREE.Vector3();
        this.animationSpeed = Math.PI;
        this.translateSpeed = 6;
        this.isAnimating = false;
        this.animationType = null;

        this.isWaiting = false;
        this.waitTimer = 0;
        this.initialWaitTime = 0;

        this.pendingGLBLoad = glbFile
            ? this.loadGLBModel(glbFile, position, rotation, scale, isHide)
            : Promise.resolve();
    }

    /**
     * 异步初始化：等待 GLB 模型加载完成。
     */
    async init() {
        if (this.pendingGLBLoad) {
            await this.pendingGLBLoad;
        }
    }

    initMesh(position, rotation, scale, isHide) {
        if (!this.mesh) return;

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        if (position) {
            this.mesh.position.set(position.x, position.y, position.z);
        }
        if (rotation) {
            this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        }
        if (scale) {
            this.mesh.scale.set(scale.x, scale.y, scale.z);
        }
        this.mesh.visible = !isHide;
    }

    loadGLBModel(glbFile, position, rotation, scale, isHide) {
        const loader = new THREE.GLTFLoader(); // 假设已导入 THREE.GLTFLoader
        return new Promise((resolve, reject) => {
            loader.load(
                glbFile,
                (gltf) => {
                    this.mesh = gltf.scene;
                    this.mesh.receiveShadow = false;
                    this.mesh.castShadow = true;

                    if (position) this.mesh.position.set(position.x, position.y, position.z);
                    if (rotation) this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
                    if (scale) this.mesh.scale.set(scale.x, scale.y, scale.z);
                    if (isHide) this.mesh.visible = false;

                    //console.log("GLB loaded:", this.mesh);

                    resolve();
                },
                undefined,
                (error) => {
                    console.error("An error occurred while loading GLB:", error);
                    reject(error);
                }
            );
        });
    }

  /**
   * 响应信号，初始化动画参数，并设置等待时间。
   */
  setSignals(signals) {
      for (const signal of signals) {
          if (this.signalIdList.includes(signal.id)) {
              this.isWaiting = true; // 开启等待
              this.waitTimer = 0;
              this.initialWaitTime = signal.waitTime || 0; // 统一的等待时间

              if (signal.type === "rotation") {
                  const { axis, angle, pivot } = signal;
                  this.pivot.copy(pivot);
                  this.axis.copy(axis).normalize();
                  this.targetAngle = angle;
                  this.startPositionOffset.subVectors(this.mesh.position, this.pivot);
                  this.currentAngle = 0;
                  this.targetQuaternion.setFromAxisAngle(this.axis, angle);
                  this.animationType = "rotation";
              } else if (signal.type === "translation") {
                  this.animationType = "translation";
                  this.translateSpeed = signal.translateSpeed;
                  this.translateTarget
                      .copy(signal.currentTranslationVector)
                      .add(this.mesh.position);
              } else if (signal.type === "appear") {
                  this.animationType = "appear";
              } else if (signal.type === "disappear") {
                  this.animationType = "disappear";
              }

              this.isAnimating = true;
          }
      }
  }

  tick(delta) {
      // 等待状态优先
      if (this.isWaiting) {
          this.waitTimer += delta;
          if (this.waitTimer >= this.initialWaitTime) {
              this.isWaiting = false; // 等待完成
          }
          return; // 等待期间不执行动画
      }

      if (!this.isAnimating) return;

      if (this.animationType === "rotation") {
          this.tickRotation(delta);
      } else if (this.animationType === "translation") {
          this.tickTranslation(delta);
      } else if (this.animationType === "appear") {
          this.mesh.visible = true; // 直接变为可见
          this.finishAnimation();
      } else if (this.animationType === "disappear") {
          this.mesh.visible = false; // 直接变为不可见
          this.finishAnimation();
      }
  }

  tickTranslation(delta) {
      const direction = new THREE.Vector3().subVectors(this.translateTarget, this.mesh.position);
      const distance = direction.length();
      const moveDistance = delta * this.translateSpeed;

      if (moveDistance < distance) {
          this.mesh.position.addScaledVector(direction.normalize(), moveDistance);
      } else {
          this.mesh.position.copy(this.translateTarget);
          this.finishAnimation();
      }
  }

  tickRotation(delta) {
      this.angleDelta = this.animationSpeed * delta;
      const remainingAngle = this.targetAngle - this.currentAngle;
      const angleThreshold = Math.PI / 180;

      if (remainingAngle <= angleThreshold) {
          this.angleDelta = remainingAngle;
          this.currentAngle = this.targetAngle;

          this.startPositionOffset.applyQuaternion(
              new THREE.Quaternion().setFromAxisAngle(this.axis, remainingAngle)
          );
          const finalPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);

          this.mesh.position.copy(finalPosition);
          this.mesh.quaternion.copy(this.initialQuaternion);
          this.mesh.quaternion.premultiply(this.targetQuaternion);
          this.initialQuaternion.premultiply(this.targetQuaternion);
          this.position.copy(finalPosition);

          this.finishAnimation();
          return;
      }

      this.currentAngle += this.angleDelta;
      const quaternion = new THREE.Quaternion().setFromAxisAngle(this.axis, this.angleDelta);
      this.startPositionOffset.applyQuaternion(quaternion);
      const newPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);

      this.mesh.position.copy(newPosition);
      this.mesh.quaternion.premultiply(quaternion);
      this.position.copy(this.mesh.position);
  }

  finishAnimation() {
      this.isAnimating = false;
      this.animationType = null;
      this.animationComplete();
  }

  animationComplete() {
      // 空方法，由子类实现
  }
}
