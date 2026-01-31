// ================= SCENE =================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 100);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 5, -10);

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ================= LIGHT =================
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, -5);
light.castShadow = true;
scene.add(light);

// ================= PLAYER =================
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0xffaa00 })
);
player.position.y = 1;
player.castShadow = true;
scene.add(player);

// ================= VARIABLES =================
let speed = 0.35;
let lane = 1;
const lanes = [-2, 0, 2];
let isJumping = false;
let velocityY = 0;
let score = 0;

// ================= AUDIO =================
const runSound = new Audio("audio/run.mp3");
runSound.loop = true;
runSound.volume = 0.4;
runSound.play();

const coinSound = new Audio("audio/coin.mp3");
const gameOverSound = new Audio("audio/gameover.mp3");

// ================= CONTROLS =================
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a") lane = Math.max(0, lane - 1);
  if (e.key === "ArrowRight" || e.key === "d") lane = Math.min(2, lane + 1);

  if ((e.key === "ArrowUp" || e.key === "w") && !isJumping) {
    isJumping = true;
    velocityY = 0.6;
  }

  if (e.key === "ArrowDown" || e.key === "s") {
    player.scale.y = 0.5;
    setTimeout(() => player.scale.y = 1, 500);
  }
});

// ================= ROAD =================
const roads = [];
function createRoad(z) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1, 20),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  road.position.set(0, -0.5, z);
  road.receiveShadow = true;
  scene.add(road);
  roads.push(road);
}
for (let i = 0; i < 6; i++) createRoad(i * 20);

// ================= OBSTACLES & COINS =================
const obstacles = [];
const coins = [];

function spawnObstacle(z) {
  const obs = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  obs.position.set(lanes[Math.floor(Math.random() * 3)], 1, z);
  scene.add(obs);
  obstacles.push(obs);
}

function spawnCoin(z) {
  const coin = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.15, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  coin.position.set(lanes[Math.floor(Math.random() * 3)], 1.5, z);
  scene.add(coin);
  coins.push(coin);
}

for (let i = 30; i < 200; i += 20) {
  spawnObstacle(i);
  spawnCoin(i + 10);
}

// ================= GAME LOOP =================
function animate() {
  requestAnimationFrame(animate);

  player.position.z += speed;
  camera.position.z = player.position.z - 10;

  player.position.x += (lanes[lane] - player.position.x) * 0.2;

  if (isJumping) {
    player.position.y += velocityY;
    velocityY -= 0.03;
    if (player.position.y <= 1) {
      player.position.y = 1;
      isJumping = false;
    }
  }

  roads.forEach(r => {
    if (r.position.z + 20 < player.position.z) {
      r.position.z += 120;
    }
  });

  obstacles.forEach(o => {
    if (o.position.distanceTo(player.position) < 1.2) {
      runSound.pause();
      gameOverSound.play();
      alert("GAME OVER\nScore: " + score);
      location.reload();
    }
  });

  coins.forEach((c, i) => {
    c.rotation.y += 0.1;
    if (c.position.distanceTo(player.position) < 1) {
      coinSound.play();
      scene.remove(c);
      coins.splice(i, 1);
      score += 10;
      console.log("Score:", score);
    }
  });

  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
