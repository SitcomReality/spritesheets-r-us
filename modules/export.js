// Export functionality
function generateCoordsSnippet() {
  const applyScaleToExportCheckbox = document.getElementById('applyScaleToExport');
  const downloadScaleInput = document.getElementById('downloadScale');
  const coordsOutput = document.getElementById('coordsOutput');
  
  const scale = applyScaleToExportCheckbox.checked ? parseFloat(downloadScaleInput.value) || 1.0 : 1.0;
  const cellWidth = Math.round(window.currentState.cellWidth * scale);
  const cellHeight = Math.round(window.currentState.cellHeight * scale);
  
  let code = `// Spritesheet coordinates for ${window.currentState.rows}x${window.currentState.columns} grid\n`;
  code += `const SPRITE_WIDTH = ${cellWidth};\n`;
  code += `const SPRITE_HEIGHT = ${cellHeight};\n\n`;
  code += `const sprites = {\n`;
  
  const cells = [];
  
  for (let row = 0; row < window.currentState.rows; row++) {
    for (let col = 0; col < window.currentState.columns; col++) {
      const cellIndex = row * window.currentState.columns + col;
      const cell = window.currentState.cells[cellIndex];
      
      if (cell.imageUrl) {
        const fullPrompt = cell.prompt.trim();
        const name = fullPrompt.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 16);
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        cells.push(`  "${name || `sprite_${row}_${col}`}": { x: ${x}, y: ${y}, width: ${cellWidth}, height: ${cellHeight} } // ${fullPrompt}`);
      }
    }
  }
  
  code += cells.join(',\n');
  code += `\n};\n\n`;
  code += `// Usage example:\n`;
  code += `// ctx.drawImage(spritesheet, sprites.sprite_name.x, sprites.sprite_name.y, sprites.sprite_name.width, sprites.sprite_name.height, 0, 0, sprites.sprite_name.width, sprites.sprite_name.height);`;
  
  coordsOutput.value = code;
}

function generateBoundingBoxesSnippet() {
  const applyScaleToExportCheckbox = document.getElementById('applyScaleToExport');
  const downloadScaleInput = document.getElementById('downloadScale');
  const coordsOutput = document.getElementById('coordsOutput');
  
  const scale = applyScaleToExportCheckbox.checked ? parseFloat(downloadScaleInput.value) || 1.0 : 1.0;
  const cellWidth = Math.round(window.currentState.cellWidth * scale);
  const cellHeight = Math.round(window.currentState.cellHeight * scale);
  
  let code = `// Spritesheet bounding boxes for ${window.currentState.rows}x${window.currentState.columns} grid\n`;
  code += `const SPRITESHEET_WIDTH = ${window.currentState.columns * cellWidth};\n`;
  code += `const SPRITESHEET_HEIGHT = ${window.currentState.rows * cellHeight};\n\n`;
  code += `const sprites = {\n`;
  
  const boxes = [];
  
  // Find actual bounding boxes if we have a canvas
  const spritesheetCanvas = window.currentState.spritesheetCanvas;
  
  for (let row = 0; row < window.currentState.rows; row++) {
    for (let col = 0; col < window.currentState.columns; col++) {
      const cellIndex = row * window.currentState.columns + col;
      const cell = window.currentState.cells[cellIndex];
      
      if (cell.imageUrl) {
        let x = col * cellWidth;
        let y = row * cellHeight;
        let width = cellWidth;
        let height = cellHeight;
        
        // Calculate tight bounding box if we have a spritesheet canvas and background was removed
        if (spritesheetCanvas && window.currentState.backgroundRemoved) {
          const bounds = findBoundingBox(spritesheetCanvas, col, row, window.currentState.cellWidth, window.currentState.cellHeight);
          if (bounds) {
            x = col * cellWidth + Math.round(bounds.minX * scale);
            y = row * cellHeight + Math.round(bounds.minY * scale);
            width = Math.round((bounds.maxX - bounds.minX + 1) * scale);
            height = Math.round((bounds.maxY - bounds.minY + 1) * scale);
          }
        }
        
        // Truncate prompt to 16 chars for name but keep original for comment
        const fullPrompt = cell.prompt.trim();
        const name = fullPrompt.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 16);
        
        boxes.push(`  "${name || `sprite_${row}_${col}`}": { x: ${x}, y: ${y}, width: ${width}, height: ${height} } // ${fullPrompt}`);
      }
    }
  }
  
  code += boxes.join(',\n');
  code += `\n};\n\n`;
  code += `// Usage example:\n`;
  code += `// ctx.drawImage(spritesheet, sprites.sprite_name.x, sprites.sprite_name.y, sprites.sprite_name.width, sprites.sprite_name.height, 0, 0, sprites.sprite_name.width, sprites.sprite_name.height);`;
  
  coordsOutput.value = code;
}

// Helper function to find the bounding box of non-transparent pixels in a cell
function findBoundingBox(canvas, col, row, cellWidth, cellHeight) {
  const ctx = canvas.getContext('2d');
  const x = col * cellWidth;
  const y = row * cellHeight;
  
  // Get image data for this cell
  const imageData = ctx.getImageData(x, y, cellWidth, cellHeight);
  const data = imageData.data;
  
  let minX = cellWidth;
  let minY = cellHeight;
  let maxX = 0;
  let maxY = 0;
  let hasOpaquePixels = false;
  
  // Find the bounds of non-transparent pixels
  for (let y = 0; y < cellHeight; y++) {
    for (let x = 0; x < cellWidth; x++) {
      const index = (y * cellWidth + x) * 4;
      const alpha = data[index + 3];
      
      if (alpha > 0) { // Non-transparent pixel
        hasOpaquePixels = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  if (!hasOpaquePixels) {
    return null; // No opaque pixels found
  }
  
  return { minX, minY, maxX, maxY };
}

function copyOutputToClipboard() {
  const coordsOutput = document.getElementById('coordsOutput');
  
  if (coordsOutput.value) {
    coordsOutput.select();
    document.execCommand('copy');
    
    window.showAlert('Code copied to clipboard!', 'success');
  } else {
    window.showError('No code to copy!');
  }
}

export { 
  generateCoordsSnippet, 
  generateBoundingBoxesSnippet, 
  copyOutputToClipboard 
};