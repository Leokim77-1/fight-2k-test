/**
 * Virtual Analog Stick Library
 * Usage: 
 * const stick = new AnalogStick({
 *   element: '#gameContainer',
 *   onMove: (direction) => { player.x += direction.x * speed; }
 * });
 */

 class AnalogStick {
  constructor(config) {
    // Default configuration
    const defaults = {
      element: document.body,
      size: 100,
      baseColor: 'rgba(0, 0, 0, 0.2)',
      stickColor: 'rgba(0, 0, 0, 0.5)',
      deadzone: 0.2,
      onMove: () => {},
      onEnd: () => {}
    };

    // Merge config with defaults
    this.config = { ...defaults, ...config };

    // State
    this.isActive = false;
    this.touchId = null;
    this.direction = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };

    // Initialize
    this.init();
  }

  init() {
    // Create DOM elements
    this.createElements();
    
    // Setup event listeners
    this.setupEvents();
  }

  createElements() {
    // Container element
    const container = typeof this.config.element === 'string' 
      ? document.querySelector(this.config.element)
      : this.config.element;

    // Create base element
    this.base = document.createElement('div');
    this.base.style.position = 'absolute';
    this.base.style.width = `${this.config.size}px`;
    this.base.style.height = `${this.config.size}px`;
    this.base.style.borderRadius = '50%';
    this.base.style.backgroundColor = this.config.baseColor;
    this.base.style.left = `${window.innerWidth * 0.2 - this.config.size/2}px`;
    this.base.style.bottom = `${window.innerHeight * 0.2}px`;
    this.base.style.touchAction = 'none';
    this.base.style.zIndex = '1000';
    this.base.style.display = 'none';

    // Create stick element
    this.stick = document.createElement('div');
    this.stick.style.position = 'absolute';
    this.stick.style.width = `${this.config.size/2}px`;
    this.stick.style.height = `${this.config.size/2}px`;
    this.stick.style.borderRadius = '50%';
    this.stick.style.backgroundColor = this.config.stickColor;
    this.stick.style.left = '50%';
    this.stick.style.top = '50%';
    this.stick.style.transform = 'translate(-50%, -50%)';
    this.stick.style.touchAction = 'none';

    // Append elements
    this.base.appendChild(this.stick);
    container.appendChild(this.base);

    // Store base position
    this.updateBasePosition();
  }

  updateBasePosition() {
    const rect = this.base.getBoundingClientRect();
    this.position = {
      x: rect.left + rect.width/2,
      y: rect.top + rect.height/2
    };
  }

  setupEvents() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.updateBasePosition();
    });

    // Touch start
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    
    // Touch move
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    
    // Touch end
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    if (this.isActive) return;
    
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const dist = Math.hypot(
        touch.clientX - this.position.x,
        touch.clientY - this.position.y
      );
      
      if (dist <= this.config.size/2) {
        this.isActive = true;
        this.touchId = touch.identifier;
        this.base.style.display = 'block';
        this.updateStickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
        break;
      }
    }
  }

  handleTouchMove(e) {
    if (!this.isActive) return;
    
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (touch.identifier === this.touchId) {
        this.updateStickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
        break;
      }
    }
  }

  handleTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchId) {
        this.resetStick();
        this.config.onEnd();
        e.preventDefault();
        break;
      }
    }
  }

  updateStickPosition(touchX, touchY) {
    let deltaX = touchX - this.position.x;
    let deltaY = touchY - this.position.y;
    
    const distance = Math.hypot(deltaX, deltaY);
    const maxDistance = this.config.size/2;
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    // Update stick visual position
    this.stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    
    // Calculate normalized direction
    this.direction = {
      x: deltaX / maxDistance,
      y: deltaY / maxDistance
    };
    
    // Apply deadzone
    if (Math.abs(this.direction.x) < this.config.deadzone) this.direction.x = 0;
    if (Math.abs(this.direction.y) < this.config.deadzone) this.direction.y = 0;
    
    // Call move callback
    this.config.onMove(this.direction);
  }

  resetStick() {
    this.isActive = false;
    this.touchId = null;
    this.direction = { x: 0, y: 0 };
    this.stick.style.transform = 'translate(-50%, -50%)';
   
  }

  // Public API methods
  enable() {
    this.base.style.display = 'block';
  }

  disable() {
    this.resetStick();
    this.base.style.display = 'block';
  }

  setPosition(x, y) {
    this.base.style.left = `${x - this.config.size/2}px`;
    this.base.style.bottom = `${y - this.config.size/2}px`;
    this.updateBasePosition();
  }

  getDirection() {
    return this.direction;
  }

  destroy() {
    this.base.remove();
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  }
}

  export default AnalogStick;