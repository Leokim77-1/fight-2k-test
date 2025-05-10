import AnalogStick from './AnalogStick.js';





const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 844;
canvas.height = 320;

const player = {
    x: 50,
    y: 150,
    width: 120,
    height: 120,
    color: 'red',

    velX: 0,
    velY: 0,
    gravity: 0.5,    // tweakable
    friction: 0.8,   // optional horizontal damping
    speed: 3,
    grounded: false
};


const ground = {
    x: 0,
    y: 270,
    width: 844,
    height: 50,
    color: 'lightgreen',
}

const background = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    color: 'lightblue',
}


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
  

    


const img =  new Image();
img.src = "./assets/sprite.png";



 function draw() {
ctx.clearRect(0, 0, canvas.width, canvas.height);


ctx.fillStyle = background.color;
ctx.fillRect(background.x, background.y, background.width, background.height);



        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);     
        
 
      
   



        
        ctx.fillStyle = ground.color;
        ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
       
if (img.complete){
    ctx.drawImage(img, player.x, player.y, player.width, player.height);   
}





}


  

img.onload = function() {
  console.log("image loaded");
  draw();
}





function gameLoop(){
    // Gravity always pulls down
    player.velY += player.gravity;

    // Apply friction to horizontal velocity (optional but smooth)
    player.velX *= player.friction;

    // Update position
    player.x += player.velX;
    player.y += player.velY;

    // Ground collision detection
    const groundLevel = ground.y - player.height;  // top of ground

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


 gameLoop();
