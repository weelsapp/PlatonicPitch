/**
 * Logo Tilt Effect
 * Makes the hero logo tilt slightly to face the mouse cursor
 */

class LogoTilt {
  constructor(options = {}) {
    // Default options
    this.options = Object.assign({
      element: '.hero-logo',       // Element to apply the tilt effect to
      maxTilt: 15,                 // Maximum tilt angle in degrees
      perspective: 1000,           // CSS perspective value
      easing: 0.15,                // Easing factor for smooth movement (0-1) - 3x faster
      scale: 1.05,                 // Subtle scale effect on hover
      resetOnLeave: true,          // Reset tilt when mouse leaves window
      gyroscope: false             // Enable gyroscope on mobile (not implemented yet)
    }, options);

    // Element to apply tilt to
    this.element = document.querySelector(this.options.element);
    if (!this.element) {
      console.warn(`LogoTilt: Element "${this.options.element}" not found`);
      return;
    }

    // State
    this.tiltX = 0;                // Current X tilt angle
    this.tiltY = 0;                // Current Y tilt angle
    this.targetTiltX = 0;          // Target X tilt angle
    this.targetTiltY = 0;          // Target Y tilt angle
    this.isActive = false;         // Is the animation active
    this.requestId = null;         // Animation frame request ID
    
    // Element dimensions and position
    this.rect = this.element.getBoundingClientRect();
    this.centerX = this.rect.left + this.rect.width / 2;
    this.centerY = this.rect.top + this.rect.height / 2;
    
    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.update = this.update.bind(this);
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the tilt effect
   */
  init() {
    // Add perspective to parent container for 3D effect
    const parent = this.element.parentElement;
    if (parent) {
      parent.style.perspective = `${this.options.perspective}px`;
      parent.style.transformStyle = 'preserve-3d';
      parent.style.overflow = 'visible'; // Ensure the 3D effect isn't clipped
    }
    
    // Add transition for smooth movement
    this.element.style.transition = 'transform 0.1s ease-out';
    this.element.style.transformStyle = 'preserve-3d';
    this.element.style.willChange = 'transform'; // Hint for browser optimization
    
    // Add event listeners
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('resize', this.handleResize);
    
    // Start animation
    this.start();
  }
  
  /**
   * Handle mouse movement
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    // Calculate mouse position relative to element center
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Calculate tilt based on mouse position
    // Invert the values so the element tilts toward the mouse
    this.targetTiltY = ((mouseX - this.centerX) / (window.innerWidth / 2)) * this.options.maxTilt;
    this.targetTiltX = ((this.centerY - mouseY) / (window.innerHeight / 2)) * this.options.maxTilt;
  }
  
  /**
   * Handle mouse leaving the window
   */
  handleMouseLeave() {
    if (this.options.resetOnLeave) {
      this.targetTiltX = 0;
      this.targetTiltY = 0;
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Update element dimensions and position
    this.rect = this.element.getBoundingClientRect();
    this.centerX = this.rect.left + this.rect.width / 2;
    this.centerY = this.rect.top + this.rect.height / 2;
  }
  
  /**
   * Start the animation
   */
  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.update();
    }
  }
  
  /**
   * Stop the animation
   */
  stop() {
    if (this.isActive) {
      this.isActive = false;
      cancelAnimationFrame(this.requestId);
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('resize', this.handleResize);
    
    // Reset element style
    this.element.style.transform = '';
    this.element.style.transition = '';
    this.element.style.willChange = '';
    
    // Reset parent style
    const parent = this.element.parentElement;
    if (parent) {
      parent.style.perspective = '';
      parent.style.transformStyle = '';
      parent.style.overflow = '';
    }
  }
  
  /**
   * Update the tilt effect
   */
  update() {
    if (!this.isActive) return;
    
    // Apply easing to create smooth movement
    this.tiltX += (this.targetTiltX - this.tiltX) * this.options.easing;
    this.tiltY += (this.targetTiltY - this.tiltY) * this.options.easing;
    
    // Apply transform to element
    this.element.style.transform = `
      rotateX(${this.tiltX}deg) 
      rotateY(${this.tiltY}deg)
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;
    
    // Continue animation loop
    this.requestId = requestAnimationFrame(this.update);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Logo tilt effect initializing...');
  
  // Create logo tilt effect with default options
  window.logoTilt = new LogoTilt({
    maxTilt: 10,       // Subtle tilt (10 degrees max)
    perspective: 1200, // Deeper perspective
    easing: 0.24,      // 3x faster tracking (original: 0.08)
    scale: 1.03        // Very subtle scale effect
  });
  
  console.log('Logo tilt effect initialized successfully');
});
