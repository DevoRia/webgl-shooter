const { chromium } = require('playwright');

async function simpleTest() {
    console.log('🚀 Starting simple keyboard test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
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
        
        // Click Start Game button
        console.log('🎮 Starting game...');
        await page.click('#startButton');
        
        // Wait for game to initialize
        await page.waitForTimeout(2000);
        console.log('✅ Game started');
        
        // Click on the game area to focus
        console.log('🎯 Clicking on game area to focus...');
        await page.click('canvas');
        await page.waitForTimeout(1000);
        
        // Test a simple key press
        console.log('⌨️ Testing simple key press...');
        await page.keyboard.press('w');
        await page.waitForTimeout(1000);
        
        // Check console for any keyboard events
        console.log('📋 Checking console messages...');
        const consoleMessages = await page.evaluate(() => {
            return window.consoleMessages || [];
        });
        
        console.log('📊 Console messages:');
        consoleMessages.forEach(msg => {
            if (msg.text.includes('Keydown') || msg.text.includes('Keyup') || msg.text.includes('Key pressed') || 
                msg.text.includes('handleMovement') || msg.text.includes('W pressed') || msg.text.includes('Moving by')) {
                console.log(`  ${msg.type}: ${msg.text}`);
            }
        });
        
        console.log('✅ Simple test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
simpleTest().catch(console.error); 