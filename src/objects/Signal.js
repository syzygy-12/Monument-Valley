export default class Signal {
    constructor({ id, axis, angle, pivot }) {
        this.id = id;
        this.axis = new THREE.Vector3(axis.x, axis.y, axis.z);
        this.angle = THREE.MathUtils.degToRad(angle);
        this.pivot = new THREE.Vector3(pivot.x, pivot.y, pivot.z);
        //console.log(`Signal created with id ${this.id}, axis ${this.axis}, angle ${this.angle}, pivot ${this.pivot}`);
    }
}

/*
"signal": {
        "id": 1,
        "axis": { "x": 0, "y": 1, "z": 0 },
        "angle": 90
      }
*/