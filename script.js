// ... existing code ...

// Initialize the grids
createGrids();
updateDownloadResolutionInfo();
initializeDropdowns();

// Event Listeners
updateGridBtn.addEventListener('click', handleUpdateGrid);
// ... existing code ...

// Initialize dropdowns
function initializeDropdowns() {
  // Initialize style preset dropdown
  const styleOptions = document.getElementById('styleOptions');
  if (styleOptions) {
    for (const style in stylePresets) {
      const option = document.createElement('option');
      option.value = style;
      option.textContent = stylePresets[style].name || style.replace(/([A-Z])/g, ' $1').trim();
      styleOptions.appendChild(option);
    }
    
    styleOptions.addEventListener('change', function() {
      if (this.value) {
        const style = stylePresets[this.value];
        prefixPromptInput.value = style.prefix || '';
        suffixPromptInput.value = style.suffix || '';
      }
    });
  }
  
  // Initialize content preset dropdown
  const contentSuggestions = document.getElementById('contentSuggestions');
  if (contentSuggestions) {
    contentSuggestions.addEventListener('change', function() {
      if (this.value && contentPresets[this.value]) {
        populateGridWithContent(contentPresets[this.value]);
      }
    });
  }
  
  updateSavedStylesSelect();
  updateSavedContentsSelect();
}

function populateGridWithContent(contentArray) {
  const rows = currentState.rows;
  const cols = currentState.columns;
  const maxItems = rows * cols;
  
  // Reset cells prompt data
  for (let i = 0; i < currentState.cells.length; i++) {
    if (i < maxItems) {
      const itemIndex = i % contentArray.length;
      currentState.cells[i].prompt = contentArray[itemIndex];
    }
  }
  
  // Update prompt grid to show the new content
  createPromptGrid();
}

function updateSavedStylesSelect() {
  const savedStylesSelect = document.getElementById('savedStyles');
  if (!savedStylesSelect) return;
  
  // Clear existing options except the first one
  while (savedStylesSelect.options.length > 1) {
    savedStylesSelect.remove(1);
  }
  
  try {
    const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
    
    for (const styleName in savedStyles) {
      const option = document.createElement('option');
      option.value = styleName;
      option.textContent = styleName;
      savedStylesSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Error loading saved styles:', error);
  }
}

function updateSavedContentsSelect() {
  const savedContentsSelect = document.getElementById('savedContents');
  if (!savedContentsSelect) return;
  
  // Clear existing options except the first one
  while (savedContentsSelect.options.length > 1) {
    savedContentsSelect.remove(1);
  }
  
  try {
    const savedContents = JSON.parse(localStorage.getItem('savedContents') || '{}');
    
    for (const contentName in savedContents) {
      const option = document.createElement('option');
      option.value = contentName;
      option.textContent = contentName;
      savedContentsSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Error loading saved contents:', error);
  }
}

function saveContent() {
  try {
    const contentName = contentNameInput.value.trim();
    if (!contentName) {
      showError("Please enter a name for this content preset.");
      return;
    }
    
    // Collect all prompts
    const prompts = currentState.cells.map(cell => cell.prompt || '');
    
    // Get saved contents
    const savedContents = JSON.parse(localStorage.getItem('savedContents') || '{}');
    
    // Add new content
    savedContents[contentName] = prompts;
    
    // Save back to localStorage
    localStorage.setItem('savedContents', JSON.stringify(savedContents));
    
    // Update content dropdown
    updateSavedContentsSelect();
    
    showAlert(`Content preset "${contentName}" saved successfully!`, 'success');
    contentNameInput.value = '';
  } catch (error) {
    console.error('Error saving content:', error);
    showError('Failed to save content preset. ' + error.message);
  }
}

function loadContent() {
  try {
    const contentName = savedContentsSelect.value;
    if (!contentName) {
      showError('Please select a content preset to load.');
      return;
    }
    
    const savedContents = JSON.parse(localStorage.getItem('savedContents') || '{}');
    
    if (!savedContents[contentName]) {
      showError(`Content preset "${contentName}" not found.`);
      return;
    }
    
    // Load the content
    populateGridWithContent(savedContents[contentName]);
    
    showAlert(`Content preset "${contentName}" loaded successfully!`, 'success');
  } catch (error) {
    console.error('Error loading content:', error);
    showError('Failed to load content preset. ' + error.message);
  }
}

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert-message ${type}`;
  alertDiv.textContent = message;
  
  document.body.appendChild(alertDiv);
  
  // Show the alert
  setTimeout(() => {
    alertDiv.classList.add('show');
  }, 10);
  
  // Hide and remove after 3 seconds
  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(alertDiv);
    }, 300);
  }, 3000);
}

function showError(message) {
  showAlert(message, 'error');
}

// ... existing code ...