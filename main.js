// ================= SCENE =================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 30, 200);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 6, -14);

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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
  new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0x332200
  })
);
player.position.set(0, 1, 0);
player.castShadow = true;
scene.add(player);

// ================= GAME VARS =================
const lanes = [-2, 0, 2];
let laneIndex = 1;
let speed = 0.35;
let isJumping = false;
let velocityY = 0;
let score = 0;
let isGameOver = false;

// ================= AUDIO =================
const runSound = new Audio("audio/run.mp3");
runSound.loop = true;
runSound.volume = 0.4;

const coinSound = new Audio("audio/coin.mp3");
const gameOverSound = new Audio("audio/gameover.mp3");

// autoplay fix
document.addEventListener("click", () => {
  runSound.play();
}, { once: true });

// ================= CONTROLS =================
document.addEventListener("keydown", e => {
  if (isGameOver) return;

  if (e.key === "ArrowLeft" || e.key === "a")
    laneIndex = Math.max(0, laneIndex - 1);

  if (e.key === "ArrowRight" || e.key === "d")
    laneIndex = Math.min(2, laneIndex + 1);

  if ((e.key === "ArrowUp" || e.key === "w") && !isJumping) {
    isJumping = true;
    velocityY = 0.6;
  }

  if (e.key === "ArrowDown" || e.key === "s") {
    player.scale.y = 0.5;
    player.position.y = 0.5;
    setTimeout(() => {
      player.scale.y = 1;
      player.position.y = 1;
    }, 400);
  }
});

// ================= ROAD =================
const roads = [];

function createRoad(z) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1, 20),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  road.position.set(0, -1, z);
  road.receiveShadow = true;
  scene.add(road);
  roads.push(road);
}

for (let i = 0; i < 6; i++) createRoad(i * 20);

// ================= OBSTACLES & COINS =================
const obstacles = [];
const coins = [];

function spawnObstacle(z) {
  const o = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  o.position.set(lanes[Math.floor(Math.random() * 3)], 1, z);
  scene.add(o);
  obstacles.push(o);
}

function spawnCoin(z) {
  const c = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.15, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  c.position.set(lanes[Math.floor(Math.random() * 3)], 1.5, z);
  scene.add(c);
  coins.push(c);
}

for (let z = 30; z < 200; z += 20) {
  spawnObstacle(z);
  spawnCoin(z + 10);
}

// ================= GAME OVER =================
function gameOver() {
  if (isGameOver) return;
  isGameOver = true;

  speed = 0;
  runSound.pause();
  gameOverSound.play();

  document.getElementById("finalScore").innerText =
    "Your Score: " + score;

  document.getElementById("gameover").style.display = "flex";
}

window.restartGame = () => location.reload();

// ================= LOOP =================
function animate() {
  requestAnimationFrame(animate);

  if (!isGameOver) {
    player.position.z += speed;
    score += 1;
  }

  camera.position.z = player.position.z - 14;
  camera.lookAt(player.position.x, 2, player.position.z + 10);

  player.position.x += (lanes[laneIndex] - player.position.x) * 0.2;

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
      gameOver();
    }
  });

  coins.forEach((c, i) => {
    c.rotation.y += 0.1;
    if (c.position.distanceTo(player.position) < 1) {
      coinSound.play();
      scene.remove(c);
      coins.splice(i, 1);
      score += 50;
    }
  });

  document.getElementById("score").innerText = "Score: " + score;

  renderer.render(scene, camera);
}

animate();

// ================= RESIZE =================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
