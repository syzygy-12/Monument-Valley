import SceneManager from "./SceneManager.js";
import LevelManager from "./LevelManager.js";

export default class Game {
  constructor() {
    this.sceneManager = null; // 延迟初始化
    this.levelManager = null;
    this.unlockedLevels = 1; // 已解锁关卡数

    // 获取界面元素
    this.startScreen = document.getElementById("start-screen");
    this.levelSelectScreen = document.getElementById("level-select");
    this.gameContainer = document.getElementById("game");

    this.currentScreen = "start"; // 跟踪当前界面状态

    // 绑定事件
    this.initEventListeners();
    this.listenForExternalLevelReady();

  }

  initEventListeners() {
    // 初始界面按键监听，鼠标监听
    document.addEventListener("keydown", this.showLevelSelect.bind(this));
    this.startScreen.addEventListener("click", this.showLevelSelect.bind(this));
    
    
  }

  // 监听来自外部的 levelReady 信号
  listenForExternalLevelReady() {
    window.addEventListener("levelReadyEvent", (event) => {
      const { level } = event.detail; // 获取传递的关卡信息
      //console.log(`Received signal to start level ${level}`);
      this.startLevel(level);
    });
  }

  showLevelSelect() {
    if (this.currentScreen !== "start") return;
    this.currentScreen = "levelSelect";

    this.audio = new Audio("./assets/audio/game.flac");
    this.audio.volume = 0.15;
    this.audio.loop = true;
    this.audio.play();

    this.startScreen.classList.add("hidden");
    this.levelSelectScreen.classList.add("show");
    //console.log("Level Select Box 已启动");

    // 动态加载 LevelSelectBox.js
    if (!this.levelSelectBoxLoaded) {
      this.levelSelectScript = document.createElement("script");
      this.levelSelectScript.type = "module";
      this.levelSelectScript.src = `./src/utils/LevelSelectBox.js`;
      this.levelSelectScript.onload = () => {
        //console.log("LevelSelectBox.js 已加载");
      }
      document.body.appendChild(this.levelSelectScript);
      this.levelSelectBoxLoaded = true;
    }
  }

  startLevel(level) {
    if (this.currentScreen !== "levelSelect") return;
    this.currentScreen = "game";
  
    this.levelSelectScreen.classList.remove("show");
    this.levelSelectScreen.classList.add("hidden");
    // 清除 LevelSelectBox 相关脚本
    if (this.levelSelectScript) {
      this.destroyLevelSelectBox();
      document.body.removeChild(this.levelSelectScript);
      this.levelSelectScript = null;
      // 清空canvas
      const canvases = document.querySelectorAll("canvas");
      canvases.forEach((canvas) => canvas.remove());
      //console.log("LevelSelectBox.js 已移除");
    }
  
    setTimeout(() => {
      this.levelSelectScreen.style.display = "none";
      this.gameContainer.style.display = "block";
      this.gameContainer.style.opacity = "0";
  
      const canvas = this.gameContainer.querySelector("canvas");
      if (canvas) canvas.remove();
  
      setTimeout(() => {
        this.gameContainer.style.opacity = "1";

        this.sceneManager = new SceneManager(this.gameContainer);
        this.levelManager = new LevelManager(this.sceneManager, this);
  
        this.sceneManager.init();
        this.levelManager.loadLevel(level);
        this.sceneManager.startRendering();
      }, 50);
    }, 800);
  }

  destroyLevelSelectBox() {
    const event = new CustomEvent("destroyLevelSelectBox");
    window.dispatchEvent(event);
  }

  winLevel(levelNumber) {
    console.log(`Level ${levelNumber} completed!`);
    if (levelNumber >= this.unlockedLevels) {
      this.unlockedLevels = levelNumber + 1;
    }
    //this.showLevelSelect();
  }
}
