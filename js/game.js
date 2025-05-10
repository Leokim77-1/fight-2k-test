import AnalogStick from './AnalogStick.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 844;
canvas.height = 320;

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
    width: 844,
    height: 50,
    color: 'lightgreen',
};

const background = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    color: 'lightblue',
};

// Initialize AnalogStick with onMove control
const stick = new AnalogStick({
    player: player,
    speed: player.speed,
    element: '#gameContainer',   // ⚠️ attach to container div, NOT canvas
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

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = background.color;
    ctx.fillRect(background.x, background.y, background.width, background.height);

    // Draw player (sprite or fallback box)
    if (img.complete) {
        ctx.drawImage(img, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw ground
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

// Game loop with physics
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

    draw();
    requestAnimationFrame(gameLoop);
}

// Start when sprite is loaded
img.onload = function() {
    console.log("Image loaded");
    draw();
    gameLoop();
}
