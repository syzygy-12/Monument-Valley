export function setSignals(levelManager, signals) {
    // 假设你有一个 globalLevelData 对象来存储关卡的配置
    const levelData = {
      1: {
        targetPosition: new THREE.Vector3(21, 9, -20),  // 终点位置
        targetLookAt: new THREE.Vector3(21, 9, -20),    // 终点视角
      },
      2: {
        targetPosition: new THREE.Vector3(2, 13, -4),
        targetLookAt: new THREE.Vector3(2, 13, -4),
      },
      // 更多关卡配置
    };
    
    let currentLevel = levelManager.levelNumber; // 获取当前关卡
    
    // 游戏胜利判断
    if (signals != [] && signals[0].id === -1) {
      console.log("Game Win!");
      levelManager.game.winLevel(levelManager.levelNumber);
      // TODO: 删去胜利界面，app.js一直不关闭
      
      // 根据当前关卡动态调整终点位置和视角
      const currentLevelData = levelData[currentLevel]; // 获取当前关卡的数据
      
      // 调用触发相机动画和显示胜利信息的函数
      triggerVictory(currentLevelData);
    }
    
    function triggerVictory(levelData) {
      // 使用当前关卡的数据设置终点位置和视角
      const targetPosition = levelData.targetPosition;
      const targetLookAt = levelData.targetLookAt;
    
      // 创建相机的动画
      const cameraTween = new TWEEN.Tween(camera.position)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 2000) // 2000ms
        .easing(TWEEN.Easing.Quadratic.InOut) // 使用平滑的缓动效果
        .onUpdate(() => {
          camera.lookAt(targetLookAt); // 相机不断调整视角
        })
        .onComplete(() => {
          showVictoryMessage(); // 动画完成后显示胜利信息
        })
      cameraTween.start(); // 开始动画
    }
    
    function showVictoryMessage() {
      const loader = new THREE.FontLoader();
      loader.load('../assets/victory.json', (font) => {
        const geometry = new THREE.TextGeometry('Victory', {
          font: font,
          size: 5,
          height: 1,
        });
    
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.set(10, 10, 10); // 根据需要调整显示位置
        scene.add(textMesh);
      });
    }
  
    if (levelManager.isSignalReceived || levelManager.animatingObjects.length > 0) {
      return;
    }
  
    levelManager.isSignalReceived = true;
    levelManager.animatingObjects = [];
  
    const signalTargets = [
      ...levelManager.platforms,
      ...levelManager.quads,
      ...levelManager.surfaces,
      ...levelManager.buttons,
      ...levelManager.triangularPrisms,
      ...levelManager.ladders,
      levelManager.sceneManager,
    ];
  
    // 为每个目标物体设置信号
    for (const target of signalTargets) {
      target.setSignals(signals);
      if (target.isAnimating) {
        levelManager.animatingObjects.push(target);
      }
    }
  
    // 特殊处理 quads 的 plate 和 doublePlate
    for (const quad of levelManager.quads) {
      if (quad.plate) {
        quad.plate.setSignals(signals);
        if (quad.plate.isAnimating) {
          levelManager.animatingObjects.push(quad.plate);
        }
      }
      if (quad.doublePlate) {
        quad.doublePlate.setSignals(signals);
        if (quad.doublePlate.isAnimating) {
          levelManager.animatingObjects.push(quad.doublePlate);
        }
      }
    }
  }
  
  export function tick(levelManager, delta) {
    const { character, buttons, animatingObjects, totem } = levelManager;
  
    // 判断角色是否站在 button 控制的 quad 上
    if (character) {
      const quad = character.currentQuad;
      if (quad) {
        for (const button of buttons) {
          if (
            quad.signalIdList &&
            quad.signalIdList.includes(button.signals[0].id) &&
            button.standStop
          ) {
            button.toggleActive(false);
          } else {
            button.toggleActive(true);
          }
        }
      }
    }
  
    // 检查动画状态
    if (animatingObjects.length > 0) {
      levelManager.animatingObjects = animatingObjects.filter(
        (obj) => obj.isAnimating
      );
  
      if (levelManager.animatingObjects.length === 0) {
        // 动画完成后的逻辑
        if (totem) {
          totem.mesh.position.copy(totem.currentQuad.getCenter());
          totem.updateHeadPosition();
        }
        levelManager.buildGraph();
        levelManager.isSignalReceived = false;
      }
    }
  }
  