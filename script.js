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
  const themeToggleBtn = document.getElementById('themeToggle');

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

  console.log("Initial state:", {
    rowStyleOverrides: {...window.currentState.rowStyleOverrides},
    columnStyleOverrides: {...window.currentState.columnStyleOverrides}
  });

  // Initialize all modules first
  const modulesToLoad = [
    './modules/tabs.js',
    './modules/grid.js',
    './modules/imageGeneration.js',
    './modules/spritesheet.js',
    './modules/styleOverrides.js',
    './modules/background.js',
    './modules/export.js',
    './modules/presets.js',
    './modules/ui.js'
  ];

  // Wait for all modules to load before initializing the UI
  Promise.all(modulesToLoad.map(module => import(module)))
    .then(modules => {
      // Tabs module
      window.initializeTabs = modules[0].initializeTabs;
      
      // Grid module
      window.createGrids = modules[1].createGrids;
      window.handleUpdateGrid = modules[1].handleUpdateGrid;
      window.validateGridInputs = modules[1].validateGridInputs;
      window.initializeCells = modules[1].initializeCells;
      window.createPromptGrid = modules[1].createPromptGrid;
      window.createImageGrid = modules[1].createImageGrid;
      window.highlightCells = modules[1].highlightCells;
      window.unhighlightCells = modules[1].unhighlightCells;
      
      // Image generation module
      window.handleGenerateCell = modules[2].handleGenerateCell;
      window.generateCell = modules[2].generateCell;
      window.generateImage = modules[2].generateImage;
      window.handleGenerateAll = modules[2].handleGenerateAll;
      window.generateAllCells = modules[2].generateAllCells;
      window.handleResetAll = modules[2].handleResetAll;
      window.resetAll = modules[2].resetAll;
      window.getFullPromptForCell = modules[2].getFullPromptForCell;
      
      // Spritesheet module
      window.updateSpritesheetPreview = modules[3].updateSpritesheetPreview;
      window.handleDownload = modules[3].handleDownload;
      window.downloadSpritesheet = modules[3].downloadSpritesheet;
      window.updateDownloadResolutionInfo = modules[3].updateDownloadResolutionInfo;
      
      // Style overrides module
      window.updateRowColumnStyleOverrides = modules[4].updateRowColumnStyleOverrides;
      window.createRowStyleOverridesUI = modules[4].createRowStyleOverridesUI;
      window.createColumnStyleOverridesUI = modules[4].createColumnStyleOverridesUI;
      window.showStyleDetails = modules[4].showStyleDetails;
      
      // Background module
      window.handleColorChange = modules[5].handleColorChange;
      window.handleHexInput = modules[5].handleHexInput;
      window.useCommonColor = modules[5].useCommonColor;
      window.removeBackground = modules[5].removeBackground;
      
      // Export module
      window.generateCoordsSnippet = modules[6].generateCoordsSnippet;
      window.generateBoundingBoxesSnippet = modules[6].generateBoundingBoxesSnippet;
      window.copyOutputToClipboard = modules[6].copyOutputToClipboard;
      
      // Presets module
      window.initializeDropdowns = modules[7].initializeDropdowns;
      window.updateSavedStylesSelect = modules[7].updateSavedStylesSelect;
      window.updateSavedContentsSelect = modules[7].updateSavedContentsSelect;
      window.populateGridWithPreset = modules[7].populateGridWithPreset;
      window.applyStylePreset = modules[7].applyStylePreset;
      window.saveStyle = modules[7].saveStyle;
      window.loadStyle = modules[7].loadStyle;
      window.saveContent = modules[7].saveContent;
      window.loadContent = modules[7].loadContent;
      
      // UI module
      window.showConfirmation = modules[8].showConfirmation;
      window.handleConfirmation = modules[8].handleConfirmation;
      window.hideModal = modules[8].hideModal;
      window.showModal = modules[8].showModal;
      window.showError = modules[8].showError;
      window.showAlert = modules[8].showAlert;
      window.toggleTheme = modules[8].toggleTheme;
      window.initTheme = modules[8].initTheme;
      
      // Import sprite rendering module
      import('./modules/spriteRendering.js')
        .then(spriteRendering => {
          window.renderSprite = spriteRendering.renderSprite;
          window.renderSpriteText = spriteRendering.renderSpriteText;
          window.initializeSpriteRendering = spriteRendering.initializeSpriteRendering;
          
          // Initialize sprite rendering after UI is loaded
          window.initializeSpriteRendering();
        })
        .catch(error => console.error('Error loading sprite rendering module:', error));
      
      // Initialize the UI now that all modules are loaded
      window.initializeTabs();
      window.createGrids();
      window.updateDownloadResolutionInfo();
      window.initTheme();
      window.initializeDropdowns();
      
      // Set up event listeners
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
      themeToggleBtn.addEventListener('click', () => window.toggleTheme());
      if (styleDetailCloseBtn) {
        styleDetailCloseBtn.addEventListener('click', () => window.hideModal(styleDetailModal));
      }
    });
});