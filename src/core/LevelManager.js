import Platform from "../objects/Platform.js";
import Quad from "../objects/Quad.js";
import Character from "../objects/Character.js";

export default class LevelManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.character = null;
    this.quads = [];

    this.graph = new Map();
  }

  async loadLevel(levelNumber) {
    const { scene, updatables } = this.sceneManager;

    // 使用 fetch 加载 JSON 文件
    const response = await fetch(`./src/levels/level${levelNumber}.json`);
    const levelData = await response.json();

    levelData.platforms.forEach((platformData) => {
      const platform = new Platform(platformData);
      scene.add(platform.mesh);
      updatables.push(platform);
    });

    levelData.quads.forEach((quadData) => {
      const quad = new Quad(quadData);
      scene.add(quad.mesh);
      updatables.push(quad);
      this.quads.push(quad);
    });

    // 构建quad连通性图
    this.buildGraph();
    //console.log(this.graph);

    // 初始化角色
    this.character = new Character();
    this.character.setInitialQuad(this.quads[0]);
    scene.add(this.character.mesh);
    updatables.push(this.character);

    // 添加点击事件监听器
    window.addEventListener("click", (event) => this.onScreenClick(event));
  }

  // 处理点击quad之后的事件
  onScreenClick(event) {
    const { scene, camera } = this.sceneManager;

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
      this.quads.map((quad) => quad.mesh),
    );

    if (intersects.length > 0) {
      const clickedQuad = this.quads.find(
        (quad) => quad.mesh === intersects[0].object,
      );
      if (clickedQuad) {
        const currentQuad = this.character.currentQuad;
        const path = this.findPath(currentQuad, clickedQuad);
        //console.log(path);
        if (path) {
          this.character.followPath(path);
        }
      }
    }
  }

  // 构建quad连通性图
  buildGraph() {
    for (const quad of this.quads) {
      this.graph.set(quad, []);
    }

    for (let i = 0; i < this.quads.length; i++) {
      const quadA = this.quads[i];
      for (let j = i + 1; j < this.quads.length; j++) {
        const quadB = this.quads[j];
        if (quadA.isConnectedTo(quadB)) {
          this.graph.get(quadA).push(quadB);
          this.graph.get(quadB).push(quadA);
        }
      }
    }
  }

  getQuads() {
    return this.quads;
  }

  // 获取quad的邻居
  getNeighbors(quad) {
    return this.graph.get(quad) || [];
  }

  // 寻找两个quad之间的路径
  findPath(startQuad, endQuad) {
    const queue = [[startQuad]];
    const visited = new Set([startQuad]);

    while (queue.length > 0) {
      const path = queue.shift();
      const quad = path[path.length - 1];

      if (quad === endQuad) {
        return path;
      }
      //console.log(quad);
      for (const neighbor of this.getNeighbors(quad)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // 没有路径
  }
}
