// SCENE
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 80);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 5, -10);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// LIGHTS (REALISTIC)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, -5);
dirLight.castShadow = true;
scene.add(dirLight);

// GROUND
const groundGeo = new THREE.BoxGeometry(6, 1, 100);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x444444
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.z = 40;
ground.receiveShadow = true;
scene.add(ground);

// PLAYER
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00
});
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 1;
player.castShadow = true;
scene.add(player);

// VARIABLES
let speed = 0.3;

// ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);

    // Player auto run
    player.position.z += speed;

    // Camera follow
    camera.position.z = player.position.z - 10;

    renderer.render(scene, camera);
}

animate();

// RESPONSIVE
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
