import { Game } from '../game/Game.js';
import { Player } from '../game/Player.js';
import { Enemy } from '../game/Enemy.js';
import { Bullet } from '../game/Bullet.js';
import { InputManager } from '../input/InputManager.js';
import { CollisionManager } from '../game/CollisionManager.js';
import { AudioManager } from '../audio/AudioManager.js';

// Mock the dependencies
jest.mock('../game/Player.js');
jest.mock('../game/Enemy.js');
jest.mock('../game/Bullet.js');
jest.mock('../input/InputManager.js');
jest.mock('../game/CollisionManager.js');
jest.mock('../audio/AudioManager.js');

describe('Game', () => {
    let game;
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock Player constructor
        Player.mockImplementation(() => ({
            mesh: { position: { x: 0, y: 1, z: 0 } },
            update: jest.fn(),
            getLookDirection: jest.fn(() => ({ x: 0, y: 0, z: -1 }))
        }));
        
        // Mock Enemy constructor
        Enemy.mockImplementation(() => ({
            mesh: { position: { x: 0, y: 1, z: 0 } },
            update: jest.fn(),
            takeDamage: jest.fn(),
            isDead: jest.fn(() => false)
        }));
        
        // Mock Bullet constructor
        Bullet.mockImplementation(() => ({
            mesh: { position: { x: 0, y: 0, z: 0 } },
            update: jest.fn(),
            shouldRemove: jest.fn(() => false),
            getDamage: jest.fn(() => 50)
        }));
        
        // Mock InputManager constructor
        InputManager.mockImplementation(() => ({
            isKeyPressed: jest.fn(() => false),
            getMouseMovement: jest.fn(() => ({ x: 0, y: 0 })),
            dispose: jest.fn()
        }));
        
        // Mock CollisionManager constructor
        CollisionManager.mockImplementation(() => ({
            checkCollision: jest.fn(() => false),
            checkBulletEnemyCollision: jest.fn(() => false),
            checkPlayerEnemyCollision: jest.fn(() => false)
        }));
        
        // Mock AudioManager constructor
        AudioManager.mockImplementation(() => ({
            playSound: jest.fn(),
            dispose: jest.fn()
        }));
        
        game = new Game();
    });
    
    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(game.score).toBe(0);
            expect(game.health).toBe(100);
            expect(game.ammo).toBe(30);
            expect(game.maxAmmo).toBe(30);
            expect(game.isGameOver).toBe(false);
            expect(game.enemies).toEqual([]);
            expect(game.bullets).toEqual([]);
        });
        
        test('should create scene, camera, and renderer', () => {
            expect(game.scene).toBeDefined();
            expect(game.camera).toBeDefined();
            expect(game.renderer).toBeDefined();
        });
        
        test('should initialize managers', () => {
            expect(game.inputManager).toBeDefined();
            expect(game.collisionManager).toBeDefined();
            expect(game.audioManager).toBeDefined();
        });
        
        test('should create player', () => {
            expect(game.player).toBeDefined();
            expect(Player).toHaveBeenCalled();
        });
    });
    
    describe('Game Loop', () => {
        test('should call update and render in game loop', () => {
            const updateSpy = jest.spyOn(game, 'update');
            const renderSpy = jest.spyOn(game, 'render');
            
            game.gameLoop();
            
            expect(updateSpy).toHaveBeenCalled();
            expect(renderSpy).toHaveBeenCalled();
        });
        
        test('should not run game loop when game is over', () => {
            game.isGameOver = true;
            const updateSpy = jest.spyOn(game, 'update');
            
            game.gameLoop();
            
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('Update', () => {
        test('should update player with input manager', () => {
            const deltaTime = 0.016;
            game.update(deltaTime);
            
            expect(game.player.update).toHaveBeenCalledWith(deltaTime, game.inputManager);
        });
        
        test('should update camera position to follow player', () => {
            const deltaTime = 0.016;
            game.update(deltaTime);
            
            expect(game.camera.position).toEqual(game.player.mesh.position);
        });
        
        test('should update enemies', () => {
            const enemy = new Enemy();
            game.enemies.push(enemy);
            const deltaTime = 0.016;
            
            game.update(deltaTime);
            
            expect(enemy.update).toHaveBeenCalledWith(deltaTime, game.player.mesh.position);
        });
        
        test('should update bullets and remove old ones', () => {
            const bullet = new Bullet();
            bullet.shouldRemove.mockReturnValue(true);
            game.bullets.push(bullet);
            const deltaTime = 0.016;
            
            game.update(deltaTime);
            
            expect(bullet.update).toHaveBeenCalledWith(deltaTime);
            expect(game.bullets).toHaveLength(0);
        });
    });
    
    describe('Shooting', () => {
        test('should create bullet when shooting with ammo', () => {
            game.ammo = 10;
            game.shoot();
            
            expect(Bullet).toHaveBeenCalled();
            expect(game.ammo).toBe(9);
            expect(game.bullets).toHaveLength(1);
        });
        
        test('should not shoot when out of ammo', () => {
            game.ammo = 0;
            game.shoot();
            
            expect(Bullet).not.toHaveBeenCalled();
            expect(game.ammo).toBe(0);
            expect(game.bullets).toHaveLength(0);
        });
        
        test('should play empty sound when out of ammo', () => {
            game.ammo = 0;
            game.shoot();
            
            expect(game.audioManager.playSound).toHaveBeenCalledWith('empty');
        });
        
        test('should play shoot sound when shooting', () => {
            game.ammo = 10;
            game.shoot();
            
            expect(game.audioManager.playSound).toHaveBeenCalledWith('shoot');
        });
    });
    
    describe('Collision Detection', () => {
        test('should detect bullet-enemy collision', () => {
            const bullet = new Bullet();
            const enemy = new Enemy();
            game.bullets.push(bullet);
            game.enemies.push(enemy);
            
            game.collisionManager.checkCollision.mockReturnValue(true);
            
            game.checkCollisions();
            
            expect(game.score).toBe(10);
            expect(game.bullets).toHaveLength(0);
            expect(game.enemies).toHaveLength(0);
        });
        
        test('should detect player-enemy collision', () => {
            const enemy = new Enemy();
            game.enemies.push(enemy);
            
            game.collisionManager.checkCollision.mockReturnValue(true);
            
            game.checkCollisions();
            
            expect(game.health).toBe(80);
            expect(game.enemies).toHaveLength(0);
        });
        
        test('should end game when health reaches zero', () => {
            const enemy = new Enemy();
            game.enemies.push(enemy);
            game.health = 20;
            
            game.collisionManager.checkCollision.mockReturnValue(true);
            
            game.checkCollisions();
            
            expect(game.isGameOver).toBe(true);
        });
    });
    
    describe('Enemy Spawning', () => {
        test('should spawn enemies periodically', () => {
            jest.useFakeTimers();
            
            game.spawnEnemies();
            
            expect(setTimeout).toHaveBeenCalled();
            
            jest.runAllTimers();
            
            expect(Enemy).toHaveBeenCalled();
            expect(game.enemies.length).toBeGreaterThan(0);
            
            jest.useRealTimers();
        });
    });
    
    describe('UI Updates', () => {
        test('should call score update callback', () => {
            const mockCallback = jest.fn();
            game.onScoreUpdate = mockCallback;
            
            game.updateScore();
            
            expect(mockCallback).toHaveBeenCalledWith(game.score);
        });
        
        test('should call health update callback', () => {
            const mockCallback = jest.fn();
            game.onHealthUpdate = mockCallback;
            
            game.updateHealth();
            
            expect(mockCallback).toHaveBeenCalledWith(game.health);
        });
        
        test('should call ammo update callback', () => {
            const mockCallback = jest.fn();
            game.onAmmoUpdate = mockCallback;
            
            game.updateAmmo();
            
            expect(mockCallback).toHaveBeenCalledWith(game.ammo);
        });
    });
    
    describe('Game Over', () => {
        test('should end game and call callback', () => {
            const mockCallback = jest.fn();
            game.onGameOver = mockCallback;
            
            game.endGame();
            
            expect(game.isGameOver).toBe(true);
            expect(mockCallback).toHaveBeenCalledWith(game.score);
        });
    });
    
    describe('Resize Handling', () => {
        test('should update camera and renderer on resize', () => {
            const originalWidth = window.innerWidth;
            const originalHeight = window.innerHeight;
            
            window.innerWidth = 1920;
            window.innerHeight = 1080;
            
            game.handleResize();
            
            expect(game.camera.aspect).toBe(1920 / 1080);
            expect(game.renderer.setSize).toHaveBeenCalledWith(1920, 1080);
            
            // Restore original values
            window.innerWidth = originalWidth;
            window.innerHeight = originalHeight;
        });
    });
    
    describe('Cleanup', () => {
        test('should dispose resources properly', () => {
            game.dispose();
            
            expect(game.renderer.dispose).toHaveBeenCalled();
            expect(game.inputManager.dispose).toHaveBeenCalled();
            expect(game.audioManager.dispose).toHaveBeenCalled();
        });
    });
}); 