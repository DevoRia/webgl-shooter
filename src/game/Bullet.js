import * as THREE from 'three';

export class Bullet {
    constructor(startPosition, direction) {
        this.speed = 50;
        this.lifetime = 3; // seconds
        this.damage = 50;
        
        this.mesh = null;
        this.direction = direction.clone().normalize();
        this.age = 0;
        
        this.setupMesh(startPosition);
    }
    
    setupMesh(startPosition) {
        // Create bullet (small yellow sphere)
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.position.copy(startPosition);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        // Move bullet
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.mesh.position.add(movement);
        
        // Add some visual effects
        this.mesh.rotation.x += deltaTime * 10;
        this.mesh.rotation.y += deltaTime * 10;
    }
    
    shouldRemove() {
        return this.age >= this.lifetime;
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    getDamage() {
        return this.damage;
    }
    
    getAge() {
        return this.age;
    }
    
    getLifetime() {
        return this.lifetime;
    }
} 