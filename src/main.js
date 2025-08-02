import { Game } from './game/Game.js';
import { UIManager } from './ui/UIManager.js';

class WebGLShooter {
    constructor() {
        this.game = null;
        this.uiManager = null;
        this.isGameRunning = false;
        
        this.init();
    }
    
    init() {
        this.uiManager = new UIManager();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const startButton = document.getElementById('startButton');
        const restartButton = document.getElementById('restartButton');
        
        startButton.addEventListener('click', () => this.startGame());
        restartButton.addEventListener('click', () => this.restartGame());
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.handleResize();
            }
        });
    }
    
    startGame() {
        console.log('Starting game...');
        if (this.isGameRunning) return;
        
        // Clean up any existing game
        if (this.game) {
            this.game.dispose();
            this.game = null;
        }
        
        this.isGameRunning = true;
        this.uiManager.hideStartScreen();
        this.uiManager.showCrosshair();
        
        console.log('Creating new game...');
        this.game = new Game();
        this.game.onScoreUpdate = (score) => this.uiManager.updateScore(score);
        this.game.onHealthUpdate = (health) => this.uiManager.updateHealth(health);
        this.game.onAmmoUpdate = (ammo) => this.uiManager.updateAmmo(ammo);
        this.game.onGameOver = (finalScore) => this.handleGameOver(finalScore);
        
        console.log('Starting game loop...');
        this.game.start();
        console.log('Game started successfully');
    }
    
    restartGame() {
        this.uiManager.hideGameOver();
        this.startGame();
    }
    
    handleGameOver(finalScore) {
        this.isGameRunning = false;
        this.uiManager.hideCrosshair();
        this.uiManager.showGameOver(finalScore);
        
        if (this.game) {
            this.game.dispose();
            this.game = null;
        }
    }
}

// Add console message collection for testing
window.consoleMessages = [];
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function(...args) {
    window.consoleMessages.push({
        type: 'log',
        text: args.join(' '),
        timestamp: Date.now()
    });
    originalConsoleLog.apply(console, args);
};

console.error = function(...args) {
    window.consoleMessages.push({
        type: 'error',
        text: args.join(' '),
        timestamp: Date.now()
    });
    originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
    window.consoleMessages.push({
        type: 'warn',
        text: args.join(' '),
        timestamp: Date.now()
    });
    originalConsoleWarn.apply(console, args);
};

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new WebGLShooter();
}); 