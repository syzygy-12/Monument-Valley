import Totem from "../objects/Totem.js";
import { buildQuadGraph, isQuadsConnected, findQuadPath } from "../utils/QuadUtils.js";
import { loadLevelData, loadLevelObjects, initializeCharacter } from "../utils/LevelLoadUtils.js";
import { initializeConsole } from "../utils/ConsoleUtils.js";
import { setSignals, tick } from "../utils/SignalUtils.js";

export default class LevelManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.character = null;
    this.platforms = [];
    this.quads = [];
    this.triangularPrisms = [];
    this.levelNumber = 0;
    this.buttons = [];
    this.surfaces = [];
    this.ladders = [];
    this.signals = [];
    this.isSignalReceived = false;

    this.graph = new Map();
    this.animatingObjects = [];
  }

  async loadLevel(levelNumber) {
    this.levelNumber = levelNumber;

    const levelData = await loadLevelData(levelNumber); // 加载关卡数据
    // 加载关卡中的物体
    await loadLevelObjects(levelData, this.sceneManager, this);
    // 构建 quad 连通性图
    this.buildGraph();
    // 初始化角色
    await initializeCharacter(this, this.sceneManager);
    this.sceneManager.updatables.push(this);
    // 操作角色移动
    window.addEventListener("click", (event) => this.onScreenClick(event));
    // 初始化控制台
    initializeConsole(this, this.sceneManager);
  }
  
  addTotem(quad) {
    
    const { scene, updatables } = this.sceneManager;
    // 初始化角色
    (async () => {
      const totem = new Totem(quad, this.sceneManager, this, quad.signalIdList);
      await totem.loadModel();
      this.totem = totem;
      scene.add(totem.mesh);
      updatables.push(totem);
    })();
  }

  setSignals(signals) {
    setSignals(this, signals);
  }

  tick(delta) {
    tick(this, delta);
  }

  buildGraph() {
    this.graph = buildQuadGraph(
      this.quads,
      (quadA, quadB) => isQuadsConnected(quadA, quadB, this.sceneManager),
      this.sceneManager
    );
  }

  getNeighbors(quad) {
    return this.graph.get(quad) || [];
  }

  findPath(startQuad, endQuad) {
    return findQuadPath(startQuad, endQuad, (quad) => this.getNeighbors(quad));
  }

  onScreenClick(event) {
    if (this.animatingObjects.length > 0) {
      return;
    }

    const { scene, camera } = this.sceneManager;
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      this.quads.map((quad) => quad.mesh)
    );

    if (intersects.length > 0) {
      const clickedQuad = this.quads.find(
        (quad) => quad.mesh === intersects[0].object
      );
      if (clickedQuad && clickedQuad !== this.character.currentQuad) {
        const currentQuad = this.character.currentQuad;
        const path = this.findPath(currentQuad, clickedQuad);
        if (path) {
          this.character.terminateMovement();
          this.character.followPath(path);
        }
      }
    }
  }
}
