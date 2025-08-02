const { chromium } = require('playwright');

async function testStartButton() {
    console.log('🚀 Testing Start Game button...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to the game
        console.log('📱 Navigating to game...');
        await page.goto('http://localhost:3002');
        
        // Wait for the start screen to load
        await page.waitForSelector('#startScreen', { timeout: 10000 });
        console.log('✅ Start screen loaded');
        
        // Check if start button exists
        const startButton = await page.$('#startButton');
        if (startButton) {
            console.log('✅ Start button found');
        } else {
            console.log('❌ Start button not found');
            return;
        }
        
        // Click Start Game button
        console.log('🎮 Clicking Start Game button...');
        await page.click('#startButton');
        
        // Wait for game to initialize
        await page.waitForTimeout(3000);
        console.log('✅ Waited for game initialization');
        
        // Check if start screen is hidden
        const startScreen = await page.$('#startScreen');
        if (startScreen) {
            const display = await startScreen.evaluate(el => window.getComputedStyle(el).display);
            console.log('📊 Start screen display:', display);
        }
        
        // Check if canvas exists
        const canvas = await page.$('canvas');
        if (canvas) {
            console.log('✅ Canvas found');
        } else {
            console.log('❌ Canvas not found');
        }
        
        // Get console messages
        console.log('📋 Getting console messages...');
        const consoleMessages = await page.evaluate(() => {
            return window.consoleMessages || [];
        });
        
        console.log('📊 Console messages:');
        consoleMessages.forEach(msg => {
            if (msg.text.includes('Starting game') || msg.text.includes('Creating new game') || 
                msg.text.includes('Game.start') || msg.text.includes('Game started')) {
                console.log(`  ${msg.type}: ${msg.text}`);
            }
        });
        
        console.log('✅ Start button test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testStartButton().catch(console.error); 