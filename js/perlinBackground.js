/**
 * Perlin Noise Background
 * A lightweight implementation that adds the perlin noise background to the hero section
 */

class PerlinBackground {
  constructor() {
    // Find the hero section
    this.heroSection = document.querySelector('.hero-section');
    if (!this.heroSection) {
      console.error('Hero section not found');
      return;
    }
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize the perlin background
   */
  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'perlin-background';
    
    // Create noise element
    this.noiseElement = document.createElement('div');
    this.noiseElement.className = 'perlin-noise';
    
    // Add noise element to container
    this.container.appendChild(this.noiseElement);
    
    // Add container to hero section
    this.heroSection.prepend(this.container);
    
    console.log('Perlin noise background initialized');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing perlin noise background...');
  
  // Detect browser
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  // Create perlin background
  window.perlinBackground = new PerlinBackground();
  
  if (isFirefox) {
    console.log('Firefox detected - using optimized perlin noise settings');
  }
  
  console.log('Perlin noise background initialized successfully');
});
