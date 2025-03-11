// Background removal functionality
function handleColorChange(e) {
  const color = e.target.value;
  window.currentState.selectedColor = backgroundRemover.hexToRgb(color);
  window.currentState.selectedColor.hex = color;
  window.currentState.selectedColor.rgba = `rgba(${window.currentState.selectedColor.r},${window.currentState.selectedColor.g},${window.currentState.selectedColor.b},1)`;
  
  // Update the color preview and hex input
  const colorPreview = document.getElementById('colorPreview');
  const colorHexInput = document.getElementById('colorHexInput');
  colorPreview.style.backgroundColor = color;
  colorHexInput.value = color;
}

function handleHexInput(e) {
  let hexValue = e.target.value;
  if (!hexValue.startsWith('#')) {
    hexValue = '#' + hexValue;
  }
  
  // Validate hex code format with regex
  if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
    const colorToRemoveInput = document.getElementById('colorToRemove');
    const colorPreview = document.getElementById('colorPreview');
    
    colorToRemoveInput.value = hexValue;
    colorPreview.style.backgroundColor = hexValue;
    
    window.currentState.selectedColor = backgroundRemover.hexToRgb(hexValue);
    window.currentState.selectedColor.hex = hexValue;
    window.currentState.selectedColor.rgba = `rgba(${window.currentState.selectedColor.r},${window.currentState.selectedColor.g},${window.currentState.selectedColor.b},1)`;
  }
}

function useCommonColor() {
  if (!window.currentState.spritesheetCanvas) {
    window.showError("Generate a spritesheet first before detecting the most common color.");
    return;
  }
  
  // Find the most common color
  window.currentState.mostCommonColor = backgroundRemover.findMostCommonColor(window.currentState.spritesheetCanvas);
  
  // Update the color input and preview
  const colorToRemoveInput = document.getElementById('colorToRemove');
  const colorHexInput = document.getElementById('colorHexInput');
  const colorPreview = document.getElementById('colorPreview');
  const useCommonColorBtn = document.getElementById('useCommonColor');
  
  colorToRemoveInput.value = window.currentState.mostCommonColor.hex;
  colorHexInput.value = window.currentState.mostCommonColor.hex;
  colorPreview.style.backgroundColor = window.currentState.mostCommonColor.hex;
  
  // Update the current selected color
  window.currentState.selectedColor = window.currentState.mostCommonColor;
  
  // Update the button text
  useCommonColorBtn.textContent = `Use Most Common Color (${window.currentState.mostCommonColor.hex})`;
  
  // Optionally, automatically apply the background removal
  if (confirm("Would you like to automatically remove this color from the spritesheet?")) {
    removeBackground(true);
  }
}

function removeBackground(useTolerance = false) {
  if (!window.currentState.spritesheetCanvas) {
    window.showError("Generate a spritesheet first before removing the background.");
    return;
  }
  
  const tolerance = useTolerance ? parseInt(document.getElementById('toleranceValue').value) : 0;
  
  // Create a copy of the canvas to work with
  const originalCanvas = window.currentState.spritesheetCanvas;
  const canvas = document.createElement('canvas');
  canvas.width = originalCanvas.width;
  canvas.height = originalCanvas.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalCanvas, 0, 0);
  
  // Choose the appropriate background removal method
  if (useTolerance) {
    backgroundRemover.removeColorWithTolerance(canvas, window.currentState.selectedColor, tolerance);
  } else {
    backgroundRemover.removeExactColor(canvas, window.currentState.selectedColor);
  }
  
  // Replace the spritesheet canvas with our modified version
  window.currentState.spritesheetCanvas = canvas;
  window.currentState.backgroundRemoved = true;
  
  // Update the preview
  const spritesheetPreview = document.getElementById('spritesheetPreview');
  spritesheetPreview.innerHTML = '';
  
  // Adjust display size
  const maxWidth = spritesheetPreview.clientWidth - 40;
  const scale = Math.min(1, maxWidth / canvas.width);
  
  canvas.style.width = (canvas.width * scale) + 'px';
  canvas.style.height = (canvas.height * scale) + 'px';
  
  spritesheetPreview.appendChild(canvas);
  
  window.showAlert('Background color removed successfully!', 'success');
}

export { 
  handleColorChange, 
  handleHexInput, 
  useCommonColor, 
  removeBackground 
};