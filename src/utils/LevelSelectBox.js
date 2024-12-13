let scene, camera, renderer, model;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isDragging = false;
let isAnimating = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationY = 0;
let faceIndex = 1;
let faces = [];
let minLevel = 1;
let maxLevel = 10;
let isAbort = false;
let animations = {};
const snapAngle = Math.PI / 2; 
const d = 5; // 正交相机范围
const aspect = window.innerWidth / window.innerHeight;
const clock = new THREE.Clock();

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(-50, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene.background = new THREE.Color(0x111111); 

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(-10, 15, -7);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-10, 0, 0);
    scene.add(directionalLight2);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    

    const loader = new THREE.GLTFLoader();
    loader.load('../assets/level_select.glb', (gltf) => {
        model = gltf.scene;
        const group = new THREE.Group();

        // 调整模型坐标系
        model.rotation.x = Math.PI / 2;

        // 缩放比例
        model.scale.set(0.8, 0.8, 0.8);

        group.add(model);
   

        // 添加四个面
        const faceSize = 2.32, shift = 2.12, shiftY = 0.96; // 面的大小，可以根据实际需求调整
        faces = [
            createNumberedFace('a', faceSize, faceSize),
            createNumberedFace('b', faceSize, faceSize),
            createNumberedFace('c', faceSize, faceSize),
            createNumberedFace('d', faceSize, faceSize)
        ];

        // 位置和朝向设置
        faces[0].position.set(-shift, -shiftY, 0); 
        faces[0].rotation.set(Math.PI / 4, -Math.PI / 2, 0); 
        faces[1].position.set(0, -shiftY, shift); 
        faces[1].rotation.set(0, 0, -Math.PI / 4);
        faces[2].position.set(shift, -shiftY, 0);
        faces[2].rotation.set(-Math.PI / 4, Math.PI / 2, 0);
        faces[3].position.set(0, -shiftY, -shift); 
        faces[3].rotation.set(0, Math.PI, -Math.PI / 4);

        // 添加所有面到 group
        faces.forEach(face => group.add(face));

        scene.add(group);

        model = group; // 将 group 作为可旋转的模型

            // 创建动画
        const times = [0, 2, 4]; // 时间点
        const values = [0, -0.3, 0]; // 对应的 y 轴位置

        const positionKF = new THREE.VectorKeyframeTrack('.position[y]', times, values);

        const clip = new THREE.AnimationClip('moveUpDown', -1, [positionKF]);

        const mixer = new THREE.AnimationMixer(group);
        const action = mixer.clipAction(clip);
        action.play();

        // 在渲染循环中更新动画
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            mixer.update(delta);
            renderer.render(scene, camera);
        }
        animate();

        //console.log("GLB model with numbered faces added to the scene");
    }, undefined, (error) => {
        console.error('Error loading GLB model:', error);
    });

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('click', onMouseClick, false);
    listenForExternalDestroyLevelSelectBox();
}

function convertToRoman(number) {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    if (number < minLevel || number > maxLevel) return '……';
    return roman[number - 1];
}


        // 创建罗马数字面
function createNumberedFace(number, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // 调整画布大小
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // 绘制背景
    context.fillStyle = 'rgba(255, 255, 255, 1.0)'; // 半透明白色背景
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制罗马数字
    context.font = 'bold 80px Arial';
    context.fillStyle = 'black'; // 字体颜色
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(convertToRoman(number), canvas.width / 2, canvas.height / 2);

    // 创建材质和网格
    const texture = new THREE.CanvasTexture(canvas);
    // 将texture旋转45度
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 4;
    const material = new THREE.MeshBasicMaterial(
        { map: texture, transparent: true , side: THREE.DoubleSide, color: 0x808080});
    
    const geometry = new THREE.PlaneGeometry(width, height);
    const surface = new THREE.Mesh(geometry, material);
    return surface;
}

function changeNumberedFace(number, face) {
    if (!face) return;
    const canvas = document.createElement('canvas');
    canvas.width = 256; // 调整画布大小
    canvas.height = 256;
    const context = canvas.getContext('2d');

    // 绘制背景
    context.fillStyle = 'rgba(255, 255, 255, 1.0)'; // 半透明白色背景
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制罗马数字
    context.font = 'bold 80px Arial';
    context.fillStyle = 'black'; // 字体颜色
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(convertToRoman(number), canvas.width / 2, canvas.height / 2);

    // 创建材质和网格
    const texture = new THREE.CanvasTexture(canvas);
    // 将texture旋转45度
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 4;
    const material = new THREE.MeshBasicMaterial(
        { map: texture, transparent: true , side: THREE.DoubleSide, color: 0x808080});
    
    face.material = material;
}


function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
    if (isDragging && model) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
        };
        targetRotationY += deltaMove.x * 0.01; // Adjust rotation sensitivity
        previousMousePosition = { x: event.clientX, y: event.clientY };
    }
}

function onMouseUp() {
    snapToClosestFace();
    isDragging = false;
}

function snapToClosestFace() {
    targetRotationY = Math.round(targetRotationY / snapAngle) * snapAngle;
}

function onMouseClick(event) {
    if (isDragging || isAnimating || !model) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model, true);
    if (intersects.length > 0) {
        // 遍历相交的物体，看是否有faces中的元素
        for (let i = 0; i < intersects.length; i++) {
            if (faces.includes(intersects[i].object)) {
                levelReady(faceIndex);
                break;
            }
        }
        //const faceIndex = Math.floor(Math.random() * 6); // Placeholder for GLB faces
        //navigateToPage(faceIndex);
    }
}

function levelReady(level) {
    //console.log('Level ' + level + ' is ready!');
    const event = new CustomEvent("levelReadyEvent", { detail: { level: level } });
    window.dispatchEvent(event);
}

function listenForExternalDestroyLevelSelectBox() {
    window.addEventListener("destroyLevelSelectBox", (event) => {
        //console.log("Received signal to destroy LevelSelectBox");
        isAbort = true;
    });
  }

function animate() {
    if (isAbort) {
        return;
    }
    requestAnimationFrame(animate);
    if (model) {
        const deltaTime = clock.getDelta();
        model.rotation.y = THREE.MathUtils.damp(model.rotation.y, targetRotationY, 2, deltaTime);
        if (Math.abs(targetRotationY - model.rotation.y) < 0.001) {
            model.rotation.y = targetRotationY; // Snap to target rotation
        }

        if (Math.abs(targetRotationY - model.rotation.y) > 0.01) {
            isAnimating = true;
        } else {
            isAnimating = false;
        }
        
        faceIndex = - Math.round(model.rotation.y / (Math.PI / 2)) + 1;
        if (faceIndex < minLevel ) {
            targetRotationY = 0;
        }
        if (faceIndex > maxLevel) {
            targetRotationY = -(maxLevel - 1) * Math.PI / 2;
        }
        //console.log(faceIndex);
        //console.log(faces);
        let currentIndex = (faceIndex + 3) % 4;
        changeNumberedFace(faceIndex, faces[currentIndex]);
        changeNumberedFace(faceIndex + 1, faces[(currentIndex + 1) % 4]);
        changeNumberedFace(faceIndex + 2, faces[(currentIndex + 2) % 4]);
        changeNumberedFace(faceIndex - 1, faces[(currentIndex + 3) % 4]);

    }
    renderer.render(scene, camera);
}

