/**
 * Button Gradient Effect
 * 
 * This script creates an interactive gradient effect for buttons where
 * the gradient follows the mouse position and smoothly returns to its
 * original position when the mouse leaves the button.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Select all primary buttons and contact buttons
  const buttons = document.querySelectorAll('.btn-primary, .contact-button');
  
  buttons.forEach(button => {
    // Add mouse event listeners to each button
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);
  });
  
  /**
   * Handle mouse enter event
   * Remove transition to allow immediate response to mouse movement
   */
  function handleMouseEnter(e) {
    e.currentTarget.style.transition = 'none';
  }
  
  /**
   * Handle mouse move event
   * Calculate the relative position of the mouse within the button
   * and update the gradient position accordingly
   */
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the button
    const width = rect.width;
    
    // Calculate the percentage position (0-100%)
    const percentage = Math.min(Math.max(x / width * 100, 0), 100);
    
    // Set the custom property for gradient position
    // Map the percentage to the 0-100% range for background-position
    e.currentTarget.style.setProperty('--x', `${percentage}% 50%`);
  }
  
  /**
   * Handle mouse leave event
   * Restore the transition and reset the gradient position
   */
  function handleMouseLeave(e) {
    e.currentTarget.style.transition = 'background-position 0.5s ease-out';
    e.currentTarget.style.setProperty('--x', '0% 50%');
  }
});
