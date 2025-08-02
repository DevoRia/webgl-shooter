export class InputManager {
    constructor() {
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.mousePosition = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            console.log('🔽 Keydown event received:', event.key, 'code:', event.code);
            this.keys[event.key.toLowerCase()] = true;
            console.log('Key pressed:', event.key, 'Current keys:', this.getPressedKeys());
        });
        
        document.addEventListener('keyup', (event) => {
            console.log('🔼 Keyup event received:', event.key, 'code:', event.code);
            this.keys[event.key.toLowerCase()] = false;
            console.log('Key released:', event.key);
        });
        
        // Mouse movement
        document.addEventListener('mousemove', (event) => {
            if (this.isPointerLocked) {
                this.mouseMovement.x = event.movementX || 0;
                this.mouseMovement.y = event.movementY || 0;
            } else {
                this.mousePosition.x = event.clientX;
                this.mousePosition.y = event.clientY;
            }
        });
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement !== null;
        });
        
        // Reset mouse movement when pointer lock is lost
        document.addEventListener('pointerlockerror', () => {
            this.isPointerLocked = false;
            this.mouseMovement.x = 0;
            this.mouseMovement.y = 0;
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    isKeyPressed(key) {
        const result = this.keys[key.toLowerCase()] || false;
        console.log(`isKeyPressed('${key}') = ${result}, keys:`, this.keys);
        return result;
    }
    
    isKeyDown(key) {
        return this.isKeyPressed(key);
    }
    
    getMouseMovement() {
        const movement = { x: this.mouseMovement.x, y: this.mouseMovement.y };
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
        return movement;
    }
    
    getMousePosition() {
        return { x: this.mousePosition.x, y: this.mousePosition.y };
    }
    
    getPointerLocked() {
        return this.isPointerLocked;
    }
    
    requestPointerLock() {
        document.body.requestPointerLock();
    }
    
    exitPointerLock() {
        document.exitPointerLock();
    }
    
    // Get all currently pressed keys
    getPressedKeys() {
        return Object.keys(this.keys).filter(key => this.keys[key]);
    }
    
    // Check if any movement keys are pressed
    isMoving() {
        return this.isKeyPressed('w') || this.isKeyPressed('a') || 
               this.isKeyPressed('s') || this.isKeyPressed('d') ||
               this.isKeyPressed('W') || this.isKeyPressed('A') || 
               this.isKeyPressed('S') || this.isKeyPressed('D');
    }
    
    // Reset all input state
    reset() {
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
    }
    
    dispose() {
        // Remove event listeners if needed
        // For now, we'll keep them active as they're needed for the game
    }
} 