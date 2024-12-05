import Game from "./src/core/Game.js";

function QuaternionSolver() {
    const quat = new THREE.Quaternion();
    quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
    console.log(quat);
}

QuaternionSolver();

// 启动游戏
const game = new Game();
game.start();
