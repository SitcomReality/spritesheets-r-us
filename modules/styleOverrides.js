// Style overrides management
function updateRowColumnStyleOverrides() {
  createRowStyleOverridesUI();
  createColumnStyleOverridesUI();
}

function createRowStyleOverridesUI() {
  const rowStyleOverridesContainer = document.getElementById('rowStyleOverrides');
  rowStyleOverridesContainer.innerHTML = '';
  
  console.log("Creating row style overrides UI with current overrides:", window.currentState.rowStyleOverrides);
  
  for (let row = 0; row < window.currentState.rows; row++) {
    const rowOverride = window.currentState.rowStyleOverrides[row] || null;
    
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
    prefixInput.addEventListener('input', () => {
      if (overrideCheckbox.checked && window.currentState.rowStyleOverrides[row]) {
        window.currentState.rowStyleOverrides[row].prefix = prefixInput.value;
        console.log(`Updated row ${row+1} prefix to: "${prefixInput.value}"`);
      }
    });
    
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
    suffixInput.addEventListener('input', () => {
      if (overrideCheckbox.checked && window.currentState.rowStyleOverrides[row]) {
        window.currentState.rowStyleOverrides[row].suffix = suffixInput.value;
        console.log(`Updated row ${row+1} suffix to: "${suffixInput.value}"`);
      }
    });
    
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
    nameInput.addEventListener('input', () => {
      if (overrideCheckbox.checked && window.currentState.rowStyleOverrides[row]) {
        window.currentState.rowStyleOverrides[row].name = nameInput.value || `Row ${row + 1} Style`;
        console.log(`Updated row ${row+1} name to: "${nameInput.value}"`);
      }
    });
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.className = 'secondary-button';
    saveButton.textContent = 'Apply Style';
    saveButton.addEventListener('click', () => {
      if (overrideCheckbox.checked) {
        // Save the style override
        window.currentState.rowStyleOverrides[row] = {
          prefix: prefixInput.value,
          suffix: suffixInput.value,
          name: nameInput.value || `Row ${row + 1} Style`
        };
        
        console.log(`Row ${row+1} style override applied:`, window.currentState.rowStyleOverrides[row]);
        
        // If style has a name, save it to styleOverrides for reuse
        if (nameInput.value) {
          window.currentState.styleOverrides[nameInput.value] = {
            prefix: prefixInput.value,
            suffix: suffixInput.value,
            name: nameInput.value
          };
        }
        
        overrideRow.classList.add('active');
      } else {
        // Remove the style override
        delete window.currentState.rowStyleOverrides[row];
        console.log(`Row ${row+1} style override removed`);
        overrideRow.classList.remove('active');
      }
      
      // Update the prompt grid to reflect changes
      window.createPromptGrid();
    });
    
    // Add save to library button
    const saveToLibraryButton = document.createElement('button');
    saveToLibraryButton.className = 'secondary-button';
    saveToLibraryButton.textContent = 'Save to Library';
    saveToLibraryButton.addEventListener('click', () => {
      if (nameInput.value) {
        // Get existing styles from localStorage
        const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
        
        // Add/update the style
        savedStyles[nameInput.value] = {
          name: nameInput.value,
          prefix: prefixInput.value,
          suffix: suffixInput.value
        };
        
        // Save back to localStorage
        localStorage.setItem('savedStyles', JSON.stringify(savedStyles));
        
        // Update the dropdown
        window.updateSavedStylesSelect();
        
        window.showAlert(`Style "${nameInput.value}" saved to library!`, 'success');
      } else {
        window.showError("Please enter a name for your style");
      }
    });
    
    // Add load from library button 
    const loadFromLibraryButton = document.createElement('button');
    loadFromLibraryButton.className = 'secondary-button';
    loadFromLibraryButton.textContent = 'Load from Library';
    loadFromLibraryButton.addEventListener('click', () => {
      const loadStyleModal = document.getElementById('loadStyleModal');
      const loadStyleSelect = document.getElementById('loadStyleSelect');
      
      // Update the styles dropdown
      window.updateLoadStyleSelect(loadStyleSelect);
      
      // Store the row reference for later use
      loadStyleModal.dataset.targetType = 'row';
      loadStyleModal.dataset.targetIndex = row;
      
      // Show the modal
      window.showModal(loadStyleModal);
    });
    
    // Add apply preset style button
    const applyPresetStyleButton = document.createElement('button');
    applyPresetStyleButton.className = 'secondary-button';
    applyPresetStyleButton.textContent = 'Apply Art Style';
    applyPresetStyleButton.addEventListener('click', () => {
      const presetStyleModal = document.createElement('div');
      presetStyleModal.className = 'modal';
      presetStyleModal.id = 'tempPresetStyleModal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      const modalTitle = document.createElement('h2');
      modalTitle.textContent = 'Select Art Style';
      
      const styleSelect = document.createElement('select');
      styleSelect.className = 'save-name-input';
      styleSelect.style.marginBottom = '1rem';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Select an art style --';
      styleSelect.appendChild(defaultOption);
      
      // Add style presets
      for (const style in window.stylePresets) {
        const option = document.createElement('option');
        option.value = style;
        option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
        styleSelect.appendChild(option);
      }
      
      const modalButtons = document.createElement('div');
      modalButtons.className = 'modal-buttons';
      
      const applyButton = document.createElement('button');
      applyButton.className = 'primary-button';
      applyButton.textContent = 'Apply';
      applyButton.addEventListener('click', () => {
        const selectedStyle = styleSelect.value;
        if (selectedStyle && window.stylePresets[selectedStyle]) {
          prefixInput.value = window.stylePresets[selectedStyle].prefix || '';
          suffixInput.value = window.stylePresets[selectedStyle].suffix || '';
          nameInput.value = selectedStyle;
          
          // If checkbox is checked, also update the override immediately
          if (overrideCheckbox.checked && window.currentState.rowStyleOverrides[row]) {
            window.currentState.rowStyleOverrides[row].prefix = window.stylePresets[selectedStyle].prefix || '';
            window.currentState.rowStyleOverrides[row].suffix = window.stylePresets[selectedStyle].suffix || '';
            window.currentState.rowStyleOverrides[row].name = selectedStyle;
          }
        }
        document.body.removeChild(presetStyleModal);
      });
      
      const cancelButton = document.createElement('button');
      cancelButton.className = 'secondary-button';
      cancelButton.textContent = 'Cancel';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(presetStyleModal);
      });
      
      modalButtons.appendChild(applyButton);
      modalButtons.appendChild(cancelButton);
      
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(styleSelect);
      modalContent.appendChild(modalButtons);
      presetStyleModal.appendChild(modalContent);
      
      document.body.appendChild(presetStyleModal);
      presetStyleModal.style.display = 'flex';
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'override-buttons';
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(saveToLibraryButton);
    buttonContainer.appendChild(loadFromLibraryButton);
    buttonContainer.appendChild(applyPresetStyleButton);
    
    overrideInputs.appendChild(prefixGroup);
    overrideInputs.appendChild(suffixGroup);
    overrideInputs.appendChild(nameGroup);
    overrideInputs.appendChild(buttonContainer);
    
    // Show/hide inputs when checkbox is toggled
    overrideCheckbox.addEventListener('change', () => {
      if (overrideCheckbox.checked) {
        overrideInputs.classList.add('show');
        
        // Also apply the override immediately when checked
        window.currentState.rowStyleOverrides[row] = {
          prefix: prefixInput.value,
          suffix: suffixInput.value,
          name: nameInput.value || `Row ${row + 1} Style`
        };
        
        console.log(`Row ${row+1} style override initially applied on checkbox:`, window.currentState.rowStyleOverrides[row]);
        overrideRow.classList.add('active');
        
        // Update the prompt grid to reflect changes
        window.createPromptGrid();
      } else {
        // Remove the style override when unchecked
        delete window.currentState.rowStyleOverrides[row];
        overrideRow.classList.remove('active');
        overrideInputs.classList.remove('show');
        
        // Update the prompt grid to reflect changes
        window.createPromptGrid();
      }
    });
    
    overrideRow.appendChild(overrideLabel);
    overrideRow.appendChild(overrideControls);
    overrideRow.appendChild(overrideInputs);
    
    rowStyleOverridesContainer.appendChild(overrideRow);
  }
}

function createColumnStyleOverridesUI() {
  const columnStyleOverridesContainer = document.getElementById('columnStyleOverrides');
  columnStyleOverridesContainer.innerHTML = '';
  
  console.log("Creating column style overrides UI with current overrides:", window.currentState.columnStyleOverrides);
  
  for (let col = 0; col < window.currentState.columns; col++) {
    const colOverride = window.currentState.columnStyleOverrides[col] || null;
    
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
    prefixInput.addEventListener('input', () => {
      if (overrideCheckbox.checked && window.currentState.columnStyleOverrides[col]) {
        window.currentState.columnStyleOverrides[col].prefix = prefixInput.value;
        console.log(`Updated column ${col+1} prefix to: "${prefixInput.value}"`);
      }
    });
    
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
    suffixInput.addEventListener('input', () => {
      if (overrideCheckbox.checked && window.currentState.columnStyleOverrides[col]) {
        window.currentState.columnStyleOverrides[col].suffix = suffixInput.value;
        console.log(`Updated column ${col+1} suffix to: "${suffixInput.value}"`);
      }
    });
    
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
    nameInput.addEventListener('input', () => {
      if (overrideCheckbox.checked && window.currentState.columnStyleOverrides[col]) {
        window.currentState.columnStyleOverrides[col].name = nameInput.value || `Column ${col + 1} Style`;
        console.log(`Updated column ${col+1} name to: "${nameInput.value}"`);
      }
    });
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.className = 'secondary-button';
    saveButton.textContent = 'Apply Style';
    saveButton.addEventListener('click', () => {
      if (overrideCheckbox.checked) {
        // Save the style override
        window.currentState.columnStyleOverrides[col] = {
          prefix: prefixInput.value,
          suffix: suffixInput.value,
          name: nameInput.value || `Column ${col + 1} Style`
        };
        
        console.log(`Column ${col+1} style override applied:`, window.currentState.columnStyleOverrides[col]);
        
        // If style has a name, save it to styleOverrides for reuse
        if (nameInput.value) {
          window.currentState.styleOverrides[nameInput.value] = {
            prefix: prefixInput.value,
            suffix: suffixInput.value,
            name: nameInput.value
          };
        }
        
        overrideRow.classList.add('active');
      } else {
        // Remove the style override
        delete window.currentState.columnStyleOverrides[col];
        console.log(`Column ${col+1} style override removed`);
        overrideRow.classList.remove('active');
      }
      
      // Update the prompt grid to reflect changes
      window.createPromptGrid();
    });
    
    // Add save to library button
    const saveToLibraryButton = document.createElement('button');
    saveToLibraryButton.className = 'secondary-button';
    saveToLibraryButton.textContent = 'Save to Library';
    saveToLibraryButton.addEventListener('click', () => {
      if (nameInput.value) {
        // Get existing styles from localStorage
        const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
        
        // Add/update the style
        savedStyles[nameInput.value] = {
          name: nameInput.value,
          prefix: prefixInput.value,
          suffix: suffixInput.value
        };
        
        // Save back to localStorage
        localStorage.setItem('savedStyles', JSON.stringify(savedStyles));
        
        // Update the dropdown
        window.updateSavedStylesSelect();
        
        window.showAlert(`Style "${nameInput.value}" saved to library!`, 'success');
      } else {
        window.showError("Please enter a name for your style");
      }
    });
    
    // Add load from library button 
    const loadFromLibraryButton = document.createElement('button');
    loadFromLibraryButton.className = 'secondary-button';
    loadFromLibraryButton.textContent = 'Load from Library';
    loadFromLibraryButton.addEventListener('click', () => {
      const loadStyleModal = document.getElementById('loadStyleModal');
      const loadStyleSelect = document.getElementById('loadStyleSelect');
      
      // Update the styles dropdown
      window.updateLoadStyleSelect(loadStyleSelect);
      
      // Store the column reference for later use
      loadStyleModal.dataset.targetType = 'column';
      loadStyleModal.dataset.targetIndex = col;
      
      // Show the modal
      window.showModal(loadStyleModal);
    });
    
    // Add apply preset style button
    const applyPresetStyleButton = document.createElement('button');
    applyPresetStyleButton.className = 'secondary-button';
    applyPresetStyleButton.textContent = 'Apply Art Style';
    applyPresetStyleButton.addEventListener('click', () => {
      const presetStyleModal = document.createElement('div');
      presetStyleModal.className = 'modal';
      presetStyleModal.id = 'tempPresetStyleModal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      const modalTitle = document.createElement('h2');
      modalTitle.textContent = 'Select Art Style';
      
      const styleSelect = document.createElement('select');
      styleSelect.className = 'save-name-input';
      styleSelect.style.marginBottom = '1rem';
      
      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Select an art style --';
      styleSelect.appendChild(defaultOption);
      
      // Add style presets
      for (const style in window.stylePresets) {
        const option = document.createElement('option');
        option.value = style;
        option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
        styleSelect.appendChild(option);
      }
      
      const modalButtons = document.createElement('div');
      modalButtons.className = 'modal-buttons';
      
      const applyButton = document.createElement('button');
      applyButton.className = 'primary-button';
      applyButton.textContent = 'Apply';
      applyButton.addEventListener('click', () => {
        const selectedStyle = styleSelect.value;
        if (selectedStyle && window.stylePresets[selectedStyle]) {
          prefixInput.value = window.stylePresets[selectedStyle].prefix || '';
          suffixInput.value = window.stylePresets[selectedStyle].suffix || '';
          nameInput.value = selectedStyle;
          
          // If checkbox is checked, also update the override immediately
          if (overrideCheckbox.checked && window.currentState.columnStyleOverrides[col]) {
            window.currentState.columnStyleOverrides[col].prefix = window.stylePresets[selectedStyle].prefix || '';
            window.currentState.columnStyleOverrides[col].suffix = window.stylePresets[selectedStyle].suffix || '';
            window.currentState.columnStyleOverrides[col].name = selectedStyle;
          }
        }
        document.body.removeChild(presetStyleModal);
      });
      
      const cancelButton = document.createElement('button');
      cancelButton.className = 'secondary-button';
      cancelButton.textContent = 'Cancel';
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(presetStyleModal);
      });
      
      modalButtons.appendChild(applyButton);
      modalButtons.appendChild(cancelButton);
      
      modalContent.appendChild(modalTitle);
      modalContent.appendChild(styleSelect);
      modalContent.appendChild(modalButtons);
      presetStyleModal.appendChild(modalContent);
      
      document.body.appendChild(presetStyleModal);
      presetStyleModal.style.display = 'flex';
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'override-buttons';
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(saveToLibraryButton);
    buttonContainer.appendChild(loadFromLibraryButton);
    buttonContainer.appendChild(applyPresetStyleButton);
    
    overrideInputs.appendChild(prefixGroup);
    overrideInputs.appendChild(suffixGroup);
    overrideInputs.appendChild(nameGroup);
    overrideInputs.appendChild(buttonContainer);
    
    // Show/hide inputs when checkbox is toggled
    overrideCheckbox.addEventListener('change', () => {
      if (overrideCheckbox.checked) {
        overrideInputs.classList.add('show');
        
        // Also apply the override immediately when checked
        window.currentState.columnStyleOverrides[col] = {
          prefix: prefixInput.value,
          suffix: suffixInput.value,
          name: nameInput.value || `Column ${col + 1} Style`
        };
        
        console.log(`Column ${col+1} style override initially applied on checkbox:`, window.currentState.columnStyleOverrides[col]);
        overrideRow.classList.add('active');
        
        // Update the prompt grid to reflect changes
        window.createPromptGrid();
      } else {
        // Remove the style override when unchecked
        delete window.currentState.columnStyleOverrides[col];
        overrideRow.classList.remove('active');
        overrideInputs.classList.remove('show');
        
        // Update the prompt grid to reflect changes
        window.createPromptGrid();
      }
    });
    
    overrideRow.appendChild(overrideLabel);
    overrideRow.appendChild(overrideControls);
    overrideRow.appendChild(overrideInputs);
    
    columnStyleOverridesContainer.appendChild(overrideRow);
  }
}

function showStyleDetails(style) {
  const styleDetailModal = document.getElementById('styleDetailModal');
  const styleDetailTitle = document.getElementById('styleDetailTitle');
  const styleDetailPrefix = document.getElementById('styleDetailPrefix');
  const styleDetailSuffix = document.getElementById('styleDetailSuffix');
  
  if (!style) return;
  
  styleDetailTitle.textContent = style.name || 'Style Details';
  styleDetailPrefix.textContent = style.prefix || '(none)';
  styleDetailSuffix.textContent = style.suffix || '(none)';
  
  window.showModal(styleDetailModal);
}

function updateLoadStyleSelect(selectElement) {
  if (!selectElement) return;
  
  // Clear existing options
  selectElement.innerHTML = '';
  
  // Add a default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Select a style --';
  selectElement.appendChild(defaultOption);
  
  // Get saved styles from localStorage
  const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
  
  // Add each style as an option
  for (const styleName in savedStyles) {
    const option = document.createElement('option');
    option.value = styleName;
    option.textContent = styleName;
    selectElement.appendChild(option);
  }
}

function applyLoadedStyleToOverride(type, index, styleName) {
  // Get saved styles from localStorage
  const savedStyles = JSON.parse(localStorage.getItem('savedStyles') || '{}');
  const style = savedStyles[styleName];
  
  if (!style) {
    window.showError(`Style "${styleName}" not found`);
    return;
  }
  
  // Apply the style to the correct override
  if (type === 'row') {
    window.currentState.rowStyleOverrides[index] = {
      prefix: style.prefix || '',
      suffix: style.suffix || '',
      name: style.name || `Row ${index + 1} Style`
    };
    
    // Update the UI
    createRowStyleOverridesUI();
  } else if (type === 'column') {
    window.currentState.columnStyleOverrides[index] = {
      prefix: style.prefix || '',
      suffix: style.suffix || '',
      name: style.name || `Column ${index + 1} Style`
    };
    
    // Update the UI
    createColumnStyleOverridesUI();
  }
  
  // Update the prompt grid to reflect changes
  window.createPromptGrid();
  
  window.showAlert(`Style "${styleName}" applied successfully!`, 'success');
}

export { 
  updateRowColumnStyleOverrides, 
  createRowStyleOverridesUI, 
  createColumnStyleOverridesUI, 
  showStyleDetails,
  updateLoadStyleSelect,
  applyLoadedStyleToOverride
};