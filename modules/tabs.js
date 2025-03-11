// Tab functionality
function initializeTabs() {
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
}

export { initializeTabs };