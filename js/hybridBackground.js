/**
 * Hybrid Background Effect
 * Combines SVG for static hexagon pattern with Canvas for mouse-follow highlight
 */

class HybridBackground {
  constructor(options = {}) {
    // Default options
    this.options = Object.assign({
      color1: '#0C192D',        // Base background color
      color2: '#0A1525',        // Secondary background color
      highlightColor: '#3C4D70', // Highlight color for mouse interaction
      highlightOpacity: 0.15,   // Opacity of the highlight
      highlightSize: 0.33,      // Size of the highlight (0-1)
      easing: 0.3,              // Easing factor for smooth movement
      hexColor: '#2A4A6A',      // Color of hexagon outlines
      hexOpacity: 0.09,         // Opacity of hexagons (very subtle)
      visibilityRadius: 0.3,    // Radius around mouse where hexagons are visible (0-1) - increased for smoother transition
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
   * Initialize the hybrid background
   */
  init() {
    // Find the hero section
    this.heroSection = document.querySelector('.hero-section');
    if (!this.heroSection) {
      console.error('Hero section not found');
      return;
    }
    
    // Set hero section background color to transparent
    // (we'll handle the background with our gradient)
    this.heroSection.style.backgroundColor = 'transparent';
    
    // Make sure hero section has position relative for proper positioning
    if (getComputedStyle(this.heroSection).position === 'static') {
      this.heroSection.style.position = 'relative';
    }
    
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'hybrid-background';
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
    this.baseGradient.className = 'hybrid-background-gradient';
    this.baseGradient.style.position = 'absolute';
    this.baseGradient.style.top = '0';
    this.baseGradient.style.left = '0';
    this.baseGradient.style.width = '100%';
    this.baseGradient.style.height = '100%';
    this.baseGradient.style.background = `linear-gradient(to bottom right, ${this.options.color1}, ${this.options.color2})`;
    
    // Create SVG container for hexagon pattern
    this.svgContainer = document.createElement('div');
    this.svgContainer.className = 'hybrid-background-pattern';
    this.svgContainer.style.position = 'absolute';
    this.svgContainer.style.top = '0';
    this.svgContainer.style.left = '0';
    this.svgContainer.style.width = '100%';
    this.svgContainer.style.height = '100%';
    this.svgContainer.style.opacity = '0'; // Start invisible, will fade in
    
    // Create mask div (will be on top of SVG)
    this.maskDiv = document.createElement('div');
    this.maskDiv.className = 'hybrid-background-mask';
    this.maskDiv.style.position = 'absolute';
    this.maskDiv.style.top = '0';
    this.maskDiv.style.left = '0';
    this.maskDiv.style.width = '100%';
    this.maskDiv.style.height = '100%';
    this.maskDiv.style.pointerEvents = 'none';
    this.maskDiv.style.backgroundColor = this.options.color1; // Same as background
    this.maskDiv.style.transition = 'background 0.1s ease'; // Smooth transition for gradient changes
    
    // Create canvas for highlight effect (will be on top of mask)
    this.highlightCanvas = document.createElement('canvas');
    this.highlightCanvas.className = 'hybrid-background-highlight-canvas';
    this.highlightCanvas.style.position = 'absolute';
    this.highlightCanvas.style.top = '0';
    this.highlightCanvas.style.left = '0';
    this.highlightCanvas.style.width = '100%';
    this.highlightCanvas.style.height = '100%';
    this.highlightCanvas.style.pointerEvents = 'none';
    this.highlightCtx = this.highlightCanvas.getContext('2d');
    
    // Add elements to container in proper order (bottom to top)
    this.container.appendChild(this.baseGradient);
    this.container.appendChild(this.svgContainer);
    this.container.appendChild(this.maskDiv);
    this.container.appendChild(this.highlightCanvas);
    
    // Add container to hero section instead of body
    this.heroSection.prepend(this.container);
    
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
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" xmlns:xlink="http://www.w3.org/1999/xlink" 
           viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="hexagon_pattern" x="0" y="0" width="44" height="76" 
                  patternTransform="translate(-2962.962 -3124.222) scale(.583)" 
                  patternUnits="userSpaceOnUse" viewBox="0 0 44 76">
            <rect width="44" height="76" style="fill:none;"/>
            <polygon points="22 63.298 22 88.702 44 101.403 66 88.702 66 63.298 44 50.597 22 63.298" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
            <polygon points="-22 63.298 -22 88.702 0 101.403 22 88.702 22 63.298 0 50.597 -22 63.298" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
            <polygon points="44 25.298 44 50.702 66 63.403 88 50.702 88 25.298 66 12.597 44 25.298" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
            <polygon points="0 25.298 0 50.702 22 63.403 44 50.702 44 25.298 22 12.597 0 25.298" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
            <polygon points="-44 25.298 -44 50.702 -22 63.403 0 50.702 0 25.298 -22 12.597 -44 25.298" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
            <polygon points="22 -12.702 22 12.702 44 25.403 66 12.702 66 -12.702 44 -25.403 22 -12.702" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
            <polygon points="-22 -12.702 -22 12.702 0 25.403 22 12.702 22 -12.702 0 -25.403 -22 -12.702" style="fill:none; stroke:#2A4A6A; stroke-miterlimit:10; stroke-width:1.5;"/>
          </pattern>
        </defs>
        <rect y="0" width="100%" height="100%" style="fill:url(#hexagon_pattern);"/>
      </svg>
    `;
    
    // Insert SVG content
    this.svgContainer.innerHTML = svgContent;
    
    // Get the SVG element
    this.svg = this.svgContainer.querySelector('svg');
    
    // Set SVG to fill container with priority on width
    if (this.svg) {
      this.svg.style.width = '100%';
      this.svg.style.height = 'auto';
      this.svg.style.minHeight = '100%';
      this.svg.style.display = 'block';
      this.svg.style.position = 'absolute';
      this.svg.style.top = '0';
      this.svg.style.left = '0';
      
      // Fade in SVG with reduced opacity (0.09)
      setTimeout(() => {
        this.svgContainer.style.transition = 'opacity 0.5s ease';
        this.svgContainer.style.opacity = this.options.hexOpacity;
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
    
    // Get hero section dimensions
    const heroRect = this.heroSection.getBoundingClientRect();
    const heroHeight = this.heroSection.offsetHeight;
    const heroWidth = this.heroSection.offsetWidth;
    
    // Update container dimensions to match hero section
    this.container.style.width = '100%';
    this.container.style.height = `${heroHeight}px`;
    this.baseGradient.style.height = `${heroHeight}px`;
    this.svgContainer.style.height = `${heroHeight}px`;
    this.maskDiv.style.height = `${heroHeight}px`;
    
    // Set dimensions for highlight canvas
    this.width = heroWidth;
    this.height = heroHeight;
    
    // Set highlight canvas dimensions
    this.highlightCanvas.style.width = '100%';
    this.highlightCanvas.style.height = `${heroHeight}px`;
    
    // Set canvas resolution (considering device pixel ratio for retina displays)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Configure highlight canvas
    this.highlightCanvas.width = this.width * dpr;
    this.highlightCanvas.height = this.height * dpr;
    this.highlightCtx.scale(dpr, dpr);
    
    // Force a render update
    this.needsUpdate = true;
  }
  
  /**
   * Handle mouse movement
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    // Get hero section bounds
    const heroRect = this.heroSection.getBoundingClientRect();
    
    // Check if mouse is within hero section
    const isInHeroSection = 
      e.clientX >= heroRect.left && 
      e.clientX <= heroRect.right && 
      e.clientY >= heroRect.top && 
      e.clientY <= heroRect.bottom;
    
    if (isInHeroSection) {
      // Convert mouse position to be relative to the hero section
      const relativeX = e.clientX - heroRect.left;
      const relativeY = e.clientY - heroRect.top;
      
      // Update mouse target position
      this.mouse.targetX = relativeX;
      this.mouse.targetY = relativeY;
    }
  }
  
  /**
   * Handle mouse leaving the window
   */
  handleMouseLeave() {
    // Reset to center of hero section when mouse leaves
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
    
    // Calculate visibility radius (how far from mouse the hexagons are visible)
    const visibilityRadius = Math.min(this.width, this.height) * this.options.visibilityRadius;
    
    // Update mask div with radial gradient
    // This creates a "hole" in the mask where the hexagons are visible
    // Using more color stops for a much smoother transition
    this.maskDiv.style.background = `radial-gradient(
      circle ${visibilityRadius}px at ${this.mouse.x}px ${this.mouse.y}px, 
      rgba(12, 25, 45, 0) 0%, 
      rgba(12, 25, 45, 0.1) 30%, 
      rgba(12, 25, 45, 0.2) 50%, 
      rgba(12, 25, 45, 0.4) 70%, 
      rgba(12, 25, 45, 0.7) 85%, 
      rgba(12, 25, 45, 1) 100%
    )`;
    
    // ---- RENDER HIGHLIGHT CANVAS ----
    // Clear highlight canvas
    this.highlightCtx.clearRect(0, 0, this.width, this.height);
    
    // Draw mouse-reactive highlight gradient
    const highlightSize = Math.max(this.width, this.height) * this.options.highlightSize;
    const highlightGradient = this.highlightCtx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, highlightSize
    );
    
    // Create highlight gradient
    highlightGradient.addColorStop(0, `rgba(60, 77, 112, ${this.options.highlightOpacity})`);
    highlightGradient.addColorStop(0.5, `rgba(60, 77, 112, ${this.options.highlightOpacity / 2})`);
    highlightGradient.addColorStop(1, 'rgba(60, 77, 112, 0)');
    
    // Apply highlight gradient
    this.highlightCtx.globalCompositeOperation = 'lighter';
    this.highlightCtx.fillStyle = highlightGradient;
    this.highlightCtx.fillRect(0, 0, this.width, this.height);
    
    // Reset composite operation
    this.highlightCtx.globalCompositeOperation = 'source-over';
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(this.render);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Hybrid background initializing...');
  
  // Detect if running on a mobile device or low-performance browser
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowPerformance = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  
  // Create background with custom options
  window.hybridBackground = new HybridBackground({
    // Gradient background options
    highlightOpacity: 0.15,    // Very subtle highlight
    highlightSize: 0.33,       // Reduced by a third
    easing: 0.3,               // 2x faster mouse following
    
    // Hexagon options
    hexColor: '#2A4A6A',       // Color of hexagon outlines
    visibilityRadius: isLowPerformance ? 0.15 : 0.2, // Smaller radius on mobile
  });
  
  console.log('Hybrid background initialized successfully');
});
