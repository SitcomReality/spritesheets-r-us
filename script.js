// ... existing code ...

// Function to initialize dropdown menus with presets
function initializeDropdowns() {
  const contentSuggestions = document.getElementById('contentSuggestions');
  const styleOptions = document.getElementById('styleOptions');
  
  // Populate content suggestions dropdown
  if (contentSuggestions) {
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

// Add error and alert display functions
function showError(message) {
  const alertEl = document.createElement('div');
  alertEl.className = 'alert-message error';
  alertEl.textContent = message;
  document.body.appendChild(alertEl);
  
  // Show the alert
  setTimeout(() => alertEl.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    alertEl.classList.remove('show');
    setTimeout(() => document.body.removeChild(alertEl), 300);
  }, 3000);
}

function showAlert(message, type = 'info') {
  const alertEl = document.createElement('div');
  alertEl.className = `alert-message ${type}`;
  alertEl.textContent = message;
  document.body.appendChild(alertEl);
  
  // Show the alert
  setTimeout(() => alertEl.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    alertEl.classList.remove('show');
    setTimeout(() => document.body.removeChild(alertEl), 300);
  }, 3000);
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

// ... existing code ...