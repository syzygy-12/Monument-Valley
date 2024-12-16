export function setSignals(levelManager, signals) {
    // 假设你有一个 globalLevelData 对象来存储关卡的配置
    const levelData = {
      1: {
        targetPosition: new THREE.Vector3(11, 19, -10),  // 终点位置
        targetZoom: 3,  // 终点缩放
      },
      2: {
        targetPosition: new THREE.Vector3(-14, 29, 12),
        targetZoom: 3,
      },
      4: {
        targetPosition: new THREE.Vector3(-12, 27, 1),
        targetZoom: 3,
      },
      0: {
        targetPosition: new THREE.Vector3(-10, 9, 24),
        targetZoom: 3,
      }
    };
    
    const currentLevel = levelManager.levelNumber; // 获取当前关卡
    
    // 游戏胜利判断
    if (signals != [] && signals[0].id === -1) {
      console.log("Game Win!");
      levelManager.game.winLevel(levelManager.levelNumber);
      // TODO: 删去胜利界面，app.js一直不关闭
      
      // 根据当前关卡动态调整终点位置和视角
      const currentLevelData = levelData[currentLevel]; // 获取当前关卡的数据
      
      // 调用触发相机动画和显示胜利信息的函数
      triggerVictory(currentLevelData, levelManager);
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
      levelManager.ocean,
    ];
  
    // 为每个目标物体设置信号
    for (const target of signalTargets) {
      if (!target) {
        continue;
      }
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

  function triggerVictory(levelData, levelManager) {
    // 使用当前关卡的数据设置终点位置、视角和缩放级别
    const targetPosition = levelData.targetPosition; // 目标位置
    const targetZoom = levelData.targetZoom;         // 目标缩放级别
    const { camera } = levelManager.sceneManager;    // 相机对象
  
    // 保存相机当前的位置和缩放
    const cameraPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };
    const cameraZoom = { zoom: camera.zoom };
    const animatingTime = 4000; // 动画持续时间
  
    // 创建相机位置的 Tween 动画
    const positionTween = new TWEEN.Tween(cameraPosition)
      .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, animatingTime)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        // 在每一帧更新相机位置
        camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        camera.updateProjectionMatrix(); // 更新相机投影矩阵
      });
  
    // 创建相机缩放的 Tween 动画
    const zoomTween = new TWEEN.Tween(cameraZoom)
      .to({ zoom: targetZoom }, animatingTime)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        // 在每一帧更新相机缩放级别
        camera.zoom = cameraZoom.zoom;
        camera.updateProjectionMatrix(); // 更新相机投影矩阵
      })
      .onComplete(() => {
        // 动画完成后的逻辑
        showVictoryMessage(levelManager);
        // 按任意位置回到初始页面
        document.addEventListener('click', () => {
          window.location.href = 'index.html';
        });
      });
  
    // 同时启动位置和缩放的动画
    positionTween.start();
    zoomTween.start();
  
  }
  
  function showVictoryMessage() {
    console.log("Victory!");
  
    // 创建一个 div 元素
    const victoryDiv = document.createElement('div');
    victoryDiv.id = 'victoryMessage'; // 方便后续移除或修改
    victoryDiv.innerText = 'Victory!'; // 显示的文本内容
  
    // 设置样式，使其居中显示
    victoryDiv.style.position = 'absolute';
    victoryDiv.style.top = '50%';
    victoryDiv.style.left = '50%';
    victoryDiv.style.transform = 'translate(-50%, -50%)'; // 精确居中
    victoryDiv.style.fontSize = '5rem';
    victoryDiv.style.fontWeight = 'bold';
    victoryDiv.style.color = '0x000000'; 
    victoryDiv.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)'; // 文本阴影
    victoryDiv.style.zIndex = '1000'; // 确保在最上层
    victoryDiv.style.pointerEvents = 'none'; // 防止阻挡鼠标事件
    victoryDiv.style.transition = 'opacity 1s'; // 添加淡入效果
    // 添加到页面的 body 中
    document.body.appendChild(victoryDiv);
  
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
  