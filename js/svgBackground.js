/**
 * SVG Background with Mouse-Follow Effect
 * A lightweight implementation using SVG instead of Canvas
 */

class SvgBackground {
  constructor(options = {}) {
    // Default options
    this.options = Object.assign({
      svgUrl: 'assets/images/hexagon-pattern.svg',
      color1: '#0C192D',        // Base background color
      color2: '#0A1525',        // Secondary background color
      highlightColor: '#3C4D70', // Highlight color for mouse interaction
      highlightOpacity: 0.15,   // Opacity of the highlight
      highlightSize: 0.33,      // Size of the highlight (0-1)
      easing: 0.3,              // Easing factor for smooth movement
      hexOpacity: 0.09,         // Maximum opacity of hexagons
      hexFadeRadius: 500,       // Radius of the fade effect around the mouse
    }, options);
    
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
   * Initialize the SVG background
   */
  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'svg-background';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.zIndex = '-1';
    this.container.style.pointerEvents = 'none';
    this.container.style.overflow = 'hidden';
    
    // Create base gradient background
    this.baseGradient = document.createElement('div');
    this.baseGradient.className = 'svg-background-gradient';
    this.baseGradient.style.position = 'absolute';
    this.baseGradient.style.top = '0';
    this.baseGradient.style.left = '0';
    this.baseGradient.style.width = '100%';
    this.baseGradient.style.height = '100%';
    this.baseGradient.style.background = `linear-gradient(to bottom right, ${this.options.color1}, ${this.options.color2})`;
    
    // Create SVG container
    this.svgContainer = document.createElement('div');
    this.svgContainer.className = 'svg-background-pattern';
    this.svgContainer.style.position = 'absolute';
    this.svgContainer.style.top = '0';
    this.svgContainer.style.left = '0';
    this.svgContainer.style.width = '100%';
    this.svgContainer.style.height = '100%';
    this.svgContainer.style.opacity = '0'; // Start invisible
    
    // Create highlight gradient
    this.highlight = document.createElement('div');
    this.highlight.className = 'svg-background-highlight';
    this.highlight.style.position = 'absolute';
    this.highlight.style.top = '0';
    this.highlight.style.left = '0';
    this.highlight.style.width = '100%';
    this.highlight.style.height = '100%';
    this.highlight.style.background = 'radial-gradient(circle, rgba(60, 77, 112, 0.15) 0%, rgba(60, 77, 112, 0.075) 50%, rgba(60, 77, 112, 0) 100%)';
    this.highlight.style.opacity = '1';
    this.highlight.style.mixBlendMode = 'lighten';
    this.highlight.style.pointerEvents = 'none';
    this.highlight.style.transform = 'translate(-50%, -50%)';
    this.highlight.style.width = '100vw';
    this.highlight.style.height = '100vh';
    
    // Add elements to container
    this.container.appendChild(this.baseGradient);
    this.container.appendChild(this.svgContainer);
    this.container.appendChild(this.highlight);
    
    // Add container to DOM
    document.body.prepend(this.container);
    
    // Load SVG
    this.loadSvg();
    
    // Set initial size
    this.handleResize();
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('scroll', this.handleResize);
    
    // Start animation
    this.start();
  }
  
  /**
   * Load SVG pattern
   */
  loadSvg() {
    // Embed SVG directly to avoid CORS issues
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 1080">
        <defs>
          <pattern id="hexagon_pattern" x="0" y="0" width="44" height="76" patternTransform="translate(-2962.962 -3124.222) scale(.583)" patternUnits="userSpaceOnUse" viewBox="0 0 44 76">
            <rect width="44" height="76" style="fill:none;"/>
            <polygon points="22 63.298 22 88.702 44 101.403 66 88.702 66 63.298 44 50.597 22 63.298" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
            <polygon points="-22 63.298 -22 88.702 0 101.403 22 88.702 22 63.298 0 50.597 -22 63.298" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
            <polygon points="44 25.298 44 50.702 66 63.403 88 50.702 88 25.298 66 12.597 44 25.298" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
            <polygon points="0 25.298 0 50.702 22 63.403 44 50.702 44 25.298 22 12.597 0 25.298" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
            <polygon points="-44 25.298 -44 50.702 -22 63.403 0 50.702 0 25.298 -22 12.597 -44 25.298" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
            <polygon points="22 -12.702 22 12.702 44 25.403 66 12.702 66 -12.702 44 -25.403 22 -12.702" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
            <polygon points="-22 -12.702 -22 12.702 0 25.403 22 12.702 22 -12.702 0 -25.403 -22 -12.702" style="fill:none; stroke:#4A6A8A; stroke-miterlimit:10; stroke-width:2;"/>
          </pattern>
        </defs>
        <rect y="0" width="1920" height="1080" style="fill:url(#hexagon_pattern);"/>
      </svg>
    `;
    
    // Insert SVG content
    this.svgContainer.innerHTML = svgContent;
    
    // Get the SVG element
    this.svg = this.svgContainer.querySelector('svg');
    
    // Set SVG to fill container
    if (this.svg) {
      this.svg.style.width = '100%';
      this.svg.style.height = '100%';
      this.svg.style.display = 'block';
      
      // Fade in SVG
      setTimeout(() => {
        this.svgContainer.style.transition = 'opacity 0.5s ease';
        this.svgContainer.style.opacity = '1';
      }, 100);
    }
  }
  
  // Track last resize time for throttling
  lastResizeTime = 0;
  
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
    
    // Get document height
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    // Update container height
    this.container.style.height = `${docHeight}px`;
    this.baseGradient.style.height = `${docHeight}px`;
    this.svgContainer.style.height = `${docHeight}px`;
    
    // Force a render update
    this.needsUpdate = true;
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
    this.mouse.targetX = window.innerWidth / 2;
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
    this.container.remove();
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
    
    // Force update every 30 frames even if mouse hasn't moved
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
    
    // Update highlight position
    this.highlight.style.left = `${this.mouse.x}px`;
    this.highlight.style.top = `${this.mouse.y}px`;
    
    // Calculate highlight size based on window dimensions
    const gradientSize = Math.max(window.innerWidth, window.innerHeight) * this.options.highlightSize;
    this.highlight.style.width = `${gradientSize * 2}px`;
    this.highlight.style.height = `${gradientSize * 2}px`;
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(this.render);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('SVG background initializing...');
  
  // Detect if running on a mobile device or low-performance browser
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowPerformance = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  
  // Create background with custom options
  window.svgBackground = new SvgBackground({
    svgUrl: 'assets/images/hexagon-pattern.svg',
    // Gradient background options
    highlightOpacity: 0.15,    // Very subtle highlight
    highlightSize: 0.33,       // Reduced by a third
    easing: 0.3,               // 2x faster mouse following
    
    // Hexagon options
    hexOpacity: 0.15,          // Increased opacity for better visibility
    hexFadeRadius: isLowPerformance ? 300 : 500 // Smaller radius on mobile/low-performance devices
  });
  
  console.log('SVG background initialized successfully');
});
