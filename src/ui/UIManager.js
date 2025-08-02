export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.healthElement = document.getElementById('health');
        this.ammoElement = document.getElementById('ammo');
        this.levelElement = document.getElementById('level');
        this.progressElement = document.getElementById('progress');
        this.mouseStatusElement = document.getElementById('mouseStatus');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.crosshair = document.getElementById('crosshair');
    }
    
    updateScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${score}`;
        }
    }
    
    updateLevel(level, progress = null) {
        if (this.levelElement) {
            this.levelElement.textContent = `Level: ${level}`;
        }
        
        if (this.progressElement && progress !== null) {
            const progressPercent = Math.round(progress * 100);
            this.progressElement.textContent = `Progress: ${progressPercent}%`;
            
            // Змінюємо колір прогресу
            if (progressPercent >= 80) {
                this.progressElement.style.color = '#00ff00';
            } else if (progressPercent >= 50) {
                this.progressElement.style.color = '#ffff00';
            } else {
                this.progressElement.style.color = '#ffffff';
            }
        }
    }
    
    updateHealth(health) {
        if (this.healthElement) {
            this.healthElement.textContent = `Health: ${health}`;
            
            // Change color based on health
            if (health <= 25) {
                this.healthElement.style.color = '#ff0000';
            } else if (health <= 50) {
                this.healthElement.style.color = '#ffaa00';
            } else {
                this.healthElement.style.color = '#ffffff';
            }
        }
    }
    
    updateAmmo(ammo) {
        if (this.ammoElement) {
            this.ammoElement.textContent = `Ammo: ${ammo}`;
            
            // Change color when ammo is low
            if (ammo <= 5) {
                this.ammoElement.style.color = '#ff0000';
            } else if (ammo <= 10) {
                this.ammoElement.style.color = '#ffaa00';
            } else {
                this.ammoElement.style.color = '#ffffff';
            }
        }
    }
    
    updateMouseStatus(isLocked) {
        if (this.mouseStatusElement) {
            if (isLocked) {
                this.mouseStatusElement.textContent = 'Mouse: ENABLED';
                this.mouseStatusElement.style.color = '#00ff00';
            } else {
                this.mouseStatusElement.textContent = 'Mouse: Click to enable';
                this.mouseStatusElement.style.color = '#ffff00';
            }
        }
    }
    
    updateFocusStatus(hasFocus) {
        if (this.mouseStatusElement) {
            const currentText = this.mouseStatusElement.textContent;
            if (hasFocus) {
                this.mouseStatusElement.textContent = currentText + ' | Focus: ON';
            } else {
                this.mouseStatusElement.textContent = currentText.replace(' | Focus: ON', '');
            }
        }
    }
    
    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = 'none';
        }
    }
    
    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = 'block';
        }
    }
    
    showGameOver(finalScore) {
        if (this.gameOverScreen && this.finalScoreElement) {
            this.finalScoreElement.textContent = finalScore;
            this.gameOverScreen.style.display = 'block';
        }
    }
    
    hideGameOver() {
        if (this.gameOverScreen) {
            this.gameOverScreen.style.display = 'none';
        }
    }
    
    showCrosshair() {
        if (this.crosshair) {
            this.crosshair.style.display = 'block';
        }
    }
    
    hideCrosshair() {
        if (this.crosshair) {
            this.crosshair.style.display = 'none';
        }
    }
    
    showMessage(message, duration = 3000) {
        // Create a temporary message element
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            text-align: center;
            z-index: 300;
            background: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
        `;
        
        document.getElementById('gameContainer').appendChild(messageElement);
        
        // Remove after duration
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, duration);
    }
    
    showDamageIndicator() {
        // Flash the screen red when taking damage
        const damageOverlay = document.createElement('div');
        damageOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.3);
            z-index: 250;
            pointer-events: none;
        `;
        
        document.getElementById('gameContainer').appendChild(damageOverlay);
        
        // Remove after 200ms
        setTimeout(() => {
            if (damageOverlay.parentNode) {
                damageOverlay.parentNode.removeChild(damageOverlay);
            }
        }, 200);
    }
    
    showAmmoReload() {
        this.showMessage('Reloading...', 1000);
    }
    
    showGamePaused() {
        this.showMessage('Game Paused', 0);
    }
    
    hideGamePaused() {
        // Remove pause message
        const pauseMessages = document.querySelectorAll('[data-pause-message]');
        pauseMessages.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
    
    updateFPS(fps) {
        // Could be used to display FPS counter
        console.log(`FPS: ${fps}`);
    }
    
    showControls() {
        const controls = `
            <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 14px; text-align: right;">
                <div>WASD - Move</div>
                <div>Mouse - Look</div>
                <div>Click - Shoot</div>
                <div>ESC - Pause</div>
            </div>
        `;
        
        const controlsElement = document.createElement('div');
        controlsElement.innerHTML = controls;
        controlsElement.id = 'controls';
        
        document.getElementById('gameContainer').appendChild(controlsElement);
    }
    
    hideControls() {
        const controlsElement = document.getElementById('controls');
        if (controlsElement) {
            controlsElement.remove();
        }
    }
    
    showMapBoundaries() {
        const boundaries = `
            <div style="position: absolute; bottom: 20px; left: 20px; color: #00ff00; font-size: 12px; background: rgba(0, 0, 0, 0.5); padding: 5px; border-radius: 3px;">
                Map Boundaries: ±80 units
            </div>
        `;
        
        const boundariesElement = document.createElement('div');
        boundariesElement.innerHTML = boundaries;
        boundariesElement.id = 'boundaries';
        
        document.getElementById('gameContainer').appendChild(boundariesElement);
    }
    
    hideMapBoundaries() {
        const boundariesElement = document.getElementById('boundaries');
        if (boundariesElement) {
            boundariesElement.remove();
        }
    }
    
    showBoundaryWarning(show) {
        let warningElement = document.getElementById('boundaryWarning');
        
        if (show && !warningElement) {
            warningElement = document.createElement('div');
            warningElement.id = 'boundaryWarning';
            warningElement.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ffaa00;
                font-size: 18px;
                text-align: center;
                z-index: 200;
                background: rgba(255, 170, 0, 0.2);
                padding: 10px;
                border-radius: 5px;
                border: 2px solid #ffaa00;
            `;
            warningElement.textContent = '⚠️ Approaching Map Boundary';
            document.getElementById('gameContainer').appendChild(warningElement);
        } else if (!show && warningElement) {
            warningElement.remove();
        }
    }
    
    updateMovementStatus(inputManager, playerPosition = null) {
        if (this.mouseStatusElement) {
            const movingKeys = [];
            if (inputManager.isKeyPressed('w')) movingKeys.push('W');
            if (inputManager.isKeyPressed('a')) movingKeys.push('A');
            if (inputManager.isKeyPressed('s')) movingKeys.push('S');
            if (inputManager.isKeyPressed('d')) movingKeys.push('D');
            
            const movementText = movingKeys.length > 0 ? ` | Moving: ${movingKeys.join('')}` : '';
            const positionText = playerPosition ? ` | Pos: (${playerPosition.x.toFixed(1)}, ${playerPosition.z.toFixed(1)})` : '';
            const currentText = this.mouseStatusElement.textContent.replace(/ \| Moving: [WASD]+/, '').replace(/ \| Pos: \([^)]+\)/, '');
            this.mouseStatusElement.textContent = currentText + movementText + positionText;
        }
    }
} 