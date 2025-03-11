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
        const name = cell.prompt.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        cells.push(`  "${name || `sprite_${row}_${col}`}": { x: ${x}, y: ${y}, width: ${cellWidth}, height: ${cellHeight} }`);
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
  code += `const spriteBoundingBoxes = [\n`;
  
  const boxes = [];
  
  for (let row = 0; row < window.currentState.rows; row++) {
    for (let col = 0; col < window.currentState.columns; col++) {
      const cellIndex = row * window.currentState.columns + col;
      const cell = window.currentState.cells[cellIndex];
      
      if (cell.imageUrl) {
        const name = cell.prompt.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        boxes.push(`  { 
    name: "${name || `sprite_${row}_${col}`}",
    x: ${x}, 
    y: ${y}, 
    width: ${cellWidth}, 
    height: ${cellHeight},
    row: ${row},
    column: ${col}
  }`);
      }
    }
  }
  
  code += boxes.join(',\n');
  code += `\n];\n\n`;
  code += `// Usage example:\n`;
  code += `// const sprite = spriteBoundingBoxes.find(box => box.name === 'sprite_name');\n`;
  code += `// ctx.drawImage(spritesheet, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);`;
  
  coordsOutput.value = code;
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