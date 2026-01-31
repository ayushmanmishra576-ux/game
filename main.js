// ================= GAME CONFIGURATION =================
const CONFIG = {
    INITIAL_SPEED: 0.35,
    SPEED_INCREASE: 0.02,
    SPEED_INTERVAL: 1000,
    LEVEL_UP_SCORE: 500
};

// ================= SCENE SETUP =================
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000011, 30, 200);

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 8, -18);
camera.lookAt(0, 0, 10);

// ================= ENHANCED RENDERER =================
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// ================= ADVANCED LIGHTING =================
// Ambient light
scene.add(new THREE.AmbientLight(0x333366, 0.3));

// Main directional light (sun/moon)
const mainLight = new THREE.DirectionalLight(0xffffff, 1);
mainLight.position.set(10, 20, -10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 50;
mainLight.shadow.camera.left = -30;
mainLight.shadow.camera.right = 30;
mainLight.shadow.camera.top = 30;
mainLight.shadow.camera.bottom = -30;
scene.add(mainLight);

// Neon colored fill lights
const neonLight1 = new THREE.PointLight(0x00ffff, 0.5, 30);
neonLight1.position.set(5, 5, 0);
scene.add(neonLight1);

const neonLight2 = new THREE.PointLight(0xff00ff, 0.5, 30);
neonLight2.position.set(-5, 5, 0);
scene.add(neonLight2);

// ================= ENHANCED PLAYER =================
const playerGroup = new THREE.Group();

// Player body with better geometry
const playerGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
const playerMaterial = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff3300,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.7
});
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.castShadow = true;
player.receiveShadow = true;

// Player glow effect
const playerGlow = new THREE.PointLight(0xffaa00, 0.5, 3);
playerGlow.position.set(0, 0, 0);
player.add(playerGlow);

playerGroup.add(player);
playerGroup.position.set(0, 1.5, 0);
scene.add(playerGroup);

// ================= ADVANCED ROAD =================
const roads = [];
const roadSegments = 8;

function createRoadSegment(z) {
    const roadGroup = new THREE.Group();
    
    // Main road
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.5, 20),
        new THREE.MeshStandardMaterial({
            color: 0x222233,
            roughness: 0.8,
            metalness: 0.2
        })
    );
    road.position.set(0, -0.25, z);
    road.receiveShadow = true;
    roadGroup.add(road);
    
    // Road markings
    const laneMarkingGeometry = new THREE.PlaneGeometry(0.1, 20);
    const laneMarkingMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
    });
    
    for (let i = -1; i <= 1; i++) {
        const marking = new THREE.Mesh(laneMarkingGeometry, laneMarkingMaterial);
        marking.position.set(i * 2.5, 0.26, z);
        marking.rotation.x = Math.PI / 2;
        roadGroup.add(marking);
    }
    
    // Road edges with neon glow
    const edgeGeometry = new THREE.BoxGeometry(0.2, 0.6, 20);
    const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5
    });
    
    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.position.set(-4.1, 0.2, z);
    leftEdge.castShadow = true;
    roadGroup.add(leftEdge);
    
    const rightEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    rightEdge.position.set(4.1, 0.2, z);
    rightEdge.castShadow = true;
    roadGroup.add(rightEdge);
    
    scene.add(roadGroup);
    roads.push(roadGroup);
}

// Create initial road segments
for (let i = 0; i < roadSegments; i++) {
    createRoadSegment(i * 20);
}

// ================= OBSTACLES =================
const obstacles = [];
const obstacleTypes = [
    { color: 0xff0000, scale: 1, points: 100 },  // Red cube
    { color: 0xffff00, scale: 0.8, points: 200 }, // Yellow pyramid
    { color: 0x00ff00, scale: 1.2, points: 50 }   // Green sphere
];

function spawnObstacle(z) {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let geometry;
    
    switch (Math.floor(Math.random() * 3)) {
        case 0:
            geometry = new THREE.BoxGeometry(type.scale, type.scale * 2, type.scale);
            break;
        case 1:
            geometry = new THREE.ConeGeometry(type.scale, type.scale * 2, 8);
            break;
        case 2:
            geometry = new THREE.SphereGeometry(type.scale, 16, 16);
            break;
    }
    
    const material = new THREE.MeshStandardMaterial({
        color: type.color,
        emissive: type.color,
        emissiveIntensity: 0.3,
        roughness: 0.2,
        metalness: 0.8
    });
    
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(
        [-2, 0, 2][Math.floor(Math.random() * 3)],
        type.scale,
        z
    );
    obstacle.castShadow = true;
    obstacle.userData = { points: type.points, type: type.color };
    
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// ================= ENHANCED COINS =================
const coins = [];

function spawnCoin(z) {
    const coinGroup = new THREE.Group();
    
    // Coin body
    const coinGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 1
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI / 2;
    coin.castShadow = true;
    coinGroup.add(coin);
    
    // Coin glow
    const coinGlow = new THREE.PointLight(0xffd700, 0.8, 2);
    coinGlow.position.set(0, 0, 0);
    coin.add(coinGlow);
    
    coinGroup.position.set(
        [-2, 0, 2][Math.floor(Math.random() * 3)],
        1.5,
        z
    );
    
    scene.add(coinGroup);
    coins.push(coinGroup);
}

// ================= POWER-UPS =================
const powerUps = [];
const powerUpTypes = [
    { color: 0x00ffff, type: 'speed', duration: 5000 },    // Speed boost
    { color: 0x00ff00, type: 'shield', duration: 3000 },   // Shield
    { color: 0xff00ff, type: 'magnet', duration: 4000 }    // Coin magnet
];

function spawnPowerUp(z) {
    if (Math.random() < 0.3) { // 30% chance to spawn power-up
        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const geometry = new THREE.OctahedronGeometry(0.6);
        const material = new THREE.MeshStandardMaterial({
            color: powerUpType.color,
            emissive: powerUpType.color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        
        const powerUp = new THREE.Mesh(geometry, material);
        powerUp.position.set(
            [-2, 0, 2][Math.floor(Math.random() * 3)],
            1.5,
            z
        );
        powerUp.castShadow = true;
        powerUp.userData = powerUpType;
        
        scene.add(powerUp);
        powerUps.push(powerUp);
    }
}

// ================= INITIAL SPAWNING =================
for (let z = 30; z < 200; z += 15) {
    if (Math.random() < 0.7) spawnObstacle(z);
    if (Math.random() < 0.8) spawnCoin(z + 5);
    spawnPowerUp(z + 10);
}

// ================= PARTICLE SYSTEM =================
const particles = [];
const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const particleMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});

function createParticleExplosion(position, color, count = 20) {
    for (let i = 0; i < count; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        particle.material.color.set(color);
        particle.position.copy(position);
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            ),
            life: 1.0
        };
        scene.add(particle);
        particles.push(particle);
    }
}

// ================= BACKGROUND ELEMENTS =================
// Stars background
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1000;
const positions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = Math.random() * 30 + 5;
    positions[i + 2] = (Math.random() - 0.5) * 100;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// ================= AUDIO ENHANCEMENTS =================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {};

async function loadSound(url, name) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    return {
        play: (volume = 1, rate = 1) => {
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();
            source.buffer = audioBuffer;
            source.playbackRate.value = rate;
            gainNode.gain.value = volume;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);
        }
    };
}

// Load sounds
Promise.all([
    loadSound('audio/run.mp3', 'run'),
    loadSound('audio/coin.mp3', 'coin'),
    loadSound('audio/gameover.mp3', 'gameover')
]).then(([run, coin, gameover]) => {
    sounds.run = run;
    sounds.coin = coin;
    sounds.gameover = gameover;
    
    // Start background music/run sound
    setInterval(() => {
        if (!isGameOver) sounds.run.play(0.3, speed / CONFIG.INITIAL_SPEED);
    }, 500);
});

// ================= GAME VARIABLES =================
const lanes = [-2, 0, 2];
let laneIndex = 1;
let speed = CONFIG.INITIAL_SPEED;
let isJumping = false;
let velocityY = 0;
let score = 0;
let isGameOver = false;
let level = 1;
let lastSpeedIncrease = Date.now();
let activePowerUps = {};

// High score from localStorage
let highScore = localStorage.getItem('neonRunHighScore') || 0;

// ================= CONTROLS =================
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (isGameOver && e.key === ' ') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Touch controls for mobile
if ('ontouchstart' in window) {
    document.getElementById('mobile-controls').style.display = 'flex';
    
    const controlButtons = {
        'left-btn': () => laneIndex = Math.max(0, laneIndex - 1),
        'right-btn': () => laneIndex = Math.min(2, laneIndex + 1),
        'jump-btn': () => {
            if (!isJumping) {
                isJumping = true;
                velocityY = 0.6;
            }
        },
        'slide-btn': () => {
            player.scale.y = 0.5;
            player.position.y = 0.75;
            setTimeout(() => {
                player.scale.y = 1;
                player.position.y = 1.5;
            }, 400);
        }
    };
    
    Object.entries(controlButtons).forEach(([id, action]) => {
        document.getElementById(id).addEventListener('touchstart', (e) => {
            e.preventDefault();
            action();
        });
    });
}

// ================= GAME FUNCTIONS =================
function updateHUD() {
    document.getElementById('score').textContent = String(score).padStart(5, '0');
    document.getElementById('level').textContent = `Level ${level}`;
    document.getElementById('speed').textContent = `Speed: ${(speed / CONFIG.INITIAL_SPEED).toFixed(1)}x`;
}

function collectCoin(coin, index) {
    score += 100;
    createParticleExplosion(coin.position, 0xffd700, 10);
    if (sounds.coin) sounds.coin.play(0.5);
    scene.remove(coin);
    coins.splice(index, 1);
}

function collectPowerUp(powerUp, index) {
    const { type, duration, color } = powerUp.userData;
    activePowerUps[type] = Date.now() + duration;
    
    // Visual effect
    createParticleExplosion(powerUp.position, color, 15);
    
    // Apply power-up effect
    switch(type) {
        case 'speed':
            speed *= 1.5;
            setTimeout(() => speed /= 1.5, duration);
            break;
        case 'shield':
            player.material.color.set(0x00ff00);
            player.material.emissive.set(0x00ff00);
            setTimeout(() => {
                if (!isGameOver) {
                    player.material.color.set(0xffaa00);
                    player.material.emissive.set(0xff3300);
                }
            }, duration);
            break;
    }
    
    scene.remove(powerUp);
    powerUps.splice(index, 1);
}

function gameOver() {
    if (isGameOver) return;
    
    isGameOver = true;
    speed = 0;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neonRunHighScore', highScore);
    }
    
    // Game over effects
    createParticleExplosion(player.position, 0xff0000, 30);
    player.material.color.set(0xff0000);
    player.material.emissive.set(0xff0000);
    
    if (sounds.gameover) sounds.gameover.play(1.0);
    
    // Show game over screen
    document.getElementById('finalScore').textContent = `Score: ${score}`;
    document.getElementById('highScore').textContent = `High Score: ${highScore}`;
    document.getElementById('gameover').style.display = 'flex';
}

function restartGame() {
    location.reload();
}

// ================= ANIMATION LOOP =================
function animate() {
    requestAnimationFrame(animate);
    
    if (!isGameOver) {
        // Update player movement
        player.position.x += (lanes[laneIndex] - player.position.x) * 0.2;
        playerGroup.position.z += speed;
        score += Math.floor(speed * 10);
        
        // Handle jumping
        if (isJumping) {
            playerGroup.position.y += velocityY;
            velocityY -= 0.03;
            if (playerGroup.position.y <= 1.5) {
                playerGroup.position.y = 1.5;
                isJumping = false;
            }
        }
        
        // Update camera
        camera.position.z = playerGroup.position.z - 18;
        camera.lookAt(playerGroup.position.x, 2, playerGroup.position.z + 10);
        
        // Rotate player slightly while moving
        playerGroup.rotation.y = Math.sin(Date.now() * 0.01) * 0.1;
        
        // Increase speed over time
        if (Date.now() - lastSpeedIncrease > CONFIG.SPEED_INTERVAL) {
            speed += CONFIG.SPEED_INCREASE;
            lastSpeedIncrease = Date.now();
            
            // Level up
            if (score > level * CONFIG.LEVEL_UP_SCORE) {
                level++;
                createParticleExplosion(playerGroup.position, 0x00ffff, 20);
            }
        }
        
        // Update road segments
        roads.forEach(road => {
            if (road.position.z + 20 < playerGroup.position.z) {
                road.position.z += roadSegments * 20;
                
                // Spawn new obstacles and coins on recycled road
                const spawnZ = road.position.z + 100;
                if (Math.random() < 0.7) spawnObstacle(spawnZ);
                if (Math.random() < 0.8) spawnCoin(spawnZ + 5);
                spawnPowerUp(spawnZ + 10);
            }
        });
        
        // Update stars (background)
        stars.position.z = playerGroup.position.z;
        
        // Check collisions
        obstacles.forEach((obstacle, index) => {
            obstacle.rotation.y += 0.02;
            obstacle.rotation.x += 0.01;
            
            const distance = obstacle.position.distanceTo(playerGroup.position);
            if (distance < 1.2 && !activePowerUps.shield) {
                gameOver();
            }
            
            // Remove obstacles behind player
            if (obstacle.position.z + 10 < playerGroup.position.z) {
                scene.remove(obstacle);
                obstacles.splice(index, 1);
            }
        });
        
        // Update coins
        coins.forEach((coin, index) => {
            coin.rotation.y += 0.1;
            coin.rotation.x += 0.05;
            
            // Coin magnet power-up
            if (activePowerUps.magnet && coin.position.distanceTo(playerGroup.position) < 5) {
                coin.position.lerp(playerGroup.position, 0.1);
            }
            
            if (coin.position.distanceTo(playerGroup.position) < 1) {
                collectCoin(coin, index);
            }
        });
        
        // Update power-ups
        powerUps.forEach((powerUp, index) => {
            powerUp.rotation.y += 0.05;
            powerUp.rotation.x += 0.03;
            powerUp.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.3;
            
            if (powerUp.position.distanceTo(playerGroup.position) < 1) {
                collectPowerUp(powerUp, index);
            }
        });
        
        // Update particles
        particles.forEach((particle, index) => {
            particle.userData.life -= 0.02;
            particle.position.add(particle.userData.velocity);
            particle.material.opacity = particle.userData.life;
            
            if (particle.userData.life <= 0) {
                scene.remove(particle);
                particles.splice(index, 1);
            }
        });
        
        // Update active power-ups
        Object.keys(activePowerUps).forEach(powerUp => {
            if (Date.now() > activePowerUps[powerUp]) {
                delete activePowerUps[powerUp];
            }
        });
        
        // Handle continuous key presses
        if (keys['arrowleft'] || keys['a']) laneIndex = Math.max(0, laneIndex - 1);
        if (keys['arrowright'] || keys['d']) laneIndex = Math.min(2, laneIndex + 1);
        if ((keys['arrowup'] || keys['w']) && !isJumping) {
            isJumping = true;
            velocityY = 0.6;
        }
        if (keys['arrowdown'] || keys['s']) {
            player.scale.y = 0.5;
            player.position.y = 0.75;
            setTimeout(() => {
                if (!isGameOver) {
                    player.scale.y = 1;
                    player.position.y = 1.5;
                }
            }, 400);
        }
        
        updateHUD();
    }
    
    // Animate neon lights
    neonLight1.position.x = playerGroup.position.x + 5 + Math.sin(Date.now() * 0.001) * 2;
    neonLight2.position.x = playerGroup.position.x - 5 + Math.cos(Date.now() * 0.001) * 2;
    
    renderer.render(scene, camera);
}

// ================= INITIALIZATION =================
window.addEventListener('load', () => {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        // Start game
        animate();
    }, 1000);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Make restart function global
window.restartGame = restartGame;

// Export for GitHub
console.log('🎮 Neon Run - Enhanced 3D Endless Runner');
console.log('✨ Features:');
console.log('- Advanced lighting & shadows');
console.log('- Particle effects system');
console.log('- Multiple power-ups');
console.log('- Level progression');
console.log('- High score system');
console.log('- Mobile touch controls');
console.log('- Neon visual effects');
console.log('- Enhanced audio system');
