import { fadeOut } from "../utils/AudioUtils.js";

export default class Lightning {
    constructor({ gap = 0.5, duration = 0.1, signalIdList, levelManager }) {
      this.levelManager = levelManager;
      this.scene = this.levelManager.sceneManager.scene; // 引用场景
      this.signalIdList = signalIdList || [];
      this.gap = gap; // 闪电的时间间隔
      this.duration = duration; // 闪电持续的时间（控制闪光效果的持续时间）
      this.lightningFlash = null; // 用于存放点光源的对象
      this.lastStrikeTime = 0; // 上次闪电时间
      this.isStriking = false; // 是否正在闪电
      this.isLightningStopped = false; // 是否停止闪电
      this.audio = new Audio("./assets/audio/storm.wav");
      this.audio.loop = true;
      this.audio.volume = 0.2;
      this.audio.play();
    }

    setSignals(signals) {
        for (const signal of signals) {
          if (this.signalIdList.includes(signal.id)) {
            if (signal.type === "stopLightning") {
                this.isLightningStopped = true;
                fadeOut(this.audio, 4);
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
  
        // 创建闪电点光源
        this.createLightningFlash();
  
        // 闪电逐渐消失
        setTimeout(() => {
          this.fadeOutLightning();
        }, this.duration * 1000);
      }
  
      // 继续检测闪电
      requestAnimationFrame(() => this.strikeLightning());
    }

    // 创建闪电点光源
    createLightningFlash() {
      if (this.lightningFlash) return;
  
      // 创建点光源
      this.maxIntensitySqrt = 2000; // 最大强度
      this.currentIntensitySqrt = this.maxIntensitySqrt; // 当前强度
      this.lightningFlash = new THREE.PointLight(0xffffff, 
          this.maxIntensitySqrt * this.maxIntensitySqrt, 100, 2); // Color, intensity, distance, decay
  
      // 设置点光源的位置
      this.lightningFlash.position.set(0, 30, 0); // 你可以根据需要调整位置
  
      // 将光源加入到场景
      this.scene.add(this.lightningFlash);
    }

    // 让闪电逐渐消失
    fadeOutLightning() {
      if (!this.lightningFlash) return; // 确保点光源已经创建
  
      const deltaIntensity = this.maxIntensitySqrt / (this.duration * 60);
      // 渐变光源强度
      const fadeOut = () => {
        if (this.lightningFlash && this.currentIntensitySqrt > 0) {
          this.currentIntensitySqrt -= deltaIntensity;
          this.lightningFlash.intensity = this.currentIntensitySqrt * this.currentIntensitySqrt;
          requestAnimationFrame(fadeOut);
        } else {
          // 完全消失后移除光源
          if (this.lightningFlash) {
            this.scene.remove(this.lightningFlash);
            this.lightningFlash = null;
            this.isStriking = false;
          }
        }
      };
  
      fadeOut();
    }

    // 更新（如果需要）
    tick(delta) {
      // 可选：如果你想让闪电持续时有其他效果或更改，可以在这里更新
    }
}
