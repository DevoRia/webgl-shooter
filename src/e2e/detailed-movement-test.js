const { chromium } = require('playwright');

async function detailedMovementTest() {
    console.log('🚀 Starting detailed movement test...');
    
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
        
        // Click on game area to focus
        console.log('🎯 Clicking on game area to focus...');
        await page.click('canvas');
        await page.waitForTimeout(1000);
        
        // Test movement keys for longer period
        console.log('🏃 Testing movement for 5 seconds...');
        
        // Hold W key for 2 seconds
        console.log('⬆️ Holding W key (forward) for 2 seconds...');
        await page.keyboard.down('w');
        await page.waitForTimeout(2000);
        await page.keyboard.up('w');
        
        // Hold S key for 2 seconds
        console.log('⬇️ Holding S key (backward) for 2 seconds...');
        await page.keyboard.down('s');
        await page.waitForTimeout(2000);
        await page.keyboard.up('s');
        
        // Hold A key for 1 second
        console.log('⬅️ Holding A key (left) for 1 second...');
        await page.keyboard.down('a');
        await page.waitForTimeout(1000);
        await page.keyboard.up('a');
        
        // Hold D key for 1 second
        console.log('➡️ Holding D key (right) for 1 second...');
        await page.keyboard.down('d');
        await page.waitForTimeout(1000);
        await page.keyboard.up('d');
        
        // Wait a bit more to see final state
        await page.waitForTimeout(1000);
        
        // Get console messages
        console.log('📋 Checking console messages...');
        const consoleMessages = await page.evaluate(() => {
            return window.consoleMessages || [];
        });
        
        console.log('📊 Console messages:');
        consoleMessages.forEach(msg => {
            if (msg.text.includes('Keydown') || msg.text.includes('Keyup') || 
                msg.text.includes('Key pressed') || msg.text.includes('Moving') ||
                msg.text.includes('handleMovement') || msg.text.includes('Player.update')) {
                console.log(`  ${msg.type}: ${msg.text}`);
            }
        });
        
        // Check final player position
        console.log('📍 Checking final player position...');
        const finalPosition = await page.evaluate(() => {
            if (window.game && window.game.player) {
                return {
                    x: window.game.player.mesh.position.x.toFixed(2),
                    y: window.game.player.mesh.position.y.toFixed(2),
                    z: window.game.player.mesh.position.z.toFixed(2)
                };
            }
            return null;
        });
        
        if (finalPosition) {
            console.log(`📍 Final position: (${finalPosition.x}, ${finalPosition.y}, ${finalPosition.z})`);
        } else {
            console.log('❌ Could not get player position');
        }
        
        console.log('✅ Detailed movement test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

detailedMovementTest(); 