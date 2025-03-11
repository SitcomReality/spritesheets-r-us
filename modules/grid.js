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
        error: null
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
      textarea.value = cell.prompt;
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
      
      cellElement.appendChild(label);
      if (hasRowOverride || hasColOverride) {
        cellElement.appendChild(promptTags);
      }
      cellElement.appendChild(textarea);
      cellElement.appendChild(promptPreview);
      cellElement.appendChild(promptToggle);
      cellElement.appendChild(generateBtn);
      
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