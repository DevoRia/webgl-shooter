import * as THREE from 'three';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Bullet } from './Bullet.js';
import { InputManager } from '../input/InputManager.js';
import { CollisionManager } from './CollisionManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { LevelManager } from './LevelManager.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.inputManager = null;
        this.collisionManager = null;
        this.audioManager = null;
        this.levelManager = null;
        this.clock = new THREE.Clock();
        
        this.health = 100;
        this.ammo = 30;
        this.maxAmmo = 30;
        this.isGameOver = false;
        
        // Callbacks
        this.onScoreUpdate = null;
        this.onHealthUpdate = null;
        this.onAmmoUpdate = null;
        this.onGameOver = null;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupPlayer();
        this.setupManagers();
        this.setupLevelManager();
        this.setupEventListeners();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        // Add textured ground plane
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // Create a checkerboard pattern texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Draw checkerboard pattern
        const tileSize = 32;
        for (let x = 0; x < canvas.width; x += tileSize) {
            for (let y = 0; y < canvas.height; y += tileSize) {
                const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                ctx.fillStyle = isEven ? '#8FBC8F' : '#90EE90'; // Dark green and light green
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        // Add some grass texture
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillRect(x, y, 2, 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: 0x90EE90 
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add some obstacles
        this.addObstacles();
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
    }
    
    setupRenderer() {
        // Clear any existing canvas in the container
        const container = document.getElementById('gameContainer');
        const existingCanvas = container.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        container.appendChild(this.renderer.domElement);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    setupPlayer() {
        this.player = new Player();
        this.scene.add(this.player.mesh);
    }
    
    setupManagers() {
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager();
    }
    
    setupLevelManager() {
        this.levelManager = new LevelManager();
        
        // Налаштовуємо callbacks для LevelManager
        this.levelManager.onScoreUpdate = (score) => {
            if (this.onScoreUpdate) {
                this.onScoreUpdate(score);
            }
        };
        
        this.levelManager.onLevelUp = (level, levelData) => {
            this.handleLevelUp(level, levelData);
        };
    }
    
    setupEventListeners() {
        // Click handler for shooting and pointer lock
        this.renderer.domElement.addEventListener('click', (event) => {
            if (this.isGameOver) return;
            
            // Focus the canvas for keyboard input
            this.renderer.domElement.focus();
            
            // Request pointer lock if not already locked
            if (!this.inputManager.getPointerLocked()) {
                this.renderer.domElement.requestPointerLock();
            } else {
                // Shoot if pointer is already locked
                this.shoot();
            }
        });
        
        // Ensure canvas can receive keyboard focus
        this.renderer.domElement.tabIndex = 0;
        this.renderer.domElement.style.outline = 'none';
        
        // Keyboard events are handled by InputManager
        // No need for duplicate event listeners here
        
        // Handle focus events
        this.renderer.domElement.addEventListener('focus', () => {
            this.uiManager.updateFocusStatus(true);
        });
        
        this.renderer.domElement.addEventListener('blur', () => {
            this.uiManager.updateFocusStatus(false);
        });
        
        // Handle pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.renderer.domElement) {
                this.uiManager.updateMouseStatus(true);
                this.uiManager.showMessage('Mouse Look: ENABLED', 1500);
            } else {
                this.uiManager.updateMouseStatus(false);
                this.uiManager.showMessage('Mouse Look: DISABLED - Click to enable', 2000);
            }
        });
        
        // Handle pointer lock errors
        document.addEventListener('pointerlockerror', () => {
            console.log('Pointer lock failed - mouse look disabled');
        });
    }
    
    start() {
        console.log('Game.start() called');
        this.isGameOver = false;
        this.spawnEnemies();
        this.gameLoop();
        this.uiManager.showMapBoundaries();
        
        // Focus the canvas for keyboard input
        this.renderer.domElement.focus();
        console.log('Game started, canvas focused');
    }
    
    gameLoop() {
        if (this.isGameOver) return;
        
        const deltaTime = this.clock.getDelta();
        
        // Clamp deltaTime to prevent large jumps and ensure smooth movement
        const clampedDeltaTime = Math.min(deltaTime, 0.033); // Max 33ms (30 FPS minimum)
        
        this.update(clampedDeltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        if (this.isGameOver) return;
        
        // Update player
        this.player.update(deltaTime, this.inputManager);
        
        // Update UI movement status
        this.uiManager.updateMovementStatus(this.inputManager, this.player.getPosition());
        
        // Constrain player to map boundaries
        this.constrainPlayerToMap();
        
        // Update camera to follow player - FPS style
        this.camera.position.copy(this.player.mesh.position);
        this.camera.position.y += 1.7; // Eye level height
        this.camera.lookAt(this.camera.position.clone().add(this.player.getLookDirection()));
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player.mesh.position);
        });
        
        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.update(deltaTime);
            
            // Remove bullets that are too far or hit something
            if (bullet.shouldRemove()) {
                this.bullets.splice(index, 1);
                this.scene.remove(bullet.mesh);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Spawn new enemies periodically
        this.updateEnemySpawning(deltaTime);
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    shoot() {
        if (this.ammo <= 0) {
            this.audioManager.playSound('empty');
            return;
        }
        
        this.ammo--;
        this.updateAmmo();
        
        // Create bullet at camera position (eye level) instead of player position
        const bullet = new Bullet(
            this.camera.position.clone(),
            this.player.getLookDirection()
        );
        
        this.bullets.push(bullet);
        this.scene.add(bullet.mesh);
        
        this.audioManager.playSound('shoot');
        
        // Auto-reload when ammo is empty
        if (this.ammo <= 0) {
            setTimeout(() => {
                this.ammo = this.maxAmmo;
                this.updateAmmo();
            }, 1000);
        }
    }
    
    checkCollisions() {
        // Check bullet-enemy collisions
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.collisionManager.checkCollision(bullet.mesh, enemy.mesh)) {
                    // Enemy hit
                    this.levelManager.addScore(10);
                    
                    // Remove bullet and enemy
                    this.bullets.splice(bulletIndex, 1);
                    this.scene.remove(bullet.mesh);
                    this.enemies.splice(enemyIndex, 1);
                    this.scene.remove(enemy.mesh);
                    
                    this.audioManager.playSound('enemyHit');
                }
            });
        });
        
        // Check player-enemy collisions
        this.enemies.forEach((enemy, index) => {
            if (this.collisionManager.checkCollision(this.player.mesh, enemy.mesh)) {
                // Player hit
                this.health -= enemy.getDamage();
                this.updateHealth();
                
                // Remove enemy
                this.enemies.splice(index, 1);
                this.scene.remove(enemy.mesh);
                
                this.audioManager.playSound('playerHit');
                
                if (this.health <= 0) {
                    this.endGame();
                }
            }
        });
    }
    
    spawnEnemies() {
        const spawnEnemy = () => {
            if (this.isGameOver) return;
            
            const levelData = this.levelManager.getCurrentLevelData();
            
            // Перевіряємо чи не перевищено максимальну кількість ворогів
            if (this.enemies.length >= levelData.maxEnemies) {
                setTimeout(spawnEnemy, 1000);
                return;
            }
            
            const enemy = new Enemy(levelData);
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30;
            
            enemy.mesh.position.set(
                Math.cos(angle) * distance,
                1,
                Math.sin(angle) * distance
            );
            
            this.enemies.push(enemy);
            this.scene.add(enemy.mesh);
            
            // Schedule next spawn based on level spawn rate
            const spawnDelay = (levelData.enemySpawnRate * 1000) + Math.random() * 500; // Зменшили випадковий час
            setTimeout(spawnEnemy, spawnDelay);
        };
        
        // Спочатку створюємо кілька ворогів одразу
        const initialEnemies = 3;
        for (let i = 0; i < initialEnemies; i++) {
            setTimeout(() => {
                if (!this.isGameOver) {
                    const levelData = this.levelManager.getCurrentLevelData();
                    const enemy = new Enemy(levelData);
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 20 + Math.random() * 30;
                    
                    enemy.mesh.position.set(
                        Math.cos(angle) * distance,
                        1,
                        Math.sin(angle) * distance
                    );
                    
                    this.enemies.push(enemy);
                    this.scene.add(enemy.mesh);
                }
            }, i * 500); // Кожен ворог з'являється через 0.5 секунди
        }
        
        // Починаємо регулярний спавн через 2 секунди
        setTimeout(spawnEnemy, 2000);
    }
    
    updateEnemySpawning(deltaTime) {
        // This could be expanded for more complex spawning logic
    }
    
    handleLevelUp(level, levelData) {
        // Показуємо повідомлення про новий рівень
        this.uiManager.showMessage(`LEVEL ${level} REACHED!`, 3000);
        
        // Змінюємо колір неба для нового рівня
        const skyColors = [
            0x87CEEB, // Синій - рівень 1
            0xFFA500, // Помаранчевий - рівень 2
            0xFFFF00, // Жовтий - рівень 3
            0x00FF00, // Зелений - рівень 4
            0x00FFFF, // Ціан - рівень 5
            0xFF00FF, // Маджента - рівень 6
            0xFFFFFF, // Білий - рівень 7+
        ];
        
        const skyColor = skyColors[Math.min(level - 1, skyColors.length - 1)];
        this.scene.background = new THREE.Color(skyColor);
        this.scene.fog = new THREE.Fog(skyColor, 50, 200);
        
        // Граємо звук рівня
        this.audioManager.playSound('levelUp');
    }
    
    updateScore() {
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.levelManager.getScore());
        }
    }
    
    getCurrentLevel() {
        return this.levelManager.getCurrentLevel();
    }
    
    getCurrentLevelData() {
        return this.levelManager.getCurrentLevelData();
    }
    
    getProgressToNextLevel() {
        return this.levelManager.getProgressToNextLevel();
    }
    
    getFibonacciNumber(level) {
        return this.levelManager.getFibonacciNumber(level);
    }
    
    updateHealth() {
        if (this.onHealthUpdate) {
            this.onHealthUpdate(this.health);
        }
    }
    
    updateAmmo() {
        if (this.onAmmoUpdate) {
            this.onAmmoUpdate(this.ammo);
        }
    }
    
    endGame() {
        this.isGameOver = true;
        this.uiManager.hideMapBoundaries();
        
        if (this.onGameOver) {
            this.onGameOver(this.levelManager.getScore());
        }
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    addObstacles() {
        // Add some random obstacles for cover
        for (let i = 0; i < 15; i++) {
            const geometry = new THREE.BoxGeometry(2, 3, 2);
            const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const obstacle = new THREE.Mesh(geometry, material);
            
            obstacle.position.set(
                (Math.random() - 0.5) * 150,
                1.5,
                (Math.random() - 0.5) * 150
            );
            
            obstacle.castShadow = true;
            obstacle.receiveShadow = true;
            this.scene.add(obstacle);
        }
        
        // Add invisible walls at map boundaries
        this.addInvisibleWalls();
    }
    
    addInvisibleWalls() {
        const wallHeight = 10;
        const wallThickness = 1;
        const mapSize = 80;
        
        // Create wall geometry
        const wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, mapSize * 2);
        const wallMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000, 
            transparent: true, 
            opacity: 0.0 
        });
        
        // North wall
        const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
        northWall.position.set(0, wallHeight / 2, -mapSize);
        this.scene.add(northWall);
        
        // South wall
        const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
        southWall.position.set(0, wallHeight / 2, mapSize);
        this.scene.add(southWall);
        
        // East wall
        const eastWall = new THREE.Mesh(wallGeometry, wallMaterial);
        eastWall.rotation.y = Math.PI / 2;
        eastWall.position.set(mapSize, wallHeight / 2, 0);
        this.scene.add(eastWall);
        
        // West wall
        const westWall = new THREE.Mesh(wallGeometry, wallMaterial);
        westWall.rotation.y = Math.PI / 2;
        westWall.position.set(-mapSize, wallHeight / 2, 0);
        this.scene.add(westWall);
    }
    
    constrainPlayerToMap() {
        const mapSize = 80; // Half of the map size (total map is 160x160)
        const playerPos = this.player.mesh.position;
        let wasConstrained = false;
        
        // Constrain X position
        if (playerPos.x > mapSize) {
            playerPos.x = mapSize;
            wasConstrained = true;
        } else if (playerPos.x < -mapSize) {
            playerPos.x = -mapSize;
            wasConstrained = true;
        }
        
        // Constrain Z position
        if (playerPos.z > mapSize) {
            playerPos.z = mapSize;
            wasConstrained = true;
        } else if (playerPos.z < -mapSize) {
            playerPos.z = -mapSize;
            wasConstrained = true;
        }
        
        // Keep player on ground level
        playerPos.y = 1;
        
        // Show warning if player was constrained
        if (wasConstrained) {
            this.uiManager.showMessage('Map Boundary Reached!', 1000);
        }
        
        // Show warning when approaching boundaries
        const warningDistance = 10;
        if (Math.abs(playerPos.x) > mapSize - warningDistance || 
            Math.abs(playerPos.z) > mapSize - warningDistance) {
            this.uiManager.showBoundaryWarning(true);
        } else {
            this.uiManager.showBoundaryWarning(false);
        }
    }
    
    dispose() {
        // Clean up resources
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.renderer.dispose();
        this.inputManager.dispose();
        this.audioManager.dispose();
    }
} 