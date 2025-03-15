// Sprite rendering utilities
const spritesheetData = {
  width: 1024,
  height: 1024,
  sprites: {
    "letter__s_": { x: 89, y: 69, width: 81, height: 118 },
    "letter__p_": { x: 352, y: 84, width: 80, height: 107 },
    "letter__r_": { x: 588, y: 51, width: 112, height: 149 },
    "letter__i_": { x: 883, y: 62, width: 31, height: 96 },
    "letter__t_": { x: 68, y: 306, width: 114, height: 134 },
    "letter__e_": { x: 331, y: 318, width: 111, height: 130 },
    "letter__h_": { x: 582, y: 286, width: 110, height: 154 },
    "letter__u_": { x: 821, y: 327, width: 131, height: 119 },
    "number__1_": { x: 60, y: 566, width: 113, height: 150 },
    "number__2_": { x: 335, y: 583, width: 99, height: 115 },
    "number__3_": { x: 574, y: 547, width: 148, height: 182 },
    "number__4_": { x: 847, y: 573, width: 92, height: 125 },
    "number__5_": { x: 67, y: 816, width: 126, height: 152 },
    "number__6_": { x: 328, y: 835, width: 124, height: 127 },
    "number__7_": { x: 600, y: 835, width: 118, height: 143 },
    "number__8_": { x: 841, y: 825, width: 98, height: 143 }
  }
};

// Render sprite to a DOM element
function renderSprite(elementId, spriteName, scale = 0.4) {
  const container = document.getElementById(elementId);
  if (!container) return;
  
  const sprite = spritesheetData.sprites[spriteName];
  if (!sprite) return;
  
  // Calculate scaled dimensions
  const width = sprite.width * scale;
  const height = sprite.height * scale;
  
  // Create sprite element
  const spriteElement = document.createElement('div');
  spriteElement.className = 'sprite';
  spriteElement.style.width = `${width}px`;
  spriteElement.style.height = `${height}px`;
  spriteElement.style.backgroundImage = `url('spritesheets_r_us_spritesheet.png')`;
  spriteElement.style.backgroundSize = `${spritesheetData.width * scale}px ${spritesheetData.height * scale}px`;
  spriteElement.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
  spriteElement.style.display = 'inline-block';
  
  container.appendChild(spriteElement);
}

// Render text using sprites
function renderSpriteText(containerId, text, scale = 0.4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear the container
  container.innerHTML = '';
  
  // Set container style for sprite text
  container.className = 'sprite-text-container';
  
  // For each character in the text
  for (const char of text.toLowerCase()) {
    if (char === ' ') {
      // Add space
      const spaceElement = document.createElement('div');
      spaceElement.className = 'sprite-space';
      spaceElement.style.width = `${30 * scale}px`;
      spaceElement.style.display = 'inline-block';
      container.appendChild(spaceElement);
    } else if (char >= 'a' && char <= 'z') {
      // Find the sprite name for the letter
      const spriteName = `letter__${char}_`;
      if (spritesheetData.sprites[spriteName]) {
        const sprite = spritesheetData.sprites[spriteName];
        
        // Calculate scaled dimensions
        const width = sprite.width * scale;
        const height = sprite.height * scale;
        
        // Create sprite element
        const spriteElement = document.createElement('div');
        spriteElement.className = 'sprite';
        spriteElement.style.width = `${width}px`;
        spriteElement.style.height = `${height}px`;
        spriteElement.style.backgroundImage = `url('spritesheets_r_us_spritesheet.png')`;
        spriteElement.style.backgroundSize = `${spritesheetData.width * scale}px ${spritesheetData.height * scale}px`;
        spriteElement.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
        spriteElement.style.display = 'inline-block';
        
        container.appendChild(spriteElement);
      }
    } else if (char >= '1' && char <= '8') {
      // Find the sprite name for the number
      const spriteName = `number__${char}_`;
      if (spritesheetData.sprites[spriteName]) {
        const sprite = spritesheetData.sprites[spriteName];
        
        // Calculate scaled dimensions
        const width = sprite.width * scale;
        const height = sprite.height * scale;
        
        // Create sprite element
        const spriteElement = document.createElement('div');
        spriteElement.className = 'sprite';
        spriteElement.style.width = `${width}px`;
        spriteElement.style.height = `${height}px`;
        spriteElement.style.backgroundImage = `url('spritesheets_r_us_spritesheet.png')`;
        spriteElement.style.backgroundSize = `${spritesheetData.width * scale}px ${spritesheetData.height * scale}px`;
        spriteElement.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
        spriteElement.style.display = 'inline-block';
        
        container.appendChild(spriteElement);
      }
    }
  }
}

// Initialize all sprite elements
function initializeSpriteRendering() {
  // Render the title
  renderSpriteText('siteTitle', 'spritesheetsrus', 0.5);
  
  // Replace section numbers with sprite numbers
  const sectionNumbers = document.querySelectorAll('.section-number');
  sectionNumbers.forEach(section => {
    const number = section.textContent;
    section.innerHTML = '';
    section.style.width = 'auto';
    section.style.height = 'auto';
    section.style.background = 'none';
    
    const spriteName = `number__${number}_`;
    if (spritesheetData.sprites[spriteName]) {
      const sprite = spritesheetData.sprites[spriteName];
      
      // Use a smaller scale for section numbers
      const scale = 0.25;
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      
      // Create sprite element
      const spriteElement = document.createElement('div');
      spriteElement.className = 'sprite';
      spriteElement.style.width = `${width}px`;
      spriteElement.style.height = `${height}px`;
      spriteElement.style.backgroundImage = `url('spritesheets_r_us_spritesheet.png')`;
      spriteElement.style.backgroundSize = `${spritesheetData.width * scale}px ${spritesheetData.height * scale}px`;
      spriteElement.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
      
      section.appendChild(spriteElement);
    }
  });
  
  // Add sprite numbers to tutorial steps
  const tutorialStepNumbers = document.querySelectorAll('.tutorial-step .step-number');
  tutorialStepNumbers.forEach(numberElement => {
    const number = numberElement.textContent;
    numberElement.innerHTML = '';
    
    const spriteName = `number__${number}_`;
    if (spritesheetData.sprites[spriteName]) {
      const sprite = spritesheetData.sprites[spriteName];
      
      // Use a smaller scale for tutorial step numbers
      const scale = 0.2;
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      
      // Create sprite element
      const spriteElement = document.createElement('div');
      spriteElement.className = 'sprite';
      spriteElement.style.width = `${width}px`;
      spriteElement.style.height = `${height}px`;
      spriteElement.style.backgroundImage = `url('spritesheets_r_us_spritesheet.png')`;
      spriteElement.style.backgroundSize = `${spritesheetData.width * scale}px ${spritesheetData.height * scale}px`;
      spriteElement.style.backgroundPosition = `-${sprite.x * scale}px -${sprite.y * scale}px`;
      
      numberElement.appendChild(spriteElement);
    }
  });
}

// Export functions
export { renderSprite, renderSpriteText, initializeSpriteRendering };