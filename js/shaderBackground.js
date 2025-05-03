/**
 * ShaderToy-inspired WebGL Background
 * Implements a hexagonal pattern with animated noise for the hero section
 */

class ShaderBackground {
  constructor() {
    // Find the hero section
    this.heroSection = document.querySelector('.hero-section');
    if (!this.heroSection) {
      console.error('Hero section not found');
      return;
    }
    
    // Check for WebGL support
    if (!this.isWebGLSupported()) {
      console.warn('WebGL not supported, falling back to standard background');
      return;
    }
    
    // Initialize Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.material = null;
    this.clock = null;
    this.container = null;
    
    // Initialize
    this.init();
  }
  
  /**
   * Check if WebGL is supported
   */
  isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Initialize the shader background
   */
  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'shader-background';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.zIndex = '0'; // Changed from -1 to 0 to ensure it's visible
    this.container.style.overflow = 'hidden';
    // Use exact RGB values: 0.04706, 0.09804, 0.17647
    this.container.style.backgroundColor = 'rgb(12, 25, 45)';
    // Set a backup using the hex value to ensure correct color
    this.container.style.background = '#0C192D';
    
    // Add container to hero section
    this.heroSection.prepend(this.container);
    
    // Initialize Three.js
    this.initThree();
    
    // Add event listeners
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('Shader background initialized');
  }
  
  /**
   * Initialize Three.js scene, camera, renderer, and material
   */
  initThree() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera (orthographic for full-screen quad)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create renderer with simpler configuration
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    
    // Set the clear color using RGB values directly (0.04706, 0.09804, 0.17647)
    this.renderer.setClearColor(new THREE.Color(12/255, 25/255, 45/255), 1.0);
    
    this.container.appendChild(this.renderer.domElement);
    
    // Create clock for animation
    this.clock = new THREE.Clock();
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(
          this.container.offsetWidth, 
          this.container.offsetHeight, 
          1
        )}
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      transparent: true
    });
    
    // Create a full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Animation loop with frame rate limiting
   */
  animate() {
    if (!this.renderer) return;
    
    // Request next frame
    requestAnimationFrame(this.animate.bind(this));
    
    // Frame rate limiting - only render every other frame (30fps instead of 60fps)
    if (!this.frameCount) this.frameCount = 0;
    this.frameCount++;
    
    if (this.frameCount % 2 === 0) {
      // Update uniforms
      this.material.uniforms.iTime.value = this.clock.getElapsedTime();
      
      // Render
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.renderer || !this.material) return;
    
    // Update renderer size
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    
    // Update resolution uniform
    this.material.uniforms.iResolution.value.set(
      this.container.offsetWidth,
      this.container.offsetHeight,
      1
    );
  }
  
  /**
   * Get vertex shader code
   */
  getVertexShader() {
    return `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;
  }
  
  /**
   * Get fragment shader code
   */
  getFragmentShader() {
    return `
      uniform float iTime;
      uniform vec3 iResolution;
      
      /////////////// K.jpg's Re-oriented 8-Point BCC Noise (OpenSimplex2S) ////////////////
      ////////////////////// Output: vec4(dF/dx, dF/dy, dF/dz, value) //////////////////////
      
      // Borrowed from Stefan Gustavson's noise code
      vec4 permute(vec4 t) {
          return t * (t * 34.0 + 133.0);
      }
      
      // Gradient set is a normalized expanded rhombic dodecahedron
      vec3 grad(float hash) {
          
          // Random vertex of a cube, +/- 1 each
          vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;
          
          // Random edge of the three edges connected to that vertex
          // Also a cuboctahedral vertex
          // And corresponds to the face of its dual, the rhombic dodecahedron
          vec3 cuboct = cube;
          cuboct[int(hash / 16.0)] = 0.0;
          
          // In a funky way, pick one of the four points on the rhombic face
          float type = mod(floor(hash / 8.0), 2.0);
          vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));
          
          // Expand it so that the new edges are the same length
          // as the existing ones
          vec3 grad = cuboct * 1.22474487139 + rhomb;
          
          // To make all gradients the same length, we only need to shorten the
          // second type of vector. We also put in the whole noise scale constant.
          // The compiler should reduce it into the existing floats. I think.
          grad *= (1.0 - 0.042942436724648037 * type) * 3.5946317686139184;
          
          return grad;
      }
      
      // BCC lattice split up into 2 cube lattices
      vec4 openSimplex2SDerivativesPart(vec3 X) {
          vec3 b = floor(X);
          vec4 i4 = vec4(X - b, 2.5);
          
          // Pick between each pair of oppposite corners in the cube.
          vec3 v1 = b + floor(dot(i4, vec4(.25)));
          vec3 v2 = b + vec3(1, 0, 0) + vec3(-1, 1, 1) * floor(dot(i4, vec4(-.25, .25, .25, .35)));
          vec3 v3 = b + vec3(0, 1, 0) + vec3(1, -1, 1) * floor(dot(i4, vec4(.25, -.25, .25, .35)));
          vec3 v4 = b + vec3(0, 0, 1) + vec3(1, 1, -1) * floor(dot(i4, vec4(.25, .25, -.25, .35)));
          
          // Gradient hashes for the four vertices in this half-lattice.
          vec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
          hashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
          hashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);
          
          // Gradient extrapolations & kernel function
          vec3 d1 = X - v1; vec3 d2 = X - v2; vec3 d3 = X - v3; vec3 d4 = X - v4;
          vec4 a = max(0.75 - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0);
          vec4 aa = a * a; vec4 aaaa = aa * aa;
          vec3 g1 = grad(hashes.x); vec3 g2 = grad(hashes.y);
          vec3 g3 = grad(hashes.z); vec3 g4 = grad(hashes.w);
          vec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));
          
          // Derivatives of the noise
          vec3 derivative = -8.0 * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations)
              + mat4x3(g1, g2, g3, g4) * aaaa;
          
          // Return it all as a vec4
          return vec4(derivative, dot(aaaa, extrapolations));
      }
      
      // Rotates domain, but preserve shape. Hides grid better in cardinal slices.
      // Good for texturing 3D objects with lots of flat parts along cardinal planes.
      vec4 openSimplex2SDerivatives_Classical(vec3 X) {
          X = dot(X, vec3(2.0/3.0)) - X;
          
          vec4 result = openSimplex2SDerivativesPart(X) + openSimplex2SDerivativesPart(X + 144.5);
          
          return vec4(dot(result.xyz, vec3(2.0/3.0)) - result.xyz, result.w);
      }
      
      //////////////////////////////// End noise code ////////////////////////////////
      
      const int aa = 2; // Reduced anti-aliasing for performance
      const float aperture = 1.0;
      
      vec4 colorCorrect(vec3 color) {
          vec3 x = max(vec3(.0), color*aperture-.004);
          vec3 retColor = (x*(6.2*x+.5))/(x*(6.2*x+1.7)+0.06);
          return vec4(min(retColor, 1.0), 1.0);
      }
      
      vec2 hex(vec2 point) {
          return vec2( (point.x + 1.7321 * point.y) / 3.0, (point.x + 1.7321 * point.y) / 3.0 - 1.1547 * point.y);
      }
      
      vec2 point(vec2 hex) {
          return vec2(3.0 * (hex.x + hex.y), 1.7321 * (hex.x - hex.y)) / 2.0;
      }
      
      float inhex(vec2 p, vec2 c, float s) {
          return step(max(abs(c.y - p.y), dot(abs(p - c), normalize(vec2(1.7321, 1.0)))), s / 2.0);
      }
      
      vec2 gethex(vec2 p) {
          vec2 center = round(hex(p));
          center.x += inhex(p, point(center + vec2(1, 0)), 1.7321) - inhex(p, point(center + vec2(-1, 0)), 1.7321);
          center.y += inhex(p, point(center + vec2(0, 1)), 1.7321) - inhex(p, point(center + vec2(0, -1)), 1.7321);
          return point(center);
      }
      
      vec3 Image(vec2 uv) {
          // Decreased scale by 36% (20% + 20%) to make hexagons 40% larger
          float hscale = 32.0;
          vec2 hex = gethex(hscale * uv);
          vec2 hsample = hex / hscale;
      
          float r = 5.0;
          // Adjusted animation speed (period set to 25)
          float period = 25.0;
      
          // Simplified calculation for better performance
          float animTime = iTime * 6.2832 / period;
          float xOffset = (r - hsample.x) * cos(animTime);
          float zOffset = (r - hsample.x) * sin(animTime);
          
          vec3 pointInSpace = vec3(xOffset, uv.y, zOffset);
      
          vec4 val = openSimplex2SDerivatives_Classical(pointInSpace);
      
          float s = 0.5 + 1.24 * (val[3]/2.0 + 0.5);
      
          // Use 40% lighter RGB values (10% + 10% + 10% + 10%): 0.10910, 0.19521, 0.29282
          // Multiplying by 1.2 to make it more visible
          vec3 hexColor = vec3(0.10910, 0.19521, 0.29282) * 1.2;
          return hexColor * inhex(hscale * uv, hex, s);
      }
      
      void main() {
          vec2 fragCoord = gl_FragCoord.xy;
          vec3 total = vec3(.0);
          
          // Reduced MSAA - only use 2x2 sampling on high-resolution displays
          int samplesX = min(aa, int(iResolution.x > 1000.0 ? 2.0 : 1.0));
          int samplesY = samplesX;
          
          if (samplesX == 1) {
              // No anti-aliasing for better performance on lower-res displays
              vec2 uv = (fragCoord - 0.5) / iResolution.xy - vec2(0.5);
              uv.x *= iResolution.x / iResolution.y;
              total = Image(uv);
          } else {
              // MSAA for higher-res displays
              for(int i = 0; i < samplesX; i++)
              for(int j = 0; j < samplesY; j++) {
                  vec2 uv = (fragCoord + vec2(float(i), float(j)) / float(samplesX) - 0.5) / iResolution.xy - vec2(0.5);
                  uv.x *= iResolution.x / iResolution.y;
                  
                  total += Image(uv);
              }
              total /= float(samplesX * samplesY);
          }
          
      // Add background color directly in the shader
      vec3 backgroundColor = vec3(0.04706, 0.09804, 0.17647);
      
      // Mix the hexagon pattern with the background color
      vec3 finalColor = mix(backgroundColor, total, total.r);
      
      // Output the final color
      gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing shader background...');
  
  try {
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
      console.error('THREE.js is not loaded. Make sure to include it before shaderBackground.js');
      return;
    }
    
    // Initialize shader background
    window.shaderBackground = new ShaderBackground();
    console.log('Shader background initialized successfully');
  } catch (error) {
    console.error('Error initializing shader background:', error);
  }
});
