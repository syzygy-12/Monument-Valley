import { isDevMode } from "../params/IsDevMode.js";
import { fadeOut } from "./AudioUtils.js";

let scene, camera, renderer, model;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let isDragging = false;
let isAnimating = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationY = 0;
let isTouching = false;
let touchStartX = 0;
let faceIndex = 1;
let faces = [];
let minLevel = isDevMode ? -1 : 1; // 开始的最小等级
let maxLevel = 5;
let isAbort = false;
let animations = {};
let gameStarted = false;
const snapAngle = Math.PI / 2; 
const d = 5; // 正交相机范围
const aspect = window.innerWidth / window.innerHeight;
const clock = new THREE.Clock();

let audioFiles = [];
for (let i = 0; i <= 3; i++) {
    const audio = new Audio(`./assets/audio/harp${i}.wav`);
    audioFiles.push(audio);
}




const gameAudio = new Audio("./assets/audio/game.flac");
gameAudio.volume = 0.1;
gameAudio.loop = true;


init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(-50, 20, 0);
    camera.lookAt(new THREE.Vector3(0, 20, 0));


    scene.background = new THREE.Color(0x808080); 

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
        './assets/bg1.jpg', 
        () => {
          //console.log('Texture loaded successfully!');
        },
        undefined, // 加载进度回调（如果需要的话）
        (error) => {
          console.error('Error loading texture:', error);
        }
      );
      
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,   
        opacity: 0.8,        
        side: THREE.DoubleSide  
    });

    const planeGeometry = new THREE.PlaneGeometry(24,30);  

    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.y = -Math.PI / 2;
    plane.position.set(10, 10, 0);

    scene.add(plane);

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

    // orbit controls
    // const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // // 启用视角转动
    // controls.enableRotate = true;


    // 创建文字几何体
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('./assets/font3.json', function(font) {
        const textGeometry = new THREE.TextGeometry('纪念碑谷', {
            font: font,
            size: 1.2,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(0, 20, -3);
        text.rotation.y = -Math.PI / 2;
        scene.add(text);
        const textGeometry2 = new THREE.TextGeometry('Monument Valley', {
            font: font,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false
        });
        const text2 = new THREE.Mesh(textGeometry2, textMaterial);
        text2.position.set(0, 19, -3);
        text2.rotation.y = -Math.PI / 2;
        scene.add(text2);

    });

    // 创建材质
    const loader = new THREE.GLTFLoader();
    loader.load('./assets/level_select.glb', (gltf) => {
        model = gltf.scene;
        const group = new THREE.Group();

        // 调整模型坐标系
        model.rotation.x = Math.PI / 2;

        // 缩放比例
        model.scale.set(0.6, 0.6, 0.6);
        model.position.set(0, -0.25, 0);

        group.add(model);
   

        // 添加四个面
        const faceSize = 1.74, shift = 1.59, shiftY = 0.72; // 面的大小，可以根据实际需求调整
        faces = [
            createNumberedFace('a', faceSize, faceSize),
            createNumberedFace('b', faceSize, faceSize),
            createNumberedFace('c', faceSize, faceSize),
            createNumberedFace('d', faceSize, faceSize)
        ];

        // 位置和朝向设置
        faces[0].position.set(-shift, -shiftY-0.25, 0); 
        faces[0].rotation.set(Math.PI / 4, -Math.PI / 2, 0); 
        faces[1].position.set(0, -shiftY-0.25, shift); 
        faces[1].rotation.set(0, 0, -Math.PI / 4);
        faces[2].position.set(shift, -shiftY-0.25, 0);
        faces[2].rotation.set(-Math.PI / 4, Math.PI / 2, 0);
        faces[3].position.set(0, -shiftY-0.25, -shift); 
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
    document.addEventListener('touchstart', onTouchStart, { passive: true }); // 添加触摸事件
    document.addEventListener('touchmove', onTouchMove, { passive: true });   // 添加触摸事件
    document.addEventListener('touchend', onTouchEnd, { passive: true });     // 添加触摸事件
    document.addEventListener('click', onMouseClick, false);
    listenForExternalDestroyLevelSelectBox();
    waitForInput();
}

function waitForInput() {
    if (!gameStarted) {
        document.addEventListener("keydown", startGame);
        document.addEventListener("mousedown", startGame);
        document.addEventListener("touchstart", startGame, { passive: true });
    }
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.removeEventListener("keydown", startGame);
    document.removeEventListener("mousedown", startGame);
    document.removeEventListener("touchstart", startGame);
    gameAudio.play();
    // 改为使用tween的平滑过渡，摄像机始终面向前方
    // camera.position.set(-50, 0, 0);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    const tween = new TWEEN.Tween(camera.position)
        .to({ x: -50, y: 0, z: 0 }, 3000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            //camera.lookAt(new THREE.Vector3(0, 0, 0));
            //console.log(camera.position);
        })
        .start();
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

function onTouchStart(event) {
    if (event.touches.length === 1) {
        isTouching = true;
        touchStartX = event.touches[0].clientX;
    }
}

function onTouchMove(event) {
    if (isTouching && model && event.touches.length === 1) {
        const deltaMove = {
            x: event.touches[0].clientX - touchStartX,
        };
        targetRotationY += deltaMove.x * 0.005; // Adjust rotation sensitivity
        touchStartX = event.touches[0].clientX;
    }
}

function onTouchEnd() {
    snapToClosestFace();
    isTouching = false;
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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
        targetRotationY += deltaMove.x * 0.002; // Adjust rotation sensitivity
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
            if (intersects[i].object === faces[(faceIndex + 3) % 4]) {
                levelReady(faceIndex);
                break;
            }
        }
        //const faceIndex = Math.floor(Math.random() * 6); // Placeholder for GLB faces
        //navigateToPage(faceIndex);
    }
}

function levelReady(level) {
    const event = new CustomEvent("levelReadyEvent", { detail: { level: level } });
    window.dispatchEvent(event);
    fadeOut(gameAudio, 2);
}

function listenForExternalDestroyLevelSelectBox() {
    window.addEventListener("destroyLevelSelectBox", (event) => {
        isAbort = true;
    });
  }

function animate() {
    if (isAbort) {
        return;
    }
    requestAnimationFrame(animate);
    TWEEN.update();
    if (model) {
        const deltaTime = clock.getDelta();
        model.rotation.y = THREE.MathUtils.damp(model.rotation.y, targetRotationY, 5, deltaTime);
        if (Math.abs(targetRotationY - model.rotation.y) < 0.001) {
            model.rotation.y = targetRotationY; // Snap to target rotation
        }

        if (Math.abs(targetRotationY - model.rotation.y) > 0.3) {
            isAnimating = true;
        } else {
            isAnimating = false;
        }
        const pre_faceIndex = faceIndex;
        faceIndex = - Math.round(model.rotation.y / (Math.PI / 2)) + 1;
        if (pre_faceIndex !== faceIndex) {
            const note = audioFiles[faceIndex % 4];
            note.currentTime = 0;
            note.play();
        }
        if (faceIndex < minLevel ) {
            targetRotationY = 0;
        }
        if (faceIndex > maxLevel) {
            targetRotationY = -(maxLevel - 1) * Math.PI / 2;
        }
        let currentIndex = (faceIndex + 3) % 4;
        changeNumberedFace(faceIndex, faces[currentIndex]);
        changeNumberedFace(faceIndex + 1, faces[(currentIndex + 1) % 4]);
        changeNumberedFace(faceIndex + 2, faces[(currentIndex + 2) % 4]);
        changeNumberedFace(faceIndex - 1, faces[(currentIndex + 3) % 4]);

    }
    renderer.render(scene, camera);
}
