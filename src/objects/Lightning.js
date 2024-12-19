export default class Lightning {
    constructor({ gap = 0.5, duration = 0.1, signalIdList, levelManager }) {
      this.levelManager = levelManager;
      this.scene = this.levelManager.sceneManager.scene; // 引用场景
      this.signalIdList = signalIdList || [];
      this.gap = gap; // 闪电的时间间隔
      this.duration = duration; // 闪电持续的时间（控制闪光效果的持续时间）
      this.lightningScreen = null; // 用于存放闪电屏幕的对象
      this.lastStrikeTime = 0; // 上次闪电时间
      this.isStriking = false; // 是否正在闪电
      this.isLightningStopped = false; // 是否停止闪电
    }

    setSignals(signals) {
        for (const signal of signals) {
          if (this.signalIdList.includes(signal.id)) {
            if (signal.type === "stopLightning") {
                this.isLightningStopped = true;
            }
          }
        }
      }
  
    // 每隔gap时间触发一次闪电
    strikeLightning() {
      const currentTime = performance.now();
  
      if (currentTime - this.lastStrikeTime > this.gap * 1000 && !this.isStriking && !this.isLightningStopped) {
        this.lastStrikeTime = currentTime;
        this.isStriking = true;
  
        // 创建闪电屏幕
        this.createLightningScreen();
  
        // 闪电屏幕逐渐消失
        setTimeout(() => {
          this.fadeOutLightning();
        }, this.duration * 1000);
      }
  
      // 继续检测闪电
      requestAnimationFrame(() => this.strikeLightning());
    }
  
    // 创建闪电屏幕
    createLightningScreen() {
      if (this.lightningScreen) return;
  
      // 创建一个覆盖全屏的白色平面
      const geometry = new THREE.PlaneGeometry(500, 500);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
        // 双面
        side: THREE.DoubleSide,
      });
  
      this.lightningScreen = new THREE.Mesh(geometry, material);
       // 旋转平面
      this.lightningScreen.rotation.y = -Math.PI / 4;
  
      // 设置位置，使平面覆盖整个视野
      this.lightningScreen.position.x = -50; // 保证平面在前景
      this.lightningScreen.position.z = 50;
      this.scene.add(this.lightningScreen);
    }
  
    // 让闪电逐渐消失
    fadeOutLightning() {
      if (!this.lightningScreen) return;
  
      const material = this.lightningScreen.material;
      const opacity = material.opacity;
      const deltaOpacity = opacity / this.duration / 60;
  
      // 渐变透明
      const fadeOut = () => {
        if (material.opacity > 0) {
          material.opacity -= deltaOpacity; // 每次减少透明度
          requestAnimationFrame(fadeOut);
        } else {
          this.scene.remove(this.lightningScreen); // 完全消失后移除
          this.lightningScreen = null;
          this.isStriking = false;
        }
      };
  
      fadeOut();
    }
  
    // 更新（如果需要）
    tick(delta) {
      // 可选：如果你想让闪电持续时有其他效果或更改，可以在这里更新
    }
  }
  