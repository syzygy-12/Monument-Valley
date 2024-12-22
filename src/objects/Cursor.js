export default class Cursor {
    constructor({ position, quaternion, levelManager }) {
        // 一个圆柱，边长0.2，高度0.01
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.01, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 1,
            transparent: true,
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.quaternion.copy(quaternion);
        this.mesh.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));

        this.mesh.position.copy(position);
        this.levelManager = levelManager;
        this.levelManager.sceneManager.scene.add(this.mesh);

        const ringGeometry = new THREE.TorusGeometry(0.4, 0.01, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 1,
            transparent: true,
        });
        this.ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        this.ringMesh.position.copy(position);
        this.ringMesh.quaternion.copy(quaternion);
        //this.ringMesh.quaternion.multiply(new THREE.Quaternion().
        //    setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
        this.levelManager.sceneManager.scene.add(this.ringMesh);

        // 执行TWEEN.js动画:透明度逐渐减少到0，然后从scene中移除
        const duration = 0.5;
        const targetOpacity = 0;
        const tween = new TWEEN.Tween(material)
            .to({ opacity: targetOpacity }, duration * 1000)
            .onComplete(() => {
                this.levelManager.sceneManager.scene.remove(this.mesh);
            })
            .start();

        const duration2 = 0.5; // 动画持续时间1秒
        const maxScale = 5; // 最大扩展比例

        // 动画：圆环逐渐扩大并消失
        const tween2 = new TWEEN.Tween(this.ringMesh.scale)
            .to({ x: maxScale, y: maxScale, z: maxScale }, duration2 * 1000) // 扩大圆环
            .start();

        const material2 = this.ringMesh.material;
        new TWEEN.Tween(material2)
            .to({ opacity: 0 }, duration2 * 1000) // 透明度逐渐减小
            .onComplete(() => {
                this.levelManager.sceneManager.scene.remove(this.ringMesh); // 动画完成后移除圆环
            })
            .start();
    }
}
