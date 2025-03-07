document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const rowsInput = document.getElementById('rows');
  const columnsInput = document.getElementById('columns');
  const cellWidthInput = document.getElementById('cellWidth');
  const cellHeightInput = document.getElementById('cellHeight');
  const updateGridBtn = document.getElementById('updateGrid');
  const prefixPromptInput = document.getElementById('prefixPrompt');
  const suffixPromptInput = document.getElementById('suffixPrompt');
  const promptGridElement = document.getElementById('promptGrid');
  const imageGridElement = document.getElementById('imageGrid');
  const generateAllBtn = document.getElementById('generateAll');
  const resetAllBtn = document.getElementById('resetAll');
  const downloadBtn = document.getElementById('downloadSpritesheet');
  const spritesheetPreview = document.getElementById('spritesheetPreview');
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmationTitle = document.getElementById('confirmationTitle');
  const confirmationMessage = document.getElementById('confirmationMessage');
  const confirmYesBtn = document.getElementById('confirmYes');
  const confirmNoBtn = document.getElementById('confirmNo');
  const progressModal = document.getElementById('progressModal');
  const progressMessage = document.getElementById('progressMessage');
  const progressBar = document.getElementById('progressBar');
  const updatePreviewBtn = document.getElementById('updatePreview');

  // State
  let currentState = {
    rows: 4,
    columns: 4,
    cellWidth: 64,
    cellHeight: 64,
    cells: [], // Will contain prompt text and image data for each cell
    isGenerating: false,
    darkMode: false
  };

  // Initialize the grids
  createGrids();

  // Event Listeners
  updateGridBtn.addEventListener('click', handleUpdateGrid);
  generateAllBtn.addEventListener('click', handleGenerateAll);
  resetAllBtn.addEventListener('click', handleResetAll);
  downloadBtn.addEventListener('click', handleDownload);
  confirmYesBtn.addEventListener('click', handleConfirmation);
  confirmNoBtn.addEventListener('click', () => hideModal(confirmationModal));
  updatePreviewBtn.addEventListener('click', updateSpritesheetPreview);

  // Theme toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Functions to create and manage the grids
  function createGrids() {
    const rows = parseInt(rowsInput.value);
    const columns = parseInt(columnsInput.value);
    const cellWidth = parseInt(cellWidthInput.value);
    const cellHeight = parseInt(cellHeightInput.value);

    if (!validateGridInputs(rows, columns, cellWidth, cellHeight)) {
      return;
    }

    // Initialize cells array if needed
    if (currentState.cells.length === 0 || 
        currentState.rows !== rows || 
        currentState.columns !== columns) {
      initializeCells(rows, columns);
    }

    // Update current state
    currentState.rows = rows;
    currentState.columns = columns;
    currentState.cellWidth = cellWidth;
    currentState.cellHeight = cellHeight;

    // Create the grids
    createPromptGrid();
    createImageGrid();
    
    // Update spritesheet preview
    updateSpritesheetPreview();
    
    // Initialize theme
    initTheme();
  }

  function validateGridInputs(rows, columns, width, height) {
    if (isNaN(rows) || rows < 1 || rows > 16 ||
        isNaN(columns) || columns < 1 || columns > 16) {
      showError("Grid dimensions must be positive integers between 1 and 16.");
      return false;
    }
    
    if (isNaN(width) || width < 16 || width > 512 ||
        isNaN(height) || height < 16 || height > 512) {
      showError("Cell dimensions must be between 16 and 512 pixels.");
      return false;
    }
    
    return true;
  }

  function initializeCells(rows, columns) {
    currentState.cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        currentState.cells.push({
          row,
          col,
          prompt: '',
          imageUrl: null,
          isGenerating: false,
          error: null
        });
      }
    }
  }

  function createPromptGrid() {
    promptGridElement.innerHTML = '';
    promptGridElement.style.gridTemplateColumns = `repeat(${currentState.columns}, 1fr)`;
    
    for (let row = 0; row < currentState.rows; row++) {
      for (let col = 0; col < currentState.columns; col++) {
        const cellIndex = row * currentState.columns + col;
        const cell = currentState.cells[cellIndex];
        
        const cellElement = document.createElement('div');
        cellElement.className = 'grid-cell prompt-cell';
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;
        cellElement.dataset.index = cellIndex;
        
        const label = document.createElement('div');
        label.className = 'prompt-cell-label';
        label.textContent = `Cell (${row + 1}, ${col + 1})`;
        
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Enter prompt for this cell...';
        textarea.value = cell.prompt;
        textarea.addEventListener('input', (e) => {
          const index = parseInt(cellElement.dataset.index);
          currentState.cells[index].prompt = e.target.value;
        });
        
        const generateBtn = document.createElement('button');
        generateBtn.className = 'cell-button primary-button';
        generateBtn.textContent = 'Generate This Cell';
        generateBtn.addEventListener('click', () => handleGenerateCell(cellIndex));
        
        cellElement.appendChild(label);
        cellElement.appendChild(textarea);
        cellElement.appendChild(generateBtn);
        
        // Add hover effect to highlight corresponding cells
        cellElement.addEventListener('mouseenter', () => highlightCells(row, col));
        cellElement.addEventListener('mouseleave', () => unhighlightCells());
        
        promptGridElement.appendChild(cellElement);
      }
    }
  }

  function createImageGrid() {
    imageGridElement.innerHTML = '';
    imageGridElement.style.gridTemplateColumns = `repeat(${currentState.columns}, 1fr)`;
    
    // Calculate cell size based on available space and grid dimensions
    const containerWidth = imageGridElement.clientWidth || 600;
    const maxCellSize = Math.floor(containerWidth / currentState.columns) - 20; // Subtract for gap
    const cellSize = Math.min(maxCellSize, 200); // Cap at 200px max
    
    for (let row = 0; row < currentState.rows; row++) {
      for (let col = 0; col < currentState.columns; col++) {
        const cellIndex = row * currentState.columns + col;
        const cell = currentState.cells[cellIndex];
        
        const cellElement = document.createElement('div');
        cellElement.className = 'grid-cell image-cell';
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;
        cellElement.dataset.index = cellIndex;
        cellElement.style.width = `${cellSize}px`;
        cellElement.style.height = `${cellSize}px`;
        
        if (cell.isGenerating) {
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'loading';
          
          const spinner = document.createElement('div');
          spinner.className = 'spinner';
          
          const loadingText = document.createElement('p');
          loadingText.textContent = 'Generating...';
          
          loadingDiv.appendChild(spinner);
          loadingDiv.appendChild(loadingText);
          cellElement.appendChild(loadingDiv);
        } else if (cell.imageUrl) {
          const img = document.createElement('img');
          img.className = 'image-preview';
          img.src = cell.imageUrl;
          img.alt = `Generated image for cell (${row + 1}, ${col + 1})`;
          cellElement.appendChild(img);
        } else {
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.textContent = 'No image generated yet';
          cellElement.appendChild(placeholder);
        }
        
        if (cell.error) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = cell.error;
          cellElement.appendChild(errorMsg);
          
          const retryBtn = document.createElement('button');
          retryBtn.className = 'cell-button primary-button';
          retryBtn.textContent = 'Retry';
          retryBtn.addEventListener('click', () => handleGenerateCell(cellIndex));
          cellElement.appendChild(retryBtn);
        }
        
        // Add hover effect to highlight corresponding cells
        cellElement.addEventListener('mouseenter', () => highlightCells(row, col));
        cellElement.addEventListener('mouseleave', () => unhighlightCells());
        
        imageGridElement.appendChild(cellElement);
      }
    }
  }

  function highlightCells(row, col) {
    const promptCells = promptGridElement.querySelectorAll('.grid-cell');
    const imageCells = imageGridElement.querySelectorAll('.grid-cell');
    
    promptCells.forEach(cell => {
      if (parseInt(cell.dataset.row) === row && parseInt(cell.dataset.col) === col) {
        cell.classList.add('highlight');
      }
    });
    
    imageCells.forEach(cell => {
      if (parseInt(cell.dataset.row) === row && parseInt(cell.dataset.col) === col) {
        cell.classList.add('highlight');
      }
    });
  }

  function unhighlightCells() {
    const highlightedCells = document.querySelectorAll('.highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));
  }

  // Event handlers
  function handleUpdateGrid() {
    createGrids();
  }

  function handleGenerateAll() {
    const totalCells = currentState.rows * currentState.columns;
    
    if (currentState.isGenerating) {
      showError("Image generation is already in progress. Please wait.");
      return;
    }
    
    if (!validatePrompts()) {
      return;
    }
    
    showModal(confirmationModal);
    confirmationTitle.textContent = "Generate All Images";
    confirmationMessage.textContent = `This will generate ${totalCells} images. Do you want to proceed?`;
    
    // The confirmation handler will call generateAllCells()
    confirmationCallback = generateAllCells;
  }

  function handleGenerateCell(cellIndex) {
    if (currentState.isGenerating) {
      showError("Image generation is already in progress. Please wait.");
      return;
    }
    
    if (!validatePrompts(cellIndex)) {
      return;
    }
    
    generateCell(cellIndex);
  }

  function handleResetAll() {
    showModal(confirmationModal);
    confirmationTitle.textContent = "Reset All";
    confirmationMessage.textContent = "This will clear all prompts and generated images. Are you sure?";
    
    // The confirmation handler will call resetAll()
    confirmationCallback = resetAll;
  }

  function handleDownload() {
    if (!canDownloadSpritesheet()) {
      showError("Please generate all images before downloading the spritesheet.");
      return;
    }
    
    downloadSpritesheet();
  }

  let confirmationCallback = null;
  function handleConfirmation() {
    hideModal(confirmationModal);
    if (confirmationCallback) {
      confirmationCallback();
      confirmationCallback = null;
    }
  }

  // Validation functions
  function validatePrompts(cellIndex = null) {
    const prefix = prefixPromptInput.value.trim();
    const suffix = suffixPromptInput.value.trim();
    
    if (cellIndex !== null) {
      // Validate single cell
      const cell = currentState.cells[cellIndex];
      if (!cell.prompt.trim()) {
        showError(`Please enter a prompt for cell (${cell.row + 1}, ${cell.col + 1}).`);
        return false;
      }
    } else {
      // Validate all cells
      for (const cell of currentState.cells) {
        if (!cell.prompt.trim()) {
          showError(`Please enter a prompt for cell (${cell.row + 1}, ${cell.col + 1}).`);
          return false;
        }
      }
    }
    
    return true;
  }

  function canDownloadSpritesheet() {
    // Check if all cells have generated images
    return currentState.cells.every(cell => cell.imageUrl !== null);
  }

  // Image generation functions
  async function generateImage(prompt) {
    try {
      // Use the websim.imageGen function from the integration
      return await websim.imageGen({
        prompt: prompt,
        width: currentState.cellWidth,
        height: currentState.cellHeight
      });
    } catch (error) {
      console.error('Image generation API error:', error);
      throw new Error('Failed to generate image. Please try again later.');
    }
  }

  function updateUIForGeneration(isGenerating) {
    generateAllBtn.disabled = isGenerating;
    updateGridBtn.disabled = isGenerating;
    resetAllBtn.disabled = isGenerating;
    updatePreviewBtn.disabled = isGenerating;
    
    // Disable/enable all "Generate This Cell" buttons
    const cellButtons = promptGridElement.querySelectorAll('.cell-button');
    cellButtons.forEach(button => {
      button.disabled = isGenerating;
    });
  }

  async function generateCell(cellIndex, updateUI = true) {
    const cell = currentState.cells[cellIndex];
    const prefix = prefixPromptInput.value.trim();
    const suffix = suffixPromptInput.value.trim();
    const prompt = `${prefix} ${cell.prompt.trim()} ${suffix}`.trim();
    
    // Update cell state
    cell.isGenerating = true;
    cell.error = null;
    
    if (updateUI) {
      createImageGrid(); // Refresh the UI to show loading state
    }
    
    try {
      const result = await generateImage(prompt);
      
      // Update cell state with the generated image
      cell.imageUrl = result.url;
      cell.isGenerating = false;
      
      if (updateUI) {
        createImageGrid();
      }
    } catch (error) {
      console.error('Image generation error:', error);
      cell.error = "Failed to generate image";
      cell.isGenerating = false;
      
      if (updateUI) {
        createImageGrid();
      }
      
      throw error; // Re-throw to handle in the calling function
    }
  }

  async function generateAllCells() {
    currentState.isGenerating = true;
    updateUIForGeneration(true);
    
    const totalCells = currentState.cells.length;
    let completedCells = 0;
    let hasErrors = false;
    
    showModal(progressModal);
    updateProgress(completedCells, totalCells);
    
    for (let i = 0; i < totalCells; i++) {
      try {
        progressMessage.textContent = `Generating image ${completedCells + 1} of ${totalCells}`;
        await generateCell(i, false); // false = don't update UI for each cell (we'll do it once at the end)
        completedCells++;
        updateProgress(completedCells, totalCells);
      } catch (error) {
        console.error(`Error generating cell ${i}:`, error);
        currentState.cells[i].error = "Generation failed";
        hasErrors = true;
        completedCells++;
        updateProgress(completedCells, totalCells);
      }
    }
    
    currentState.isGenerating = false;
    hideModal(progressModal);
    updateUIForGeneration(false);
    
    // Update the UI after all generations are complete
    createImageGrid();
    
    if (hasErrors) {
      showError("Some images failed to generate. You can retry individual cells.");
    } else {
      // Enable download button
      downloadBtn.disabled = false;
    }
  }

  function updateProgress(completed, total) {
    const percentage = (completed / total) * 100;
    progressBar.style.width = `${percentage}%`;
    progressMessage.textContent = `Generating image ${completed} of ${total}`;
  }

  // Spritesheet functions
  function updateSpritesheetPreview() {
    // Clear the current preview
    spritesheetPreview.innerHTML = '';
    
    // Check if we have any generated images
    const hasImages = currentState.cells.some(cell => cell.imageUrl);
    
    if (!hasImages) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'Generate images to create a spritesheet';
      spritesheetPreview.appendChild(emptyMessage);
      return;
    }
    
    // Create the canvas for the spritesheet
    const canvas = document.createElement('canvas');
    canvas.width = currentState.columns * currentState.cellWidth;
    canvas.height = currentState.rows * currentState.cellHeight;
    canvas.style.maxWidth = '100%';  // Make preview responsive
    canvas.style.height = 'auto';    // Maintain aspect ratio
    const ctx = canvas.getContext('2d');
    
    // Add the canvas to the preview
    spritesheetPreview.appendChild(canvas);
    
    // Load and draw all available images
    drawSpritesheetOnCanvas(canvas, ctx);
  }

  function drawSpritesheetOnCanvas(canvas, ctx) {
    let loadedImages = 0;
    const totalCells = currentState.cells.length;
    const images = [];
    
    // Initialize the image array
    for (let i = 0; i < totalCells; i++) {
      images[i] = null;
    }
    
    // Load all images
    currentState.cells.forEach((cell, index) => {
      if (cell.imageUrl) {
        const img = new Image();
        
        // Create a data URL from the cell image to avoid CORS issues
        // This uses the HTML canvas element that's already displaying the image in the grid
        try {
          const imageCell = document.querySelector(`.image-cell[data-row="${cell.row}"][data-col="${cell.col}"] img`);
          if (imageCell) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentState.cellWidth;
            tempCanvas.height = currentState.cellHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(imageCell, 0, 0, currentState.cellWidth, currentState.cellHeight);
            img.src = tempCanvas.toDataURL('image/png');
          } else {
            img.crossOrigin = 'anonymous';
            img.src = cell.imageUrl;
          }
        } catch (e) {
          console.warn('Failed to create local image copy, attempting direct load', e);
          img.crossOrigin = 'anonymous';
          img.src = cell.imageUrl;
        }
        
        img.onload = () => {
          images[index] = img;
          loadedImages++;
          
          // Once all images are loaded, draw them on the canvas
          if (loadedImages === currentState.cells.filter(c => c.imageUrl).length) {
            drawImagesOnCanvas(ctx, images);
          }
        };
        
        img.onerror = () => {
          console.error(`Failed to load image for cell (${cell.row + 1}, ${cell.col + 1})`);
          loadedImages++;
          
          // Continue even if some images fail to load
          if (loadedImages === currentState.cells.filter(c => c.imageUrl).length) {
            drawImagesOnCanvas(ctx, images);
          }
        };
      }
    });
  }

  function drawImagesOnCanvas(ctx, images) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw each image in its proper position
    currentState.cells.forEach((cell, index) => {
      if (images[index]) {
        const x = cell.col * currentState.cellWidth;
        const y = cell.row * currentState.cellHeight;
        ctx.drawImage(images[index], x, y, currentState.cellWidth, currentState.cellHeight);
      }
    });
  }

  function downloadSpritesheet() {
    // Create a canvas for the final spritesheet
    const canvas = document.createElement('canvas');
    canvas.width = currentState.columns * currentState.cellWidth;
    canvas.height = currentState.rows * currentState.cellHeight;
    const ctx = canvas.getContext('2d');
    
    // Load all images and draw them on the canvas
    let loadedImages = 0;
    const totalImages = currentState.cells.length;
    const images = Array(totalImages).fill(null);
    
    currentState.cells.forEach((cell, index) => {
      if (!cell.imageUrl) {
        loadedImages++;
        return;
      }
      
      const img = new Image();
      
      // Use the same CORS workaround as in drawSpritesheetOnCanvas
      try {
        const imageCell = document.querySelector(`.image-cell[data-row="${cell.row}"][data-col="${cell.col}"] img`);
        if (imageCell) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = currentState.cellWidth;
          tempCanvas.height = currentState.cellHeight;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(imageCell, 0, 0, currentState.cellWidth, currentState.cellHeight);
          img.src = tempCanvas.toDataURL('image/png');
        } else {
          img.crossOrigin = 'anonymous';
          img.src = cell.imageUrl;
        }
      } catch (e) {
        console.warn('Failed to create local image copy, attempting direct load', e);
        img.crossOrigin = 'anonymous';
        img.src = cell.imageUrl;
      }
      
      img.onload = () => {
        images[index] = img;
        loadedImages++;
        
        if (loadedImages === totalImages) {
          // Draw all images on the canvas
          currentState.cells.forEach((cell, idx) => {
            if (images[idx]) {
              const x = cell.col * currentState.cellWidth;
              const y = cell.row * currentState.cellHeight;
              ctx.drawImage(images[idx], x, y, currentState.cellWidth, currentState.cellHeight);
            }
          });
          
          // Convert canvas to downloadable data URL
          const dataUrl = canvas.toDataURL('image/png');
          
          // Create a download link
          const downloadLink = document.createElement('a');
          downloadLink.href = dataUrl;
          downloadLink.download = 'spritesheet.png';
          
          // Trigger the download
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      
      img.onerror = () => {
        console.error(`Failed to load image for cell (${cell.row + 1}, ${cell.col + 1})`);
        loadedImages++;
        
        if (loadedImages === totalImages) {
          showError("Some images could not be loaded for the download. Please try regenerating them.");
        }
      };
    });
  }

  // Reset function
  function resetAll() {
    // Reset all cell data
    currentState.cells.forEach(cell => {
      cell.prompt = '';
      cell.imageUrl = null;
      cell.isGenerating = false;
      cell.error = null;
    });
    
    // Reset global prompts
    prefixPromptInput.value = '';
    suffixPromptInput.value = '';
    
    // Reset UI
    createPromptGrid();
    createImageGrid();
    updateSpritesheetPreview();
    
    // Disable download button
    downloadBtn.disabled = true;
  }

  // UI helper functions
  function showError(message) {
    alert(message); // Simple alert for errors - could be replaced with a nicer UI
  }

  function showModal(modal) {
    modal.style.display = 'flex';
  }

  function hideModal(modal) {
    modal.style.display = 'none';
  }

  // Theme functions
  function initTheme() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
      currentState.darkMode = true;
      document.getElementById('themeToggle').textContent = '☀️';
    } else {
      document.getElementById('themeToggle').textContent = '🌙';
    }
  }

  function toggleTheme() {
    currentState.darkMode = !currentState.darkMode;
    document.body.classList.toggle('dark-mode');
    
    if (currentState.darkMode) {
      localStorage.setItem('theme', 'dark');
      document.getElementById('themeToggle').textContent = '☀️';
    } else {
      localStorage.setItem('theme', 'light');
      document.getElementById('themeToggle').textContent = '🌙';
    }
  }
});