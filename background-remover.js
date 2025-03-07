// Background removal utilities for spritesheet generator
const backgroundRemover = {
  // Find the most common color in the canvas
  findMostCommonColor: function(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const colorCounts = {};
    
    // Count occurrences of each color
    for (let i = 0; i < data.length; i += 4) {
      // Skip transparent pixels
      if (data[i + 3] === 0) continue;
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const colorKey = `${r},${g},${b}`;
      
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    // Find the most common color
    let mostCommonColor = null;
    let highestCount = 0;
    
    for (const colorKey in colorCounts) {
      if (colorCounts[colorKey] > highestCount) {
        highestCount = colorCounts[colorKey];
        mostCommonColor = colorKey;
      }
    }
    
    if (mostCommonColor) {
      const [r, g, b] = mostCommonColor.split(',').map(Number);
      return { r, g, b, rgba: `rgba(${r},${g},${b},1)`, rgb: `rgb(${r},${g},${b})`, hex: this.rgbToHex(r, g, b) };
    }
    
    return { r: 255, g: 255, b: 255, rgba: 'rgba(255,255,255,1)', rgb: 'rgb(255,255,255)', hex: '#FFFFFF' };
  },
  
  // Convert RGB to HEX
  rgbToHex: function(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  },
  
  // Convert HEX to RGB
  hexToRgb: function(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  // Simple color removal - exact match only
  removeExactColor: function(canvas, color) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Store the current composite operation
    const previousCompositeOperation = ctx.globalCompositeOperation;
    
    // Draw with "destination-out" to make matching pixels transparent
    ctx.globalCompositeOperation = 'destination-out';
    
    // Set the fill color to the color we want to remove
    ctx.fillStyle = color.rgba || `rgba(${color.r},${color.g},${color.b},1)`;
    
    // Fill a rectangle the size of the canvas, which will remove all pixels of that color
    ctx.fillRect(0, 0, width, height);
    
    // Restore the previous composite operation
    ctx.globalCompositeOperation = previousCompositeOperation;
    
    return canvas;
  },
  
  // Remove color with tolerance
  removeColorWithTolerance: function(canvas, color, tolerance) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Get the pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Ensure we have color components as numbers
    const r = color.r;
    const g = color.g;
    const b = color.b;
    
    // For each pixel, check if it's within the tolerance range
    for (let i = 0; i < data.length; i += 4) {
      const pixelR = data[i];
      const pixelG = data[i + 1];
      const pixelB = data[i + 2];
      
      // Calculate distance between the pixel color and the target color
      const distance = Math.sqrt(
        Math.pow(pixelR - r, 2) +
        Math.pow(pixelG - g, 2) +
        Math.pow(pixelB - b, 2)
      );
      
      // If the distance is within the tolerance, make the pixel transparent
      if (distance <= tolerance) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    
    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  },
  
  // Create an eyedropper color picker for a canvas
  setupEyedropper: function(canvas, colorInput, toggleButton) {
    let isPickingColor = false;
    
    toggleButton.addEventListener('click', () => {
      isPickingColor = !isPickingColor;
      
      if (isPickingColor) {
        toggleButton.textContent = 'Cancel Selection';
        toggleButton.classList.add('active');
        canvas.style.cursor = 'crosshair';
      } else {
        toggleButton.textContent = 'Pick Color';
        toggleButton.classList.remove('active');
        canvas.style.cursor = 'default';
      }
    });
    
    canvas.addEventListener('click', (e) => {
      if (!isPickingColor) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];
      const hex = this.rgbToHex(r, g, b);
      
      colorInput.value = hex;
      
      // Trigger change event
      const event = new Event('change');
      colorInput.dispatchEvent(event);
      
      // Turn off eyedropper mode
      isPickingColor = false;
      toggleButton.textContent = 'Pick Color';
      toggleButton.classList.remove('active');
      canvas.style.cursor = 'default';
    });
  }
};