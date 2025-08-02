import { Bullet } from '../game/Bullet.js';

describe('Bullet', () => {
    let bullet;
    let startPosition;
    let direction;
    
    beforeEach(() => {
        startPosition = new THREE.Vector3(0, 0, 0);
        direction = new THREE.Vector3(0, 0, -1);
        bullet = new Bullet(startPosition, direction);
    });
    
    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(bullet.speed).toBe(50);
            expect(bullet.lifetime).toBe(3);
            expect(bullet.damage).toBe(50);
            expect(bullet.age).toBe(0);
        });
        
        test('should create mesh with correct properties', () => {
            expect(bullet.mesh).toBeDefined();
            expect(bullet.mesh.position.x).toBe(startPosition.x);
            expect(bullet.mesh.position.y).toBe(startPosition.y);
            expect(bullet.mesh.position.z).toBe(startPosition.z);
            expect(bullet.mesh.castShadow).toBe(true);
            expect(bullet.mesh.receiveShadow).toBe(false);
        });
        
        test('should normalize direction vector', () => {
            const nonNormalizedDirection = new THREE.Vector3(10, 0, 0);
            const bullet2 = new Bullet(startPosition, nonNormalizedDirection);
            
            const length = Math.sqrt(
                bullet2.direction.x * bullet2.direction.x +
                bullet2.direction.y * bullet2.direction.y +
                bullet2.direction.z * bullet2.direction.z
            );
            expect(length).toBeCloseTo(1, 5);
        });
        
        test('should handle zero direction vector', () => {
            const zeroDirection = new THREE.Vector3(0, 0, 0);
            
            expect(() => {
                new Bullet(startPosition, zeroDirection);
            }).not.toThrow();
        });
    });
    
    describe('Movement', () => {
        test('should move in the correct direction', () => {
            const initialPosition = { ...bullet.mesh.position };
            const deltaTime = 0.016;
            
            bullet.update(deltaTime);
            
            expect(bullet.mesh.position.z).toBeLessThan(initialPosition.z);
        });
        
        test('should move at correct speed', () => {
            const deltaTime = 0.016;
            const expectedDistance = bullet.speed * deltaTime;
            
            const initialPosition = { ...bullet.mesh.position };
            
            bullet.update(deltaTime);
            
            const actualDistance = Math.abs(bullet.mesh.position.z - initialPosition.z);
            expect(actualDistance).toBeCloseTo(expectedDistance, 5);
        });
        
        test('should handle different directions', () => {
            const rightDirection = new THREE.Vector3(1, 0, 0);
            const bullet2 = new Bullet(startPosition, rightDirection);
            
            const initialPosition = { ...bullet2.mesh.position };
            const deltaTime = 0.016;
            
            bullet2.update(deltaTime);
            
            expect(bullet2.mesh.position.x).toBeGreaterThan(initialPosition.x);
        });
        
        test('should handle diagonal movement', () => {
            const diagonalDirection = new THREE.Vector3(1, 0, 1);
            const bullet2 = new Bullet(startPosition, diagonalDirection);
            
            const initialPosition = { ...bullet2.mesh.position };
            const deltaTime = 0.016;
            
            bullet2.update(deltaTime);
            
            expect(bullet2.mesh.position.x).toBeGreaterThan(initialPosition.x);
            expect(bullet2.mesh.position.z).toBeGreaterThan(initialPosition.z);
        });
    });
    
    describe('Age and Lifetime', () => {
        test('should increment age on update', () => {
            const deltaTime = 0.016;
            const initialAge = bullet.age;
            
            bullet.update(deltaTime);
            
            expect(bullet.age).toBe(initialAge + deltaTime);
        });
        
        test('should not be removed initially', () => {
            expect(bullet.shouldRemove()).toBe(false);
        });
        
        test('should be removed after lifetime expires', () => {
            bullet.age = bullet.lifetime + 0.1;
            
            expect(bullet.shouldRemove()).toBe(true);
        });
        
        test('should be removed exactly at lifetime', () => {
            bullet.age = bullet.lifetime;
            
            expect(bullet.shouldRemove()).toBe(true);
        });
        
        test('should handle multiple updates', () => {
            const deltaTime = 0.016;
            
            for (let i = 0; i < 10; i++) {
                bullet.update(deltaTime);
            }
            
            expect(bullet.age).toBeCloseTo(10 * deltaTime, 5);
        });
    });
    
    describe('Visual Effects', () => {
        test('should rotate bullet for visual effect', () => {
            const initialRotation = { ...bullet.mesh.rotation };
            const deltaTime = 0.016;
            
            bullet.update(deltaTime);
            
            expect(bullet.mesh.rotation.x).toBeGreaterThan(initialRotation.x);
            expect(bullet.mesh.rotation.y).toBeGreaterThan(initialRotation.y);
        });
        
        test('should have emissive material', () => {
            expect(bullet.mesh.material.emissive).toBeDefined();
            expect(bullet.mesh.material.emissiveIntensity).toBe(0.5);
        });
    });
    
    describe('Position and Damage', () => {
        test('should return current position', () => {
            const position = bullet.getPosition();
            
            expect(position.x).toBe(bullet.mesh.position.x);
            expect(position.y).toBe(bullet.mesh.position.y);
            expect(position.z).toBe(bullet.mesh.position.z);
        });
        
        test('should return cloned position', () => {
            const position = bullet.getPosition();
            
            // Modify the returned position
            position.x = 999;
            
            // Original position should remain unchanged
            expect(bullet.mesh.position.x).not.toBe(999);
        });
        
        test('should return correct damage', () => {
            expect(bullet.getDamage()).toBe(bullet.damage);
        });
        
        test('should return current age', () => {
            bullet.age = 1.5;
            expect(bullet.getAge()).toBe(1.5);
        });
        
        test('should return lifetime', () => {
            expect(bullet.getLifetime()).toBe(bullet.lifetime);
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle zero delta time', () => {
            const initialPosition = { ...bullet.mesh.position };
            const initialAge = bullet.age;
            
            bullet.update(0);
            
            expect(bullet.mesh.position.x).toBe(initialPosition.x);
            expect(bullet.mesh.position.y).toBe(initialPosition.y);
            expect(bullet.mesh.position.z).toBe(initialPosition.z);
            expect(bullet.age).toBe(initialAge);
        });
        
        test('should handle very large delta time', () => {
            const deltaTime = 1.0; // 1 second
            
            expect(() => {
                bullet.update(deltaTime);
            }).not.toThrow();
        });
        
        test('should handle negative delta time', () => {
            const initialAge = bullet.age;
            
            bullet.update(-0.016);
            
            expect(bullet.age).toBe(initialAge - 0.016);
        });
        
        test('should handle null start position', () => {
            expect(() => {
                new Bullet(null, direction);
            }).not.toThrow();
        });
        
        test('should handle null direction', () => {
            expect(() => {
                new Bullet(startPosition, null);
            }).not.toThrow();
        });
    });
    
    describe('Performance', () => {
        test('should handle many bullets efficiently', () => {
            const bullets = [];
            const deltaTime = 0.016;
            
            // Create many bullets
            for (let i = 0; i < 1000; i++) {
                const bullet = new Bullet(
                    new THREE.Vector3(i, i, i),
                    new THREE.Vector3(1, 0, 0)
                );
                bullets.push(bullet);
            }
            
            // Update all bullets
            const startTime = performance.now();
            bullets.forEach(bullet => {
                bullet.update(deltaTime);
            });
            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 50ms)
            expect(endTime - startTime).toBeLessThan(50);
        });
    });
    
    describe('Memory Management', () => {
        test('should not create memory leaks with many bullets', () => {
            const bullets = [];
            
            // Create and update many bullets
            for (let i = 0; i < 1000; i++) {
                const bullet = new Bullet(
                    { x: i, y: i, z: i },
                    { x: 1, y: 0, z: 0 }
                );
                bullet.update(0.016);
                bullets.push(bullet);
            }
            
            // Clear references
            bullets.length = 0;
            
            // Should not throw any errors
            expect(() => {
                // Force garbage collection if available
                if (global.gc) {
                    global.gc();
                }
            }).not.toThrow();
        });
    });
    
    describe('Different Bullet Types', () => {
        test('should handle different speeds', () => {
            bullet.speed = 100;
            const deltaTime = 0.016;
            const expectedDistance = bullet.speed * deltaTime;
            
            const initialPosition = { ...bullet.mesh.position };
            
            bullet.update(deltaTime);
            
            const actualDistance = Math.abs(bullet.mesh.position.z - initialPosition.z);
            expect(actualDistance).toBeCloseTo(expectedDistance, 5);
        });
        
        test('should handle different lifetimes', () => {
            bullet.lifetime = 1.0;
            
            bullet.age = 0.5;
            expect(bullet.shouldRemove()).toBe(false);
            
            bullet.age = 1.0;
            expect(bullet.shouldRemove()).toBe(true);
        });
        
        test('should handle different damage values', () => {
            bullet.damage = 75;
            expect(bullet.getDamage()).toBe(75);
        });
    });
}); 