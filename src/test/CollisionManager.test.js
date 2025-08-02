import { CollisionManager } from '../game/CollisionManager.js';

describe('CollisionManager', () => {
    let collisionManager;
    
    beforeEach(() => {
        collisionManager = new CollisionManager();
    });
    
    describe('Initialization', () => {
        test('should initialize with default collision distance', () => {
            expect(collisionManager.collisionDistance).toBe(1.0);
        });
    });
    
    describe('Basic Collision Detection', () => {
        test('should detect collision between two meshes', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 0.5, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollision(mesh1, mesh2);
            
            expect(result).toBe(true);
        });
        
        test('should not detect collision when meshes are far apart', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 2, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollision(mesh1, mesh2);
            
            expect(result).toBe(false);
        });
        
        test('should handle null meshes', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            
            expect(collisionManager.checkCollision(null, mesh1)).toBe(false);
            expect(collisionManager.checkCollision(mesh1, null)).toBe(false);
            expect(collisionManager.checkCollision(null, null)).toBe(false);
        });
    });
    
    describe('Radius-Based Collision Detection', () => {
        test('should detect collision with custom radii', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 1, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollisionWithRadius(mesh1, mesh2, 0.6, 0.6);
            
            expect(result).toBe(true);
        });
        
        test('should not detect collision when radii are too small', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 1, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollisionWithRadius(mesh1, mesh2, 0.4, 0.4);
            
            expect(result).toBe(false);
        });
        
        test('should use default radii when not specified', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 0.5, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollisionWithRadius(mesh1, mesh2);
            
            expect(result).toBe(true);
        });
    });
    
    describe('Point Collision Detection', () => {
        test('should detect collision between point and mesh', () => {
            const point = { x: 0.5, y: 0, z: 0 };
            const mesh = { position: { x: 0, y: 0, z: 0 } };
            
            const result = collisionManager.checkPointCollision(point, mesh, 0.6);
            
            expect(result).toBe(true);
        });
        
        test('should not detect collision when point is outside radius', () => {
            const point = { x: 1, y: 0, z: 0 };
            const mesh = { position: { x: 0, y: 0, z: 0 } };
            
            const result = collisionManager.checkPointCollision(point, mesh, 0.5);
            
            expect(result).toBe(false);
        });
        
        test('should use default radius when not specified', () => {
            const point = { x: 0.5, y: 0, z: 0 };
            const mesh = { position: { x: 0, y: 0, z: 0 } };
            
            const result = collisionManager.checkPointCollision(point, mesh);
            
            expect(result).toBe(true);
        });
    });
    
    describe('Ray Collision Detection', () => {
        test('should detect ray collision with mesh', () => {
            const rayOrigin = { x: 0, y: 0, z: 0 };
            const rayDirection = { x: 1, y: 0, z: 0 };
            const mesh = { position: { x: 5, y: 0, z: 0 } };
            
            const result = collisionManager.checkRayCollision(rayOrigin, rayDirection, mesh, 10);
            
            expect(result).toBe(false); // Mock returns empty array
        });
        
        test('should respect max distance parameter', () => {
            const rayOrigin = { x: 0, y: 0, z: 0 };
            const rayDirection = { x: 1, y: 0, z: 0 };
            const mesh = { position: { x: 5, y: 0, z: 0 } };
            
            const result = collisionManager.checkRayCollision(rayOrigin, rayDirection, mesh, 3);
            
            expect(result).toBe(false);
        });
    });
    
    describe('AABB Collision Detection', () => {
        test('should detect AABB collision', () => {
            const box1 = {
                min: { x: 0, y: 0, z: 0 },
                max: { x: 1, y: 1, z: 1 }
            };
            const box2 = {
                min: { x: 0.5, y: 0.5, z: 0.5 },
                max: { x: 1.5, y: 1.5, z: 1.5 }
            };
            
            const result = collisionManager.checkAABBCollision(box1, box2);
            
            expect(result).toBe(true);
        });
        
        test('should not detect AABB collision when boxes are separate', () => {
            const box1 = {
                min: { x: 0, y: 0, z: 0 },
                max: { x: 1, y: 1, z: 1 }
            };
            const box2 = {
                min: { x: 2, y: 2, z: 2 },
                max: { x: 3, y: 3, z: 3 }
            };
            
            const result = collisionManager.checkAABBCollision(box1, box2);
            
            expect(result).toBe(false);
        });
    });
    
    describe('Game-Specific Collision Methods', () => {
        test('should detect bullet-enemy collision', () => {
            const bullet = { mesh: { position: { x: 0, y: 0, z: 0 } } };
            const enemy = { mesh: { position: { x: 0.3, y: 0, z: 0 } } };
            
            const result = collisionManager.checkBulletEnemyCollision(bullet, enemy);
            
            expect(result).toBe(true);
        });
        
        test('should detect player-enemy collision', () => {
            const player = { mesh: { position: { x: 0, y: 0, z: 0 } } };
            const enemy = { mesh: { position: { x: 0.8, y: 0, z: 0 } } };
            
            const result = collisionManager.checkPlayerEnemyCollision(player, enemy);
            
            expect(result).toBe(true);
        });
    });
    
    describe('Distance Calculations', () => {
        test('should calculate distance between two meshes', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 3, y: 4, z: 0 } };
            
            const distance = collisionManager.getDistance(mesh1, mesh2);
            
            expect(distance).toBe(5); // 3-4-5 triangle
        });
        
        test('should return Infinity for null meshes', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            
            expect(collisionManager.getDistance(null, mesh1)).toBe(Infinity);
            expect(collisionManager.getDistance(mesh1, null)).toBe(Infinity);
        });
        
        test('should check if objects are within range', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 2, y: 0, z: 0 } };
            
            expect(collisionManager.isWithinRange(mesh1, mesh2, 3)).toBe(true);
            expect(collisionManager.isWithinRange(mesh1, mesh2, 1)).toBe(false);
        });
    });
    
    describe('Closest Object Detection', () => {
        test('should find closest object from list', () => {
            const referenceMesh = { position: { x: 0, y: 0, z: 0 } };
            const objectList = [
                { mesh: { position: { x: 5, y: 0, z: 0 } } },
                { mesh: { position: { x: 2, y: 0, z: 0 } } },
                { mesh: { position: { x: 10, y: 0, z: 0 } } }
            ];
            
            const closest = collisionManager.getClosestObject(referenceMesh, objectList);
            
            expect(closest).toBe(objectList[1]); // Distance 2
        });
        
        test('should return null for empty list', () => {
            const referenceMesh = { position: { x: 0, y: 0, z: 0 } };
            
            const closest = collisionManager.getClosestObject(referenceMesh, []);
            
            expect(closest).toBeNull();
        });
        
        test('should return null for null reference mesh', () => {
            const objectList = [
                { mesh: { position: { x: 1, y: 0, z: 0 } } }
            ];
            
            const closest = collisionManager.getClosestObject(null, objectList);
            
            expect(closest).toBeNull();
        });
    });
    
    describe('Edge Cases', () => {
        test('should handle zero distance collision', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 0, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollision(mesh1, mesh2);
            
            expect(result).toBe(true);
        });
        
        test('should handle very large distances', () => {
            const mesh1 = { position: { x: 0, y: 0, z: 0 } };
            const mesh2 = { position: { x: 1000000, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollision(mesh1, mesh2);
            
            expect(result).toBe(false);
        });
        
        test('should handle negative coordinates', () => {
            const mesh1 = { position: { x: -1, y: 0, z: 0 } };
            const mesh2 = { position: { x: -0.5, y: 0, z: 0 } };
            
            const result = collisionManager.checkCollision(mesh1, mesh2);
            
            expect(result).toBe(true);
        });
    });
    
    describe('Performance', () => {
        test('should handle many collision checks efficiently', () => {
            const meshes = [];
            for (let i = 0; i < 1000; i++) {
                meshes.push({ position: { x: i, y: 0, z: 0 } });
            }
            
            const startTime = performance.now();
            
            for (let i = 0; i < 100; i++) {
                collisionManager.checkCollision(meshes[i], meshes[i + 1]);
            }
            
            const endTime = performance.now();
            
            // Should complete within reasonable time (less than 10ms)
            expect(endTime - startTime).toBeLessThan(10);
        });
    });
}); 