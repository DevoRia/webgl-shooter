const { chromium } = require('playwright');

async function testMovement() {
    console.log('🚀 Starting movement test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slow down for better visibility
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
        
        // Click on the game area to focus and enable pointer lock
        console.log('🎯 Clicking on game area to focus...');
        await page.click('canvas');
        await page.waitForTimeout(1000);
        
        // Test WASD movement
        console.log('🏃 Testing movement keys...');
        
        // Test W key (forward)
        console.log('⬆️ Testing W key (forward)...');
        await page.keyboard.down('w');
        await page.waitForTimeout(2000);
        await page.keyboard.up('w');
        
        // Test S key (backward)
        console.log('⬇️ Testing S key (backward)...');
        await page.keyboard.down('s');
        await page.waitForTimeout(2000);
        await page.keyboard.up('s');
        
        // Test A key (left)
        console.log('⬅️ Testing A key (left)...');
        await page.keyboard.down('a');
        await page.waitForTimeout(2000);
        await page.keyboard.up('a');
        
        // Test D key (right)
        console.log('➡️ Testing D key (right)...');
        await page.keyboard.down('d');
        await page.waitForTimeout(2000);
        await page.keyboard.up('d');
        
        // Get console messages to see what happened
        console.log('📋 Getting console messages...');
        const consoleMessages = await page.evaluate(() => {
            return window.consoleMessages || [];
        });
        
        console.log('📊 Console messages:');
        consoleMessages.forEach(msg => {
            console.log(`  ${msg.type}: ${msg.text}`);
        });
        
        // Check if position changed
        console.log('📍 Checking player position...');
        const positionText = await page.evaluate(() => {
            const mouseStatus = document.querySelector('#mouseStatus');
            return mouseStatus ? mouseStatus.textContent : 'Position not found';
        });
        
        console.log('🎯 Current position info:', positionText);
        
        // Take a screenshot
        console.log('📸 Taking screenshot...');
        await page.screenshot({ path: 'movement-test-result.png' });
        
        console.log('✅ Movement test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'movement-test-error.png' });
    } finally {
        await browser.close();
    }
}

// Run the test
testMovement().catch(console.error); 