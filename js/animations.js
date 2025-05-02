/**
 * Animations for the website
 * This file contains animation utilities and implementations
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations
  initMouseReactiveBackground();
  initLoadAnimations();
  initScrollAnimations();
  console.log('Animation system ready');
});

/**
 * Initialize mouse-reactive background
 * Creates a dynamic gradient that follows the mouse cursor
 */
function initMouseReactiveBackground() {
  // Get document dimensions
  let docWidth = window.innerWidth;
  let docHeight = window.innerHeight;
  
  // Update dimensions on window resize
  window.addEventListener('resize', function() {
    docWidth = window.innerWidth;
    docHeight = window.innerHeight;
  });
  
  // Set initial CSS variables for the gradient
  document.documentElement.style.setProperty('--mouse-x', '50%');
  document.documentElement.style.setProperty('--mouse-y', '50%');
  document.documentElement.style.setProperty('--gradient-size', '0%');
  
  // Function to handle mouse movement
  function handleMouseMove(e) {
    // Calculate mouse position as percentage of viewport
    const mouseX = (e.clientX / docWidth) * 100;
    const mouseY = (e.clientY / docHeight) * 100;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--mouse-x', `${mouseX}%`);
    document.documentElement.style.setProperty('--mouse-y', `${mouseY}%`);
    document.documentElement.style.setProperty('--gradient-size', '50%');
  }
  
  // Use requestAnimationFrame with a throttle for smoother performance
  let lastUpdate = 0;
  const throttleDelay = 50; // Increase delay to reduce updates and flickering
  
  document.addEventListener('mousemove', function(e) {
    const now = Date.now();
    if (now - lastUpdate > throttleDelay) {
      window.requestAnimationFrame(function() {
        handleMouseMove(e);
      });
      lastUpdate = now;
    }
  });
  
  // Add mouseout event listener to reset gradient when mouse leaves the window
  document.addEventListener('mouseout', function() {
    document.documentElement.style.setProperty('--gradient-size', '0%');
  });
}

/**
 * Fade in element
 * 
 * @param {HTMLElement} element - The element to fade in
 * @param {number} duration - Duration of the animation in milliseconds
 * @param {Function} callback - Optional callback function to run after animation completes
 */
function fadeIn(element, duration = 500, callback) {
  if (!element) return;
  
  // Set initial opacity
  element.style.opacity = 0;
  element.style.display = 'block';
  
  // Get start timestamp
  let start = null;
  
  // Animation step function
  function step(timestamp) {
    if (!start) start = timestamp;
    
    // Calculate progress
    const progress = timestamp - start;
    
    // Set opacity based on progress
    element.style.opacity = Math.min(progress / duration, 1);
    
    // Continue animation if not complete
    if (progress < duration) {
      window.requestAnimationFrame(step);
    } else if (typeof callback === 'function') {
      // Run callback if provided
      callback();
    }
  }
  
  // Start animation
  window.requestAnimationFrame(step);
}

/**
 * Fade out element
 * 
 * @param {HTMLElement} element - The element to fade out
 * @param {number} duration - Duration of the animation in milliseconds
 * @param {Function} callback - Optional callback function to run after animation completes
 */
function fadeOut(element, duration = 500, callback) {
  if (!element) return;
  
  // Set initial opacity
  element.style.opacity = 1;
  
  // Get start timestamp
  let start = null;
  
  // Animation step function
  function step(timestamp) {
    if (!start) start = timestamp;
    
    // Calculate progress
    const progress = timestamp - start;
    
    // Set opacity based on progress
    element.style.opacity = Math.max(1 - (progress / duration), 0);
    
    // Continue animation if not complete
    if (progress < duration) {
      window.requestAnimationFrame(step);
    } else {
      // Hide element when animation completes
      element.style.display = 'none';
      
      // Run callback if provided
      if (typeof callback === 'function') {
        callback();
      }
    }
  }
  
  // Start animation
  window.requestAnimationFrame(step);
}

/**
 * Slide down element
 * 
 * @param {HTMLElement} element - The element to slide down
 * @param {number} duration - Duration of the animation in milliseconds
 * @param {Function} callback - Optional callback function to run after animation completes
 */
function slideDown(element, duration = 500, callback) {
  // This is a placeholder for future implementation
  console.log('Slide down animation will be implemented in the future');
}

/**
 * Slide up element
 * 
 * @param {HTMLElement} element - The element to slide up
 * @param {number} duration - Duration of the animation in milliseconds
 * @param {Function} callback - Optional callback function to run after animation completes
 */
function slideUp(element, duration = 500, callback) {
  // This is a placeholder for future implementation
  console.log('Slide up animation will be implemented in the future');
}

/**
 * Initialize animations for elements that should animate on page load
 */
function initLoadAnimations() {
  // Get all elements with the initially-hidden class that should animate on load
  const heroElements = document.querySelectorAll('.initially-hidden');
  
  // Add the animation classes
  heroElements.forEach(element => {
    element.classList.add('animate-on-load');
  });
  
  // Trigger animations after the page has loaded
  // Use a longer delay to ensure everything is ready
  setTimeout(() => {
    heroElements.forEach(element => {
      element.classList.add('animated');
    });
  }, 300);
}

/**
 * Initialize animations for elements that should animate on scroll
 */
function initScrollAnimations() {
  // Select all elements that should animate on scroll
  const scrollElements = document.querySelectorAll('.features-section .features-title, .features-section .features-description, .features-section .features-img, .features-section .feature-card');
  
  // Add the animation class
  scrollElements.forEach(element => {
    element.classList.add('animate-on-scroll');
  });
  
  // Create an Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If the element is in the viewport
      if (entry.isIntersecting) {
        // Add the animated class to trigger the animation
        entry.target.classList.add('animated');
        // Unobserve the element after it's been animated
        observer.unobserve(entry.target);
      }
    });
  }, {
    // Options for the observer
    threshold: 0.1, // Trigger when at least 10% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before the element enters the viewport
  });
  
  // Observe each element
  scrollElements.forEach(element => {
    observer.observe(element);
  });
}
