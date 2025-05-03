/**
 * SVG Loader
 * Loads SVG files and applies the gradient
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get all SVG objects
  const svgObjects = document.querySelectorAll('.feature-icon object');
  
  // Process each SVG object
  svgObjects.forEach(function(obj) {
    const url = obj.getAttribute('data');
    
    // Fetch the SVG file
    fetch(url)
      .then(response => response.text())
      .then(svgContent => {
        // Create a temporary div to hold the SVG content
        const div = document.createElement('div');
        div.innerHTML = svgContent;
        
        // Get the SVG element
        const svg = div.querySelector('svg');
        
        if (svg) {
          // Set width and height
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          
          // Find all paths, rects, circles, and polygons
          const elements = svg.querySelectorAll('path, rect, circle, polygon');
          
          // Apply the gradient to each element
          elements.forEach(el => {
            el.setAttribute('fill', 'url(#icon-gradient)');
          });
          
          // Replace the object with the SVG
          obj.parentNode.replaceChild(svg, obj);
        }
      })
      .catch(error => {
        console.error('Error loading SVG:', error);
      });
  });
});
