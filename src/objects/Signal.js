export default class Signal {
    constructor({ id, type, axis, angle, pivot, translationVectorList, translateSpeed, toCamera,
        intensity, duration, animationSpeed, waitTime }) {
        this.id = id;
        this.count = 0;
        this.waitTime = waitTime || 0;
        this.toCamera = toCamera || false;
        this.type = type;
        if (type === "rotation") {
            this.type = "rotation";
            this.axis = new THREE.Vector3(axis.x, axis.y, axis.z);
            this.angle = THREE.MathUtils.degToRad(angle);
            this.pivot = new THREE.Vector3(pivot.x, pivot.y, pivot.z);
        }
        else if (type === "translation") {
            this.type = "translation";
            this.translationVectorList = translationVectorList.map(
                (vector) => new THREE.Vector3(vector.x, vector.y, vector.z));
            this.currentTranslationVector = this.translationVectorList[0];
            this.translateSpeed = translateSpeed || 6;  // 超参数
            //console.log(translationVectorList);
        }
        else if (type === "appear") {
            this.type = "appear";
        }
        else if (type === "disappear") {
            this.type = "disappear";
        }
        else if (type === "cameraShake") {
            this.type = "cameraShake";
            this.intensity = intensity || 0.1;
            this.duration = duration || 1;
        }
        else if (type === "animation") {
            this.type = "animation";
            this.animationSpeed = animationSpeed || 1;
        }
    }
    
    addCount() {
        if (this.type === "translation") {
            this.currentTranslationVector = this.translationVectorList[
                this.count % this.translationVectorList.length];
        }
        this.count++;
    }
}
