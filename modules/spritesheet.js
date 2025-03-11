// Spritesheet functionality
function updateSpritesheetPreview() {
  const spritesheetPreview = document.getElementById('spritesheetPreview');
  const downloadBtn = document.getElementById('downloadSpritesheet');
  
  // Clear previous content
  spritesheetPreview.innerHTML = '';
  
  // If no cells have images, show placeholder message
  if (!window.currentState.cells.some(cell => cell.imageUrl)) {
    const placeholder = document.createElement('p');
    placeholder.className = 'empty-message';
    placeholder.textContent = 'Generate images to create a spritesheet';
    spritesheetPreview.appendChild(placeholder);
    return;
  }
  
  // Create a canvas for the spritesheet
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions based on cell count and size
  const canvasWidth = window.currentState.columns * window.currentState.cellWidth;
  const canvasHeight = window.currentState.rows * window.currentState.cellHeight;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Add white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Add the cell images to the canvas
  const loadPromises = [];
  
  window.currentState.cells.forEach(cell => {
    if (cell.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = cell.localUrl || cell.imageUrl;
      
      const promise = new Promise((resolve, reject) => {
        img.onload = () => {
          const x = cell.col * window.currentState.cellWidth;
          const y = cell.row * window.currentState.cellHeight;
          ctx.drawImage(img, x, y, window.currentState.cellWidth, window.currentState.cellHeight);
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image for cell (${cell.row + 1}, ${cell.col + 1})`);
          reject();
        };
      });
      
      loadPromises.push(promise);
    }
  });
  
  // When all images are loaded, append the canvas to the preview
  Promise.all(loadPromises.map(p => p.catch(() => null)))
    .then(() => {
      // Calculate display size to fit in preview area
      const maxWidth = spritesheetPreview.clientWidth - 40; // Account for padding
      const scale = Math.min(1, maxWidth / canvasWidth);
      
      canvas.style.width = (canvasWidth * scale) + 'px';
      canvas.style.height = (canvasHeight * scale) + 'px';
      
      // Save state for download
      window.currentState.spritesheetCanvas = canvas;
      window.currentState.canvasFullSize = false;
      
      spritesheetPreview.appendChild(canvas);
      
      // Update download button state
      downloadBtn.disabled = !window.currentState.cells.every(cell => cell.imageUrl);
      
      // Update download resolution info
      updateDownloadResolutionInfo();
    });
}

function handleDownload() {
  if (!window.currentState.spritesheetCanvas) {
    window.showError("No spritesheet available to download.");
    return;
  }
  
  const downloadScaleInput = document.getElementById('downloadScale');
  const scale = parseFloat(downloadScaleInput.value) || 1.0;
  downloadSpritesheet(scale);
}

function downloadSpritesheet(scale = 1.0) {
  if (!window.currentState.spritesheetCanvas) {
    window.showError("No spritesheet available to download.");
    return;
  }
  
  // Create a new canvas with the scaled dimensions
  const canvas = window.currentState.spritesheetCanvas;
  const scaledWidth = Math.round(canvas.width * scale);
  const scaledHeight = Math.round(canvas.height * scale);
  
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = scaledWidth;
  scaledCanvas.height = scaledHeight;
  
  const ctx = scaledCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);
  
  // Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = scaledCanvas.toDataURL('image/png');
  downloadLink.download = `spritesheet_${window.currentState.rows}x${window.currentState.columns}.png`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function updateDownloadResolutionInfo() {
  const downloadScaleInput = document.getElementById('downloadScale');
  const downloadResolutionInfo = document.getElementById('downloadResolutionInfo');
  
  const scale = parseFloat(downloadScaleInput.value) || 1.0;
  const width = Math.round(window.currentState.columns * window.currentState.cellWidth * scale);
  const height = Math.round(window.currentState.rows * window.currentState.cellHeight * scale);
  downloadResolutionInfo.textContent = `Final resolution: ${width} × ${height} pixels`;
}

export { 
  updateSpritesheetPreview, 
  handleDownload, 
  downloadSpritesheet, 
  updateDownloadResolutionInfo 
};