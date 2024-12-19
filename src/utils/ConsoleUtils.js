import { isDevMode } from "../params/IsDevMode.js";

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
    if (isDevMode) {
      generateSignalButtons(levelManager, buttonContainer);
    }
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

// 生成 WASD 控制按钮，放置到页面右下角
export function generateWASDButtons() {
  // 创建一个新的容器并将其固定到页面右下角
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "WASDButtonContainer";
  buttonContainer.style.position = "fixed";
  buttonContainer.style.bottom = "20px";
  buttonContainer.style.right = "60px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column"; // 改为上下排列
  buttonContainer.style.gap = "10px";
  buttonContainer.style.zIndex = "1000"; // 确保按钮显示在最前面
  buttonContainer.style.transform = "rotate(45deg)"; // 旋转按钮容器 45 度
  buttonContainer.style.transformOrigin = "bottom right"; // 设置旋转中心为右下角
  document.body.appendChild(buttonContainer);

  // 创建 WASD 按钮
  const keys = ['W', 'A', 'S', 'D'];

  // 创建上、下、左、右按钮的顺序
  const buttonOrder = [
    [keys[0]], // W
    [keys[1], keys[2], keys[3]], // A, S, D
  ];

  // 为每一行创建按钮
  buttonOrder.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    rowDiv.style.gap = "10px";
    rowDiv.style.justifyContent = "center"; // 按钮居中对齐
    row.forEach(key => {
      const button = document.createElement("button");
      button.textContent = key;
      styleButton2(button);

      button.addEventListener("click", () => {
        simulateKeyPress(key);
      });

      rowDiv.appendChild(button);
    });
    buttonContainer.appendChild(rowDiv);
  });
}

// 按钮样式函数
function styleButton2(button) {
  // 增加现代化样式
  button.style.padding = "12px 20px";
  button.style.background = "linear-gradient(145deg, #6a5acd, #836fff)";
  button.style.color = "#fff";
  button.style.border = "2px solid #4b0082";
  button.style.borderRadius = "12px";
  button.style.fontSize = "20px";
  button.style.fontFamily = "'Roboto', sans-serif"; // 更现代的字体
  button.style.fontWeight = "bold";
  button.style.cursor = "pointer";
  button.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
  button.style.transition = "all 0.3s ease"; // 平滑过渡

  // 按钮交互效果
  button.addEventListener("mouseenter", () => {
    button.style.background = "linear-gradient(145deg, #836fff, #6a5acd)";
    button.style.transform = "scale(1.1)";
    button.style.boxShadow = "2px 2px 15px rgba(0, 0, 0, 0.3)";
  });
  
  button.addEventListener("mouseleave", () => {
    button.style.background = "linear-gradient(145deg, #6a5acd, #836fff)";
    button.style.transform = "scale(1)";
    button.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
  });

  // 按钮按下效果
  button.addEventListener("mousedown", () => {
    button.style.transform = "scale(0.95)";
    button.style.boxShadow = "inset 2px 2px 5px rgba(0, 0, 0, 0.3)";
  });

  button.addEventListener("mouseup", () => {
    button.style.transform = "scale(1)";
    button.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
  });
}


// 模拟键盘按键
function simulateKeyPress(key) {
  const event = new KeyboardEvent('keydown', {
    key: key
  });
  window.dispatchEvent(event);
}