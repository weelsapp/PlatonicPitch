/**
 * Logo Hover Effect
 * Creates a "hollowing" effect around the mouse cursor on the hero logo
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Logo hover effect initializing...');
  
  // Get the logo container
  const logoContainer = document.querySelector('.hero-image-container');
  
  if (!logoContainer) {
    console.warn('Logo hover effect: Hero image container not found');
    return;
  }
  
  // Add mouse move event listener to track mouse position
  logoContainer.addEventListener('mousemove', (e) => {
    // Get the position of the mouse relative to the container
    const rect = logoContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate the percentage position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Update the CSS variables
    logoContainer.style.setProperty('--mouse-x', `${xPercent}%`);
    logoContainer.style.setProperty('--mouse-y', `${yPercent}%`);
  });
  
  // Reset the position when mouse leaves
  logoContainer.addEventListener('mouseleave', () => {
    logoContainer.style.setProperty('--mouse-x', '50%');
    logoContainer.style.setProperty('--mouse-y', '50%');
  });
  
  console.log('Logo hover effect initialized successfully');
});
