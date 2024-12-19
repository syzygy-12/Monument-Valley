export default class Signal {
    constructor({ id, type, axis, angle, pivot, rotateSpeed, translationVectorList, translateSpeed, toCamera,
        intensity, duration, animationSpeed, targetColor, position, color, waitTime }) {
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
            this.rotateSpeed = rotateSpeed || Math.PI / 2;  // 超参数
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
        else if (type === "colorShift") {
            this.type = "colorShift";
            if (typeof targetColor === "string") {
                targetColor = parseInt(targetColor, 16);
            }
            this.targetColor = new THREE.Color(targetColor);
            this.duration = duration || 1;
        }
        else if (type === "addDirectionalLight") {
            this.type = "addDirectionalLight";
            this.position = new THREE.Vector3(position.x, position.y, position.z);
            this.toCamera = toCamera || false;
            if (typeof color === "string") {
                color = parseInt(color, 16);
            }
            this.color = new THREE.Color(color);
            this.duration = duration || 1;
            this.intensity = intensity || 1;
        }
        else if (type === "stopRain") {
            this.type = "stopRain";
            this.duration = duration || 1;
        }
        else if (type === "stopLightning") {
            this.type = "stopLightning";
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
