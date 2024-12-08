import SceneManager from "./SceneManager.js";
import LevelManager from "./LevelManager.js";

export default class Game {
  constructor() {
    this.sceneManager = null; // 延迟初始化
    this.levelManager = null;

    // 获取界面元素
    this.startScreen = document.getElementById("start-screen");
    this.levelSelectScreen = document.getElementById("level-select");
    this.gameContainer = document.getElementById("game"); // 获取游戏容器

    this.currentScreen = "start"; // 跟踪当前界面状态

    // 绑定事件
    this.initEventListeners();
  }

  initEventListeners() {
    // 初始界面按键监听，鼠标监听
    document.addEventListener("keydown", this.showLevelSelect.bind(this));
    this.startScreen.addEventListener("click", this.showLevelSelect.bind(this));

    // 选关按钮监听
    const levelButtons = document.querySelectorAll(".level-btn");
    levelButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const level = parseInt(e.target.dataset.level);
        this.startLevel(level);
      });
    });
  }

  showLevelSelect() {
    if (this.currentScreen !== "start") return; // 防止重复触发
    this.currentScreen = "levelSelect";

    // 初始界面隐藏动画
    this.startScreen.classList.add("hidden");

    // 选关界面显示动画
    this.levelSelectScreen.classList.add("show");
  }

  startLevel(level) {
    if (this.currentScreen !== "levelSelect") return; // 防止重复触发
    this.currentScreen = "game";
  
    // 选关界面隐藏
    this.levelSelectScreen.classList.remove("show");
    this.levelSelectScreen.classList.add("hidden");
  
    setTimeout(() => {
      this.levelSelectScreen.style.display = "none";
  
      // 显示游戏容器
      this.gameContainer.style.display = "block";
      this.gameContainer.style.opacity = "0"; // 初始透明
  
      // 清理 Three.js 渲染器之前的 canvas，而保留 UI 层
      const canvas = this.gameContainer.querySelector("canvas");
      if (canvas) canvas.remove(); // 仅删除之前的渲染器
  
      // 渐变显示容器
      setTimeout(() => {
        this.gameContainer.style.opacity = "1";
  
        // 初始化场景并加载对应关卡
        this.sceneManager = new SceneManager(this.gameContainer);
        this.levelManager = new LevelManager(this.sceneManager);
  
        this.sceneManager.init();
        this.levelManager.loadLevel(level);
        this.sceneManager.startRendering();
      }, 50);
    }, 800);
  }
  

  start() {
    // 初始游戏逻辑留空，等待玩家按键
  }
}
