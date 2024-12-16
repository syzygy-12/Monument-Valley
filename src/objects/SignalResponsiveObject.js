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
        this.rotateSpeed = Math.PI / 2;
        this.targetQuaternion = new THREE.Quaternion();
        this.translateTarget = new THREE.Vector3();
        this.translateSpeed = 6;
        this.isAnimating = false;
        this.animationType = null;
        this.animationSpeed = 1; // 动画速度

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
                    if (rotation) {
                        this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
                        this.initialQuaternion.setFromEuler(this.mesh.rotation);
                    }
                    if (scale) this.mesh.scale.set(scale.x, scale.y, scale.z);
                    if (isHide) this.mesh.visible = false;

                    // 加载动画
                    if (gltf.animations.length > 0) {
                        this.mesh.mixer = new THREE.AnimationMixer(this.mesh);
                        this.mesh.animations = []; // 确保动画数组是空的
                        gltf.animations.forEach((clip) => {
                            this.mesh.animations.push(clip);  // 将动画添加到 mesh.animations
                            this.mesh.mixer.clipAction(clip); // 绑定动画
                        });
                    }

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
                    this.rotateSpeed = signal.rotateSpeed || Math.PI / 2;
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
                } else if (signal.type === "animation") {
                    this.animationType = "animation";
                    this.animationSpeed = signal.animationSpeed || 1;
    
                    // 如果存在正在播放的动画，先停止所有动画
                    if (this.mesh.mixer) {
                        this.mesh.mixer.stopAllAction(); // 停止当前正在播放的动画
                    }
    
                    // 动画播放一次，速度加快
                    if (this.mesh.animations.length > 0) {
                        this.mesh.animations.forEach((clip) => {
                            const action = this.mesh.mixer.clipAction(clip);
                            action.clampWhenFinished = true;
                            action.setLoop(THREE.LoopOnce);
                            action.play();
                        });
                    }
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
    
        // 更新动画混合器
        if (this.mesh.mixer) {
            this.mesh.mixer.update(delta * this.animationSpeed);
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
        } else if (this.animationType === "animation") {
            // 动画播放一次
            if (this.mesh.animations.length > 0) {
                let isFinished = true;
                this.mesh.animations.forEach((clip) => {
                    const action = this.mesh.mixer.clipAction(clip);
                    if (action.isRunning()) {
                        isFinished = false;
                    }
                });
    
                // 如果所有动画都已完成，结束动画
                if (isFinished) {
                    this.finishAnimation();
                }
            }
        }
    }

    tickTranslation(delta) {
        // 判断是否已有补间动画，避免重复启动
        if (!this.translationTween) {
            const startPosition = this.mesh.position.clone();
            const targetPosition = this.translateTarget.clone();
            const animatingTime = Math.abs(startPosition.distanceTo(targetPosition) / this.translateSpeed) * 1000; // 1000ms = 1s

            // 使用 TWEEN 创建补间动画
            this.translationTween = new TWEEN.Tween(startPosition)
                .to(targetPosition, animatingTime) // 1000ms 平滑过渡到目标位置
                .easing(TWEEN.Easing.Quadratic.InOut) // 平滑缓动函数
                .onUpdate(() => {
                    this.mesh.position.copy(startPosition); // 更新位置
                    this.position.copy(startPosition);
                })
                .onComplete(() => {
                    this.mesh.position.copy(this.translateTarget);
                    this.position.copy(this.translateTarget);
                    this.finishAnimation();
                    this.translationTween = null; // 动画完成后清理
                });

            this.translationTween.start();
        }

        // 在主循环中调用 TWEEN.update()，确保动画执行
        TWEEN.update();
    }


    tickRotation(delta) {
        if (!this.rotationTween) {
            // 起始角度和目标角度
            const startAngle = this.currentAngle;
            const endAngle = this.targetAngle;
            const animatingTime = Math.abs(endAngle - startAngle) / this.rotateSpeed * 1000; // 1000ms = 1s

            // TWEEN 补间动画
            this.rotationTween = new TWEEN.Tween({ angle: startAngle })
                .to({ angle: endAngle }, animatingTime)
                .easing(TWEEN.Easing.Quadratic.InOut) // 平滑缓动函数
                .onUpdate((obj) => {
                    const deltaAngle = obj.angle - this.currentAngle; // 计算角度增量
                    this.currentAngle = obj.angle; // 更新当前角度

                    // 更新旋转和位置
                    const quaternion = new THREE.Quaternion().setFromAxisAngle(this.axis, deltaAngle);
                    this.startPositionOffset.applyQuaternion(quaternion);
                    const newPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);

                    this.mesh.position.copy(newPosition);
                    this.mesh.quaternion.premultiply(quaternion);
                    this.position.copy(this.mesh.position);
                })
                .onComplete(() => {
                    this.currentAngle = this.targetAngle;
                    this.finishAnimation();
                    this.rotationTween = null; // 清理状态
                });

            this.rotationTween.start();
        }

        // 更新 TWEEN 状态
        TWEEN.update();
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
