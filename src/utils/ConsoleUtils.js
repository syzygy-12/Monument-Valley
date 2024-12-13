export function initializeConsole(levelManager, sceneManager) {
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
  
      // 生成信号按钮
      generateSignalButtons(levelManager, buttonContainer);
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
      sceneManager.resetCameraPosition();
    });
  }
  
  function generateSignalButtons(levelManager, container) {
    // 清空按钮容器
    container.innerHTML = "";
  
    // 遍历 signals 数组，动态生成按钮
    levelManager.signals.forEach((signal, index) => {
      const button = document.createElement("button");
      button.textContent = `Signal ${signal.id}`;
  
      // 设置按钮样式
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
  
      // 点击事件：触发信号
      button.addEventListener("click", () => {
        console.log(`Emitting Signal ${index + 1}`);
        levelManager.setSignals([signal]);
      });
  
      container.appendChild(button);
    });
  }
  