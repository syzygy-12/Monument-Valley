export function initializeConsole(levelManager, sceneManager) {
  // 控制台 DOM 元素
  const openConsoleBtn = document.getElementById("openConsoleBtn");
  const consoleDiv = document.getElementById("console");

  // 创建“游玩模式”按钮
  const playModeBtn = document.createElement("button");
  playModeBtn.textContent = "游玩模式";
  styleButton(playModeBtn);
  playModeBtn.addEventListener("click", () => {
    // 锁死相机
    sceneManager.controls.enabled = false; // 关闭 OrbitControls
    sceneManager.resetCameraPosition();         // 重置相机位置
  });
  consoleDiv.appendChild(playModeBtn);

  // 创建“探索模式”按钮
  const exploreModeBtn = document.createElement("button");
  exploreModeBtn.textContent = "探索模式";
  styleButton(exploreModeBtn);
  exploreModeBtn.addEventListener("click", () => {
    // 开启 OrbitControls
    sceneManager.controls.enabled = true;
  });
  consoleDiv.appendChild(exploreModeBtn);

  // 创建返回主界面
  const backToMainBtn = document.createElement("button");
  backToMainBtn.textContent = "返回主界面";
  styleButton(backToMainBtn);
  backToMainBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  consoleDiv.appendChild(backToMainBtn);

  // 创建关闭控制台
  const closeConsoleBtn = document.createElement("button");
  closeConsoleBtn.textContent = "关闭";
  styleButton(closeConsoleBtn);
  closeConsoleBtn.addEventListener("click", () => {
    consoleDiv.style.transform = "translateY(-100%)";
    setTimeout(() => {
      consoleDiv.style.display = "none";
    }, 500);
  });
  consoleDiv.appendChild(closeConsoleBtn);

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
}

function generateSignalButtons(levelManager, container) {
  // 清空按钮容器
  container.innerHTML = "";

  // 遍历 signals 数组，动态生成按钮
  levelManager.signals.forEach((signal, index) => {
    const button = document.createElement("button");
    button.textContent = `Signal ${signal.id}`;
    styleButton(button);

    button.addEventListener("click", () => {
      console.log(`Emitting Signal ${index + 1}`);
      levelManager.setSignals([signal]);
    });

    container.appendChild(button);
  });
}

// 按钮样式函数
function styleButton(button) {
  button.style.padding = "8px 12px";
  button.style.backgroundColor = "#444";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  // 按钮之间增加间隔
  button.style.marginRight = "10px";
  button.style.marginBottom = "10px";
  button.style.transition = "background-color 0.3s";

  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#666";
  });
  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#444";
  });
}
