export function setSignals(levelManager, signals) {
    if (signals != [] && signals[0].id === -1) {
      // 游戏胜利
      console.log("Game Win!");
      window.location.href = "pages/victory.html"; // 跳转到胜利页面
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
  