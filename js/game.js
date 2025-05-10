import AnalogStick from './AnalogStick.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 844;
canvas.height = 320;

// World size (wider + taller for jump room)
const world = {
    width: 2000,
    height: canvas.height + 200
};

// Player object with physics + jump lock
const player = {
    x: 50,
    y: 150,
    width: 120,
    height: 120,
    color: 'red',

    velX: 0,
    velY: 0,
    gravity: 0.3,
    friction: 0.8,
    speed: 3,
    grounded: false,
    jumpStrength: 10,
    jumpLocked: false  // Prevents jump spamming
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

// Camera follows player X + Y with smooth easing
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    followSpeed: 0.1,

    follow(player) {
        const targetX = player.x + player.width / 2 - this.width / 2;
        const targetY = player.y + player.height / 2 - this.height / 2;

        // Smooth follow
        this.x += (targetX - this.x) * this.followSpeed;
        this.y += (targetY - this.y) * this.followSpeed;

        // Clamp within world
        this.x = Math.max(0, Math.min(this.x, world.width - this.width));
        this.y = Math.max(0, Math.min(this.y, world.height - this.height));
    }
};

// Initialize AnalogStick with movement + jump via stick UP
const stick = new AnalogStick({
    player: player,
    speed: player.speed,
    element: '#gameContainer',
    alwaysVisible: true,
    onMove: (dir) => {
        // Move left/right
        player.velX = dir.x * player.speed;

        // Jump if pushing UP and grounded and not jumpLocked
        if (dir.y < -0.5 && player.grounded && !player.jumpLocked) {
            player.velY = -player.jumpStrength;
            player.grounded = false;
            player.jumpLocked = true;
        }

        // Unlock jump when stick released from up
        if (dir.y >= -0.5) {
            player.jumpLocked = false;
        }
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

    // Parallax background
    ctx.fillStyle = background.color;
    ctx.fillRect(-camera.x * 0.3, -camera.y * 0.1, background.width * 2, background.height * 2);

    // Draw ground
    ctx.fillStyle = ground.color;
    ctx.fillRect(ground.x - camera.x, ground.y - camera.y, ground.width, ground.height);

    // Draw player (sprite or fallback box)
    if (img.complete) {
        ctx.drawImage(img, player.x - camera.x, player.y - camera.y, player.width, player.height);
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
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

    // Camera follows player (X and Y)
    camera.follow(player);

    draw();
    requestAnimationFrame(gameLoop);
}

// Start when sprite is loaded
img.onload = function () {
    console.log("Image loaded");
    draw();
    gameLoop();
}
