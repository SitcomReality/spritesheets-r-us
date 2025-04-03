// Presets and save/load functionality
function initializeDropdowns() {
  const contentSuggestions = document.getElementById('contentSuggestions');
  const styleOptions = document.getElementById('styleOptions');
  
  // Populate content suggestions dropdown
  if (contentSuggestions) {
    contentSuggestions.innerHTML = '<option value="">-- Select content type --</option>';
    for (const category in contentPresets) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      contentSuggestions.appendChild(option);
    }
    
    // Add event listener for content selection
    contentSuggestions.addEventListener('change', function() {
      if (this.value) {
        populateGridWithPreset(this.value);
      }
    });
  }
  
  // Populate style options dropdown
  if (styleOptions) {
    styleOptions.innerHTML = '<option value="">-- Select art style --</option>';
    for (const style in stylePresets) {
      const option = document.createElement('option');
      option.value = style;
      option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
      styleOptions.appendChild(option);
    }
    
    // Add event listener for style selection
    styleOptions.addEventListener('change', function() {
      if (this.value) {
        applyStylePreset(this.value);
      }
    });
  }
  
  // Initialize saved styles dropdown
  updateSavedStylesSelect();
  
  // Initialize saved contents dropdown
  updateSavedContentsSelect();
}

function updateSavedStylesSelect() {
  const savedStylesSelect = document.getElementById('savedStyles');
  if (!savedStylesSelect) return;
  
  // Clear existing options except the first one
  while (savedStylesSelect.options.length > 1) {
    savedStylesSelect.remove(1);
  }
  
  // Add saved styles from localStorage
  const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
  for (const styleName in savedStyles) {
    const option = document.createElement('option');
    option.value = styleName;
    option.textContent = styleName;
    savedStylesSelect.appendChild(option);
  }
}

function updateSavedContentsSelect() {
  const savedContentsSelect = document.getElementById('savedContents');
  if (!savedContentsSelect) return;
  
  // Clear existing options except the first one
  while (savedContentsSelect.options.length > 1) {
    savedContentsSelect.remove(1);
  }
  
  // Add saved contents from localStorage
  const savedContents = JSON.parse(localStorage.getItem('savedContents') || '{}');
  for (const contentName in savedContents) {
    const option = document.createElement('option');
    option.value = contentName;
    option.textContent = contentName;
    savedContentsSelect.appendChild(option);
  }
}

function populateGridWithPreset(presetName) {
  if (!contentPresets[presetName]) return;
  
  const items = contentPresets[presetName];
  const cellCount = window.currentState.rows * window.currentState.columns;
  const replaceEmptyOnly = document.getElementById('replaceEmptyOnly').checked;
  
  // Reset prompts if needed
  if (confirm(`Replace ${replaceEmptyOnly ? 'empty' : 'all'} cell prompts with ${presetName}?`)) {
    for (let i = 0; i < cellCount; i++) {
      const itemIndex = i % items.length;
      // Skip cells with content if replaceEmptyOnly is checked
      if (replaceEmptyOnly && window.currentState.cells[i].prompt.trim() !== '') {
        continue;
      }
      window.currentState.cells[i].prompt = items[itemIndex];
    }
    
    // Update the UI
    window.createPromptGrid();
  }
}

function applyStylePreset(styleName) {
  if (!stylePresets[styleName]) return;
  
  if (confirm(`Apply the "${styleName}" style to all cells?`)) {
    const prefixPromptInput = document.getElementById('prefixPrompt');
    const suffixPromptInput = document.getElementById('suffixPrompt');
    
    prefixPromptInput.value = stylePresets[styleName].prefix || '';
    suffixPromptInput.value = stylePresets[styleName].suffix || '';
  }
}

function saveStyle() {
  const styleNameInput = document.getElementById('styleName');
  const prefixPromptInput = document.getElementById('prefixPrompt');
  const suffixPromptInput = document.getElementById('suffixPrompt');
  
  const styleName = styleNameInput.value.trim();
  if (!styleName) {
    window.showError("Please enter a name for your style");
    return;
  }
  
  // Get current style
  const style = {
    name: styleName,
    prefix: prefixPromptInput.value.trim(),
    suffix: suffixPromptInput.value.trim()
  };
  
  // Get existing styles from localStorage
  const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
  
  // Add/update the style
  savedStyles[styleName] = style;
  
  // Save back to localStorage
  localStorage.setItem('savedStyles', JSON.stringify(savedStyles));
  
  // Update the dropdown
  updateSavedStylesSelect();
  
  window.showAlert(`Style "${styleName}" saved successfully!`, 'success');
}

function loadStyle() {
  const savedStylesSelect = document.getElementById('savedStyles');
  const prefixPromptInput = document.getElementById('prefixPrompt');
  const suffixPromptInput = document.getElementById('suffixPrompt');
  
  const styleName = savedStylesSelect.value;
  if (!styleName) {
    window.showError("Please select a style to load");
    return;
  }
  
  // Get saved styles from localStorage
  const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
  const style = savedStyles[styleName];
  
  if (!style) {
    window.showError(`Style "${styleName}" not found`);
    return;
  }
  
  // Apply the style
  prefixPromptInput.value = style.prefix || '';
  suffixPromptInput.value = style.suffix || '';
  
  window.showAlert(`Style "${styleName}" loaded successfully!`, 'success');
}

function saveContent() {
  const contentNameInput = document.getElementById('contentName');
  
  const contentName = contentNameInput.value.trim();
  if (!contentName) {
    window.showError("Please enter a name for your content set");
    return;
  }
  
  // Get current cell prompts
  const cellPrompts = window.currentState.cells.map(cell => cell.prompt);
  
  // Get existing content sets from localStorage
  const savedContents = JSON.parse(localStorage.getItem('savedContents') || '{}');
  
  // Add/update the content set
  savedContents[contentName] = {
    name: contentName,
    prompts: cellPrompts,
    rows: window.currentState.rows,
    columns: window.currentState.columns
  };
  
  // Save back to localStorage
  localStorage.setItem('savedContents', JSON.stringify(savedContents));
  
  // Update the dropdown
  updateSavedContentsSelect();
  
  window.showAlert(`Content set "${contentName}" saved successfully!`, 'success');
}

function loadContent() {
  const savedContentsSelect = document.getElementById('savedContents');
  
  const contentName = savedContentsSelect.value;
  if (!contentName) {
    window.showError("Please select a content set to load");
    return;
  }
  
  // Get saved content sets from localStorage
  const savedContents = JSON.parse(localStorage.getItem('savedContents') || '{}');
  const contentSet = savedContents[contentName];
  
  if (!contentSet) {
    window.showError(`Content set "${contentName}" not found`);
    return;
  }
  
  // Check if dimensions match
  if (contentSet.rows !== window.currentState.rows || contentSet.columns !== window.currentState.columns) {
    if (!confirm(`The selected content set is for a ${contentSet.rows}x${contentSet.columns} grid, but your current grid is ${window.currentState.rows}x${window.currentState.columns}. Some content may be lost or repeated. Continue?`)) {
      return;
    }
  }
  
  // Apply the content
  const cellCount = window.currentState.rows * window.currentState.columns;
  for (let i = 0; i < cellCount; i++) {
    if (i < contentSet.prompts.length) {
      window.currentState.cells[i].prompt = contentSet.prompts[i] || '';
    }
  }
  
  // Update the UI
  window.createPromptGrid();
  
  window.showAlert(`Content set "${contentName}" loaded successfully!`, 'success');
}

export { 
  initializeDropdowns, 
  updateSavedStylesSelect, 
  updateSavedContentsSelect, 
  populateGridWithPreset, 
  applyStylePreset, 
  saveStyle, 
  loadStyle, 
  saveContent, 
  loadContent 
};