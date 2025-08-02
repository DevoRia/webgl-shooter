import * as THREE from 'three';

export class Player {
    constructor() {
        this.speed = 15; // Increased speed for more noticeable movement
        this.rotationSpeed = 0.002;
        this.mouseSensitivity = 0.005; // Much higher sensitivity for better FPS experience
        
        this.mesh = null;
        this.direction = new THREE.Vector3(0, 0, -1);
        this.velocity = new THREE.Vector3();
        
        this.setupMesh();
    }
    
    setupMesh() {
        // Create player body (capsule shape)
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x0066cc });
        this.mesh = new THREE.Mesh(geometry, material);
        
        this.mesh.position.set(0, 1, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = false;
    }
    
    update(deltaTime, inputManager) {
        this.handleMovement(deltaTime, inputManager);
        this.handleRotation(inputManager);
    }
    
    handleMovement(deltaTime, inputManager) {
        // Clamp deltaTime to prevent large jumps and ensure smooth movement
        const clampedDeltaTime = Math.min(deltaTime, 0.033); // Max 33ms (30 FPS minimum)
        
        const moveVector = new THREE.Vector3();
        
        // Forward/backward movement
        if (inputManager.isKeyPressed('w') || inputManager.isKeyPressed('W')) {
            moveVector.add(this.direction.clone().multiplyScalar(this.speed * clampedDeltaTime));
        }
        if (inputManager.isKeyPressed('s') || inputManager.isKeyPressed('S')) {
            moveVector.add(this.direction.clone().multiplyScalar(-this.speed * clampedDeltaTime));
        }
        
        // Left/right movement (strafe)
        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(this.direction, new THREE.Vector3(0, 1, 0)).normalize();
        
        if (inputManager.isKeyPressed('a') || inputManager.isKeyPressed('A')) {
            moveVector.add(rightVector.clone().multiplyScalar(-this.speed * clampedDeltaTime));
        }
        if (inputManager.isKeyPressed('d') || inputManager.isKeyPressed('D')) {
            moveVector.add(rightVector.clone().multiplyScalar(this.speed * clampedDeltaTime));
        }
        
        // Apply movement
        if (moveVector.length() > 0) {
            this.mesh.position.add(moveVector);
        }
        
        // Keep player on ground
        this.mesh.position.y = 1;
    }
    
    handleRotation(inputManager) {
        const mouseMovement = inputManager.getMouseMovement();
        
        if (mouseMovement.x !== 0 || mouseMovement.y !== 0) {
            // Horizontal rotation (yaw) - more responsive
            const yawRotation = new THREE.Matrix4();
            yawRotation.makeRotationY(-mouseMovement.x * this.mouseSensitivity);
            this.direction.applyMatrix4(yawRotation);
            
            // Vertical rotation (pitch) - full range for better FPS experience
            const currentPitch = Math.asin(this.direction.y);
            const newPitch = currentPitch - mouseMovement.y * this.mouseSensitivity;
            const clampedPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, newPitch)); // Almost full vertical range
            
            // Recalculate direction with new pitch
            const horizontalLength = Math.cos(clampedPitch);
            this.direction.x = Math.sin(this.getYaw()) * horizontalLength;
            this.direction.z = Math.cos(this.getYaw()) * horizontalLength;
            this.direction.y = Math.sin(clampedPitch);
            this.direction.normalize();
        }
    }
    
    setMouseSensitivity(sensitivity) {
        this.mouseSensitivity = Math.max(0.001, Math.min(0.01, sensitivity));
    }
    
    getMouseSensitivity() {
        return this.mouseSensitivity;
    }
    
    getYaw() {
        return Math.atan2(this.direction.x, this.direction.z);
    }
    
    getLookDirection() {
        return this.direction.clone();
    }
    
    getPosition() {
        return this.mesh.position.clone();
    }
    
    takeDamage(amount) {
        // This could be expanded for damage effects
        return amount;
    }
} 