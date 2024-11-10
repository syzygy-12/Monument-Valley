import SceneManager from "./SceneManager.js";
import LevelManager from "./LevelManager.js";

export default class Game {
  constructor() {
    this.sceneManager = new SceneManager();
    this.levelManager = new LevelManager(this.sceneManager);
  }

  start() {
    this.sceneManager.init();
    this.levelManager.loadLevel(1);
    this.sceneManager.startRendering();
  }
}
