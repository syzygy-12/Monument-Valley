export default class SignalResponsiveObject {
    constructor({ geometry, material, position, signalIdList }) {
      this.signalIdList = signalIdList || [];

      this.mesh = null;
      if (geometry && material) {
        this.mesh = new THREE.Mesh(geometry, material);
        if (position) {
          this.mesh.position.set(position.x, position.y, position.z);
        }
    
        this.mesh.receiveShadow = false;
      }
      

      this.initialQuaternion = new THREE.Quaternion();
      this.initialQuaternion.set(0, 0, 0, 1);
  
      if (position) {
        this.position = new THREE.Vector3(position.x, position.y, position.z);
      }
  
      // 动画控制变量
      this.pivot = new THREE.Vector3(); // 旋转的中心点
      this.axis = new THREE.Vector3(0, 1, 0); // 默认旋转轴
      this.startPositionOffset = new THREE.Vector3(); // 物体相对 pivot 的初始偏移
      this.angleDelta = 0; // 每帧旋转的增量角度
      this.currentAngle = 0; // 当前已经旋转的角度
      this.targetAngle = 0; // 目标旋转角度
      this.targetQuaternion = new THREE.Quaternion(); // 目标旋转四元数
      this.translateTarget = new THREE.Vector3(); // 目标平移位置
      this.animationSpeed = Math.PI; // 控制动画速度，单位：弧度/秒
      this.tranlateSpeed = 5; // 控制平移速度，单位：米/秒
      this.isAnimating = false; // 动画状态
      this.animationType = null; // 动画类型
    }
  
    /**
     * 响应信号，初始化动画参数。
     * @param {Object} signal 信号对象，包含 id, axis, angle, pivot
     */
    setSignal(signal) {
        if (this.signalIdList.includes(signal.id)) {
          if (signal.type === "rotation") {

            const { axis, angle, pivot } = signal;
        
            this.pivot = new THREE.Vector3(pivot.x, pivot.y, pivot.z);
            this.axis = new THREE.Vector3(axis.x, axis.y, axis.z).normalize();
            this.targetAngle = angle;
        
            // 计算初始偏移
            this.startPositionOffset = new THREE.Vector3().subVectors(this.mesh.position, this.pivot);
        
            // 初始化动画状态
            this.currentAngle = 0;
            this.targetQuaternion = new THREE.Quaternion().setFromAxisAngle(this.axis, angle);
            this.animationType = "rotation";
            this.isAnimating = true; // 开始动画
          }
          else if (signal.type === "translation") {
            this.animationType = "translation";
            this.translateTarget = new THREE.Vector3().addVectors
              (signal.currentTranslationVector, this.mesh.position);
            //console.log(signal.currentTranslationVector);
            this.isAnimating = true; // 开始动画
          }
        }
      }

    animationComplete() {
      ; // 空方法，由子类实现
    }
  
    /**
     * 动画更新方法，在每帧调用。
     * @param {number} delta 距离上一帧的时间间隔（秒）
     */
    tick(delta) {
        if (!this.isAnimating) return;
        if (this.animationType === "rotation") {
          this.tickRotation(delta);
        } 
        else if (this.animationType === "translation") {
          this.tickTranslation(delta);
        }
        
      }

      tickTranslation(delta) {
        const direction = new THREE.Vector3().subVectors(this.translateTarget, this.mesh.position);
        const distance = direction.length();
        const moveDistance = delta * this.tranlateSpeed;
        if (moveDistance < distance) {
          this.mesh.position.addScaledVector(direction.normalize(), moveDistance);
        } else {
          this.mesh.position.copy(this.translateTarget);
          this.animationComplete();
          this.position.copy(this.mesh.position);
          this.isAnimating = false;
          this.animationType = null;
        }
      }

      tickRotation(delta) {
        // 计算旋转增量
        this.angleDelta = this.animationSpeed * delta;
      
        // 剩余角度计算
        const remainingAngle = this.targetAngle - this.currentAngle;
        const angleThreshold = Math.PI / 180; // 阈值（1度）
      
        if (remainingAngle <= angleThreshold) {
          this.angleDelta = remainingAngle; // 直接到目标角度
          this.currentAngle = this.targetAngle; // 更新为目标角度
      
          // 更新位置和旋转到目标
          this.startPositionOffset.applyQuaternion(
            new THREE.Quaternion().setFromAxisAngle(this.axis, remainingAngle)
          );
          const finalPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);
          this.mesh.position.copy(finalPosition);
          this.mesh.quaternion.copy(this.initialQuaternion);
          this.mesh.quaternion.premultiply(this.targetQuaternion);
          this.initialQuaternion.premultiply(this.targetQuaternion);
          this.position.copy(finalPosition); // 更新逻辑位置
          this.animationComplete();
          this.isAnimating = false; // 动画完成
          this.animationType = null
          return; // 动画结束
        }
      
        // 累计旋转角度
        this.currentAngle += this.angleDelta;
      
        // 应用旋转
        const quaternion = new THREE.Quaternion().setFromAxisAngle(this.axis, this.angleDelta);
        this.startPositionOffset.applyQuaternion(quaternion);
      
        // 计算新的位置
        const newPosition = new THREE.Vector3().addVectors(this.pivot, this.startPositionOffset);
      
        // 应用位置和旋转
        this.mesh.position.copy(newPosition);
        this.mesh.quaternion.premultiply(quaternion);
      
        // 更新逻辑位置
        this.position.copy(this.mesh.position);
      }
  }