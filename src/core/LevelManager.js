import Platform from "../objects/Platform.js";
import Quad from "../objects/Quad.js";
import Character from "../objects/Character.js";
import TriangularPrism from "../objects/TriangularPrism.js";
import Button from "../objects/Button.js";
import Surface from "../objects/Surface.js";

export default class LevelManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.character = null;
    this.platforms = [];
    this.quads = [];
    this.triangularPrisms = [];
    this.buttons = [];
    this.surfaces = [];
    this.signals = null;
    this.isSignalReceived = false;

    this.graph = new Map();
    this.animatingObjects = [];
  }

  async loadLevel(levelNumber) {
    const { scene, updatables } = this.sceneManager;
    
    // 使用 fetch 加载 JSON 文件
    const response = await fetch(`./src/levels/level${levelNumber}.json`);
    const levelData = await response.json();

    levelData.cameraShift = levelData.cameraShift || { dx : 0, dy : 0 };
    levelData.Platforms = levelData.Platforms || [];
    levelData.triangularprisms = levelData.triangularprisms || [];
    levelData.quads = levelData.quads || [];
    levelData.buttons = levelData.buttons || [];
    levelData.surfaces = levelData.surfaces || [];

    // 移动相机
    this.sceneManager.shiftCamera(levelData.cameraShift);

    levelData.platforms.forEach((platformData) => {
      const platform = new Platform(platformData);
      scene.add(platform.mesh);
      updatables.push(platform);
      this.platforms.push(platform);
    });

    levelData.triangularprisms.forEach((triangularPrismData) => {
      const triangularPrism = new TriangularPrism(triangularPrismData);
      scene.add(triangularPrism.mesh);
      updatables.push(triangularPrism);
      this.triangularPrisms.push(triangularPrism);
    });

    levelData.quads.forEach((quadData) => {
      const quad = new Quad({ ...quadData, levelManager: this });
      scene.add(quad.mesh);
      updatables.push(quad);
      this.quads.push(quad);

      if(quad.plate) {
        scene.add(quad.plate.mesh);
        updatables.push(quad.plate);
      }
      if(quad.doublePlate) {
        scene.add(quad.doublePlate.mesh);
        updatables.push(quad.doublePlate);
      }
    });

    levelData.surfaces.forEach((surfaceData) => {
      const surface = new Surface(surfaceData);
      scene.add(surface.mesh);
      updatables.push(surface);
      this.surfaces.push(surface);
    });

    levelData.buttons.forEach((buttonData) => {
      // button要加入levelManager的信息
      const button = new Button({ ...buttonData, levelManager: this });
      scene.add(button.mesh);
      updatables.push(button);
      this.buttons.push(button);
    });

    // 构建quad连通性图
    this.buildGraph();

    // 初始化角色
    (async () => {
      const character = new Character(this.sceneManager);
      await character.loadModel();
      character.setInitialQuad(this.quads[0]);
      this.character = character;
      scene.add(character.mesh);
      updatables.push(character);
    })();

    updatables.push(this);


    // 添加点击事件监听器
    window.addEventListener("click", (event) => this.onScreenClick(event));
  }

  // 设置信号
  setSignal(signal) {
    if (signal.id == -1) {
      // 游戏胜利
      console.log("Game Win!");
      window.location.href = 'pages/victory.html'; // 跳转到胜利页面
    }
    
    if (this.isSignalReceived) {
      return;
    }
    if (this.animatingObjects.length > 0 ) {
      return;
    }
    this.isSignalReceived = true;
    this.signals = signal;
    this.animatingObjects = [];

    for (const platform of this.platforms) {
      platform.setSignal(signal);
      if (platform.isAnimating) {
        this.animatingObjects.push(platform);
      }
    }
    for (const quad of this.quads) {
      quad.setSignal(signal);
      if (quad.isAnimating) {
        this.animatingObjects.push(quad);
      }
    }
    for (const surface of this.surfaces) {
      surface.setSignal(signal);
      if (surface.isAnimating) {
        this.animatingObjects.push(surface);
      }
    }  
    for (const button of this.buttons) {
      button.setSignal(signal);
      if (button.isAnimating) {
        this.animatingObjects.push(button);
      }
    }
    for (const triangularPrism of this.triangularPrisms) {
      triangularPrism.setSignal(signal);
      if (triangularPrism.isAnimating) {
        this.animatingObjects.push(triangularPrism);
      }
    }
    for (const quad of this.quads) {
      if (quad.plate) {
        quad.plate.setSignal(signal);
        if (quad.plate.isAnimating) {
          this.animatingObjects.push(quad.plate);
        }
      }
      if (quad.doublePlate) {
        quad.doublePlate.setSignal(signal);
        if (quad.doublePlate.isAnimating) {
          this.animatingObjects.push(quad.doublePlate);
        }
      }
    }
  }

  tick(delta) {  
    //console.log(this.animatingObjects);
    // 检查动画状态
    if (this.animatingObjects.length > 0) {
      this.animatingObjects = this.animatingObjects.filter((obj) => obj.isAnimating);
      if (this.animatingObjects.length === 0) {
        // 所有动画完成后重新生成连通图
        //console.log("rebuild graph");
        this.buildGraph();
        this.isSignalReceived = false;
        //console.log(this.graph);
      }
    }
  }

  // 处理点击quad之后的事件
  onScreenClick(event) {
    if (this.animatingObjects.length > 0 ) {
      return;
    }
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
      if (clickedQuad && clickedQuad !== this.character.currentQuad) {
        const currentQuad = this.character.currentQuad;
        const path = this.findPath(currentQuad, clickedQuad);
        if (path) {
          //console.log(path);
          this.character.terminateMovement();
          this.character.followPath(path);
        }
      }
    }
  }

  // 判断两个quad是否相连
  isConnectedTo(quadA, quadB, i, j) {
    const threshold = 1;
    for (const key in quadA.keyPoints) {
      for (const otherKey in quadB.keyPoints) {
        // 获取两个点在相机正交投影平面上的对应点，（屏幕空间），只取x，y坐标，忽略z坐标
        // 将 NDC 转换为屏幕像素坐标
        const width = window.innerWidth; // 屏幕宽度
        const height = window.innerHeight; // 屏幕高度

        // 获取 quadA 的屏幕位置
        const ndcPointA = quadA.keyPoints[key].clone().project(this.sceneManager.camera);
        const pointPixelA = new THREE.Vector2(
          (ndcPointA.x + 1) * 0.5 * width, // 转换到 [0, width]
          (1 - ndcPointA.y) * 0.5 * height // 转换到 [0, height]，注意 Y 轴反转
        );

        // 获取 quadB 的屏幕位置
        const ndcPointB = quadB.keyPoints[otherKey].clone().project(this.sceneManager.camera);
        const pointPixelB = new THREE.Vector2(
          (ndcPointB.x + 1) * 0.5 * width,
          (1 - ndcPointB.y) * 0.5 * height
        );
        
        const point = new THREE.Vector2(pointPixelA.x, pointPixelA.y);
        const otherPoint = new THREE.Vector2(pointPixelB.x, pointPixelB.y);
          
        if (point.distanceTo(otherPoint) < threshold) {
          return true;
        }
      }
    }
    return false;
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
        if (this.isConnectedTo(quadA, quadB, i, j)) {
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
