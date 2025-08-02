import { InputManager } from '../input/InputManager.js';

describe('InputManager', () => {
    let inputManager;
    
    beforeEach(() => {
        // Reset DOM mocks
        document.getElementById.mockClear();
        document.addEventListener.mockClear();
        
        inputManager = new InputManager();
    });
    
    describe('Initialization', () => {
        test('should initialize with empty state', () => {
            expect(inputManager.keys).toEqual({});
            expect(inputManager.mouseMovement).toEqual({ x: 0, y: 0 });
            expect(inputManager.mousePosition).toEqual({ x: 0, y: 0 });
            expect(inputManager.isPointerLocked).toBe(false);
        });
        
        test('should set up event listeners', () => {
            expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('pointerlockerror', expect.any(Function));
            expect(document.addEventListener).toHaveBeenCalledWith('contextmenu', expect.any(Function));
        });
    });
    
    describe('Keyboard Input', () => {
        test('should detect key press', () => {
            // Simulate keydown event
            const keydownEvent = new KeyboardEvent('keydown', { key: 'w' });
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            keydownHandler(keydownEvent);
            
            expect(inputManager.isKeyPressed('w')).toBe(true);
            expect(inputManager.isKeyPressed('W')).toBe(true);
        });
        
        test('should detect key release', () => {
            // First press the key
            const keydownEvent = new KeyboardEvent('keydown', { key: 'w' });
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            keydownHandler(keydownEvent);
            
            // Then release it
            const keyupEvent = new KeyboardEvent('keyup', { key: 'w' });
            const keyupHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keyup'
            )[1];
            keyupHandler(keyupEvent);
            
            expect(inputManager.isKeyPressed('w')).toBe(false);
        });
        
        test('should handle case-insensitive key detection', () => {
            const keydownEvent = new KeyboardEvent('keydown', { key: 'W' });
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            keydownHandler(keydownEvent);
            
            expect(inputManager.isKeyPressed('w')).toBe(true);
            expect(inputManager.isKeyPressed('W')).toBe(true);
        });
        
        test('should return false for unpressed keys', () => {
            expect(inputManager.isKeyPressed('nonexistent')).toBe(false);
        });
        
        test('should handle multiple keys', () => {
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            keydownHandler(new KeyboardEvent('keydown', { key: 'w' }));
            keydownHandler(new KeyboardEvent('keydown', { key: 'a' }));
            
            expect(inputManager.isKeyPressed('w')).toBe(true);
            expect(inputManager.isKeyPressed('a')).toBe(true);
            expect(inputManager.isKeyPressed('s')).toBe(false);
        });
    });
    
    describe('Mouse Input', () => {
        test('should get mouse movement when pointer is locked', () => {
            inputManager.isPointerLocked = true;
            
            const mousemoveEvent = new MouseEvent('mousemove', {
                movementX: 10,
                movementY: -5
            });
            const mousemoveHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            )[1];
            
            mousemoveHandler(mousemoveEvent);
            
            const movement = inputManager.getMouseMovement();
            expect(movement.x).toBe(10);
            expect(movement.y).toBe(-5);
        });
        
        test('should get mouse position when pointer is not locked', () => {
            inputManager.isPointerLocked = false;
            
            const mousemoveEvent = new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 200
            });
            const mousemoveHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            )[1];
            
            mousemoveHandler(mousemoveEvent);
            
            const position = inputManager.getMousePosition();
            expect(position.x).toBe(100);
            expect(position.y).toBe(200);
        });
        
        test('should reset mouse movement after getting it', () => {
            inputManager.isPointerLocked = true;
            inputManager.mouseMovement = { x: 10, y: 5 };
            
            const movement1 = inputManager.getMouseMovement();
            expect(movement1.x).toBe(10);
            expect(movement1.y).toBe(5);
            
            const movement2 = inputManager.getMouseMovement();
            expect(movement2.x).toBe(0);
            expect(movement2.y).toBe(0);
        });
        
        test('should handle missing movement properties', () => {
            inputManager.isPointerLocked = true;
            
            const mousemoveEvent = new MouseEvent('mousemove', {});
            const mousemoveHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            )[1];
            
            mousemoveHandler(mousemoveEvent);
            
            const movement = inputManager.getMouseMovement();
            expect(movement.x).toBe(0);
            expect(movement.y).toBe(0);
        });
    });
    
    describe('Pointer Lock', () => {
        test('should detect pointer lock state changes', () => {
            const pointerlockchangeHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'pointerlockchange'
            )[1];
            
            // Simulate pointer lock
            document.pointerLockElement = document.createElement('div');
            pointerlockchangeHandler();
            
            expect(inputManager.isPointerLocked).toBe(true);
            
            // Simulate pointer unlock
            document.pointerLockElement = null;
            pointerlockchangeHandler();
            
            expect(inputManager.isPointerLocked).toBe(false);
        });
        
        test('should reset mouse movement on pointer lock error', () => {
            inputManager.mouseMovement = { x: 10, y: 5 };
            
            const pointerlockerrorHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'pointerlockerror'
            )[1];
            
            pointerlockerrorHandler();
            
            expect(inputManager.isPointerLocked).toBe(false);
            expect(inputManager.mouseMovement.x).toBe(0);
            expect(inputManager.mouseMovement.y).toBe(0);
        });
        
        test('should request pointer lock', () => {
            inputManager.requestPointerLock();
            
            expect(document.requestPointerLock).toHaveBeenCalled();
        });
        
        test('should exit pointer lock', () => {
            inputManager.exitPointerLock();
            
            expect(document.exitPointerLock).toHaveBeenCalled();
        });
    });
    
    describe('Utility Methods', () => {
        test('should get all pressed keys', () => {
            inputManager.keys = { w: true, a: true, s: false };
            
            const pressedKeys = inputManager.getPressedKeys();
            
            expect(pressedKeys).toContain('w');
            expect(pressedKeys).toContain('a');
            expect(pressedKeys).not.toContain('s');
        });
        
        test('should detect movement', () => {
            inputManager.keys = { w: true, a: false, s: false, d: false };
            
            expect(inputManager.isMoving()).toBe(true);
            
            inputManager.keys = { w: false, a: false, s: false, d: false };
            
            expect(inputManager.isMoving()).toBe(false);
        });
        
        test('should handle case-insensitive movement detection', () => {
            inputManager.keys = { W: true, A: false, S: false, D: false };
            
            expect(inputManager.isMoving()).toBe(true);
        });
        
        test('should reset input state', () => {
            inputManager.keys = { w: true, a: true };
            inputManager.mouseMovement = { x: 10, y: 5 };
            
            inputManager.reset();
            
            expect(inputManager.keys).toEqual({});
            expect(inputManager.mouseMovement).toEqual({ x: 0, y: 0 });
        });
    });
    
    describe('Context Menu Prevention', () => {
        test('should prevent context menu', () => {
            const contextmenuEvent = new MouseEvent('contextmenu');
            const contextmenuHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'contextmenu'
            )[1];
            
            const preventDefaultSpy = jest.spyOn(contextmenuEvent, 'preventDefault');
            
            contextmenuHandler(contextmenuEvent);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle null key events', () => {
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            expect(() => {
                keydownHandler(null);
            }).not.toThrow();
        });
        
        test('should handle events without key property', () => {
            const keydownEvent = new Event('keydown');
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            expect(() => {
                keydownHandler(keydownEvent);
            }).not.toThrow();
        });
        
        test('should handle null mouse events', () => {
            const mousemoveHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            )[1];
            
            expect(() => {
                mousemoveHandler(null);
            }).not.toThrow();
        });
        
        test('should handle missing event properties', () => {
            const mousemoveEvent = new Event('mousemove');
            const mousemoveHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            )[1];
            
            expect(() => {
                mousemoveHandler(mousemoveEvent);
            }).not.toThrow();
        });
    });
    
    describe('Performance', () => {
        test('should handle rapid key events efficiently', () => {
            const keydownHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'keydown'
            )[1];
            
            const startTime = performance.now();
            
            for (let i = 0; i < 1000; i++) {
                keydownHandler(new KeyboardEvent('keydown', { key: 'w' }));
            }
            
            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 10ms)
            expect(endTime - startTime).toBeLessThan(10);
        });
        
        test('should handle rapid mouse events efficiently', () => {
            const mousemoveHandler = document.addEventListener.mock.calls.find(
                call => call[0] === 'mousemove'
            )[1];
            
            const startTime = performance.now();
            
            for (let i = 0; i < 1000; i++) {
                mousemoveHandler(new MouseEvent('mousemove', {
                    movementX: i,
                    movementY: i
                }));
            }
            
            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 10ms)
            expect(endTime - startTime).toBeLessThan(10);
        });
    });
    
    describe('Cleanup', () => {
        test('should dispose without errors', () => {
            expect(() => {
                inputManager.dispose();
            }).not.toThrow();
        });
    });
}); 