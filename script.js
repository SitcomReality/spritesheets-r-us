// Core application initialization
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
  window.currentState = {
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

  // Initialize the UI
  import('./modules/tabs.js').then(module => {
    window.initializeTabs = module.initializeTabs;
    initializeTabs();
  });

  import('./modules/grid.js').then(module => {
    window.createGrids = module.createGrids;
    window.handleUpdateGrid = module.handleUpdateGrid;
    window.validateGridInputs = module.validateGridInputs;
    window.initializeCells = module.initializeCells;
    window.createPromptGrid = module.createPromptGrid;
    window.createImageGrid = module.createImageGrid;
    window.highlightCells = module.highlightCells;
    window.unhighlightCells = module.unhighlightCells;

    // Initialize with imported functions
    createGrids();
  });

  import('./modules/imageGeneration.js').then(module => {
    window.handleGenerateCell = module.handleGenerateCell;
    window.generateCell = module.generateCell;
    window.generateImage = module.generateImage;
    window.handleGenerateAll = module.handleGenerateAll;
    window.generateAllCells = module.generateAllCells;
    window.handleResetAll = module.handleResetAll;
    window.resetAll = module.resetAll;
    window.getFullPromptForCell = module.getFullPromptForCell;
  });

  import('./modules/spritesheet.js').then(module => {
    window.updateSpritesheetPreview = module.updateSpritesheetPreview;
    window.handleDownload = module.handleDownload;
    window.downloadSpritesheet = module.downloadSpritesheet;
    window.updateDownloadResolutionInfo = module.updateDownloadResolutionInfo;

    // Initialize with imported functions
    updateDownloadResolutionInfo();
  });

  import('./modules/styleOverrides.js').then(module => {
    window.updateRowColumnStyleOverrides = module.updateRowColumnStyleOverrides;
    window.createRowStyleOverridesUI = module.createRowStyleOverridesUI;
    window.createColumnStyleOverridesUI = module.createColumnStyleOverridesUI;
    window.showStyleDetails = module.showStyleDetails;

    // Initialize with imported functions
    updateRowColumnStyleOverrides();
  });

  import('./modules/background.js').then(module => {
    window.handleColorChange = module.handleColorChange;
    window.handleHexInput = module.handleHexInput;
    window.useCommonColor = module.useCommonColor;
    window.removeBackground = module.removeBackground;
  });

  import('./modules/export.js').then(module => {
    window.generateCoordsSnippet = module.generateCoordsSnippet;
    window.generateBoundingBoxesSnippet = module.generateBoundingBoxesSnippet;
    window.copyOutputToClipboard = module.copyOutputToClipboard;
  });

  import('./modules/presets.js').then(module => {
    window.initializeDropdowns = module.initializeDropdowns;
    window.updateSavedStylesSelect = module.updateSavedStylesSelect;
    window.updateSavedContentsSelect = module.updateSavedContentsSelect;
    window.populateGridWithPreset = module.populateGridWithPreset;
    window.applyStylePreset = module.applyStylePreset;
    window.saveStyle = module.saveStyle;
    window.loadStyle = module.loadStyle;
    window.saveContent = module.saveContent;
    window.loadContent = module.loadContent;

    // Initialize with imported functions
    initializeDropdowns();
  });

  import('./modules/ui.js').then(module => {
    window.showConfirmation = module.showConfirmation;
    window.handleConfirmation = module.handleConfirmation;
    window.hideModal = module.hideModal;
    window.showModal = module.showModal;
    window.showError = module.showError;
    window.showAlert = module.showAlert;
    window.toggleTheme = module.toggleTheme;
    window.initTheme = module.initTheme;

    // Initialize with imported functions
    initTheme();
  });

  // Event Listeners
  updateGridBtn.addEventListener('click', () => window.handleUpdateGrid());
  generateAllBtn.addEventListener('click', () => window.handleGenerateAll());
  resetAllBtn.addEventListener('click', () => window.handleResetAll());
  downloadBtn.addEventListener('click', () => window.handleDownload());
  confirmYesBtn.addEventListener('click', () => window.handleConfirmation());
  confirmNoBtn.addEventListener('click', () => window.hideModal(confirmationModal));
  updatePreviewBtn.addEventListener('click', () => window.updateSpritesheetPreview());
  colorToRemoveInput.addEventListener('change', (e) => window.handleColorChange(e));
  colorHexInput.addEventListener('input', (e) => window.handleHexInput(e));
  useCommonColorBtn.addEventListener('click', () => window.useCommonColor());
  removeWithToleranceBtn.addEventListener('click', () => window.removeBackground(true));
  saveStyleBtn.addEventListener('click', () => window.saveStyle());
  loadStyleBtn.addEventListener('click', () => window.loadStyle());
  saveContentBtn.addEventListener('click', () => window.saveContent());
  loadContentBtn.addEventListener('click', () => window.loadContent());
  generateCoordsBtn.addEventListener('click', () => window.generateCoordsSnippet());
  generateBoundingBoxesBtn.addEventListener('click', () => window.generateBoundingBoxesSnippet());
  copyToClipboardBtn.addEventListener('click', () => window.copyOutputToClipboard());
  downloadScaleInput.addEventListener('input', () => window.updateDownloadResolutionInfo());

  // Theme toggle
  const themeToggleBtn = document.getElementById('themeToggle');
  themeToggleBtn.addEventListener('click', () => window.toggleTheme());

  // Add event listener for style detail modal close button
  if (styleDetailCloseBtn) {
    styleDetailCloseBtn.addEventListener('click', () => window.hideModal(styleDetailModal));
  }
});