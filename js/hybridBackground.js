/**
 * Hybrid Background Effect
 * Combines SVG for static hexagon pattern with Canvas for mouse-follow highlight
 */

class HybridBackground {
  constructor(options = {}) {
    // Browser detection
    this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    this.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1 && !this.isFirefox;
    this.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1 && !this.isChrome;
    
    // Default options
    this.options = Object.assign({
      color1: '#0C192D',        // Base background color
      color2: '#0A1525',        // Secondary background color
      highlightColor: '#3C4D70', // Highlight color for mouse interaction
      highlightOpacity: this.isFirefox ? 0.18 : 0.15,   // Slightly higher opacity for Firefox
      highlightSize: this.isFirefox ? 0.38 : 0.33,      // Slightly larger highlight for Firefox
      easing: this.isFirefox ? 0.25 : 0.3,              // Smoother easing for Firefox
      hexColor: '#2A4A6A',      // Color of hexagon outlines
      hexOpacity: 0.09,         // Opacity of hexagons (very subtle)
      visibilityRadius: 0.3,    // Radius around mouse where hexagons are visible (0-1)
      // Firefox-specific rendering options
      useBlur: this.isFirefox,  // Use blur effect for Firefox
      blurAmount: 1.5,          // Blur amount in pixels
      useMultiStopGradient: this.isFirefox, // Use more color stops for Firefox
      throttleDelay: this.isFirefox ? 12 : 0, // Add throttling for Firefox
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
    
    // Add base elements to container
    this.container.appendChild(this.baseGradient);
    this.container.appendChild(this.svgContainer);
    
    // Only create canvas for non-Firefox browsers
    if (!this.isFirefox) {
      // Create canvas for highlight effect
      this.highlightCanvas = document.createElement('canvas');
      this.highlightCanvas.className = 'hybrid-background-highlight-canvas';
      this.highlightCanvas.style.position = 'absolute';
      this.highlightCanvas.style.top = '0';
      this.highlightCanvas.style.left = '0';
      this.highlightCanvas.style.width = '100%';
      this.highlightCanvas.style.height = '100%';
      this.highlightCanvas.style.pointerEvents = 'none';
      this.highlightCtx = this.highlightCanvas.getContext('2d');
      
      // Add canvas to container
      this.container.appendChild(this.highlightCanvas);
      
      // Add mouse event listeners for animation
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseleave', this.handleMouseLeave);
    } else {
      // For Firefox, we don't create the canvas or add mouse event listeners
      console.log('Firefox detected - mouse animation disabled for better performance');
    }
    
    // Add container to hero section instead of body
    this.heroSection.prepend(this.container);
    
    // Load SVG
    this.loadSvg();
    
    // Set initial size
    this.handleResize();
    
    // Add resize event listener (needed for all browsers)
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleResize);
    
    // Start animation (will be a no-op for Firefox)
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
    
    // Store dimensions for all browsers
    this.width = heroWidth;
    this.height = heroHeight;
    
    // Only update canvas for non-Firefox browsers
    if (!this.isFirefox && this.highlightCanvas) {
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
  }
  
  // Track last mouse move time for throttling
  lastMouseMoveTime = 0;
  
  /**
   * Handle mouse movement
   * @param {MouseEvent} e - Mouse event
   */
  handleMouseMove(e) {
    // Apply throttling for Firefox
    if (this.isFirefox && this.options.throttleDelay > 0) {
      const now = Date.now();
      if (now - this.lastMouseMoveTime < this.options.throttleDelay) {
        return;
      }
      this.lastMouseMoveTime = now;
    }
    
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
    
    // Skip rendering for Firefox browsers
    if (this.isFirefox) {
      // No animation for Firefox - just keep the animation loop running
      // to maintain compatibility with the rest of the code
      this.animationFrame = requestAnimationFrame(this.render);
      return;
    }
    
    // For non-Firefox browsers, continue with the animation
    if (!this.highlightCanvas || !this.highlightCtx) {
      // Safety check - if canvas wasn't created, don't try to render
      this.animationFrame = requestAnimationFrame(this.render);
      return;
    }
    
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
    
    // ---- RENDER HIGHLIGHT CANVAS ----
    // Clear highlight canvas
    this.highlightCtx.clearRect(0, 0, this.width, this.height);
    
    // Draw mouse-reactive highlight gradient
    const highlightSize = Math.max(this.width, this.height) * this.options.highlightSize;
    const highlightGradient = this.highlightCtx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, highlightSize
    );
    
    // Standard gradient
    highlightGradient.addColorStop(0, `rgba(60, 77, 112, ${this.options.highlightOpacity})`);
    highlightGradient.addColorStop(0.5, `rgba(60, 77, 112, ${this.options.highlightOpacity / 2})`);
    highlightGradient.addColorStop(1, 'rgba(60, 77, 112, 0)');
    
    // Use standard compositing
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
  // Detect browser
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
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
  
  if (isFirefox) {
    console.log('Firefox detected - using optimized rendering for Firefox');
  }
  
  console.log('Hybrid background initialized successfully');
});
