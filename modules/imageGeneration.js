// Image generation functionality
function getFullPromptForCell(rowIndex, colIndex, cellPrompt) {
  const prefixPromptInput = document.getElementById('prefixPrompt');
  const suffixPromptInput = document.getElementById('suffixPrompt');
  
  const globalPrefix = prefixPromptInput.value.trim();
  const globalSuffix = suffixPromptInput.value.trim();
  
  const rowOverride = window.currentState.rowStyleOverrides[rowIndex] || null;
  const colOverride = window.currentState.columnStyleOverrides[colIndex] || null;
  
  let prefixToUse = globalPrefix;
  let suffixToUse = globalSuffix;
  
  // Apply row override prefix if it exists
  if (rowOverride && rowOverride.prefix) {
    prefixToUse = rowOverride.prefix.trim();
  }
  
  // Apply column override prefix if it exists (column overrides take precedence over row)
  if (colOverride && colOverride.prefix) {
    prefixToUse = colOverride.prefix.trim();
  }
  
  // Apply row override suffix if it exists
  if (rowOverride && rowOverride.suffix) {
    suffixToUse = rowOverride.suffix.trim();
  }
  
  // Apply column override suffix if it exists (column overrides take precedence over row)
  if (colOverride && colOverride.suffix) {
    suffixToUse = colOverride.suffix.trim();
  }
  
  // Build the final prompt
  let finalPrompt = '';
  if (prefixToUse) finalPrompt += `${prefixToUse} `;
  finalPrompt += cellPrompt.trim();
  if (suffixToUse) finalPrompt += ` ${suffixToUse}`;
  
  return finalPrompt.trim();
}

function handleGenerateCell(cellIndex) {
  // Show confirmation for single cell generation
  if (window.currentState.cells[cellIndex].imageUrl) {
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.dataset.cellIndex = cellIndex;
    
    window.showConfirmation(
      "Regenerate Image",
      "Are you sure you want to regenerate this image?",
      generateCell
    );
  } else {
    generateCell(cellIndex);
  }
}

async function generateCell(cellIndex, updateUI = true) {
  const cell = window.currentState.cells[cellIndex];
  const row = cell.row;
  const col = cell.col;
  const prompt = getFullPromptForCell(row, col, cell.prompt);
  
  // Update cell state
  cell.isGenerating = true;
  cell.error = null;
  
  if (updateUI) {
    window.createImageGrid(); // Refresh the UI to show loading state
  }
  
  try {
    const result = await generateImage(prompt);
    
    // Update cell state with the generated image
    cell.imageUrl = result.url;
    cell.localUrl = result.localUrl || result.url; // Use the local URL if available
    cell.isGenerating = false;
    
    if (updateUI) {
      window.createImageGrid();
      window.updateSpritesheetPreview(); // Update the preview after generating a cell
    }
  } catch (error) {
    console.error('Image generation error:', error);
    cell.error = "Failed to generate image";
    cell.isGenerating = false;
    
    if (updateUI) {
      window.createImageGrid();
    }
    
    throw error; // Re-throw to handle in the calling function
  }
}

async function generateImage(prompt) {
  try {
    console.log('Generating image with prompt:', prompt);
    const result = await websim.imageGen({
      prompt: prompt,
      aspect_ratio: "1:1",
    });
    
    return { 
      url: result.url,
      localUrl: result.url
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

function handleGenerateAll() {
  window.showConfirmation(
    "Generate All Images",
    `Are you sure you want to generate images for all ${window.currentState.rows * window.currentState.columns} cells?`,
    generateAllCells
  );
}

async function generateAllCells() {
  const progressModal = document.getElementById('progressModal');
  const progressBar = document.getElementById('progressBar');
  const progressMessage = document.getElementById('progressMessage');
  const generateAllBtn = document.getElementById('generateAll');
  const resetAllBtn = document.getElementById('resetAll');
  const updateGridBtn = document.getElementById('updateGrid');
  
  // Show progress modal
  progressModal.style.display = 'flex';
  progressBar.style.width = '0%';
  
  const totalCells = window.currentState.rows * window.currentState.columns;
  let completedCells = 0;
  
  // Disable buttons while generating
  generateAllBtn.disabled = true;
  resetAllBtn.disabled = true;
  updateGridBtn.disabled = true;
  
  try {
    for (let i = 0; i < totalCells; i++) {
      progressMessage.textContent = `Generating image ${completedCells + 1} of ${totalCells}`;
      progressBar.style.width = (completedCells / totalCells * 100) + '%';
      
      try {
        await generateCell(i, false); // Don't update UI for each cell
        completedCells++;
      } catch (error) {
        console.error(`Error generating cell ${i}:`, error);
        // Continue with next cell even if one fails
      }
    }
    
    // Update the UI after all generations
    window.createImageGrid();
    window.updateSpritesheetPreview();
    
    window.showAlert(`Generated ${completedCells} of ${totalCells} images successfully.`, 'success');
  } catch (error) {
    console.error('Error in batch generation:', error);
    window.showError('Error generating all images: ' + error.message);
  } finally {
    // Re-enable buttons
    generateAllBtn.disabled = false;
    resetAllBtn.disabled = false;
    updateGridBtn.disabled = false;
    
    // Hide progress modal
    progressModal.style.display = 'none';
  }
}

function handleResetAll() {
  window.showConfirmation(
    "Reset All Cells",
    "Are you sure you want to reset all cells? This will clear all images and prompts.",
    resetAll
  );
}

function resetAll() {
  // Clear all cells
  window.currentState.cells.forEach(cell => {
    cell.imageUrl = null;
    cell.localUrl = null;
    cell.prompt = '';
    cell.isGenerating = false;
    cell.error = null;
  });
  
  // Update the UI
  window.createPromptGrid();
  window.createImageGrid();
  window.updateSpritesheetPreview();
  
  window.showAlert('All cells reset successfully', 'success');
}

export { 
  handleGenerateCell, 
  generateCell, 
  generateImage, 
  handleGenerateAll, 
  generateAllCells, 
  handleResetAll, 
  resetAll,
  getFullPromptForCell
};