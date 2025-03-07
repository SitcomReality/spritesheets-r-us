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
  const colorToRemoveInput = document.getElementById('colorToRemove');
  const colorHexInput = document.getElementById('colorHexInput');
  const colorPreview = document.getElementById('colorPreview');
  const eyedropperToggle = document.getElementById('eyedropperToggle');
  const useCommonColorBtn = document.getElementById('useCommonColor');
  const removeExactColorBtn = document.getElementById('removeExactColor');
  const removeWithToleranceBtn = document.getElementById('removeWithTolerance');
  const toleranceValueInput = document.getElementById('toleranceValue');

  // State
  let currentState = {
    rows: 2,
    columns: 2,
    cellWidth: 1024,
    cellHeight: 1024,
    cells: [], // Will contain prompt text and image data for each cell
    isGenerating: false,
    darkMode: false,
    selectedColor: { r: 255, g: 255, b: 255, hex: '#FFFFFF', rgba: 'rgba(255,255,255,1)' },
    mostCommonColor: { r: 255, g: 255, b: 255, hex: '#FFFFFF', rgba: 'rgba(255,255,255,1)' },
    canvasFullSize: false // New property to track canvas zoom state
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
  colorToRemoveInput.addEventListener('change', handleColorChange);
  colorHexInput.addEventListener('input', handleHexInput);
  useCommonColorBtn.addEventListener('click', useCommonColor);
  removeExactColorBtn.addEventListener('click', () => removeBackground(false));
  removeWithToleranceBtn.addEventListener('click', () => removeBackground(true));

  // Theme toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Functions to create and manage the grids
  function createGrids() {
    const rows = parseInt(rowsInput.value);
    const columns = parseInt(columnsInput.value);
    const cellWidth = parseInt(cellWidthInput.value); // Will always be 1024
    const cellHeight = parseInt(cellHeightInput.value); // Will always be 1024

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
    
    if (isNaN(width) || width < 16 || 
        isNaN(height) || height < 16) {
      showError("Cell dimensions must be at least 16 pixels.");
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
          localUrl: null,
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
          img.src = cell.localUrl || cell.imageUrl; // Use the local URL if available
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
      const result = await websim.imageGen({
        prompt: prompt,
        width: currentState.cellWidth,
        height: currentState.cellHeight
      });
      
      // After getting the result, fetch the image as a blob and create a local URL
      try {
        const response = await fetch(result.url);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        return { ...result, localUrl: objectURL };
      } catch (error) {
        console.warn('Failed to create local URL for image:', error);
        return result;
      }
    } catch (error) {
      console.error('Image generation API error:', error);
      throw new Error('Failed to generate image. Please try again later.');
    }
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
      cell.localUrl = result.localUrl || result.url; // Use the local URL if available
      cell.isGenerating = false;
      
      if (updateUI) {
        createImageGrid();
        updateSpritesheetPreview(); // Update the preview after generating a cell
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
    updateSpritesheetPreview(); // Update spritesheet preview after all cells are generated
    
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
  function downloadSpritesheet() {
    // Use the current preview canvas instead of creating a new one
    const canvas = spritesheetPreview.querySelector('canvas');
    
    if (!canvas) {
      showError("Please generate a spritesheet preview first.");
      return;
    }
    
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
    
    // Create the canvas for the spritesheet with exact dimensions
    const canvas = document.createElement('canvas');
    canvas.width = currentState.columns * currentState.cellWidth;
    canvas.height = currentState.rows * currentState.cellHeight;
    
    setupCanvasZoomToggle(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Add the canvas to the preview
    spritesheetPreview.appendChild(canvas);
    
    // Load and draw all available images
    drawSpritesheetOnCanvas(canvas, ctx);
    
    // Setup eyedropper for the canvas
    backgroundRemover.setupEyedropper(canvas, colorToRemoveInput, eyedropperToggle);
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
        
        // Use the local URL to avoid CORS issues
        if (cell.localUrl) {
          img.src = cell.localUrl;
        } else {
          // For backward compatibility, try to draw from the displayed image
          try {
            const imageCell = document.querySelector(`.image-cell[data-row="${cell.row}"][data-col="${cell.col}"] img`);
            if (imageCell) {
              img.src = imageCell.src;
            } else {
              console.warn(`No image element found for cell (${cell.row + 1}, ${cell.col + 1}), skipping`);
              loadedImages++;
              return;
            }
          } catch (e) {
            console.warn('Failed to find image element, skipping cell', e);
            loadedImages++;
            return;
          }
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

  function setupCanvasZoomToggle(canvas) {
    if (canvas.width > spritesheetPreview.clientWidth) {
      canvas.style.cursor = currentState.canvasFullSize ? 'zoom-out' : 'zoom-in';
      canvas.style.width = currentState.canvasFullSize ? 'auto' : '100%';
      
      // Remove any existing click event listener
      canvas.removeEventListener('click', canvasZoomToggleHandler);
      
      // Add click event to toggle zoom
      canvas.addEventListener('click', canvasZoomToggleHandler);
    } else {
      canvas.style.cursor = 'default';
    }
  }

  function canvasZoomToggleHandler() {
    currentState.canvasFullSize = !currentState.canvasFullSize;
    this.style.cursor = currentState.canvasFullSize ? 'zoom-out' : 'zoom-in';
    this.style.width = currentState.canvasFullSize ? 'auto' : '100%';
  }

  // Reset function
  function resetAll() {
    // Reset all cell data
    currentState.cells.forEach(cell => {
      cell.prompt = '';
      cell.imageUrl = null;
      cell.localUrl = null;
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

  // Background removal functions
  function handleColorChange(e) {
    const colorHex = e.target.value;
    colorHexInput.value = colorHex;
    colorPreview.style.backgroundColor = colorHex;
    
    // Update state with selected color
    const rgb = backgroundRemover.hexToRgb(colorHex);
    currentState.selectedColor = {
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      hex: colorHex,
      rgba: `rgba(${rgb.r},${rgb.g},${rgb.b},1)`
    };
  }
  
  function handleHexInput(e) {
    const value = e.target.value;
    
    // Make sure the value starts with #
    if (!value.startsWith('#')) {
      e.target.value = '#' + value;
    }
    
    // Validate hex format with regex
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(value)) {
      colorToRemoveInput.value = value;
      colorPreview.style.backgroundColor = value;
      
      // Update state with selected color
      const rgb = backgroundRemover.hexToRgb(value);
      currentState.selectedColor = {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        hex: value,
        rgba: `rgba(${rgb.r},${rgb.g},${rgb.b},1)`
      };
    }
  }
  
  function useCommonColor() {
    const canvas = spritesheetPreview.querySelector('canvas');
    if (!canvas) {
      showError("Please generate a spritesheet preview first.");
      return;
    }
    
    // Find the most common color in the canvas
    const mostCommonColor = backgroundRemover.findMostCommonColor(canvas);
    currentState.mostCommonColor = mostCommonColor;
    
    // Update the UI
    colorToRemoveInput.value = mostCommonColor.hex;
    colorHexInput.value = mostCommonColor.hex;
    colorPreview.style.backgroundColor = mostCommonColor.hex;
    
    // Update the button text
    useCommonColorBtn.textContent = `Use Most Common Color (${mostCommonColor.hex})`;
    
    // Update state with selected color
    currentState.selectedColor = mostCommonColor;
  }
  
  function removeBackground(useTolerance) {
    const canvas = spritesheetPreview.querySelector('canvas');
    if (!canvas) {
      showError("Please generate a spritesheet preview first.");
      return;
    }
    
    // Clone the canvas to avoid modifying the original
    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = canvas.width;
    clonedCanvas.height = canvas.height;
    const ctx = clonedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    
    if (useTolerance) {
      // Show loading modal
      showModal(progressModal);
      progressMessage.textContent = "Removing background with tolerance...";
      progressBar.style.width = "50%";
      
      // Use setTimeout to allow the UI to update before the heavy processing
      setTimeout(() => {
        const tolerance = parseInt(toleranceValueInput.value) || 30;
        backgroundRemover.removeColorWithTolerance(clonedCanvas, currentState.selectedColor, tolerance);
        
        // Replace the original canvas
        canvas.parentNode.replaceChild(clonedCanvas, canvas);
        
        // Setup eyedropper for the new canvas
        backgroundRemover.setupEyedropper(clonedCanvas, colorToRemoveInput, eyedropperToggle);
        
        setupCanvasZoomToggle(clonedCanvas);
        
        hideModal(progressModal);
      }, 100);
    } else {
      // Exact color removal is fast enough to not need a loading indicator
      backgroundRemover.removeExactColor(clonedCanvas, currentState.selectedColor);
      
      // Replace the original canvas
      canvas.parentNode.replaceChild(clonedCanvas, canvas);
      
      // Setup eyedropper for the new canvas
      backgroundRemover.setupEyedropper(clonedCanvas, colorToRemoveInput, eyedropperToggle);
      
      setupCanvasZoomToggle(clonedCanvas);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    colorHexInput.value = currentState.selectedColor.hex;
    colorPreview.style.backgroundColor = currentState.selectedColor.hex;
    
    // Initialize event listeners for color inputs
    colorToRemoveInput.addEventListener('change', handleColorChange);
    colorHexInput.addEventListener('input', handleHexInput);
  });

  // Add the content suggestion system
  const contentSuggestions = document.getElementById('contentSuggestions');
  const styleOptions = document.getElementById('styleOptions');

  if (contentSuggestions) {
    contentSuggestions.addEventListener('change', function() {
      if (this.value === '') return;
      
      const selectedContent = contentPresets[this.value];
      if (selectedContent) {
        populateGrid(selectedContent);
      }
      
      // Reset the select after applying
      this.value = '';
    });
  }

  if (styleOptions) {
    styleOptions.addEventListener('change', function() {
      if (this.value === '') return;
      
      const selectedStyle = stylePresets[this.value];
      if (selectedStyle) {
        if (selectedStyle.prefix) {
          prefixPromptInput.value = selectedStyle.prefix;
        }
        if (selectedStyle.suffix) {
          suffixPromptInput.value = selectedStyle.suffix;
        }
      }
      
      // Reset the select after applying
      this.value = '';
    });
  }

  function populateGrid(contentSet) {
    // Create a copy of the contentSet to draw from randomly
    const contentCopy = [...contentSet];
    
    // Reset all cells first
    currentState.cells.forEach(cell => {
      cell.prompt = '';
    });
    
    // Fill grid with content from the preset
    for (let i = 0; i < currentState.cells.length; i++) {
      if (contentCopy.length > 0) {
        // Select a random index from the remaining content
        const randomIndex = Math.floor(Math.random() * contentCopy.length);
        // Assign the content and remove it from the array
        currentState.cells[i].prompt = contentCopy[randomIndex];
        contentCopy.splice(randomIndex, 1);
      } else {
        // If we run out of content, use random items from the original set
        const randomIndex = Math.floor(Math.random() * contentSet.length);
        currentState.cells[i].prompt = contentSet[randomIndex];
      }
    }
    
    // Update the prompt grid to show the new content
    createPromptGrid();
  }

  // Clean up function for when images are no longer needed
  function cleanupImageURLs() {
    currentState.cells.forEach(cell => {
      if (cell.localUrl && cell.localUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cell.localUrl);
      }
    });
  }

  // Add event listener to clean up on page unload
  window.addEventListener('beforeunload', cleanupImageURLs);
});