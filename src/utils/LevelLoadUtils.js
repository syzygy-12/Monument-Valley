// LevelLoadUtils.js
import Platform from "../objects/Platform.js";
import Quad from "../objects/Quad.js";
import TriangularPrism from "../objects/TriangularPrism.js";
import Surface from "../objects/Surface.js";
import Button from "../objects/Button.js";
import Snow from "../objects/Snow.js";
import Rain from "../objects/Rain.js";
import Character from "../objects/Character.js";
import Ladder from "../objects/Ladder.js";
import Ocean from "../objects/Ocean.js";
import Lightning from "../objects/Lightning.js";
import WaterSurface from "../objects/WaterSurface.js";

export async function loadLevelData(levelNumber) {
  // 异步加载关卡 JSON 数据
  const response = await fetch(`./src/levels/level${levelNumber}.json`);
  const levelData = await response.json();
  
  // 设置默认值
  return {
    cameraShift: levelData.cameraShift || { dx: 0, dy: 0 },
    platforms: levelData.platforms || [],
    triangularprisms: levelData.triangularprisms || [],
    quads: levelData.quads || [],
    buttons: levelData.buttons || [],
    surfaces: levelData.surfaces || [],
    ladders: levelData.ladders || null,
    backgroundColor: levelData.backgroundColor || 0x000000,
    models: levelData.models || [],
    snow: levelData.snow || null,
    rain: levelData.rain || null,
    ocean: levelData.ocean || null,
    directionalLights: levelData.directionalLights || [],
    lightning: levelData.lightning || null,
    waterSurface: levelData.waterSurface || null,
  };
}

export async function loadLevelObjects(levelData, sceneManager, levelManager) {
  const { scene, updatables } = sceneManager;

  // 相机和背景
  sceneManager.shiftCamera(levelData.cameraShift);
  sceneManager.background(levelData.backgroundColor);
  
  // 加载有向光
  levelData.directionalLights.forEach((data) => {
    if (data.color) {
      data.color = parseInt(data.color, 16);
    }
    const light = new THREE.DirectionalLight(data.color || 0xffffff, data.intensity);
    light.position.set(data.position.x, data.position.y, data.position.z);
    scene.add(light);
  });

  // 加载雪效果
  if (levelData.snow) {
    const { particlesCount, size, areaSize, speed } = levelData.snow;
    const snow = new Snow({ particlesCount, size, areaSize, speed, levelManager });
    updatables.push(snow);
  }

  // 加载雨效果
  if (levelData.rain) {
    const rain = new Rain({ ...levelData.rain, levelManager });
    updatables.push(rain);
    levelManager.rain = rain;
  }

  // 加载海洋效果
  if (levelData.ocean) {
    const ocean = new Ocean({ ...levelData.ocean, levelManager });
    updatables.push(ocean);
    levelManager.ocean = ocean;
  }

  // 加载闪电效果
  if (levelData.lightning) {
    const lightning = new Lightning({ ...levelData.lightning, levelManager });
    levelManager.lightning = lightning;
    levelManager.lightning.strikeLightning();
  }

  // 加载水面
  if (levelData.waterSurface) {
    const waterSurface = new WaterSurface({ ...levelData.waterSurface, levelManager });
    updatables.push(waterSurface);
    levelManager.waterSurface = waterSurface;
  }

  // 加载平台
  levelData.platforms.forEach((data) => {
    const platform = new Platform(data);
    scene.add(platform.mesh);
    updatables.push(platform);
    levelManager.platforms.push(platform);
  });

  // 加载三角棱柱
  levelData.triangularprisms.forEach((data) => {
    const triangularPrism = new TriangularPrism(data);
    scene.add(triangularPrism.mesh);
    updatables.push(triangularPrism);
    levelManager.triangularPrisms.push(triangularPrism);
  });

  // 加载方块 (Quad)
  levelData.quads.forEach((data) => {
    const quad = new Quad({ ...data, levelManager });
    scene.add(quad.mesh);
    updatables.push(quad);
    levelManager.quads.push(quad);

    if (quad.plate) {
      scene.add(quad.plate.mesh);
      updatables.push(quad.plate);
      levelManager.signals.push(...quad.plate.signals);
    }
    if (quad.doublePlate) {
      scene.add(quad.doublePlate.mesh);
      updatables.push(quad.doublePlate);
      levelManager.signals.push(...quad.doublePlate.signals);
    }
  });

  // 加载表面
  levelData.surfaces.forEach((data) => {
    const surface = new Surface(data);
    scene.add(surface.mesh);
    updatables.push(surface);
    levelManager.surfaces.push(surface);
  });

  // 加载梯子
  if (levelData.ladders) {
    for (const ladderData of levelData.ladders) {
      const ladder = new Ladder(ladderData);
      scene.add(ladder.mesh);
      updatables.push(ladder);
      levelManager.ladders.push(ladder);
    }
  }

  // 加载按钮
  for (const buttonData of levelData.buttons) {
    const button = new Button({ ...buttonData, levelManager });
    await button.init(); 
    scene.add(button.mesh); 
    updatables.push(button);
    levelManager.buttons.push(button);
    levelManager.signals.push(...button.signals);
  }

  const character = new Character(sceneManager, levelManager);
  await character.loadModel();
  character.setInitialQuad(levelManager.quads[0]);
  levelManager.character = character;
  scene.add(character.mesh);
  updatables.push(character);

  // 加载 3D 模型
  if (levelData.models) {
    await loadModels(levelData.models, scene, updatables);
  }
}

async function loadModels(models, scene, updatables) {
    const loader = new THREE.GLTFLoader();

    for (const modelData of models) {
      const { id, path, position, scale, rotation, color } = modelData;

      try {
        const gltf = await loader.loadAsync(path); // 使用 loadAsync 异步加载 GLB 模型
        const model = gltf.scene;
        
        // 设置模型位置、缩放、旋转
        model.position.set(position.x, position.y, position.z);
        model.scale.set(scale.x, scale.y, scale.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);
        if (color) {
          const parsedColor = parseInt(color, 16);
          const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
          model.traverse((child) => {
            child.material = material;
            console.log(child);
          });
        }

        // 添加到场景
        scene.add(model);
        updatables.push(model); // 如果需要在 tick 中更新模型状态，可以将模型加入 updatables

        //console.log(`Loaded model: ${id} from ${path}`);
      } catch (error) {
        console.error(`Failed to load model from ${path}:`, error);
      }
    }
}