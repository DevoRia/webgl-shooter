import { Enemy } from '../game/Enemy.js';

describe('Enemy', () => {
    let enemy;
    
    beforeEach(() => {
        enemy = new Enemy();
    });
    
    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(enemy.speed).toBe(2);
            expect(enemy.health).toBe(100);
            expect(enemy.damage).toBe(20);
            expect(enemy.detectionRange).toBe(15);
            expect(enemy.attackRange).toBe(2);
            expect(enemy.state).toBe('patrol');
        });
        
        test('should create mesh with correct properties', () => {
            expect(enemy.mesh).toBeDefined();
            expect(enemy.mesh.castShadow).toBe(true);
            expect(enemy.mesh.receiveShadow).toBe(false);
        });
        
        test('should initialize target as null', () => {
            expect(enemy.target).toBeNull();
        });
    });
    
    describe('State Management', () => {
        test('should be in patrol state initially', () => {
            expect(enemy.state).toBe('patrol');
        });
        
        test('should change to chase state when player is in detection range', () => {
            const playerPosition = { x: 10, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            
            enemy.update(0.016, playerPosition);
            
            expect(enemy.state).toBe('chase');
        });
        
        test('should change to attack state when player is in attack range', () => {
            const playerPosition = { x: 1, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            
            enemy.update(0.016, playerPosition);
            
            expect(enemy.state).toBe('attack');
        });
        
        test('should stay in patrol state when player is out of range', () => {
            const playerPosition = { x: 20, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            
            enemy.update(0.016, playerPosition);
            
            expect(enemy.state).toBe('patrol');
        });
    });
    
    describe('Chase Behavior', () => {
        test('should move towards player when chasing', () => {
            const playerPosition = { x: 10, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            enemy.state = 'chase';
            enemy.target = playerPosition;
            
            const initialPosition = { ...enemy.mesh.position };
            const deltaTime = 0.016;
            
            enemy.chase(deltaTime);
            
            expect(enemy.mesh.position.x).toBeGreaterThan(initialPosition.x);
        });
        
        test('should not move when no target', () => {
            enemy.target = null;
            const initialPosition = { ...enemy.mesh.position };
            const deltaTime = 0.016;
            
            enemy.chase(deltaTime);
            
            expect(enemy.mesh.position.x).toBe(initialPosition.x);
            expect(enemy.mesh.position.y).toBe(initialPosition.y);
            expect(enemy.mesh.position.z).toBe(initialPosition.z);
        });
        
        test('should keep enemy on ground level', () => {
            const playerPosition = { x: 10, y: 1, z: 0 };
            enemy.mesh.position.set(0, 5, 0); // Above ground
            enemy.target = playerPosition;
            
            const deltaTime = 0.016;
            
            enemy.chase(deltaTime);
            
            expect(enemy.mesh.position.y).toBe(1);
        });
        
        test('should face target when chasing', () => {
            const playerPosition = { x: 10, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            enemy.target = playerPosition;
            
            const deltaTime = 0.016;
            
            enemy.chase(deltaTime);
            
            // Should have rotated to face the target
            expect(enemy.mesh.rotation.y).toBeDefined();
        });
    });
    
    describe('Patrol Behavior', () => {
        test('should move in random direction during patrol', () => {
            const deltaTime = 0.016;
            const initialPosition = { ...enemy.mesh.position };
            
            enemy.patrol(deltaTime);
            
            // Should have moved in some direction
            const distance = Math.sqrt(
                Math.pow(enemy.mesh.position.x - initialPosition.x, 2) +
                Math.pow(enemy.mesh.position.z - initialPosition.z, 2)
            );
            expect(distance).toBeGreaterThan(0);
        });
        
        test('should change direction periodically', () => {
            const deltaTime = 0.016;
            
            // First patrol call
            enemy.patrol(deltaTime);
            const firstDirection = { ...enemy.patrolDirection };
            
            // Advance time and call patrol again
            enemy.patrolTimer = 4; // Over 3 seconds
            enemy.patrol(deltaTime);
            
            // Direction should have changed
            expect(enemy.patrolDirection.x).not.toBe(firstDirection.x);
            expect(enemy.patrolDirection.z).not.toBe(firstDirection.z);
        });
        
        test('should keep enemy within bounds', () => {
            const deltaTime = 0.016;
            
            // Move enemy far away
            enemy.mesh.position.set(100, 1, 100);
            
            enemy.patrol(deltaTime);
            
            const distance = Math.sqrt(
                enemy.mesh.position.x * enemy.mesh.position.x +
                enemy.mesh.position.z * enemy.mesh.position.z
            );
            expect(distance).toBeLessThanOrEqual(50);
        });
        
        test('should keep enemy on ground during patrol', () => {
            const deltaTime = 0.016;
            enemy.mesh.position.set(0, 5, 0); // Above ground
            
            enemy.patrol(deltaTime);
            
            expect(enemy.mesh.position.y).toBe(1);
        });
    });
    
    describe('Attack Behavior', () => {
        test('should perform attack action', () => {
            // Attack method should not throw
            expect(() => {
                enemy.attack();
            }).not.toThrow();
        });
    });
    
    describe('Target Facing', () => {
        test('should face target correctly', () => {
            const targetPosition = { x: 10, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            
            enemy.faceTarget(targetPosition);
            
            expect(enemy.mesh.rotation.y).toBeDefined();
        });
        
        test('should handle null target position', () => {
            expect(() => {
                enemy.faceTarget(null);
            }).not.toThrow();
        });
        
        test('should calculate correct angle to target', () => {
            const targetPosition = { x: 1, y: 1, z: 0 };
            enemy.mesh.position.set(0, 1, 0);
            
            enemy.faceTarget(targetPosition);
            
            // Should be facing right (positive X)
            expect(enemy.mesh.rotation.y).toBeCloseTo(Math.PI / 2, 5);
        });
    });
    
    describe('Damage System', () => {
        test('should take damage correctly', () => {
            const initialHealth = enemy.health;
            const damageAmount = 25;
            
            const isDead = enemy.takeDamage(damageAmount);
            
            expect(enemy.health).toBe(initialHealth - damageAmount);
            expect(isDead).toBe(false);
        });
        
        test('should return true when health reaches zero', () => {
            enemy.health = 20;
            
            const isDead = enemy.takeDamage(25);
            
            expect(enemy.health).toBe(-5);
            expect(isDead).toBe(true);
        });
        
        test('should provide visual feedback when taking damage', () => {
            const damageAmount = 25;
            
            enemy.takeDamage(damageAmount);
            
            // Should change color temporarily
            expect(enemy.mesh.material.color).toBeDefined();
        });
    });
    
    describe('Position and Health', () => {
        test('should return current position', () => {
            const position = enemy.getPosition();
            
            expect(position.x).toBe(enemy.mesh.position.x);
            expect(position.y).toBe(enemy.mesh.position.y);
            expect(position.z).toBe(enemy.mesh.position.z);
        });
        
        test('should return cloned position', () => {
            const position = enemy.getPosition();
            
            // Modify the returned position
            position.x = 999;
            
            // Original position should remain unchanged
            expect(enemy.mesh.position.x).not.toBe(999);
        });
        
        test('should return current health', () => {
            expect(enemy.getHealth()).toBe(enemy.health);
        });
        
        test('should check if dead', () => {
            expect(enemy.isDead()).toBe(false);
            
            enemy.health = 0;
            expect(enemy.isDead()).toBe(true);
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle zero delta time', () => {
            const initialPosition = { ...enemy.mesh.position };
            
            enemy.update(0, { x: 10, y: 1, z: 0 });
            
            expect(enemy.mesh.position.x).toBe(initialPosition.x);
            expect(enemy.mesh.position.y).toBe(initialPosition.y);
            expect(enemy.mesh.position.z).toBe(initialPosition.z);
        });
        
        test('should handle null player position', () => {
            expect(() => {
                enemy.update(0.016, null);
            }).not.toThrow();
        });
        
        test('should handle very large delta time', () => {
            const deltaTime = 1.0; // 1 second
            
            expect(() => {
                enemy.update(deltaTime, { x: 10, y: 1, z: 0 });
            }).not.toThrow();
        });
        
        test('should handle negative damage', () => {
            const initialHealth = enemy.health;
            
            enemy.takeDamage(-10);
            
            expect(enemy.health).toBe(initialHealth + 10);
        });
    });
    
    describe('Performance', () => {
        test('should handle many enemies efficiently', () => {
            const enemies = [];
            const playerPosition = { x: 10, y: 1, z: 0 };
            
            // Create many enemies
            for (let i = 0; i < 100; i++) {
                const enemy = new Enemy();
                enemy.mesh.position.set(i, 1, i);
                enemies.push(enemy);
            }
            
            // Update all enemies
            const startTime = performance.now();
            enemies.forEach(enemy => {
                enemy.update(0.016, playerPosition);
            });
            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 100ms)
            expect(endTime - startTime).toBeLessThan(100);
        });
    });
}); 