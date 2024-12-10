import  Button  from "../objects/Button.js";

export async function loadButtons(levelData, scene, levelManager, updatables) {
    for (const buttonData of levelData.buttons) {
        const button = new Button({ ...buttonData, levelManager });
        
        await button.init();  // 等待按钮初始化完成
        
        scene.add(button.mesh);  // 现在可以安全地添加按钮到场景
        //console.log("add button", button.mesh);
        
        updatables.push(button);
        levelManager.buttons.push(button);
        levelManager.signals.push(...button.signals);
      }
}