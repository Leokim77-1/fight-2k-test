/**
 * Universal Pause Manager
 * Usage:
 * import { PauseManager } from './pause-manager.js';
 * const pause = new PauseManager({ onPause, onResume });
 */
export class PauseManager {
  constructor(config = {}) {
    // Configuration
    this.config = {
      pauseKeys: ['p', ' '],  // Spacebar or 'p' by default
      pauseButtonId: null,     // Optional HTML button ID
      onPause: () => {},
      onResume: () => {},
      ...config
    };

    // State
    this.isPaused = false;
    this.lastTime = 0;
    this.deltaTime = 0;

    // Initialize
    this.setupControls();
  }

  /* Core Methods */
  setupControls() {
    // Keyboard control
    document.addEventListener('keydown', (e) => {
      if (this.config.pauseKeys.includes(e.key.toLowerCase())) {
        this.toggle();
        e.preventDefault();
      }
    });

    // Button control (if specified)
    if (this.config.pauseButtonId) {
      const btn = document.getElementById(this.config.pauseButtonId);
      if (btn) btn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.isPaused ? this.resume() : this.pause();
  }

  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.config.onPause();
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTime = performance.now(); // Reset timing
    this.config.onResume();
  }

  /* Time Management */
  updateDeltaTime() {
    const now = performance.now();
    this.deltaTime = this.isPaused ? 0 : (now - this.lastTime) / 1000;
    this.lastTime = now;
    return this.deltaTime;
  }

  /* Utility Methods */
  getState() {
    return this.isPaused;
  }

  setCustomKeys(keys) {
    this.config.pauseKeys = keys;
  }
}