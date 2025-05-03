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
      easing: 0.1,              // Easing factor for smooth movement (0-1) - 2x faster
      noiseIntensity: 0.02,     // Subtle noise for texture (0-1)
      
      // Hexagon grid options
      hexEnabled: true,         // Enable hexagon grid
      hexSize: 30,              // Size of hexagons (distance from center to corner)
      hexColor: '#1A2A4A',      // Color of hexagon outlines
      hexLineWidth: 1,          // Width of hexagon lines
      hexOpacity: 0.5,          // Maximum opacity of hexagons
      hexFadeRadius: 200,       // Radius of the fade effect around the mouse
      hexGlow: 2                // Glow effect size (0 for no glow)
    }, options);
    
    // Hexagon grid
    this.hexGrid = [];

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
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '-1'; // Place behind content
    this.canvas.style.pointerEvents = 'none'; // Allow interactions with elements below
    
    // Add canvas to DOM
    document.body.prepend(this.canvas);
    
    // Set canvas size
    this.handleResize();
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('scroll', this.handleResize); // Update canvas on scroll
    
    // Start animation
    this.start();
  }
  
  // Track last resize time for throttling
  lastResizeTime = 0;
  lastWidth = 0;
  lastHeight = 0;
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Throttle resize events to once per 500ms
    const now = Date.now();
    if (now - this.lastResizeTime < 500) {
      return;
    }
    this.lastResizeTime = now;
    
    // Get document height (to cover all content, not just viewport)
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    // Set canvas dimensions to match document size
    this.width = window.innerWidth;
    this.height = docHeight;
    
    // Update canvas size
    this.canvas.style.height = `${docHeight}px`;
    
    // Set canvas resolution (considering device pixel ratio for retina displays)
    // Limit DPR to 2 for better performance on high-DPI displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    // Only regenerate hexagon grid when size changes significantly
    const widthChanged = Math.abs(this.width - this.lastWidth) > 100;
    const heightChanged = Math.abs(this.height - this.lastHeight) > 100;
    
    if ((widthChanged || heightChanged) && this.options.hexEnabled) {
      this.lastWidth = this.width;
      this.lastHeight = this.height;
      this.generateHexGrid();
    }
    
    // Force a render update
    this.needsUpdate = true;
  }
  
  /**
   * Generate hexagon grid
   */
  generateHexGrid() {
    // Clear existing grid
    this.hexGrid = [];
    
    const size = this.options.hexSize;
    const width = this.width;
    const height = this.height;
    
    // Calculate hexagon dimensions
    const hexWidth = size * Math.sqrt(3);
    const hexHeight = size * 2;
    
    // Calculate grid dimensions with increased spacing (reduced density)
    // Increase spacing by 50% to reduce the number of hexagons
    const spacing = 1.5; // Spacing multiplier
    const rows = Math.ceil(height / (size * 1.5 * spacing)) + 1;
    const cols = Math.ceil(width / (hexWidth * spacing)) + 1;
    
    // Generate grid with offset for every other column (90-degree rotated grid)
    // Use a step value to reduce density
    for (let col = -1; col < cols; col++) {
      for (let row = -1; row < rows; row++) {
        // Calculate center position of hexagon with increased spacing
        const x = col * hexWidth * spacing + (row % 2 === 0 ? 0 : hexWidth / 2);
        const y = row * size * 1.5 * spacing;
        
        // Add hexagon to grid
        this.hexGrid.push({ x, y, size });
      }
    }
    
    console.log(`Generated hexagon grid with ${this.hexGrid.length} hexagons`);
  }
  
  /**
   * Draw a hexagon
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} size - Size of hexagon (distance from center to corner)
   * @param {number} opacity - Opacity of hexagon (0-1)
   */
  drawHexagon(x, y, size, opacity = 1) {
    const ctx = this.ctx;
    
    // Set line style directly without saving context (more efficient)
    ctx.strokeStyle = this.options.hexColor;
    ctx.lineWidth = this.options.hexLineWidth;
    ctx.globalAlpha = opacity;
    
    // Begin path
    ctx.beginPath();
    
    // Use pre-calculated points for better performance
    // Draw hexagon with 90 degree rotation
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + Math.PI / 2; // Add 90 degree rotation
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    
    // Close path
    ctx.closePath();
    
    // Stroke hexagon
    ctx.stroke();
    
    // Reset alpha to avoid affecting other drawing operations
    ctx.globalAlpha = 1;
  }
  
  /**
   * Handle mouse movement
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    // Get mouse position relative to the document (including scroll)
    this.mouse.targetX = e.clientX;
    this.mouse.targetY = e.clientY + window.scrollY;
  }
  
  /**
   * Handle mouse leaving the window
   */
  handleMouseLeave() {
    // Reset to center of current viewport when mouse leaves
    this.mouse.targetX = this.width / 2;
    this.mouse.targetY = window.scrollY + window.innerHeight / 2;
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
    window.removeEventListener('scroll', this.handleResize);
    this.canvas.remove();
  }
  
  /**
   * Generate improved noise
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Noise value (0-1)
   */
  noise(x, y) {
    // Multi-frequency noise for more detailed texture
    // Higher frequencies for finer detail
    const noise1 = (Math.sin(x * 0.03) + Math.sin(y * 0.03)) * 0.4;
    const noise2 = (Math.sin(x * 0.06 + 0.3) + Math.sin(y * 0.06 + 0.1)) * 0.3;
    const noise3 = (Math.sin(x * 0.12 + 0.7) + Math.sin(y * 0.12 + 0.5)) * 0.2;
    const noise4 = (Math.sin(x * 0.24 + 1.1) + Math.sin(y * 0.24 + 0.9)) * 0.1;
    
    // Combine different frequencies for more natural look
    return (noise1 + noise2 + noise3 + noise4) * 0.5 + 0.5;
  }
  
  // Performance optimization: Track if mouse has moved significantly
  lastMouseX = 0;
  lastMouseY = 0;
  needsUpdate = true;
  frameCount = 0;
  
  /**
   * Render the background
   */
  render() {
    if (!this.isRunning) return;
    
    // Apply easing to mouse movement for smooth transitions
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * this.options.easing;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * this.options.easing;
    
    // Performance optimization: Only redraw when necessary
    const mouseMoved = Math.abs(this.mouse.x - this.lastMouseX) > 1 || 
                       Math.abs(this.mouse.y - this.lastMouseY) > 1;
    
    // Force update every 30 frames even if mouse hasn't moved (for any animations)
    this.frameCount++;
    if (this.frameCount >= 30) {
      this.needsUpdate = true;
      this.frameCount = 0;
    }
    
    // Skip rendering if no update needed
    if (!mouseMoved && !this.needsUpdate) {
      this.animationFrame = requestAnimationFrame(this.render);
      return;
    }
    
    // Update last mouse position
    this.lastMouseX = this.mouse.x;
    this.lastMouseY = this.mouse.y;
    this.needsUpdate = false;
    
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
    
    // Draw hexagon grid if enabled
    if (this.options.hexEnabled && this.hexGrid.length > 0) {
      // Reset composite operation for hexagons
      this.ctx.globalCompositeOperation = 'source-over';
      
      // Draw each hexagon with opacity based on distance from mouse
      const fadeRadius = this.options.hexFadeRadius;
      const maxOpacity = this.options.hexOpacity;
      
      // Only draw hexagons within a certain distance from the mouse for performance
      // Using 1.5x the fade radius to ensure smooth edges
      const visibilityRadius = fadeRadius * 1.5;
      
      // Performance optimization: Calculate squared distances to avoid square root operations
      const visibilityRadiusSq = visibilityRadius * visibilityRadius;
      const fadeRadiusSq = fadeRadius * fadeRadius;
      
      // Get viewport bounds for culling
      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + window.innerHeight;
      const viewportBuffer = 200; // Buffer to ensure smooth transitions
      
      for (const hex of this.hexGrid) {
        // Skip hexagons outside the viewport (with buffer)
        if (hex.y < viewportTop - viewportBuffer || hex.y > viewportBottom + viewportBuffer) {
          continue;
        }
        
        // Calculate squared distance from mouse (more efficient than using Math.sqrt)
        const dx = hex.x - this.mouse.x;
        const dy = hex.y - this.mouse.y;
        const distanceSq = dx * dx + dy * dy;
        
        // Skip hexagons too far from mouse
        if (distanceSq > visibilityRadiusSq) continue;
        
        // Calculate opacity based on distance
        let opacity = 0;
        if (distanceSq < fadeRadiusSq) {
          // Calculate actual distance only when needed
          const distance = Math.sqrt(distanceSq);
          // Exponential fade (cube) for stronger falloff
          opacity = maxOpacity * Math.pow(1 - distance / fadeRadius, 3);
          
          // Draw hexagon with calculated opacity
          this.drawHexagon(hex.x, hex.y, hex.size, opacity);
        }
      }
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
  
  // Detect if running on a mobile device or low-performance browser
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowPerformance = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  
  // Create background with custom options
  window.canvasBackground = new CanvasBackground({
    // Gradient background options
    highlightOpacity: 0.15,    // Very subtle highlight
    highlightSize: 0.33,       // Reduced by a third (was 0.5)
    easing: 0.3,               // 2x faster mouse following as requested
    noiseIntensity: 0,         // Noise effect disabled
    
    // Hexagon grid options
    hexEnabled: true,          // Enable hexagon grid
    hexSize: isLowPerformance ? 30 : 20, // Larger hexagons on mobile/low-performance devices
    hexColor: '#2A4A6A',       // Brighter color for better visibility
    hexLineWidth: 1,           // Thinner lines for better performance
    hexOpacity: 0.09,          // Increased from 0.07 to 0.09
    hexFadeRadius: isLowPerformance ? 300 : 500, // Smaller radius on mobile/low-performance devices
    hexGlow: 0                 // Disable glow effect for better performance
  });
  
  console.log('Canvas background initialized successfully');
});
