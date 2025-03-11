// ... existing code ...

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
  const downloadScaleInput = document.getElementById('downloadScale');
  const downloadResolutionInfo = document.getElementById('downloadResolutionInfo');
  const applyScaleToExportCheckbox = document.getElementById('applyScaleToExport');
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
  const removeWithToleranceBtn = document.getElementById('removeWithTolerance');
  const toleranceValueInput = document.getElementById('toleranceValue');
  const saveStyleBtn = document.getElementById('saveStyle');
  const loadStyleBtn = document.getElementById('loadStyle');
  const saveContentBtn = document.getElementById('saveContent');
  const loadContentBtn = document.getElementById('loadContent');
  const generateCoordsBtn = document.getElementById('generateCoords');
  const generateBoundingBoxesBtn = document.getElementById('generateBoundingBoxes');
  const coordsOutput = document.getElementById('coordsOutput');
  const copyToClipboardBtn = document.getElementById('copyToClipboard');
  const styleNameInput = document.getElementById('styleName');
  const contentNameInput = document.getElementById('contentName');
  const savedStylesSelect = document.getElementById('savedStyles');
  const savedContentsSelect = document.getElementById('savedContents');
  const rowStyleOverridesContainer = document.getElementById('rowStyleOverrides');
  const columnStyleOverridesContainer = document.getElementById('columnStyleOverrides');
  const styleDetailModal = document.getElementById('styleDetailModal');
  const styleDetailTitle = document.getElementById('styleDetailTitle');
  const styleDetailPrefix = document.getElementById('styleDetailPrefix');
  const styleDetailSuffix = document.getElementById('styleDetailSuffix');
  const styleDetailCloseBtn = document.getElementById('styleDetailClose');

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
    canvasFullSize: false, // New property to track canvas zoom state
    backgroundRemoved: false, // Track if background removal has been applied
    rowStyleOverrides: {},  // For storing per-row style overrides
    columnStyleOverrides: {}, // For storing per-column style overrides
    styleOverrides: {} // For tracking all named style overrides
  };

  // Initialize tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show corresponding content
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // Add event listener for style detail modal close button
  if (styleDetailCloseBtn) {
    styleDetailCloseBtn.addEventListener('click', () => hideModal(styleDetailModal));
  }

  // Add tab functionality for row/column overrides
  const overrideTabButtons = document.querySelectorAll('#rowColumnStyles .tab-button');
  const overrideTabContents = document.querySelectorAll('#rowColumnStyles .tab-content');
  
  overrideTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      overrideTabButtons.forEach(btn => btn.classList.remove('active'));
      overrideTabContents.forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // Initialize the grids
  createGrids();
  updateDownloadResolutionInfo();
  initializeDropdowns();

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
  removeWithToleranceBtn.addEventListener('click', () => removeBackground(true));
  saveStyleBtn.addEventListener('click', saveStyle);
  loadStyleBtn.addEventListener('click', loadStyle);
  saveContentBtn.addEventListener('click', saveContent);
  loadContentBtn.addEventListener('click', loadContent);
  generateCoordsBtn.addEventListener('click', generateCoordsSnippet);
  generateBoundingBoxesBtn.addEventListener('click', generateBoundingBoxesSnippet);
  copyToClipboardBtn.addEventListener('click', copyOutputToClipboard);
  downloadScaleInput.addEventListener('input', updateDownloadResolutionInfo);

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
    
    // Update row/column style overrides
    updateRowColumnStyleOverrides();

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
        
        // Add data attributes for style overrides
        const hasRowOverride = !!currentState.rowStyleOverrides[row];
        const hasColOverride = !!currentState.columnStyleOverrides[col];
        
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
          const rowStyle = currentState.rowStyleOverrides[row];
          const rowTag = document.createElement('span');
          rowTag.className = 'prompt-tag row-tag';
          rowTag.textContent = `Row ${row + 1}: ${rowStyle.name || 'Custom Style'}`;
          rowTag.addEventListener('click', () => showStyleDetails(rowStyle));
          promptTags.appendChild(rowTag);
        }
        
        if (hasColOverride) {
          const colStyle = currentState.columnStyleOverrides[col];
          const colTag = document.createElement('span');
          colTag.className = 'prompt-tag col-tag';
          colTag.textContent = `Col ${col + 1}: ${colStyle.name || 'Custom Style'}`;
          colTag.addEventListener('click', () => showStyleDetails(colStyle));
          promptTags.appendChild(colTag);
        }
        
        // Create a visual representation of the full prompt
        const promptPreview = document.createElement('div');
        promptPreview.className = 'cell-prompt-preview';
        promptPreview.textContent = getFullPromptForCell(row, col, cell.prompt);
        
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
          currentState.cells[index].prompt = e.target.value;
          // Update prompt preview
          promptPreview.textContent = getFullPromptForCell(row, col, e.target.value);
        });
        
        const generateBtn = document.createElement('button');
        generateBtn.className = 'cell-button primary-button';
        generateBtn.textContent = 'Generate This Cell';
        generateBtn.addEventListener('click', () => handleGenerateCell(cellIndex));
        
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

  // ... existing code ...

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

  // ... existing code ...

  function createImageGrid() {
    imageGridElement.innerHTML = '';
    imageGridElement.style.gridTemplateColumns = `repeat(${currentState.columns}, 1fr)`;
    
    for (let row = 0; row < currentState.rows; row++) {
      for (let col = 0; col < currentState.columns; col++) {
        const cellIndex = row * currentState.columns + col;
        const cell = currentState.cells[cellIndex];
        
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
          regenerateBtn.addEventListener('click', () => handleGenerateCell(cellIndex));
          
          const clearBtn = document.createElement('button');
          clearBtn.className = 'cell-button secondary-button';
          clearBtn.textContent = 'Clear';
          clearBtn.addEventListener('click', () => {
            cell.imageUrl = null;
            cell.localUrl = null;
            createImageGrid();
            updateSpritesheetPreview();
          });
          
          cellControls.appendChild(regenerateBtn);
          cellControls.appendChild(clearBtn);
          cellElement.appendChild(cellControls);
        } else {
          // Show placeholder
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.textContent = cell.error || 'No image generated yet';
          cellElement.appendChild(placeholder);
        }
        
        // Add hover effect to highlight corresponding cells
        cellElement.addEventListener('mouseenter', () => highlightCells(row, col));
        cellElement.addEventListener('mouseleave', () => unhighlightCells());
        
        imageGridElement.appendChild(cellElement);
      }
    }
    
    // Enable or disable the download button based on whether all cells have images
    downloadBtn.disabled = !currentState.cells.every(cell => cell.imageUrl);
  }

  function unhighlightCells() {
    const promptCells = promptGridElement.querySelectorAll('.grid-cell');
    const imageCells = imageGridElement.querySelectorAll('.grid-cell');
    
    promptCells.forEach(cell => {
      cell.classList.remove('highlight');
    });
    
    imageCells.forEach(cell => {
      cell.classList.remove('highlight');
    });
  }

  // ... existing code ...

  // Functions for row/column style overrides
  function updateRowColumnStyleOverrides() {
    createRowStyleOverridesUI();
    createColumnStyleOverridesUI();
  }
  
  function createRowStyleOverridesUI() {
    rowStyleOverridesContainer.innerHTML = '';
    
    for (let row = 0; row < currentState.rows; row++) {
      const rowOverride = currentState.rowStyleOverrides[row] || null;
      
      const overrideRow = document.createElement('div');
      overrideRow.className = 'override-row';
      overrideRow.classList.toggle('active', !!rowOverride);
      
      const overrideLabel = document.createElement('div');
      overrideLabel.className = 'override-label';
      overrideLabel.textContent = `Row ${row + 1}`;
      
      const overrideControls = document.createElement('div');
      overrideControls.className = 'override-controls';
      
      const overrideToggle = document.createElement('div');
      overrideToggle.className = 'override-toggle';
      
      const overrideCheckbox = document.createElement('input');
      overrideCheckbox.type = 'checkbox';
      overrideCheckbox.id = `row-override-${row}`;
      overrideCheckbox.checked = !!rowOverride;
      
      const overrideToggleLabel = document.createElement('label');
      overrideToggleLabel.htmlFor = `row-override-${row}`;
      overrideToggleLabel.textContent = 'Override Style';
      
      overrideToggle.appendChild(overrideCheckbox);
      overrideToggle.appendChild(overrideToggleLabel);
      
      overrideControls.appendChild(overrideToggle);
      
      if (rowOverride) {
        const styleName = document.createElement('span');
        styleName.className = 'style-name';
        styleName.textContent = rowOverride.name || 'Custom Style';
        styleName.addEventListener('click', () => showStyleDetails(rowOverride));
        
        overrideControls.appendChild(styleName);
      }
      
      const overrideInputs = document.createElement('div');
      overrideInputs.className = 'override-inputs';
      if (rowOverride) overrideInputs.classList.add('show');
      
      // Prefix input
      const prefixGroup = document.createElement('div');
      prefixGroup.className = 'override-input';
      
      const prefixLabel = document.createElement('label');
      prefixLabel.textContent = 'Row Prefix:';
      
      const prefixInput = document.createElement('textarea');
      prefixInput.placeholder = 'Enter prefix prompt for this row...';
      prefixInput.value = rowOverride?.prefix || '';
      
      prefixGroup.appendChild(prefixLabel);
      prefixGroup.appendChild(prefixInput);
      
      // Suffix input
      const suffixGroup = document.createElement('div');
      suffixGroup.className = 'override-input';
      
      const suffixLabel = document.createElement('label');
      suffixLabel.textContent = 'Row Suffix:';
      
      const suffixInput = document.createElement('textarea');
      suffixInput.placeholder = 'Enter suffix prompt for this row...';
      suffixInput.value = rowOverride?.suffix || '';
      
      suffixGroup.appendChild(suffixLabel);
      suffixGroup.appendChild(suffixInput);
      
      // Name input
      const nameGroup = document.createElement('div');
      nameGroup.className = 'override-input';
      
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Style Name:';
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Name this style (optional)';
      nameInput.value = rowOverride?.name || '';
      
      nameGroup.appendChild(nameLabel);
      nameGroup.appendChild(nameInput);
      
      // Add save button
      const saveButton = document.createElement('button');
      saveButton.className = 'secondary-button';
      saveButton.textContent = 'Apply Style';
      saveButton.addEventListener('click', () => {
        if (overrideCheckbox.checked) {
          // Save the style override
          currentState.rowStyleOverrides[row] = {
            prefix: prefixInput.value,
            suffix: suffixInput.value,
            name: nameInput.value || `Row ${row + 1} Style`
          };
          
          // If style has a name, save it to styleOverrides for reuse
          if (nameInput.value) {
            currentState.styleOverrides[nameInput.value] = {
              prefix: prefixInput.value,
              suffix: suffixInput.value,
              name: nameInput.value
            };
          }
          
          overrideRow.classList.add('active');
        } else {
          // Remove the style override
          delete currentState.rowStyleOverrides[row];
          overrideRow.classList.remove('active');
        }
        
        // Update the prompt grid to reflect changes
        createPromptGrid();
      });
      
      overrideInputs.appendChild(prefixGroup);
      overrideInputs.appendChild(suffixGroup);
      overrideInputs.appendChild(nameGroup);
      overrideInputs.appendChild(saveButton);
      
      // Show/hide inputs when checkbox is toggled
      overrideCheckbox.addEventListener('change', () => {
        if (overrideCheckbox.checked) {
          overrideInputs.classList.add('show');
        } else {
          overrideInputs.classList.remove('show');
        }
      });
      
      overrideRow.appendChild(overrideLabel);
      overrideRow.appendChild(overrideControls);
      overrideRow.appendChild(overrideInputs);
      
      rowStyleOverridesContainer.appendChild(overrideRow);
    }
  }
  
  function createColumnStyleOverridesUI() {
    columnStyleOverridesContainer.innerHTML = '';
    
    for (let col = 0; col < currentState.columns; col++) {
      const colOverride = currentState.columnStyleOverrides[col] || null;
      
      const overrideRow = document.createElement('div');
      overrideRow.className = 'override-row';
      overrideRow.classList.toggle('active', !!colOverride);
      
      const overrideLabel = document.createElement('div');
      overrideLabel.className = 'override-label';
      overrideLabel.textContent = `Column ${col + 1}`;
      
      const overrideControls = document.createElement('div');
      overrideControls.className = 'override-controls';
      
      const overrideToggle = document.createElement('div');
      overrideToggle.className = 'override-toggle';
      
      const overrideCheckbox = document.createElement('input');
      overrideCheckbox.type = 'checkbox';
      overrideCheckbox.id = `col-override-${col}`;
      overrideCheckbox.checked = !!colOverride;
      
      const overrideToggleLabel = document.createElement('label');
      overrideToggleLabel.htmlFor = `col-override-${col}`;
      overrideToggleLabel.textContent = 'Override Style';
      
      overrideToggle.appendChild(overrideCheckbox);
      overrideToggle.appendChild(overrideToggleLabel);
      
      overrideControls.appendChild(overrideToggle);
      
      if (colOverride) {
        const styleName = document.createElement('span');
        styleName.className = 'style-name';
        styleName.textContent = colOverride.name || 'Custom Style';
        styleName.addEventListener('click', () => showStyleDetails(colOverride));
        
        overrideControls.appendChild(styleName);
      }
      
      const overrideInputs = document.createElement('div');
      overrideInputs.className = 'override-inputs';
      if (colOverride) overrideInputs.classList.add('show');
      
      // Prefix input
      const prefixGroup = document.createElement('div');
      prefixGroup.className = 'override-input';
      
      const prefixLabel = document.createElement('label');
      prefixLabel.textContent = 'Column Prefix:';
      
      const prefixInput = document.createElement('textarea');
      prefixInput.placeholder = 'Enter prefix prompt for this column...';
      prefixInput.value = colOverride?.prefix || '';
      
      prefixGroup.appendChild(prefixLabel);
      prefixGroup.appendChild(prefixInput);
      
      // Suffix input
      const suffixGroup = document.createElement('div');
      suffixGroup.className = 'override-input';
      
      const suffixLabel = document.createElement('label');
      suffixLabel.textContent = 'Column Suffix:';
      
      const suffixInput = document.createElement('textarea');
      suffixInput.placeholder = 'Enter suffix prompt for this column...';
      suffixInput.value = colOverride?.suffix || '';
      
      suffixGroup.appendChild(suffixLabel);
      suffixGroup.appendChild(suffixInput);
      
      // Name input
      const nameGroup = document.createElement('div');
      nameGroup.className = 'override-input';
      
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Style Name:';
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Name this style (optional)';
      nameInput.value = colOverride?.name || '';
      
      nameGroup.appendChild(nameLabel);
      nameGroup.appendChild(nameInput);
      
      // Add save button
      const saveButton = document.createElement('button');
      saveButton.className = 'secondary-button';
      saveButton.textContent = 'Apply Style';
      saveButton.addEventListener('click', () => {
        if (overrideCheckbox.checked) {
          // Save the style override
          currentState.columnStyleOverrides[col] = {
            prefix: prefixInput.value,
            suffix: suffixInput.value,
            name: nameInput.value || `Column ${col + 1} Style`
          };
          
          // If style has a name, save it to styleOverrides for reuse
          if (nameInput.value) {
            currentState.styleOverrides[nameInput.value] = {
              prefix: prefixInput.value,
              suffix: suffixInput.value,
              name: nameInput.value
            };
          }
          
          overrideRow.classList.add('active');
        } else {
          // Remove the style override
          delete currentState.columnStyleOverrides[col];
          overrideRow.classList.remove('active');
        }
        
        // Update the prompt grid to reflect changes
        createPromptGrid();
      });
      
      overrideInputs.appendChild(prefixGroup);
      overrideInputs.appendChild(suffixGroup);
      overrideInputs.appendChild(nameGroup);
      overrideInputs.appendChild(saveButton);
      
      // Show/hide inputs when checkbox is toggled
      overrideCheckbox.addEventListener('change', () => {
        if (overrideCheckbox.checked) {
          overrideInputs.classList.add('show');
        } else {
          overrideInputs.classList.remove('show');
        }
      });
      
      overrideRow.appendChild(overrideLabel);
      overrideRow.appendChild(overrideControls);
      overrideRow.appendChild(overrideInputs);
      
      columnStyleOverridesContainer.appendChild(overrideRow);
    }
  }
  
  function showStyleDetails(style) {
    if (!style) return;
    
    styleDetailTitle.textContent = style.name || 'Style Details';
    styleDetailPrefix.textContent = style.prefix || '(none)';
    styleDetailSuffix.textContent = style.suffix || '(none)';
    
    showModal(styleDetailModal);
  }
  
  function getFullPromptForCell(rowIndex, colIndex, cellPrompt) {
    const globalPrefix = prefixPromptInput.value.trim();
    const globalSuffix = suffixPromptInput.value.trim();
    
    const rowOverride = currentState.rowStyleOverrides[rowIndex];
    const colOverride = currentState.columnStyleOverrides[colIndex];
    
    const prefixParts = [];
    const suffixParts = [];
    
    // Add column prefix if it exists
    if (colOverride && colOverride.prefix) {
      prefixParts.push(colOverride.prefix.trim());
    } else if (globalPrefix) {
      prefixParts.push(globalPrefix);
    }
    
    // Add row prefix if it exists
    if (rowOverride && rowOverride.prefix) {
      prefixParts.push(rowOverride.prefix.trim());
    } else if (!colOverride?.prefix && globalPrefix && prefixParts.length === 0) {
      prefixParts.push(globalPrefix);
    }
    
    // Add column suffix if it exists
    if (colOverride && colOverride.suffix) {
      suffixParts.push(colOverride.suffix.trim());
    } else if (globalSuffix) {
      suffixParts.push(globalSuffix);
    }
    
    // Add row suffix if it exists
    if (rowOverride && rowOverride.suffix) {
      suffixParts.push(rowOverride.suffix.trim());
    } else if (!colOverride?.suffix && globalSuffix && suffixParts.length === 0) {
      suffixParts.push(globalSuffix);
    }
    
    // Build the final prompt
    const prefix = prefixParts.join(' ');
    const suffix = suffixParts.join(' ');
    
    let finalPrompt = '';
    if (prefix) finalPrompt += `${prefix} `;
    finalPrompt += cellPrompt.trim();
    if (suffix) finalPrompt += ` ${suffix}`;
    
    return finalPrompt.trim();
  }

  // ... existing code ...

  async function generateCell(cellIndex, updateUI = true) {
    const cell = currentState.cells[cellIndex];
    const row = cell.row;
    const col = cell.col;
    const prompt = getFullPromptForCell(row, col, cell.prompt);
    
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

  // ... existing code ...

  function saveStyle() {
    try {
      const styleName = styleNameInput.value.trim();
      if (!styleName) {
        showError("Please enter a name for this style preset.");
        return;
      }

      // Get all saved styles
      const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
      
      // Add new style
      savedStyles[styleName] = {
        prefix: prefixPromptInput.value,
        suffix: suffixPromptInput.value,
        name: styleName
      };
      
      // Save back to localStorage
      localStorage.setItem('savedStyles', JSON.stringify(savedStyles));
      
      // Add to styleOverrides for potential row/column use
      currentState.styleOverrides[styleName] = {
        prefix: prefixPromptInput.value,
        suffix: suffixPromptInput.value,
        name: styleName
      };
      
      // Update style dropdown
      updateStyleDropdown();
      updateSavedStylesSelect();
      
      showAlert(`Style preset "${styleName}" saved successfully!`, 'success');
      styleNameInput.value = '';
    } catch (error) {
      console.error('Error saving style:', error);
      showError('Failed to save style preset. ' + error.message);
    }
  }
  
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
    
    // Reset row and column style overrides
    currentState.rowStyleOverrides = {};
    currentState.columnStyleOverrides = {};
    
    // Update UI
    createPromptGrid();
    createImageGrid();
    updateSpritesheetPreview();
    updateRowColumnStyleOverrides();
    
    // Disable download button
    downloadBtn.disabled = true;
  }

  // ... existing code ...

  function loadStyle() {
    try {
      const styleName = savedStylesSelect.value;
      if (!styleName) {
        showError('Please select a style to load.');
        return;
      }
      
      const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
      
      if (!savedStyles[styleName]) {
        showError(`Style "${styleName}" not found.`);
        return;
      }
      
      // Load the style
      prefixPromptInput.value = savedStyles[styleName].prefix || '';
      suffixPromptInput.value = savedStyles[styleName].suffix || '';
      
      showAlert(`Style preset "${styleName}" loaded successfully!`, 'success');
    } catch (error) {
      console.error('Error loading style:', error);
      showError('Failed to load style preset. ' + error.message);
    }
  }

  // ... existing code ...
});