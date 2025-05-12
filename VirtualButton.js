 class VirtualButton {
  constructor(config) {
    // Default configuration
    const defaults = {
      element: document.body,
      position: 'right', // 'left'|'right'|'top'|'bottom'|'custom'
      x: 0,              // Only used when position: 'custom'
      y: 0,              // Only used when position: 'custom'
      size: 80,
      color: 'rgba(255, 0, 0, 0.3)',
      activeColor: 'rgba(255, 0, 0, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '50%',
      onPress: () => {},
      onRelease: () => {},
      alwaysVisible: true,
      visible: true
    };

    // Merge config with defaults
    this.config = { ...defaults, ...config };

    // State
    this.isPressed = false;
    this.touchId = null;

    // Initialize
    this.init();
  }

  init() {
    this.createButton();
    this.setupEvents();
    this.setPosition();
  }

  createButton() {
    this.button = document.createElement('div');
    this.button.style.position = 'absolute';
    this.button.style.width = `${this.config.size}px`;
    this.button.style.height = `${this.config.size}px`;
    this.button.style.backgroundColor = this.config.color;
    this.button.style.border = `2px solid ${this.config.borderColor}`;
    this.button.style.borderRadius = this.config.borderRadius;
    this.button.style.touchAction = 'none';
    this.button.style.zIndex = '1000';
    this.button.style.display = this.config.visible ? 'block' : 'none';
    this.button.style.transition = 'background-color 0.1s';

    const container = typeof this.config.element === 'string' 
      ? document.querySelector(this.config.element)
      : this.config.element;
    container.appendChild(this.button);
  }

  setPosition() {
    const margin = 30;
    const size = this.config.size;

    switch(this.config.position) {
      case 'left':
        this.button.style.left = `${margin}px`;
        this.button.style.bottom = `${margin}px`;
        break;
      case 'right':
        this.button.style.right = `${margin}px`;
        this.button.style.bottom = `${margin}px`;
        break;
      case 'top':
        this.button.style.top = `${margin}px`;
        this.button.style.left = '50%';
        this.button.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        this.button.style.bottom = `${margin}px`;
        this.button.style.left = '50%';
        this.button.style.transform = 'translateX(-50%)';
        break;
      case 'custom':
        this.button.style.left = `${this.config.x}px`;
        this.button.style.bottom = `${this.config.y}px`;
        break;
    }
  }

  setupEvents() {
    this.button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handlePress(e);
    });

    document.addEventListener('touchend', (e) => {
      if (this.isPressed && 
          (e.changedTouches[0].identifier === this.touchId || !this.touchId)) {
        this.handleRelease(e);
      }
    });

    // Mouse support for desktop testing
    this.button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handlePress(e);
    });

    document.addEventListener('mouseup', (e) => {
      if (this.isPressed) {
        this.handleRelease(e);
      }
    });
  }

  handlePress(e) {
    this.isPressed = true;
    this.touchId = e.touches ? e.touches[0].identifier : null;
    this.button.style.backgroundColor = this.config.activeColor;
    this.config.onPress();
  }

  handleRelease(e) {
    this.isPressed = false;
    this.touchId = null;
    this.button.style.backgroundColor = this.config.color;
    this.config.onRelease();
  }

  // Public API
  setVisible(visible) {
    this.button.style.display = visible ? 'block' : 'none';
  }

  setPosition(x, y) {
    this.button.style.left = `${x}px`;
    this.button.style.bottom = `${y}px`;
  }

  destroy() {
    this.button.remove();
  }
}

  export default VirtualButton;