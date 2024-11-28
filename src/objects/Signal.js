export default class Signal {
    constructor({ id, type, axis, angle, pivot, translationVectorList }) {
        this.id = id;
        this.count = 0;
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
            console.log(translationVectorList);
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

/*
"signal": {
        "id": 1,
        "axis": { "x": 0, "y": 1, "z": 0 },
        "angle": 90
      }
*/