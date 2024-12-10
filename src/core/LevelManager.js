import Platform from "../objects/Platform.js";
import Quad from "../objects/Quad.js";
import Character from "../objects/Character.js";
import TriangularPrism from "../objects/TriangularPrism.js";
import Button from "../objects/Button.js";
import Surface from "../objects/Surface.js";

import { loadButtons } from "../utils/LoadButtons.js";

export default class LevelManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.character = null;
    this.platforms = [];
    this.quads = [];
    this.triangularPrisms = [];
    this.buttons = [];
    this.surfaces = [];
    this.signals = [];
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

    // 加载场景中的 3D 模型
    if (levelData.models) {
      await this.loadModels(levelData.models, scene, updatables);
    }

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
        this.signals.push(...quad.plate.signals);
        
      }
      if(quad.doublePlate) {
        scene.add(quad.doublePlate.mesh);
        updatables.push(quad.doublePlate);
        this.signals.push(...quad.doublePlate.signals);
      }
    });

    levelData.surfaces.forEach((surfaceData) => {
      const surface = new Surface(surfaceData);
      scene.add(surface.mesh);
      updatables.push(surface);
      this.surfaces.push(surface);
    });

    loadButtons(levelData, scene, this, updatables);

    // levelData.buttons.forEach((buttonData) => {
    //   const button = new Button({...buttonData, levelManager: this});
    //   button.init();
    //   scene.add(button.mesh);
    //   console.log("add button", button.mesh);
    //   updatables.push(button);
    //   this.buttons.push(button);
    //   this.signals.push(...button.signals);
    // });
    

    // levelData.buttons.forEach((buttonData) => {
    //   let button; // 提前声明变量
    //   button = new Button({
    //     ...buttonData,
    //     levelManager: this,
    //     onReady: (mesh) => {
    //       scene.add(mesh);
    //       updatables.push(button);
    //       console.log(mesh)
    //       this.buttons.push(button);
    //       this.signals.push(...button.signals);
    //     },
    //   });
    // });
    

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

    this.addListener();

  }

  async loadModels(models, scene, updatables) {
    const loader = new THREE.GLTFLoader();

    for (const modelData of models) {
      const { id, path, position, scale, rotation } = modelData;

      try {
        const gltf = await loader.loadAsync(path); // 使用 loadAsync 异步加载 GLB 模型
        const model = gltf.scene;
        
        // 设置模型位置、缩放、旋转
        model.position.set(position.x, position.y, position.z);
        model.scale.set(scale.x, scale.y, scale.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);

        // 添加到场景
        scene.add(model);
        updatables.push(model); // 如果需要在 tick 中更新模型状态，可以将模型加入 updatables

        console.log(`Loaded model: ${id} from ${path}`);
      } catch (error) {
        console.error(`Failed to load model from ${path}:`, error);
      }
    }
  }



  addListener() {
    // 操作角色移动
    window.addEventListener("click", (event) => this.onScreenClick(event));

    // 控制台 DOM 元素
    const openConsoleBtn = document.getElementById("openConsoleBtn");
    const closeConsoleBtn = document.getElementById("closeConsoleBtn");
    const resetCameraBtn = document.getElementById("resetCameraBtn");
    const consoleDiv = document.getElementById("console");
  
    // 动态按钮容器
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "signalButtonContainer";
    buttonContainer.style.display = "flex";
    buttonContainer.style.flexWrap = "wrap";
    buttonContainer.style.gap = "10px";
    buttonContainer.style.marginTop = "10px";
    consoleDiv.appendChild(buttonContainer);
  
    // 打开控制台
    openConsoleBtn.addEventListener("click", () => {
      consoleDiv.style.display = "block";
      setTimeout(() => {
        consoleDiv.style.transform = "translateY(0)";
      }, 10);
  
      // 动态生成按钮
      this.generateSignalButtons(buttonContainer);
    });
  
    // 关闭控制台
    closeConsoleBtn.addEventListener("click", () => {
      consoleDiv.style.transform = "translateY(-100%)";
      setTimeout(() => {
        consoleDiv.style.display = "none";
      }, 500);
    });
  
    // 重置相机位置
    resetCameraBtn.addEventListener("click", () => {
      this.sceneManager.resetCameraPosition();
    });
  }

  generateSignalButtons(container) {
    // 清空之前的按钮
    container.innerHTML = "";
  
    // 遍历 signals 数组，动态生成按钮
    this.signals.forEach((signal, index) => {
      const button = document.createElement("button");
      button.textContent = `Signal ${signal.id}`; // 按钮文本
  
      // 样式设置
      button.style.padding = "8px 12px";
      button.style.backgroundColor = "#444";
      button.style.color = "#fff";
      button.style.border = "none";
      button.style.borderRadius = "4px";
      button.style.cursor = "pointer";
      button.style.transition = "background-color 0.3s";
  
      button.addEventListener("mouseenter", () => {
        button.style.backgroundColor = "#666";
      });
      button.addEventListener("mouseleave", () => {
        button.style.backgroundColor = "#444";
      });
  
      // 绑定点击事件：触发对应的 signal
      button.addEventListener("click", () => {
        console.log(`Emitting Signal ${index + 1}`);
        this.setSignals([signal]);
      });
  
      // 将按钮添加到容器中
      container.appendChild(button);
    });
  }
  
  

  // 设置信号
  setSignals(signals) {
    if (signals != [] && signals[0].id === -1) {
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
    this.animatingObjects = [];

    for (const platform of this.platforms) {
      platform.setSignals(signals);
      if (platform.isAnimating) {
        this.animatingObjects.push(platform);
      }
    }
    for (const quad of this.quads) {
      quad.setSignals(signals);
      if (quad.isAnimating) {
        this.animatingObjects.push(quad);
      }
    }
    for (const surface of this.surfaces) {
      surface.setSignals(signals);
      if (surface.isAnimating) {
        this.animatingObjects.push(surface);
      }
    }  
    for (const button of this.buttons) {
      button.setSignals(signals);
      if (button.isAnimating) {
        this.animatingObjects.push(button);
      }
    }
    for (const triangularPrism of this.triangularPrisms) {
      triangularPrism.setSignals(signals);
      if (triangularPrism.isAnimating) {
        this.animatingObjects.push(triangularPrism);
      }
    }
    for (const quad of this.quads) {
      if (quad.plate) {
        quad.plate.setSignals(signals);
        if (quad.plate.isAnimating) {
          this.animatingObjects.push(quad.plate);
        }
      }
      if (quad.doublePlate) {
        quad.doublePlate.setSignals(signals);
        if (quad.doublePlate.isAnimating) {
          this.animatingObjects.push(quad.doublePlate);
        }
      }
    }
  }

  tick(delta) {  
    // 判断角色是否站在button控制的quad上，如果是，锁死button
    if (this.character) {
      const quad = this.character.currentQuad;
      if (quad) {
        for (const button of this.buttons) {
          if (quad.signalIdList && quad.signalIdList.includes(button.signals[0].id) && button.standStop) {
            button.toggleActive(false);
          }
          else {
            button.toggleActive(true);
          }
        }
      }
    }
      
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
