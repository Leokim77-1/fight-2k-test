// ParallaxCamera.js

export default class ParallaxCamera {
  constructor(config) {
    this.player = config.player;       // The player object to follow
    this.worldWidth = config.worldWidth; // World width
    this.worldHeight = config.worldHeight; // World height
    this.panMargin = config.panMargin || 300;  // Pan margin to allow some movement at edges
    this.deadzoneWidth = config.deadzoneWidth || 400; // Deadzone width for horizontal movement
    this.deadzoneHeight = config.deadzoneHeight || 200; // Deadzone height for vertical movement
    this.cameraEase = config.cameraEase || 0.1;  // Smoothing factor for camera movement
    this.cameraBounce = config.cameraBounce || 0.05; // Bounce effect when hitting edges
    
    // Camera position and velocity
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraVelocityX = 0;
    this.cameraVelocityY = 0;
  }

  // Clamp function to restrict values within a given range
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // Update the camera's position based on player's position
  updateCamera() {
    const dzLeft = this.cameraX + (canvas.width / 2) - (this.deadzoneWidth / 2);
    const dzRight = this.cameraX + (canvas.width / 2) + (this.deadzoneWidth / 2);
    const dzTop = this.cameraY + (canvas.height / 2) - (this.deadzoneHeight / 2);
    const dzBottom = this.cameraY + (canvas.height / 2) + (this.deadzoneHeight / 2);

    let targetCameraX = this.cameraX;
    let targetCameraY = this.cameraY;

    // Move camera if player leaves deadzone horizontally
    if (this.player.x < dzLeft) {
      targetCameraX -= dzLeft - this.player.x;
    } else if (this.player.x + this.player.width > dzRight) {
      targetCameraX += (this.player.x + this.player.width) - dzRight;
    }

    // Move camera if player leaves deadzone vertically
    if (this.player.y < dzTop) {
      targetCameraY -= dzTop - this.player.y;
    } else if (this.player.y + this.player.height > dzBottom) {
      targetCameraY += (this.player.y + this.player.height) - dzBottom;
    }

    // Apply soft bounce at edges
    if (targetCameraX <= -this.panMargin) {
      targetCameraX = -this.panMargin + this.cameraBounce;
    } else if (targetCameraX >= this.worldWidth - canvas.width + this.panMargin) {
      targetCameraX = this.worldWidth - canvas.width + this.panMargin - this.cameraBounce;
    }

    targetCameraX = this.clamp(targetCameraX, -this.panMargin, this.worldWidth - canvas.width + this.panMargin);

    // Soft bounce on the vertical edges
    if (targetCameraY <= -this.panMargin) {
      targetCameraY = -this.panMargin + this.cameraBounce;
    } else if (targetCameraY >= this.worldHeight - canvas.height + this.panMargin) {
      targetCameraY = this.worldHeight - canvas.height + this.panMargin - this.cameraBounce;
    }

    targetCameraY = this.clamp(targetCameraY, -this.panMargin, this.worldHeight - canvas.height + this.panMargin);

    // Smooth camera movement
    this.cameraX += (targetCameraX - this.cameraX) * this.cameraEase;
    this.cameraY += (targetCameraY - this.cameraY) * this.cameraEase;

    // Camera velocity for smoother movement
    this.cameraVelocityX = (targetCameraX - this.cameraX) * this.cameraEase;
    this.cameraVelocityY = (targetCameraY - this.cameraY) * this.cameraEase;
  }

  // Call this in your game loop to update the camera
  getCameraPosition() {
    return {
      x: this.cameraX,
      y: this.cameraY
    };
  }
}
