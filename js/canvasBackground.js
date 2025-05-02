/**
 * Canvas Background Effect
 * A professional implementation of a mouse-reactive background using HTML5 Canvas
 */

class CanvasBackground {
  constructor(options = {}) {
    // Default options
    this.options = Object.assign({
      color1: '#0C192D',        // Base background color
      color2: '#0A1525',        // Secondary background color
      highlightColor: '#3C4D70', // Highlight color for mouse interaction
      highlightOpacity: 0.15,   // Opacity of the highlight
      highlightSize: 0.5,       // Size of the highlight (0-1)
      easing: 0.05,             // Easing factor for smooth movement (0-1)
      noiseIntensity: 0.02      // Subtle noise for texture (0-1)
    }, options);

    // Canvas setup
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Mouse position
    this.mouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2
    };
    
    // Animation state
    this.animationFrame = null;
    this.isRunning = false;
    
    // Bind methods
    this.handleResize = this.handleResize.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.render = this.render.bind(this);
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the canvas background
   */
  init() {
    // Set up canvas
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none'; // Allow interactions with elements below
    
    // Add canvas to DOM
    document.body.prepend(this.canvas);
    
    // Set canvas size
    this.handleResize();
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Start animation
    this.start();
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Set canvas dimensions to match window size
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Set canvas resolution (considering device pixel ratio for retina displays)
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }
  
  /**
   * Handle mouse movement
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    this.mouse.targetX = e.clientX;
    this.mouse.targetY = e.clientY;
  }
  
  /**
   * Handle mouse leaving the window
   */
  handleMouseLeave() {
    // Reset to center when mouse leaves
    this.mouse.targetX = this.width / 2;
    this.mouse.targetY = this.height / 2;
  }
  
  /**
   * Start the animation
   */
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.render();
    }
  }
  
  /**
   * Stop the animation
   */
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.remove();
  }
  
  /**
   * Generate subtle noise
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Noise value (0-1)
   */
  noise(x, y) {
    // Simple noise function for subtle texture
    return (Math.sin(x * 0.01) + Math.sin(y * 0.01)) * 0.5 + 0.5;
  }
  
  /**
   * Render the background
   */
  render() {
    if (!this.isRunning) return;
    
    // Apply easing to mouse movement for smooth transitions
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * this.options.easing;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * this.options.easing;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw base gradient background
    const baseGradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    baseGradient.addColorStop(0, this.options.color1);
    baseGradient.addColorStop(1, this.options.color2);
    this.ctx.fillStyle = baseGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw mouse-reactive gradient
    const gradientSize = Math.max(this.width, this.height) * this.options.highlightSize;
    const radialGradient = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, gradientSize
    );
    
    // Create highlight gradient with subtle noise
    radialGradient.addColorStop(0, `rgba(60, 77, 112, ${this.options.highlightOpacity})`);
    radialGradient.addColorStop(0.5, `rgba(60, 77, 112, ${this.options.highlightOpacity / 2})`);
    radialGradient.addColorStop(1, 'rgba(60, 77, 112, 0)');
    
    // Apply gradient
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = radialGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Add subtle noise texture
    if (this.options.noiseIntensity > 0) {
      this.ctx.globalCompositeOperation = 'overlay';
      this.ctx.globalAlpha = this.options.noiseIntensity;
      
      // Only calculate noise for a subsection of the screen for performance
      const noiseScale = 100; // Lower = better performance, higher = more detailed noise
      for (let x = 0; x < this.width; x += noiseScale) {
        for (let y = 0; y < this.height; y += noiseScale) {
          const noiseValue = this.noise(x + this.mouse.x * 0.05, y + this.mouse.y * 0.05);
          this.ctx.fillStyle = `rgba(255, 255, 255, ${noiseValue * 0.05})`;
          this.ctx.fillRect(x, y, noiseScale, noiseScale);
        }
      }
      
      this.ctx.globalAlpha = 1;
    }
    
    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(this.render);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Canvas background initializing...');
  
  // Create background with default options
  window.canvasBackground = new CanvasBackground({
    highlightOpacity: 0.15, // Very subtle highlight
    highlightSize: 0.5,     // Medium size highlight
    easing: 0.08,           // Smooth movement
    noiseIntensity: 0.01    // Very subtle noise
  });
  
  console.log('Canvas background initialized successfully');
});
