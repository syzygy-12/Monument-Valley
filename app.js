import Game from "./src/core/Game.js";

function QuaternionSolver() {
    const quat = new THREE.Quaternion();
    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    const quat2 = new THREE.Quaternion();
    quat2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
    quat.multiply(quat2);
    console.log(quat);
    const quat3 = new THREE.Quaternion();
    //从欧拉角转换为四元数
    quat3.setFromEuler(new THREE.Euler(-Math.PI / 4, 0, 0, 'XYZ'));
    console.log(quat3);
}

//QuaternionSolver();

// 启动游戏
const game = new Game();