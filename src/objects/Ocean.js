export default class Ocean {
    constructor({ size, speed, depth, color, signalIdList, levelManager }) {
      this.levelManager = levelManager;
      this.scene = this.levelManager.sceneManager.scene; // 引用场景
      this.size = size;
      this.speed = speed;
      this.color = color;
      this.depth = depth;
      this.signalIdList = signalIdList || [];
  
      // 创建平面几何体，增加细分数以增强网格复杂度
      const segments = 40; // 提高网格细分数，越大网格越精细
      this.geometry = new THREE.PlaneGeometry(this.size / 2, this.size / 2, segments / 2, segments);
  
      if (color) {
        color = parseInt(color, 16);
      }
      // 创建海面材质，深蓝色
      this.material = new THREE.MeshStandardMaterial({
        color: color || 0x005daf, 
        wireframe: false,
        transparent: true,
        opacity: 1,
        flatShading: true,
      });
  
      // 创建网格
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.rotation.x = -Math.PI / 2; // 使其平行于地面
      this.mesh.rotation.z = -Math.PI / 2; // 旋转一定角度，使其更加自然

      this.isAnimating = false;
      this.animationNumber = 0;
        this.isWaiting = false;
        this.waitTimer = 0;
        this.initialWaitTime = 0;
        this.animationTypes = [];
        this.translateSpeed = 0;
        this.translateTarget = new THREE.Vector3();

        this.targetColor = new THREE.Color();
        this.duration = 0;

      this.scene.add(this.mesh);
  
      // 为每个顶点生成随机的频率和幅度（用于波浪效果的随机性）
      this.randomOffsets = new Float32Array(this.geometry.attributes.position.count);
      this.frequencies = new Float32Array(this.geometry.attributes.position.count);
      this.amplitudes = new Float32Array(this.geometry.attributes.position.count);
  
      for (let i = 0; i < this.geometry.attributes.position.count; i++) {
        this.randomOffsets[i] = Math.random() * 100; // 随机化每个顶点的初始偏移量
        this.frequencies[i] = Math.random() * 0.3 + 0.1; // 每个顶点有不同的频率
        this.amplitudes[i] = Math.random() * 1.2 + 0.5; // 每个顶点有不同的波动幅度
      }
    }

    setSignals(signals) {
        for (const signal of signals) {
          if (this.signalIdList.includes(signal.id)) {
              this.isWaiting = true; // 开启等待
              this.waitTimer = 0;
              this.initialWaitTime = signal.waitTime || 0; // 统一的等待时间
              if (signal.type === "translation") {
                    this.animationTypes.push("translation");
                    this.translateSpeed = signal.translateSpeed;
                    this.translateTarget
                        .copy(signal.currentTranslationVector)
                        .add(this.mesh.position);
                    this.animationNumber++;
              } 
              if (signal.type === "colorShift") {
                  // 通过信号改变颜色，渐变改变
                  this.animationTypes.push("colorShift");
                  this.targetColor = signal.targetColor;
                  this.duration = signal.duration || 1;
                  this.animationNumber++;
              }
              this.isAnimating = true;
          }
        }
      }
  
    // 更新海面波动
    tick(delta) {
      const positions = this.geometry.attributes.position.array;
      const time = this.levelManager.sceneManager.time;
  
      // 更新每个顶点的位置，模拟更随机的波动
      for (let i = 0; i < this.geometry.attributes.position.count; i++) {
        const index = i * 3;
        const x = positions[index];     // 水平方向的坐标
        const z = positions[index + 1]; // 水平坐标（z 轴）
  
        // 为每个顶点引入不同的频率、幅度和偏移量，使波动更加不均匀
        const randomOffset = this.randomOffsets[i]; // 获取每个顶点的随机偏移量
        const frequency = this.frequencies[i]; // 获取每个顶点的频率
        const amplitude = this.amplitudes[i]; // 获取每个顶点的幅度
  
        // 使用正弦波来模拟波动，加入随机频率和幅度，使波浪看起来更加自然和不规则
        positions[index + 2] = Math.sin((x + z) * frequency + time * this.speed + 
          randomOffset) * amplitude + this.depth; // Y 位置（海浪的高度）
      }
  
      // 通知 Three.js 更新位置数据
      this.geometry.attributes.position.needsUpdate = true;

      
        // 等待状态优先
        if (this.isWaiting) {
            this.waitTimer += delta;
            if (this.waitTimer >= this.initialWaitTime) {
                this.isWaiting = false; // 等待完成
            }
            return; // 等待期间不执行动画
        }

        if (!this.isAnimating) return;

        if (this.animationTypes.includes("translation")) {
            this.tickTranslation(delta);
        }
        if (this.animationTypes.includes("colorShift")) {
            this.tickColorShift(delta);
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
            })
            .onComplete(() => {
              this.mesh.position.copy(this.translateTarget);
              this.finishAnimation();
              this.translationTween = null; // 动画完成后清理
            });
      
          this.translationTween.start();
        }
      
        // 在主循环中调用 TWEEN.update()，确保动画执行
        TWEEN.update();
      }

    tickColorShift(delta) {
      
        // 判断是否已有补间动画，避免重复启动
        if (!this.colorTween) {
          const startColor = this.material.color.clone();
          const targetColor = this.targetColor.clone();
          const animatingTime = this.duration * 1000; // 1000ms = 1s
      
          // 使用 TWEEN 创建补间动画
          this.colorTween = new TWEEN.Tween(startColor)
            .to(targetColor, animatingTime) // 1000ms 平滑过渡到目标颜色
            .easing(TWEEN.Easing.Quadratic.InOut) // 平滑缓动函数
            .onUpdate(() => {
              this.material.color.copy(startColor); // 更新颜色
            })
            .onComplete(() => {
              this.material.color.copy(this.targetColor);
              this.finishAnimation();
              this.colorTween = null; // 动画完成后清理
            });
      
          this.colorTween.start();
        }
      
        // 在主循环中调用 TWEEN.update()，确保动画执行
        TWEEN.update();
    }
      
    finishAnimation() {
        this.animationNumber--;
        if (this.animationNumber === 0) {
            this.isAnimating = false;
            this.animationTypes = [];

        }
    }
  }
  