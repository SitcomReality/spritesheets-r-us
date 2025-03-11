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
  const saveStateBtn = document.getElementById('saveState');
  const loadStateBtn = document.getElementById('loadState');
  const saveCustomStyleBtn = document.getElementById('saveCustomStyle');
  const saveCustomContentBtn = document.getElementById('saveCustomContent');
  const manageCustomSetsBtn = document.getElementById('manageCustomSets');
  const generateCoordsBtn = document.getElementById('generateCoords');
  const generateBoundingBoxesBtn = document.getElementById('generateBoundingBoxes');
  const coordsOutput = document.getElementById('coordsOutput');
  const copyToClipboardBtn = document.getElementById('copyToClipboard');

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
    customStyles: {},    // Store user-created styles
    customContentSets: {} // Store user-created content sets
  };

  // Initialize the grids
  createGrids();
  updateDownloadResolutionInfo();
  loadUserCustomSets(); // Load any saved custom sets

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
  saveStateBtn.addEventListener('click', saveState);
  loadStateBtn.addEventListener('click', loadState);
  saveCustomStyleBtn.addEventListener('click', saveCustomStyle);
  saveCustomContentBtn.addEventListener('click', saveCustomContent);
  manageCustomSetsBtn.addEventListener('click', showManageCustomSetsModal);
  generateCoordsBtn.addEventListener('click', generateCoordsSnippet);
  generateBoundingBoxesBtn.addEventListener('click', generateBoundingBoxesSnippet);
  copyToClipboardBtn.addEventListener('click', copyOutputToClipboard);
  downloadScaleInput.addEventListener('input', updateDownloadResolutionInfo);

  // Add the content suggestion system
  const contentSuggestions = document.getElementById('contentSuggestions');
  const styleOptions = document.getElementById('styleOptions');

  if (contentSuggestions) {
    contentSuggestions.addEventListener('change', function() {
      if (this.value === '') return;
      
      // Check if this is a custom content set
      if (this.value.startsWith('custom_')) {
        const customSetName = this.value.substring(7); // Remove 'custom_' prefix
        if (currentState.customContentSets[customSetName]) {
          populateGrid(currentState.customContentSets[customSetName].content);
        }
      } else {
        const selectedContent = contentPresets[this.value];
        if (selectedContent) {
          populateGrid(selectedContent);
        }
      }
      
      // Reset the select after applying
      this.value = '';
    });
  }

  if (styleOptions) {
    styleOptions.addEventListener('change', function() {
      if (this.value === '') return;
      
      // Check if this is a custom style
      if (this.value.startsWith('custom_')) {
        const customStyleName = this.value.substring(7); // Remove 'custom_' prefix
        if (currentState.customStyles[customStyleName]) {
          prefixPromptInput.value = currentState.customStyles[customStyleName].prefix || '';
          suffixPromptInput.value = currentState.customStyles[customStyleName].suffix || '';
        }
      } else {
        const selectedStyle = stylePresets[this.value];
        if (selectedStyle) {
          if (selectedStyle.prefix) {
            prefixPromptInput.value = selectedStyle.prefix;
          }
          if (selectedStyle.suffix) {
            suffixPromptInput.value = selectedStyle.suffix;
          }
        }
      }
      
      // Reset the select after applying
      this.value = '';
    });
  }

  // Custom styles and content sets functions
  function saveCustomStyle() {
    const prefix = prefixPromptInput.value.trim();
    const suffix = suffixPromptInput.value.trim();
    
    if (!prefix && !suffix) {
      showError("Please enter a prefix or suffix prompt before saving a custom style.");
      return;
    }
    
    showPromptModal(
      "Save Custom Style",
      "Enter a name for this style:",
      (styleName) => {
        if (!styleName.trim()) {
          showError("Style name cannot be empty.");
          return;
        }
        
        // Save the custom style
        if (!currentState.customStyles) currentState.customStyles = {};
        currentState.customStyles[styleName] = {
          prefix: prefix,
          suffix: suffix
        };
        
        // Save to localStorage
        saveCustomSetsToLocalStorage();
        
        // Update the style options dropdown
        updateCustomStylesDropdown();
        
        showSuccessMessage(`Style "${styleName}" saved successfully!`);
      }
    );
  }
  
  function saveCustomContent() {
    // Check if there are any populated prompts
    const hasPopulatedPrompts = currentState.cells.some(cell => cell.prompt.trim() !== '');
    
    if (!hasPopulatedPrompts) {
      showError("Please enter at least one prompt in the grid before saving a custom content set.");
      return;
    }
    
    showPromptModal(
      "Save Custom Content Set",
      "Enter a name for this content set:",
      (contentSetName) => {
        if (!contentSetName.trim()) {
          showError("Content set name cannot be empty.");
          return;
        }
        
        // Extract all non-empty prompts from the grid
        const contentSet = currentState.cells
          .filter(cell => cell.prompt.trim() !== '')
          .map(cell => cell.prompt.trim());
        
        // Save the custom content set
        if (!currentState.customContentSets) currentState.customContentSets = {};
        currentState.customContentSets[contentSetName] = {
          content: contentSet
        };
        
        // Save to localStorage
        saveCustomSetsToLocalStorage();
        
        // Update the content options dropdown
        updateCustomContentDropdown();
        
        showSuccessMessage(`Content set "${contentSetName}" saved successfully!`);
      }
    );
  }
  
  function saveCustomSetsToLocalStorage() {
    try {
      localStorage.setItem('customStyles', JSON.stringify(currentState.customStyles || {}));
      localStorage.setItem('customContentSets', JSON.stringify(currentState.customContentSets || {}));
    } catch (error) {
      console.error('Error saving custom sets to localStorage:', error);
    }
  }
  
  function loadUserCustomSets() {
    try {
      // Load custom styles
      const savedStyles = localStorage.getItem('customStyles');
      if (savedStyles) {
        currentState.customStyles = JSON.parse(savedStyles);
        updateCustomStylesDropdown();
      }
      
      // Load custom content sets
      const savedContentSets = localStorage.getItem('customContentSets');
      if (savedContentSets) {
        currentState.customContentSets = JSON.parse(savedContentSets);
        updateCustomContentDropdown();
      }
    } catch (error) {
      console.error('Error loading custom sets from localStorage:', error);
    }
  }
  
  function updateCustomStylesDropdown() {
    // Clear existing custom options
    Array.from(styleOptions.options).forEach(option => {
      if (option.value.startsWith('custom_')) {
        styleOptions.removeChild(option);
      }
    });
    
    // Make sure we have the separator
    let separatorExists = false;
    Array.from(styleOptions.options).forEach(option => {
      if (option.value === 'customSeparator') {
        separatorExists = true;
      }
    });
    
    if (!separatorExists) {
      const separator = document.createElement('option');
      separator.value = 'customSeparator';
      separator.textContent = '-- Custom Styles --';
      separator.disabled = true;
      styleOptions.appendChild(separator);
    }
    
    // Add custom styles to the dropdown
    if (currentState.customStyles) {
      Object.keys(currentState.customStyles).forEach(styleName => {
        const option = document.createElement('option');
        option.value = 'custom_' + styleName;
        option.textContent = styleName;
        styleOptions.appendChild(option);
      });
    }
  }
  
  function updateCustomContentDropdown() {
    // Clear existing custom options
    Array.from(contentSuggestions.options).forEach(option => {
      if (option.value.startsWith('custom_')) {
        contentSuggestions.removeChild(option);
      }
    });
    
    // Make sure we have the separator
    let separatorExists = false;
    Array.from(contentSuggestions.options).forEach(option => {
      if (option.value === 'customSeparator') {
        separatorExists = true;
      }
    });
    
    if (!separatorExists) {
      const separator = document.createElement('option');
      separator.value = 'customSeparator';
      separator.textContent = '-- Custom Content Sets --';
      separator.disabled = true;
      contentSuggestions.appendChild(separator);
    }
    
    // Add custom content sets to the dropdown
    if (currentState.customContentSets) {
      Object.keys(currentState.customContentSets).forEach(contentSetName => {
        const option = document.createElement('option');
        option.value = 'custom_' + contentSetName;
        option.textContent = contentSetName;
        contentSuggestions.appendChild(option);
      });
    }
  }
  
  function showManageCustomSetsModal() {
    // Create and show a modal for managing custom sets
    let manageModal = document.getElementById('manageCustomSetsModal');
    
    // Create modal if it doesn't exist
    if (!manageModal) {
      manageModal = document.createElement('div');
      manageModal.id = 'manageCustomSetsModal';
      manageModal.className = 'modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.maxWidth = '700px';
      modalContent.style.width = '90%';
      
      modalContent.innerHTML = `
        <h2>Manage Custom Sets</h2>
        <div style="display: flex; margin-bottom: 1rem;">
          <button id="showStylesBtn" class="primary-button" style="flex: 1; margin-right: 0.5rem;">Custom Styles</button>
          <button id="showContentSetsBtn" class="secondary-button" style="flex: 1; margin-left: 0.5rem;">Custom Content Sets</button>
        </div>
        <div id="stylesContainer" style="max-height: 400px; overflow-y: auto;"></div>
        <div id="contentSetsContainer" style="display: none; max-height: 400px; overflow-y: auto;"></div>
        <div class="modal-buttons">
          <button id="closeManageModalBtn" class="primary-button">Close</button>
        </div>
      `;
      
      manageModal.appendChild(modalContent);
      document.body.appendChild(manageModal);
      
      // Add event listeners
      document.getElementById('showStylesBtn').addEventListener('click', () => {
        document.getElementById('stylesContainer').style.display = 'block';
        document.getElementById('contentSetsContainer').style.display = 'none';
        document.getElementById('showStylesBtn').className = 'primary-button';
        document.getElementById('showContentSetsBtn').className = 'secondary-button';
        populateStylesContainer();
      });
      
      document.getElementById('showContentSetsBtn').addEventListener('click', () => {
        document.getElementById('stylesContainer').style.display = 'none';
        document.getElementById('contentSetsContainer').style.display = 'block';
        document.getElementById('showStylesBtn').className = 'secondary-button';
        document.getElementById('showContentSetsBtn').className = 'primary-button';
        populateContentSetsContainer();
      });
      
      document.getElementById('closeManageModalBtn').addEventListener('click', () => {
        hideModal(manageModal);
      });
    }
    
    // Populate the styles container initially
    populateStylesContainer();
    
    // Show the modal
    showModal(manageModal);
  }
  
  function populateStylesContainer() {
    const container = document.getElementById('stylesContainer');
    container.innerHTML = '';
    
    if (!currentState.customStyles || Object.keys(currentState.customStyles).length === 0) {
      container.innerHTML = '<p>No custom styles saved yet.</p>';
      return;
    }
    
    Object.keys(currentState.customStyles).forEach(styleName => {
      const style = currentState.customStyles[styleName];
      
      const styleElement = document.createElement('div');
      styleElement.className = 'custom-set-item';
      styleElement.style.padding = '1rem';
      styleElement.style.marginBottom = '1rem';
      styleElement.style.border = '1px solid var(--border-color)';
      styleElement.style.borderRadius = 'var(--border-radius)';
      
      styleElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <h3 style="margin: 0;">${styleName}</h3>
          <div>
            <button class="apply-style-btn secondary-button" data-name="${styleName}">Apply</button>
            <button class="delete-style-btn secondary-button" data-name="${styleName}">Delete</button>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div>
            <strong>Prefix:</strong> 
            <span style="font-style: italic;">${style.prefix || '(none)'}</span>
          </div>
          <div>
            <strong>Suffix:</strong> 
            <span style="font-style: italic;">${style.suffix || '(none)'}</span>
          </div>
        </div>
      `;
      
      container.appendChild(styleElement);
    });
    
    // Add event listeners for the buttons
    container.querySelectorAll('.apply-style-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const styleName = e.target.dataset.name;
        const style = currentState.customStyles[styleName];
        
        prefixPromptInput.value = style.prefix || '';
        suffixPromptInput.value = style.suffix || '';
        
        showSuccessMessage(`Style "${styleName}" applied.`);
      });
    });
    
    container.querySelectorAll('.delete-style-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const styleName = e.target.dataset.name;
        
        if (confirm(`Are you sure you want to delete the style "${styleName}"?`)) {
          delete currentState.customStyles[styleName];
          saveCustomSetsToLocalStorage();
          updateCustomStylesDropdown();
          populateStylesContainer();
          showSuccessMessage(`Style "${styleName}" deleted.`);
        }
      });
    });
  }
  
  function populateContentSetsContainer() {
    const container = document.getElementById('contentSetsContainer');
    container.innerHTML = '';
    
    if (!currentState.customContentSets || Object.keys(currentState.customContentSets).length === 0) {
      container.innerHTML = '<p>No custom content sets saved yet.</p>';
      return;
    }
    
    Object.keys(currentState.customContentSets).forEach(setName => {
      const contentSet = currentState.customContentSets[setName];
      
      const setElement = document.createElement('div');
      setElement.className = 'custom-set-item';
      setElement.style.padding = '1rem';
      setElement.style.marginBottom = '1rem';
      setElement.style.border = '1px solid var(--border-color)';
      setElement.style.borderRadius = 'var(--border-radius)';
      
      let contentItems = '';
      if (contentSet.content && contentSet.content.length > 0) {
        contentItems = contentSet.content.map(item => `<li>${item}</li>`).join('');
      } else {
        contentItems = '<li>(No items)</li>';
      }
      
      setElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <h3 style="margin: 0;">${setName}</h3>
          <div>
            <button class="apply-content-btn secondary-button" data-name="${setName}">Apply</button>
            <button class="delete-content-btn secondary-button" data-name="${setName}">Delete</button>
          </div>
        </div>
        <div>
          <strong>Items (${contentSet.content ? contentSet.content.length : 0}):</strong>
          <ul style="max-height: 150px; overflow-y: auto;">
            ${contentItems}
          </ul>
        </div>
      `;
      
      container.appendChild(setElement);
    });
    
    // Add event listeners for the buttons
    container.querySelectorAll('.apply-content-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const setName = e.target.dataset.name;
        const contentSet = currentState.customContentSets[setName];
        
        if (contentSet.content && contentSet.content.length > 0) {
          populateGrid(contentSet.content);
          showSuccessMessage(`Content set "${setName}" applied.`);
        } else {
          showError('This content set is empty.');
        }
      });
    });
    
    container.querySelectorAll('.delete-content-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const setName = e.target.dataset.name;
        
        if (confirm(`Are you sure you want to delete the content set "${setName}"?`)) {
          delete currentState.customContentSets[setName];
          saveCustomSetsToLocalStorage();
          updateCustomContentDropdown();
          populateContentSetsContainer();
          showSuccessMessage(`Content set "${setName}" deleted.`);
        }
      });
    });
  }

  function showPromptModal(title, message, callback) {
    let promptModal = document.getElementById('customPromptModal');
    
    // Create modal if it doesn't exist
    if (!promptModal) {
      promptModal = document.createElement('div');
      promptModal.id = 'customPromptModal';
      promptModal.className = 'modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      modalContent.innerHTML = `
        <h2 id="promptModalTitle">Input Required</h2>
        <p id="promptModalMessage"></p>
        <input type="text" id="promptModalInput" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius);">
        <div class="modal-buttons">
          <button id="promptModalSave" class="primary-button">Save</button>
          <button id="promptModalCancel" class="secondary-button">Cancel</button>
        </div>
      `;
      
      promptModal.appendChild(modalContent);
      document.body.appendChild(promptModal);
    }
    
    // Set the title and message
    document.getElementById('promptModalTitle').textContent = title;
    document.getElementById('promptModalMessage').textContent = message;
    
    // Clear the input
    const input = document.getElementById('promptModalInput');
    input.value = '';
    
    // Set up the event listeners
    const saveBtn = document.getElementById('promptModalSave');
    const cancelBtn = document.getElementById('promptModalCancel');
    
    // Remove any existing listeners
    const newSaveBtn = saveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    newSaveBtn.addEventListener('click', () => {
      const value = input.value.trim();
      hideModal(promptModal);
      if (callback) callback(value);
    });
    
    newCancelBtn.addEventListener('click', () => {
      hideModal(promptModal);
    });
    
    // Allow pressing Enter to save
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const value = input.value.trim();
        hideModal(promptModal);
        if (callback) callback(value);
      }
    });
    
    // Show the modal
    showModal(promptModal);
    
    // Focus the input
    setTimeout(() => {
      input.focus();
    }, 100);
  }
  
  function showSuccessMessage(message) {
    let alertBox = document.createElement('div');
    alertBox.className = 'alert-message success';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    
    // Show the message
    setTimeout(() => {
      alertBox.classList.add('show');
    }, 10);
    
    // Hide after a delay
    setTimeout(() => {
      alertBox.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(alertBox);
      }, 300);
    }, 3000);
  }
});