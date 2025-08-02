const { chromium } = require('playwright');

async function testMovementStability() {
    console.log('🚀 Starting movement stability test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
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
        
        // Test movement stability
        console.log('🏃 Testing movement stability...');
        
        // Test 1: Continuous forward movement
        console.log('⬆️ Test 1: Continuous forward movement (W key)');
        await page.keyboard.down('w');
        await page.waitForTimeout(3000);
        await page.keyboard.up('w');
        
        // Test 2: Continuous backward movement
        console.log('⬇️ Test 2: Continuous backward movement (S key)');
        await page.keyboard.down('s');
        await page.waitForTimeout(3000);
        await page.keyboard.up('s');
        
        // Test 3: Continuous left movement
        console.log('⬅️ Test 3: Continuous left movement (A key)');
        await page.keyboard.down('a');
        await page.waitForTimeout(3000);
        await page.keyboard.up('a');
        
        // Test 4: Continuous right movement
        console.log('➡️ Test 4: Continuous right movement (D key)');
        await page.keyboard.down('d');
        await page.waitForTimeout(3000);
        await page.keyboard.up('d');
        
        // Test 5: Diagonal movement (W+A)
        console.log('↖️ Test 5: Diagonal movement (W+A)');
        await page.keyboard.down('w');
        await page.keyboard.down('a');
        await page.waitForTimeout(2000);
        await page.keyboard.up('w');
        await page.keyboard.up('a');
        
        // Test 6: Diagonal movement (W+D)
        console.log('↗️ Test 6: Diagonal movement (W+D)');
        await page.keyboard.down('w');
        await page.keyboard.down('d');
        await page.waitForTimeout(2000);
        await page.keyboard.up('w');
        await page.keyboard.up('d');
        
        // Test 7: Quick key presses
        console.log('⚡ Test 7: Quick key presses');
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('w');
            await page.waitForTimeout(100);
            await page.keyboard.press('s');
            await page.waitForTimeout(100);
        }
        
        // Test 8: Rapid direction changes
        console.log('🔄 Test 8: Rapid direction changes');
        const directions = ['w', 's', 'a', 'd'];
        for (let i = 0; i < 20; i++) {
            const key = directions[i % directions.length];
            await page.keyboard.press(key);
            await page.waitForTimeout(50);
        }
        
        // Wait a bit more to see final state
        await page.waitForTimeout(1000);
        
        // Get console messages
        console.log('📋 Checking console messages...');
        const consoleMessages = await page.evaluate(() => {
            return window.consoleMessages || [];
        });
        
        // Analyze console messages
        console.log('📊 Console message analysis:');
        
        const keydownEvents = consoleMessages.filter(msg => msg.text.includes('Keydown'));
        const keyupEvents = consoleMessages.filter(msg => msg.text.includes('Keyup'));
        const playerUpdates = consoleMessages.filter(msg => msg.text.includes('Player.update'));
        const movementEvents = consoleMessages.filter(msg => msg.text.includes('Moving by'));
        
        console.log(`  Keydown events: ${keydownEvents.length}`);
        console.log(`  Keyup events: ${keyupEvents.length}`);
        console.log(`  Player updates: ${playerUpdates.length}`);
        console.log(`  Movement events: ${movementEvents.length}`);
        
        // Check for errors
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        if (errors.length > 0) {
            console.log('❌ Errors found:');
            errors.forEach(error => console.log(`  ${error.text}`));
        } else {
            console.log('✅ No errors found');
        }
        
        // Check frame rate stability
        if (playerUpdates.length > 0) {
            const updateIntervals = [];
            for (let i = 1; i < playerUpdates.length; i++) {
                const interval = playerUpdates[i].timestamp - playerUpdates[i-1].timestamp;
                updateIntervals.push(interval);
            }
            
            const avgInterval = updateIntervals.reduce((a, b) => a + b, 0) / updateIntervals.length;
            const minInterval = Math.min(...updateIntervals);
            const maxInterval = Math.max(...updateIntervals);
            
            console.log(`📈 Frame rate analysis:`);
            console.log(`  Average update interval: ${avgInterval.toFixed(2)}ms`);
            console.log(`  Min update interval: ${minInterval.toFixed(2)}ms`);
            console.log(`  Max update interval: ${maxInterval.toFixed(2)}ms`);
            console.log(`  Estimated FPS: ${(1000 / avgInterval).toFixed(1)}`);
            
            // Check for frame drops
            const frameDrops = updateIntervals.filter(interval => interval > avgInterval * 2);
            if (frameDrops.length > 0) {
                console.log(`⚠️  Frame drops detected: ${frameDrops.length}`);
            } else {
                console.log('✅ No significant frame drops detected');
            }
        }
        
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
        
        console.log('✅ Movement stability test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testMovementStability(); 