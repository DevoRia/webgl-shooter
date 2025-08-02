import * as THREE from 'three';

export class Enemy {
    constructor(levelData = null) {
        // Базові параметри
        this.baseSpeed = 3;
        this.baseHealth = 80;
        this.baseDamage = 25;
        this.detectionRange = 15;
        this.attackRange = 2;
        
        // Параметри з рівня (якщо передані)
        if (levelData) {
            this.speed = levelData.enemySpeed || this.baseSpeed;
            this.health = levelData.enemyHealth || this.baseHealth;
            this.damage = levelData.enemyDamage || this.baseDamage;
            this.color = levelData.color || 0xff0000;
        } else {
            this.speed = this.baseSpeed;
            this.health = this.baseHealth;
            this.damage = this.baseDamage;
            this.color = 0xff0000;
        }
        
        this.mesh = null;
        this.target = null;
        this.state = 'patrol'; // patrol, chase, attack
        this.maxHealth = this.health; // Зберігаємо максимальне здоров'я для відображення
        
        this.setupMesh();
    }
    
    setupMesh() {
        // Create enemy body з кольором рівня
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
    }
    
    update(deltaTime, playerPosition) {
        this.target = playerPosition;
        
        if (this.target) {
            const distanceToPlayer = this.mesh.position.distanceTo(this.target);
            
            if (distanceToPlayer <= this.attackRange) {
                this.state = 'attack';
                this.attack();
            } else if (distanceToPlayer <= this.detectionRange) {
                this.state = 'chase';
                this.chase(deltaTime);
            } else {
                this.state = 'patrol';
                this.patrol(deltaTime);
            }
        } else {
            this.patrol(deltaTime);
        }
    }
    
    chase(deltaTime) {
        if (!this.target) return;
        
        // Calculate direction to player
        const direction = new THREE.Vector3();
        direction.subVectors(this.target, this.mesh.position).normalize();
        
        // Move towards player
        const movement = direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(movement);
        
        // Keep enemy on ground
        this.mesh.position.y = 1;
        
        // Rotate to face player
        this.faceTarget(this.target);
    }
    
    patrol(deltaTime) {
        // Simple patrol behavior - move in a random direction
        if (!this.patrolDirection) {
            this.patrolDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            this.patrolTimer = 0;
        }
        
        this.patrolTimer += deltaTime;
        
        // Change direction every 3 seconds
        if (this.patrolTimer > 3) {
            this.patrolDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            this.patrolTimer = 0;
        }
        
        // Move in patrol direction
        const movement = this.patrolDirection.clone().multiplyScalar(this.speed * 0.5 * deltaTime);
        this.mesh.position.add(movement);
        
        // Keep enemy on ground
        this.mesh.position.y = 1;
        
        // Keep enemy within bounds
        const maxDistance = 50;
        if (this.mesh.position.length() > maxDistance) {
            this.mesh.position.normalize().multiplyScalar(maxDistance);
        }
    }
    
    attack() {
        // Attack behavior - could be expanded with animations
        // For now, just damage is handled in collision detection
    }
    
    faceTarget(targetPosition) {
        if (!targetPosition) return;
        
        const direction = new THREE.Vector3();
        direction.subVectors(targetPosition, this.mesh.position).normalize();
        
        // Calculate rotation to face target
        const angle = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = angle;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Visual feedback for damage
        this.mesh.material.color.setHex(0xff6666);
        setTimeout(() => {
            this.mesh.material.color.setHex(this.color);
        }, 100);
        
        return this.health <= 0;
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getHealth() {
        return this.health;
    }
    
    getMaxHealth() {
        return this.maxHealth;
    }
    
    getHealthPercentage() {
        return this.health / this.maxHealth;
    }
    
    isDead() {
        return this.health <= 0;
    }
    
    getDamage() {
        return this.damage;
    }
    
    getSpeed() {
        return this.speed;
    }
    
    getColor() {
        return this.color;
    }
} 