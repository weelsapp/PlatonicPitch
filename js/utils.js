/**
 * Utility functions for the website
 */

/**
 * Debounce function to limit how often a function can be called
 * Useful for resize or scroll events
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @return {Function} - The debounced function
 */
function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if an element is in the viewport
 * 
 * @param {HTMLElement} element - The element to check
 * @param {number} offset - Optional offset to use
 * @return {boolean} - Whether the element is in the viewport
 */
function isInViewport(element, offset = 0) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.bottom >= 0 - offset &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) + offset &&
    rect.right >= 0 - offset
  );
}

/**
 * Get viewport dimensions
 * 
 * @return {Object} - Object containing width and height of the viewport
 */
function getViewportDimensions() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
  };
}

/**
 * Check if the device is mobile
 * 
 * @return {boolean} - Whether the device is mobile
 */
function isMobileDevice() {
  return window.innerWidth < 768;
}

// Export utilities if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    isInViewport,
    getViewportDimensions,
    isMobileDevice
  };
}
