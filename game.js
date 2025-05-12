import AnalogStick from './AnalogStick.js';
import VirtualButton from './VirtualButton.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// World dimensions
const worldWidth = 1000;
const worldHeight = 1000;

// Pan margin space
const panMargin = 100;

// Player
const player = {
  x: 50,
  y: 0,
  width: 200,
  height: 250,
  color: 'blue',
  speed: 5,
  isJumping: false,
  gravity: 0.8,
  yVelocity: 0,
  jumpPower: 17,
  flippedX: false,
  facing: "right",
  health: 300,
  isDead: false,
  healthbar: {x: 100, y: 100, width: 500, height: 70}
};

// Enemy
const enemy = {
  x: 500,
  y: 0,
  width: 200,
  height: 250,
  color: 'blue',
  speed: 5,
  isJumping: false,
  gravity: 0.8,
  yVelocity: 0,
  jumpPower: 15,
  flippedX: false,
  facing: "right",
  health: 100,
  isDead: false,
};

const healthFrame = {
  x: 100,
  y: 30,
  width: 300,
  height: 30,
  color: 'black',
};

// Gradients for health bars
const gradient = ctx.createLinearGradient(20, 30, 360, 200);
gradient.addColorStop(0.3, 'red');
gradient.addColorStop(0.5, 'pink');
gradient.addColorStop(1, 'blue');
gradient.addColorStop(0.7, 'lightblue');

const gradientB = ctx.createLinearGradient(20, 30, 500, 600);
gradientB.addColorStop(0.3, 'red');
gradientB.addColorStop(0.5, 'blue');
gradientB.addColorStop(0.7, 'pink');
gradientB.addColorStop(1, 'lightblue');

// === COUNTDOWN SYSTEM ===
let countdown = 99;

const countdownSettings = {
  fontSize: 100,
  fontFamily: 'Impact',
  gradientColors: ['red', 'orange', 'yellow'],
  strokeColor: 'white',
  strokeWidth: 4,
  shadowColor: 'rgba(0,0,0,0.7)',
  shadowBlur: 10,
  shadowOffsetX: 3,
  shadowOffsetY: 0
};

setInterval(() => {
  if (countdown > 0) {
    countdown--;
  }
}, 1000);

// === Camera
let cameraX = 0;
let cameraY = 0;
let cameraVelocityX = 0;
let cameraVelocityY = 0;

const deadzoneWidth = 50;
const deadzoneHeight = 150;
const cameraEase = 0.1;
const cameraBounce = 0.05;

// Assets
const img = new Image();
img.src = "./sprite.png";
const bg = new Image();
bg.src = "./bg.png";
const gd = new Image();
gd.src = "./gd.png";
const en = new Image();
en.src = "./sprite.png";
const pro = new Image();
pro.src = "./pro.png";
const pro2 = new Image();
pro2.src = "./pro2.png";

const back1 = { x: -50, y: 0, width: 0, height: 0 };
const ground = { x: -150, y: 0, width: worldWidth + 250, height: 170 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  back1.width = canvas.width + 150;
  back1.height = canvas.height + 50;

  ground.y = canvas.height - 100;
  player.y = ground.y - player.height + 240;
  enemy.y = ground.y - enemy.height + 240;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Analog stick
let moveDir = { x: 0, y: 0 };
const stick = new AnalogStick({
  element: '#main',
  baseColor: 'rgba(0, 0, 0, 0.47)',
    stickColor: 'rgba(0, 0, 0, 0.86)',
  onMove: (dir) => {
    moveDir = dir;

    if (dir.x <= -0.2 && player.facing !== 'left') {
      player.flippedX = true;
      player.facing = 'left';
    }

    if (dir.x >= 0.2 && player.facing !== 'right') {
      player.flippedX = false;
      player.facing = 'right';
    }

    if (dir.y <= 0.07 && !player.isJumping) {
      player.isJumping = true;
      player.yVelocity = -player.jumpPower;
    }
  },
  onEnd: () => {
    moveDir = { x: 0, y: 0 };
  }
});
stick.enable();
stick.setPosition(120, canvas.height - 300);



//attack button
const attackBtn = new VirtualButton({
  position: 'absolute',
  color: 'rgba(255,100,0,0.7)',
    size: 90,
  onPress: () => {
  }
});
attackBtn.setVisible(true)  // Hide button  
attackBtn.setPosition(window.innerWidth - 120, window.innerHeight - 300);


const attackBtn2 = new VirtualButton({
  position: 'absolute',
  color: 'rgba(145, 255, 0, 0.7)',
  size: 70,
  onPress: () => {

  }
});
attackBtn2.setVisible(true)  // Hide button  
attackBtn2.setPosition(window.innerWidth - 230, window.innerHeight - 350);



const attackBtn3 = new VirtualButton({
  position: 'absolute',
  color: 'rgba(4, 0, 255, 0.7)',
  size: 60,
  onPress: () => {}
});
attackBtn3.setVisible(true)  // Hide button  
attackBtn3.setPosition(window.innerWidth - 130, window.innerHeight - 400);




function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function updatePlayer() {
  player.x += moveDir.x * player.speed;
  player.x = clamp(player.x, 0, worldWidth - player.width);

  if (player.isJumping) {
    player.yVelocity += player.gravity;
    player.y += player.yVelocity;

    const groundLevel = ground.y - player.height + 240;
    if (player.y >= groundLevel) {
      player.y = groundLevel;
      player.isJumping = false;
      player.yVelocity = 0;
    }
  }

  player.y = clamp(player.y, 0, worldHeight - player.height);
}

function updateEnemy() {
  if (player.x < enemy.x && enemy.facing !== 'left') {
    enemy.flippedX = true;
    enemy.facing = 'left';
  }
  if (player.x > enemy.x && enemy.facing !== 'right') {
    enemy.flippedX = false;
    enemy.facing = 'right';
  }
}

function updateCamera() {
  const dzLeft = cameraX + (canvas.width / 2) - (deadzoneWidth / 2);
  const dzRight = cameraX + (canvas.width / 2) + (deadzoneWidth / 2);
  const dzTop = cameraY + (canvas.height / 2) - (deadzoneHeight / 2);
  const dzBottom = cameraY + (canvas.height / 2) + (deadzoneHeight / 2);

  let targetCameraX = cameraX;
  let targetCameraY = cameraY;

  if (player.x < dzLeft + 50) {
    targetCameraX -= dzLeft - player.x;
  } else if (player.x + player.width > dzRight - 50) {
    targetCameraX += (player.x + player.width) - dzRight;
  }

  if (player.y < dzTop) {
    targetCameraY -= dzTop - player.y;
  } else if (player.y + player.height > dzBottom) {
    targetCameraY += (player.y + player.height) - dzBottom;
  }

  if (targetCameraX <= -panMargin) {
    targetCameraX = -panMargin + cameraBounce;
  } else if (targetCameraX >= worldWidth - canvas.width + panMargin) {
    targetCameraX = worldWidth - canvas.width + panMargin - cameraBounce;
  }

  targetCameraX = clamp(targetCameraX, -panMargin, worldWidth - canvas.width + panMargin);

  if (targetCameraY <= -panMargin) {
    targetCameraY = -panMargin + cameraBounce;
  } else if (targetCameraY >= worldHeight - canvas.height + panMargin) {
    targetCameraY = worldHeight - canvas.height + panMargin - cameraBounce;
  }

  const minCameraX = -panMargin;
  const maxCameraX = worldWidth - canvas.width + panMargin;
  const minCameraY = -panMargin;
  const maxCameraY = worldHeight - canvas.height + panMargin;

  targetCameraX = clamp(targetCameraX, minCameraX, maxCameraX);
  targetCameraY = clamp(targetCameraY, minCameraY, maxCameraY);

  cameraX += (targetCameraX - cameraX) * cameraEase;
  cameraY += (targetCameraY - cameraY) * cameraEase;
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCountdown() {
  const text = countdown.toString().padStart(2, '0');

  ctx.save();
  ctx.font = `${countdownSettings.fontSize}px ${countdownSettings.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top: 70px';

  const grad = ctx.createLinearGradient(0, 0, 0, countdownSettings.fontSize);
  const colors = countdownSettings.gradientColors;
  const step = 1 / (colors.length - 1);
  colors.forEach((color, i) => {
    grad.addColorStop(i * step, color);
  });

  ctx.shadowColor = countdownSettings.shadowColor;
  ctx.shadowBlur = countdownSettings.shadowBlur;
  ctx.shadowOffsetX = countdownSettings.shadowOffsetX;
  ctx.shadowOffsetY = countdownSettings.shadowOffsetY;

  ctx.fillStyle = grad;
  ctx.fillText(text, canvas.width / 2, 100);

  ctx.lineWidth = countdownSettings.strokeWidth;
  ctx.strokeStyle = countdownSettings.strokeColor;
  ctx.strokeText(text, canvas.width / 2, 100);

  ctx.restore();
}

function drawWorld() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bgOffsetX = cameraX * 0.5;
  const bgOffsetY = cameraY * 0.3;
  const groundOffsetX = cameraX;
  const groundOffsetY = cameraY - 170;

  if (bg.complete) {
    ctx.drawImage(bg, back1.x - bgOffsetX, back1.y - bgOffsetY, back1.width, back1.height);
  } else {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(back1.x - bgOffsetX, back1.y - bgOffsetY, back1.width, back1.height);
  }

  if (gd.complete) {
    ctx.drawImage(gd, ground.x - groundOffsetX, ground.y - groundOffsetY, ground.width, ground.height);
  } else {
    ctx.fillStyle = 'green';
    ctx.fillRect(ground.x - groundOffsetX, ground.y - groundOffsetY, ground.width, ground.height);
  }

  const enemyScreenX = enemy.x - cameraX;
  const enemyScreenY = enemy.y - cameraY;

  if (en.complete) {
    if (enemy.flippedX) {
      ctx.save();
      ctx.translate(enemyScreenX + enemy.width, enemyScreenY);
      ctx.scale(-1, 1);
      ctx.drawImage(en, 0, 0, enemy.width, enemy.height);
      ctx.restore();
    } else {
      ctx.drawImage(en, enemyScreenX, enemyScreenY, enemy.width, enemy.height);
    }
  }

  const playerScreenX = player.x - cameraX;
  const playerScreenY = player.y - cameraY;

  ctx.save();
  if (player.flippedX) {
    ctx.translate(playerScreenX + player.width, playerScreenY);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, player.width, player.height);
  } else {
    ctx.drawImage(img, playerScreenX, playerScreenY, player.width, player.height);
  }
  ctx.restore();

  ctx.restore();


   
  drawUI();
   ctx.drawImage(pro,healthFrame.x - 80, healthFrame.y+ healthFrame.height - 50, 90, 90);
   ctx.drawImage(pro2,healthFrame.x * 8 + 24, healthFrame.y+ healthFrame.height - 50, 90, 90);

}


function drawUI() {
  // === Healthbars + portraits ===
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  drawRoundedRect(healthFrame.x - 20, healthFrame.y, healthFrame.width, healthFrame.height, 15);
  ctx.fillStyle = healthFrame.color;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  let radC = 15;
  if (player.health <= 296) {
    radC = 0;
  }

  drawRoundedRect(healthFrame.x - 20, healthFrame.y + 2, player.health, healthFrame.height - 4, radC);
  ctx.fillStyle = gradient;
  ctx.fill();

  drawRoundedRect(healthFrame.x - 75, healthFrame.y + 10 - 20, 80, 80, 40);
  ctx.fillStyle = healthFrame.color;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.stroke();



  drawRoundedRect(healthFrame.x - 20, healthFrame.y+ healthFrame.height, 150, 18, 0);
  ctx.fillStyle = gradient;
  ctx.fill();


  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.stroke();



  drawRoundedRect(healthFrame.x - 75, healthFrame.y + 10 - 20, 80, 80, 40);
  ctx.fillStyle = healthFrame.color;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.stroke();




  drawRoundedRect(healthFrame.x + healthFrame.width + healthFrame.width / 2, healthFrame.y, healthFrame.width, healthFrame.height, 15);
  ctx.fillStyle = healthFrame.color;
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'white';
  ctx.stroke();

  drawRoundedRect(healthFrame.x + healthFrame.width + healthFrame.width / 2, healthFrame.y + 2, player.health, healthFrame.height - 4, radC);
  ctx.fillStyle = gradientB;
  ctx.fill();

  
  drawRoundedRect(healthFrame.x * 7 + 5, healthFrame.y+ healthFrame.height, 150, 18, 0);
  ctx.fillStyle = gradientB;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.stroke();

  drawRoundedRect(healthFrame.x + healthFrame.width + healthFrame.width + 130, healthFrame.y - 10, 80, 80, 40);
  ctx.fillStyle = healthFrame.color;
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'white';
  ctx.stroke();

  // === Draw countdown ===
  drawCountdown();
}

function gameLoop() {
  updatePlayer();
  updateEnemy();
  updateCamera();
  drawWorld();
  requestAnimationFrame(gameLoop);
}

gameLoop();
