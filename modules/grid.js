// Grid management functionality
function createGrids() {
  const rowsInput = document.getElementById('rows');
  const columnsInput = document.getElementById('columns');
  const cellWidthInput = document.getElementById('cellWidth');
  const cellHeightInput = document.getElementById('cellHeight');
  
  const rows = parseInt(rowsInput.value);
  const columns = parseInt(columnsInput.value);
  const cellWidth = parseInt(cellWidthInput.value);
  const cellHeight = parseInt(cellHeightInput.value);
  
  if (!validateGridInputs(rows, columns, cellWidth, cellHeight)) {
    return;
  }

  // Initialize cells array if needed
  if (window.currentState.cells.length === 0 || 
      window.currentState.rows !== rows || 
      window.currentState.columns !== columns) {
    initializeCells(rows, columns);
  }

  // Update current state
  window.currentState.rows = rows;
  window.currentState.columns = columns;
  window.currentState.cellWidth = cellWidth;
  window.currentState.cellHeight = cellHeight;
  
  // Update row/column style overrides
  window.updateRowColumnStyleOverrides();

  // Create the grids
  createPromptGrid();
  createImageGrid();
  
  // Update spritesheet preview
  window.updateSpritesheetPreview();
  
  // Initialize theme
  window.initTheme();
}

function handleUpdateGrid() {
  createGrids();
}

function validateGridInputs(rows, columns, width, height) {
  if (isNaN(rows) || rows < 1 || rows > 16 ||
      isNaN(columns) || columns < 1 || columns > 16) {
    window.showError("Grid dimensions must be positive integers between 1 and 16.");
    return false;
  }
  
  if (isNaN(width) || width < 16 || 
      isNaN(height) || height < 16) {
    window.showError("Cell dimensions must be at least 16 pixels.");
    return false;
  }
  
  return true;
}

function initializeCells(rows, columns) {
  window.currentState.cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      window.currentState.cells.push({
        row,
        col,
        prompt: '',
        imageUrl: null,
        localUrl: null,
        isGenerating: false,
        error: null,
        sourceType: 'prompt', // Default source type: 'prompt', 'upload', or 'color'
        backgroundColor: null // For solid color cells
      });
    }
  }
}

function createPromptGrid() {
  const promptGridElement = document.getElementById('promptGrid');
  promptGridElement.innerHTML = '';
  promptGridElement.style.gridTemplateColumns = `repeat(${window.currentState.columns}, 1fr)`;
  
  for (let row = 0; row < window.currentState.rows; row++) {
    for (let col = 0; col < window.currentState.columns; col++) {
      const cellIndex = row * window.currentState.columns + col;
      const cell = window.currentState.cells[cellIndex];
      
      const cellElement = document.createElement('div');
      cellElement.className = 'grid-cell prompt-cell';
      cellElement.dataset.row = row;
      cellElement.dataset.col = col;
      cellElement.dataset.index = cellIndex;
      
      // Add data attributes for style overrides
      const hasRowOverride = !!window.currentState.rowStyleOverrides[row];
      const hasColOverride = !!window.currentState.columnStyleOverrides[col];
      
      if (hasRowOverride) {
        cellElement.dataset.rowOverride = "true";
      }
      
      if (hasColOverride) {
        cellElement.dataset.colOverride = "true";
      }
      
      const label = document.createElement('div');
      label.className = 'prompt-cell-label';
      label.textContent = `Cell (${row + 1}, ${col + 1})`;
      
      // Add style tags to show which styles are applied
      const promptTags = document.createElement('div');
      promptTags.className = 'prompt-tags';
      
      if (hasRowOverride) {
        const rowStyle = window.currentState.rowStyleOverrides[row];
        const rowTag = document.createElement('span');
        rowTag.className = 'prompt-tag row-tag';
        rowTag.textContent = `Row ${row + 1}: ${rowStyle.name || 'Custom Style'}`;
        rowTag.addEventListener('click', () => window.showStyleDetails(rowStyle));
        promptTags.appendChild(rowTag);
      }
      
      if (hasColOverride) {
        const colStyle = window.currentState.columnStyleOverrides[col];
        const colTag = document.createElement('span');
        colTag.className = 'prompt-tag col-tag';
        colTag.textContent = `Col ${col + 1}: ${colStyle.name || 'Custom Style'}`;
        colTag.addEventListener('click', () => window.showStyleDetails(colStyle));
        promptTags.appendChild(colTag);
      }
      
      // Create source selection tabs
      const sourceSelector = document.createElement('div');
      sourceSelector.className = 'cell-source-selector';
      
      // Create tab buttons
      const promptTabButton = document.createElement('button');
      promptTabButton.className = `source-tab-button ${cell.sourceType === 'prompt' || !cell.sourceType ? 'active' : ''}`;
      promptTabButton.textContent = 'Prompt';
      promptTabButton.dataset.sourceType = 'prompt';
      
      const uploadTabButton = document.createElement('button');
      uploadTabButton.className = `source-tab-button ${cell.sourceType === 'upload' ? 'active' : ''}`;
      uploadTabButton.textContent = 'Upload';
      uploadTabButton.dataset.sourceType = 'upload';
      
      const colorTabButton = document.createElement('button');
      colorTabButton.className = `source-tab-button ${cell.sourceType === 'color' ? 'active' : ''}`;
      colorTabButton.textContent = 'Color';
      colorTabButton.dataset.sourceType = 'color';
      
      sourceSelector.appendChild(promptTabButton);
      sourceSelector.appendChild(uploadTabButton);
      sourceSelector.appendChild(colorTabButton);
      
      // Create source content containers
      const promptContent = document.createElement('div');
      promptContent.className = `cell-source-content ${cell.sourceType === 'prompt' || !cell.sourceType ? 'active' : ''}`;
      promptContent.dataset.sourceType = 'prompt';
      
      const uploadContent = document.createElement('div');
      uploadContent.className = `cell-source-content ${cell.sourceType === 'upload' ? 'active' : ''}`;
      uploadContent.dataset.sourceType = 'upload';
      
      const colorContent = document.createElement('div');
      colorContent.className = `cell-source-content ${cell.sourceType === 'color' ? 'active' : ''}`;
      colorContent.dataset.sourceType = 'color';
      
      // Create a visual representation of the full prompt
      const promptPreview = document.createElement('div');
      promptPreview.className = 'cell-prompt-preview';
      promptPreview.textContent = window.getFullPromptForCell(row, col, cell.prompt);
      
      const promptToggle = document.createElement('span');
      promptToggle.className = 'cell-prompt-preview-toggle';
      promptToggle.textContent = 'Show full prompt';
      promptToggle.addEventListener('click', (e) => {
        promptPreview.classList.toggle('expanded');
        promptToggle.textContent = promptPreview.classList.contains('expanded') ? 
          'Hide full prompt' : 'Show full prompt';
        e.stopPropagation();
      });
      
      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Enter prompt for this cell...';
      textarea.value = cell.prompt || '';
      textarea.addEventListener('input', (e) => {
        const index = parseInt(cellElement.dataset.index);
        window.currentState.cells[index].prompt = e.target.value;
        // Update prompt preview
        promptPreview.textContent = window.getFullPromptForCell(row, col, e.target.value);
      });
      
      const generateBtn = document.createElement('button');
      generateBtn.className = 'cell-button primary-button';
      generateBtn.textContent = 'Generate This Cell';
      generateBtn.addEventListener('click', () => window.handleGenerateCell(cellIndex));
      
      // Add elements to prompt content
      promptContent.appendChild(textarea);
      promptContent.appendChild(promptPreview);
      promptContent.appendChild(promptToggle);
      promptContent.appendChild(generateBtn);
      
      // Add upload content
      const uploadInstructions = document.createElement('p');
      uploadInstructions.className = 'upload-instructions';
      uploadInstructions.textContent = 'Upload an image to use for this cell:';
      
      const uploadInput = document.createElement('input');
      uploadInput.type = 'file';
      uploadInput.accept = 'image/*';
      uploadInput.className = 'upload-input';
      uploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = function(loadEvent) {
            const index = parseInt(cellElement.dataset.index);
            window.currentState.cells[index].sourceType = 'upload';
            window.currentState.cells[index].imageUrl = loadEvent.target.result;
            window.currentState.cells[index].localUrl = loadEvent.target.result;
            window.createImageGrid();
            window.updateSpritesheetPreview();
          };
          
          reader.readAsDataURL(file);
        }
      });
      
      const uploadPreview = document.createElement('div');
      uploadPreview.className = 'upload-preview';
      if (cell.sourceType === 'upload' && cell.imageUrl) {
        const img = document.createElement('img');
        img.src = cell.imageUrl;
        img.alt = 'Uploaded image';
        uploadPreview.appendChild(img);
      } else {
        uploadPreview.textContent = 'No image uploaded';
      }
      
      uploadContent.appendChild(uploadInstructions);
      uploadContent.appendChild(uploadInput);
      uploadContent.appendChild(uploadPreview);
      
      // Add color content
      const colorInstructions = document.createElement('p');
      colorInstructions.className = 'color-instructions';
      colorInstructions.textContent = 'Select a solid color for this cell:';
      
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.className = 'color-input';
      colorInput.value = cell.backgroundColor || '#000000';
      colorInput.addEventListener('input', (e) => {
        const index = parseInt(cellElement.dataset.index);
        window.currentState.cells[index].sourceType = 'color';
        window.currentState.cells[index].backgroundColor = e.target.value;
        
        // Generate a solid color image
        const canvas = document.createElement('canvas');
        canvas.width = window.currentState.cellWidth;
        canvas.height = window.currentState.cellHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = e.target.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        window.currentState.cells[index].imageUrl = canvas.toDataURL('image/png');
        window.currentState.cells[index].localUrl = canvas.toDataURL('image/png');
        
        window.createImageGrid();
        window.updateSpritesheetPreview();
      });
      
      const colorPreview = document.createElement('div');
      colorPreview.className = 'color-preview-box';
      colorPreview.style.backgroundColor = cell.backgroundColor || '#000000';
      
      // Update color preview when input changes
      colorInput.addEventListener('input', (e) => {
        colorPreview.style.backgroundColor = e.target.value;
      });
      
      colorContent.appendChild(colorInstructions);
      colorContent.appendChild(colorInput);
      colorContent.appendChild(colorPreview);
      
      // Set up tab button event listeners
      [promptTabButton, uploadTabButton, colorTabButton].forEach(button => {
        button.addEventListener('click', () => {
          // Deactivate all buttons and content
          [promptTabButton, uploadTabButton, colorTabButton].forEach(b => b.classList.remove('active'));
          [promptContent, uploadContent, colorContent].forEach(c => c.classList.remove('active'));
          
          // Activate clicked button and corresponding content
          button.classList.add('active');
          const sourceType = button.dataset.sourceType;
          cellElement.querySelector(`.cell-source-content[data-source-type="${sourceType}"]`).classList.add('active');
          
          // Update cell source type
          const index = parseInt(cellElement.dataset.index);
          window.currentState.cells[index].sourceType = sourceType;
          
          // If switching to color and we have a backgroundColor but no image, generate one
          if (sourceType === 'color' && window.currentState.cells[index].backgroundColor && 
              (!window.currentState.cells[index].imageUrl || window.currentState.cells[index].imageUrl === null)) {
            const canvas = document.createElement('canvas');
            canvas.width = window.currentState.cellWidth;
            canvas.height = window.currentState.cellHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = window.currentState.cells[index].backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Convert canvas to data URL
            window.currentState.cells[index].imageUrl = canvas.toDataURL('image/png');
            window.currentState.cells[index].localUrl = canvas.toDataURL('image/png');
            
            window.createImageGrid();
            window.updateSpritesheetPreview();
          }
        });
      });
      
      // Add all elements to cell
      cellElement.appendChild(label);
      if (hasRowOverride || hasColOverride) {
        cellElement.appendChild(promptTags);
      }
      cellElement.appendChild(sourceSelector);
      cellElement.appendChild(promptContent);
      cellElement.appendChild(uploadContent);
      cellElement.appendChild(colorContent);
      
      // Add hover effect to highlight corresponding cells
      cellElement.addEventListener('mouseenter', () => highlightCells(row, col));
      cellElement.addEventListener('mouseleave', () => unhighlightCells());
      
      promptGridElement.appendChild(cellElement);
    }
  }
}

function createImageGrid() {
  const imageGridElement = document.getElementById('imageGrid');
  const downloadBtn = document.getElementById('downloadSpritesheet');
  
  imageGridElement.innerHTML = '';
  imageGridElement.style.gridTemplateColumns = `repeat(${window.currentState.columns}, 1fr)`;
  
  for (let row = 0; row < window.currentState.rows; row++) {
    for (let col = 0; col < window.currentState.columns; col++) {
      const cellIndex = row * window.currentState.columns + col;
      const cell = window.currentState.cells[cellIndex];
      
      const cellElement = document.createElement('div');
      cellElement.className = 'grid-cell image-cell';
      cellElement.dataset.row = row;
      cellElement.dataset.col = col;
      cellElement.dataset.index = cellIndex;
      cellElement.style.position = 'relative';
      
      // Add row and column numbers for reference
      const rowNumber = document.createElement('div');
      rowNumber.className = 'row-number';
      rowNumber.textContent = row + 1;
      
      const colNumber = document.createElement('div');
      colNumber.className = 'col-number';
      colNumber.textContent = col + 1;
      
      cellElement.appendChild(rowNumber);
      cellElement.appendChild(colNumber);
      
      if (cell.isGenerating) {
        // Show loading indicator
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.style.width = '100%';
        loading.style.height = '100%';
        loading.style.minHeight = `${window.currentState.cellHeight / 4}px`;
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Generating...';
        loadingText.style.marginTop = '10px';
        
        loading.appendChild(spinner);
        loading.appendChild(loadingText);
        cellElement.appendChild(loading);
      } else if (cell.imageUrl) {
        // Show the generated image
        const img = document.createElement('img');
        img.className = 'image-preview';
        img.src = cell.localUrl || cell.imageUrl;
        img.alt = `Image for cell (${row + 1}, ${col + 1})`;
        img.loading = 'lazy';
        
        cellElement.appendChild(img);
        
        // Add regenerate and clear buttons
        const cellControls = document.createElement('div');
        cellControls.className = 'cell-controls';
        
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'cell-button primary-button';
        regenerateBtn.textContent = 'Regenerate';
        regenerateBtn.addEventListener('click', () => window.handleGenerateCell(cellIndex));
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'cell-button secondary-button';
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => {
          cell.imageUrl = null;
          cell.localUrl = null;
          createImageGrid();
          window.updateSpritesheetPreview();
        });
        
        cellControls.appendChild(regenerateBtn);
        cellControls.appendChild(clearBtn);
        cellElement.appendChild(cellControls);
      } else {
        // Show placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.textContent = cell.error || 'No image generated yet';
        placeholder.style.minHeight = `${window.currentState.cellHeight / 4}px`;
        cellElement.appendChild(placeholder);
      }
      
      // Add hover effect to highlight corresponding cells
      cellElement.addEventListener('mouseenter', () => highlightCells(row, col));
      cellElement.addEventListener('mouseleave', () => unhighlightCells());
      
      imageGridElement.appendChild(cellElement);
    }
  }
  
  // Enable or disable the download button based on whether all cells have images
  downloadBtn.disabled = !window.currentState.cells.every(cell => cell.imageUrl);
}

function highlightCells(row, col) {
  const promptGridElement = document.getElementById('promptGrid');
  const imageGridElement = document.getElementById('imageGrid');
  
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
  const promptGridElement = document.getElementById('promptGrid');
  const imageGridElement = document.getElementById('imageGrid');
  
  const promptCells = promptGridElement.querySelectorAll('.grid-cell');
  const imageCells = imageGridElement.querySelectorAll('.grid-cell');
  
  promptCells.forEach(cell => {
    cell.classList.remove('highlight');
  });
  
  imageCells.forEach(cell => {
    cell.classList.remove('highlight');
  });
}

export { 
  createGrids, 
  handleUpdateGrid, 
  validateGridInputs, 
  initializeCells, 
  createPromptGrid, 
  createImageGrid, 
  highlightCells, 
  unhighlightCells 
};