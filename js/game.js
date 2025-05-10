import AnalogStick from './AnalogStick.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 844;
canvas.height = 320;

// World size (bigger than canvas)
const world = {
    width: 2000,
    height: canvas.height
};

// Player object with physics
const player = {
    x: 50,
    y: 150,
    width: 120,
    height: 120,
    color: 'red',

    velX: 0,
    velY: 0,
    gravity: 0.5,
    friction: 0.8,
    speed: 3,
    grounded: false
};

const ground = {
    x: 0,
    y: 270,
    width: world.width,
    height: 50,
    color: 'lightgreen',
};

const background = {
    x: 0,
    y: 0,
    width: world.width,
    height: canvas.height,
    color: 'lightblue',
};

// Camera to follow player
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    follow(player, margin = 200) {
        const centerX = player.x + player.width/2;
        const targetX = centerX - this.width / 2;

        // Clamp camera within world bounds
        this.x = Math.max(0, Math.min(targetX, world.width - this.width));
    }
};

// Initialize AnalogStick with onMove control (ALWAYS FIXED POSITION)
const stick = new AnalogStick({
    player: player,
    speed: player.speed,
    element: '#gameContainer',
    alwaysVisible: true,
    onMove: (dir) => {
        player.velX = dir.x * player.speed;
    },
    onEnd: () => {
        player.velX = 0;
    }
});
stick.enable();

// Load sprite
const img = new Image();
img.src = "./assets/sprite.png";

// Draw everything with camera offset
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parallax background (moves slower than player)
    ctx.fillStyle = background.color;
    ctx.fillRect(-camera.x * 0.3, background.y, background.width * 2, background.height);

    // Draw ground
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x - camera.x, ground.y, ground.width, ground.height);

    // Draw player (sprite or fallback box)
    if (img.complete) {
        ctx.drawImage(img, player.x - camera.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);
    }
}

// Game loop with physics + camera follow
function gameLoop() {
    // Apply gravity
    player.velY += player.gravity;

    // Apply friction to horizontal velocity
    player.velX *= player.friction;

    // Update player position
    player.x += player.velX;
    player.y += player.velY;

    // Ground collision
    const groundLevel = ground.y - player.height;

    if (player.y >= groundLevel) {
        player.y = groundLevel;
        player.velY = 0;
        player.grounded = true;
    } else {
        player.grounded = false;
    }

    // Camera follows player
    camera.follow(player);

    draw();
    requestAnimationFrame(gameLoop);
}

// Start when sprite is loaded
img.onload = function() {
    console.log("Image loaded");
    draw();
    gameLoop();
}
