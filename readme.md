# 纪念碑谷

### 运行

在 VScode 里安装 Live Server 插件，然后右键`index.html`，选择 Open with Live Server ，之后自动跳转到浏览器运行

### 项目架构

```perl
Monument-Valley/
├── index.html               # 主HTML文件
├── style.css                # 游戏的基本样式
├── app.js                   # 主入口文件
├── assets/                  # 资源文件夹
│   ├── textures/            # 材质文件夹
│   └── models/              # 模型文件夹
├── src/                     # 源代码文件夹
│   ├── core/                # 核心模块
│   │   ├── Game.js          # 游戏主逻辑
│   │   ├── SceneManager.js  # 场景管理器
│   │   ├── LevelManager.js  # 关卡管理器
│   │   └── CameraController.js # 相机控制器
│   ├── objects/             # 3D对象
│   │   ├── Character.js     # 角色类
│   │   ├── Platform.js      # 平台类
│   │   ├── Stair.js         # 楼梯类
│   │   └── Quad.js      # 平面类
│   ├── levels/              # 关卡数据
│   │   ├── level1.json      # 第一关
│   │   ├── level2.json      # 第二关
│   │   └── ...              # 更多关卡
│   └── utils/               # 工具函数
│       ├── MathUtils.js     # 数学计算函数（例如旋转、转换）
│       └── EventUtils.js    # 事件处理函数
└── package.json             # 项目依赖配置文件

```

### 项目规划

第一阶段:

先创造出基本的场景，再就这这些场景搞人物的移动逻辑

第二阶段:

加入交互模块，加入更多的道具设计

第三阶段:

做美术，做关卡设计，做初始界面，人物动画，声音等



### 目前目标

第三关

文字和loading界面

发布视频

苹果声音



