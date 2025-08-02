const { chromium } = require('playwright');

async function takeScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  try {
    // Navigate to the game
    console.log('Navigating to game...');
    await page.goto('http://localhost:5174');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of the start screen
    console.log('Taking start screen screenshot...');
    await page.screenshot({ 
      path: 'screenshots/start-screen.png',
      fullPage: true 
    });
    
    // Click start button to begin game
    console.log('Starting game...');
    await page.click('#startButton');
    
    // Wait a moment for the game to initialize
    await page.waitForTimeout(2000);
    
    // Take screenshot of gameplay
    console.log('Taking gameplay screenshot...');
    await page.screenshot({ 
      path: 'screenshots/gameplay.png',
      fullPage: true 
    });
    
    // Simulate some gameplay (move around, shoot)
    console.log('Simulating gameplay...');
    await page.keyboard.down('KeyW'); // Move forward
    await page.waitForTimeout(1000);
    await page.keyboard.up('KeyW');
    
    // Take another gameplay screenshot
    await page.screenshot({ 
      path: 'screenshots/gameplay-2.png',
      fullPage: true 
    });
    
    // Simulate game over by taking damage
    console.log('Simulating game over...');
    // This would require more complex interaction with the game
    
    console.log('Screenshots taken successfully!');
    
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

takeScreenshots(); 