// UI utilities and theme management
function showConfirmation(title, message, callback) {
  const confirmationModal = document.getElementById('confirmationModal');
  const confirmationTitle = document.getElementById('confirmationTitle');
  const confirmationMessage = document.getElementById('confirmationMessage');
  
  confirmationTitle.textContent = title;
  confirmationMessage.textContent = message;
  confirmationModal.style.display = 'flex';
  
  // Store the callback for when user confirms
  confirmationModal.dataset.callback = callback.name;
}

function handleConfirmation() {
  const confirmationModal = document.getElementById('confirmationModal');
  
  hideModal(confirmationModal);
  
  const callbackName = confirmationModal.dataset.callback;
  if (callbackName === 'generateAllCells') {
    window.generateAllCells();
  } else if (callbackName === 'resetAll') {
    window.resetAll();
  } else if (callbackName === 'generateCell') {
    // Extract the cell index from the callback name if stored
    const cellIndex = parseInt(confirmationModal.dataset.cellIndex);
    if (!isNaN(cellIndex)) {
      window.generateCell(cellIndex);
    }
  }
}

function hideModal(modal) {
  modal.style.display = 'none';
}

function showModal(modal) {
  modal.style.display = 'flex';
}

function showError(message) {
  const errorAlert = document.createElement('div');
  errorAlert.className = 'alert-message error';
  errorAlert.textContent = message;
  document.body.appendChild(errorAlert);
  
  // Show the message
  setTimeout(() => errorAlert.classList.add('show'), 10);
  
  // Hide and remove after delay
  setTimeout(() => {
    errorAlert.classList.remove('show');
    setTimeout(() => errorAlert.remove(), 300);
  }, 3000);
}

function showAlert(message, type = 'info') {
  const alert = document.createElement('div');
  alert.className = `alert-message ${type}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  
  // Show the message
  setTimeout(() => alert.classList.add('show'), 10);
  
  // Hide and remove after delay
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

function toggleTheme() {
  window.currentState.darkMode = !window.currentState.darkMode;
  document.body.classList.toggle('dark-mode', window.currentState.darkMode);
  localStorage.setItem('darkMode', window.currentState.darkMode ? 'true' : 'false');
  
  const themeToggleBtn = document.getElementById('themeToggle');
  themeToggleBtn.innerHTML = window.currentState.darkMode ? '☀️' : '🌙';
}

function initTheme() {
  // Check for saved theme preference
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Set the theme based on saved preference
  window.currentState.darkMode = savedDarkMode;
  document.body.classList.toggle('dark-mode', window.currentState.darkMode);
  
  // Update toggle button
  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = window.currentState.darkMode ? '☀️' : '🌙';
  }
}

export { 
  showConfirmation, 
  handleConfirmation, 
  hideModal, 
  showModal, 
  showError, 
  showAlert, 
  toggleTheme, 
  initTheme 
};