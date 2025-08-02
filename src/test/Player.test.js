import { Player } from '../game/Player.js';

describe('Player', () => {
    let player;
    let mockInputManager;
    
    beforeEach(() => {
        player = new Player();
        
        mockInputManager = {
            isKeyPressed: jest.fn(() => false),
            getMouseMovement: jest.fn(() => ({ x: 0, y: 0 }))
        };
    });
    
    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(player.speed).toBe(5);
            expect(player.rotationSpeed).toBe(0.002);
            expect(player.mouseSensitivity).toBe(0.005);
            expect(player.direction).toBeDefined();
            expect(player.velocity).toBeDefined();
        });
        
        test('should create mesh with correct properties', () => {
            expect(player.mesh).toBeDefined();
            expect(player.mesh.position.x).toBe(0);
            expect(player.mesh.position.y).toBe(1);
            expect(player.mesh.position.z).toBe(0);
            expect(player.mesh.castShadow).toBe(true);
            expect(player.mesh.receiveShadow).toBe(false);
        });
        
        test('should initialize direction vector', () => {
            expect(player.direction.x).toBe(0);
            expect(player.direction.y).toBe(0);
            expect(player.direction.z).toBe(-1);
        });
    });
    
    describe('Movement', () => {
        test('should move forward when W key is pressed', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'w');
            
            const initialPosition = { ...player.mesh.position };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.z).toBeLessThan(initialPosition.z);
        });
        
        test('should move backward when S key is pressed', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 's');
            
            const initialPosition = { ...player.mesh.position };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.z).toBeGreaterThan(initialPosition.z);
        });
        
        test('should move left when A key is pressed', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'a');
            
            const initialPosition = { ...player.mesh.position };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.x).toBeLessThan(initialPosition.x);
        });
        
        test('should move right when D key is pressed', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'd');
            
            const initialPosition = { ...player.mesh.position };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.x).toBeGreaterThan(initialPosition.x);
        });
        
        test('should handle multiple movement keys', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => 
                key === 'w' || key === 'd'
            );
            
            const initialPosition = { ...player.mesh.position };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.z).toBeLessThan(initialPosition.z);
            expect(player.mesh.position.x).toBeGreaterThan(initialPosition.x);
        });
        
        test('should keep player on ground level', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'w');
            
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.y).toBe(1);
        });
        
        test('should handle case-insensitive key input', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'W');
            
            const initialPosition = { ...player.mesh.position };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.mesh.position.z).toBeLessThan(initialPosition.z);
        });
    });
    
    describe('Rotation', () => {
        test('should handle horizontal mouse movement', () => {
            mockInputManager.getMouseMovement.mockReturnValue({ x: 10, y: 0 });
            
            const initialDirection = { ...player.direction };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.direction.x).not.toBe(initialDirection.x);
        });
        
        test('should handle vertical mouse movement', () => {
            mockInputManager.getMouseMovement.mockReturnValue({ x: 0, y: 10 });
            
            const initialDirection = { ...player.direction };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.direction.y).not.toBe(initialDirection.y);
        });
        
        test('should limit vertical rotation to prevent over-rotation', () => {
            mockInputManager.getMouseMovement.mockReturnValue({ x: 0, y: 1000 });
            
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            // Direction should be normalized and within limits
            const length = Math.sqrt(
                player.direction.x * player.direction.x +
                player.direction.y * player.direction.y +
                player.direction.z * player.direction.z
            );
            expect(length).toBeCloseTo(1, 5);
        });
        
        test('should not rotate when no mouse movement', () => {
            mockInputManager.getMouseMovement.mockReturnValue({ x: 0, y: 0 });
            
            const initialDirection = { ...player.direction };
            const deltaTime = 0.016;
            
            player.update(deltaTime, mockInputManager);
            
            expect(player.direction.x).toBe(initialDirection.x);
            expect(player.direction.y).toBe(initialDirection.y);
            expect(player.direction.z).toBe(initialDirection.z);
        });
    });
    
    describe('Direction and Look', () => {
        test('should return correct yaw angle', () => {
            player.direction.set(1, 0, 0); // Looking right
            
            const yaw = player.getYaw();
            
            expect(yaw).toBeCloseTo(Math.PI / 2, 5);
        });
        
        test('should return look direction vector', () => {
            const lookDirection = player.getLookDirection();
            
            expect(lookDirection).toBeDefined();
            expect(lookDirection.x).toBe(player.direction.x);
            expect(lookDirection.y).toBe(player.direction.y);
            expect(lookDirection.z).toBe(player.direction.z);
        });
        
        test('should return cloned look direction', () => {
            const lookDirection = player.getLookDirection();
            
            // Modify the returned direction
            lookDirection.x = 999;
            
            // Original direction should remain unchanged
            expect(player.direction.x).not.toBe(999);
        });
    });
    
    describe('Position', () => {
        test('should return current position', () => {
            const position = player.getPosition();
            
            expect(position.x).toBe(player.mesh.position.x);
            expect(position.y).toBe(player.mesh.position.y);
            expect(position.z).toBe(player.mesh.position.z);
        });
        
        test('should return cloned position', () => {
            const position = player.getPosition();
            
            // Modify the returned position
            position.x = 999;
            
            // Original position should remain unchanged
            expect(player.mesh.position.x).not.toBe(999);
        });
    });
    
    describe('Damage', () => {
        test('should handle damage', () => {
            const damageAmount = 25;
            
            const result = player.takeDamage(damageAmount);
            
            expect(result).toBe(damageAmount);
        });
    });
    
    describe('Movement Speed', () => {
        test('should move at correct speed', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'w');
            
            const deltaTime = 0.016;
            const expectedDistance = player.speed * deltaTime;
            
            const initialPosition = { ...player.mesh.position };
            
            player.update(deltaTime, mockInputManager);
            
            const actualDistance = Math.abs(player.mesh.position.z - initialPosition.z);
            expect(actualDistance).toBeCloseTo(expectedDistance, 5);
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle zero delta time', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'w');
            
            const initialPosition = { ...player.mesh.position };
            
            player.update(0, mockInputManager);
            
            expect(player.mesh.position.x).toBe(initialPosition.x);
            expect(player.mesh.position.y).toBe(initialPosition.y);
            expect(player.mesh.position.z).toBe(initialPosition.z);
        });
        
        test('should handle very large delta time', () => {
            mockInputManager.isKeyPressed.mockImplementation((key) => key === 'w');
            
            const deltaTime = 1.0; // 1 second
            
            player.update(deltaTime, mockInputManager);
            
            // Should still be on ground
            expect(player.mesh.position.y).toBe(1);
        });
        
        test('should handle null input manager', () => {
            expect(() => {
                player.update(0.016, null);
            }).not.toThrow();
        });
    });
}); 