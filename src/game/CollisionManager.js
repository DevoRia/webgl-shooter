import * as THREE from 'three';

export class CollisionManager {
    constructor() {
        this.collisionDistance = 1.0; // Distance threshold for collision
    }
    
    checkCollision(mesh1, mesh2) {
        if (!mesh1 || !mesh2) return false;
        
        const distance = mesh1.position.distanceTo(mesh2.position);
        return distance <= this.collisionDistance;
    }
    
    checkCollisionWithRadius(mesh1, mesh2, radius1 = 0.5, radius2 = 0.5) {
        if (!mesh1 || !mesh2) return false;
        
        const distance = mesh1.position.distanceTo(mesh2.position);
        const combinedRadius = radius1 + radius2;
        
        return distance <= combinedRadius;
    }
    
    checkPointCollision(point, mesh, radius = 0.5) {
        if (!mesh) return false;
        
        const distance = point.distanceTo(mesh.position);
        return distance <= radius;
    }
    
    checkRayCollision(rayOrigin, rayDirection, mesh, maxDistance = 100) {
        if (!mesh) return false;
        
        const raycaster = new THREE.Raycaster(rayOrigin, rayDirection, 0, maxDistance);
        const intersects = raycaster.intersectObject(mesh);
        
        return intersects.length > 0;
    }
    
    getCollisionPoint(rayOrigin, rayDirection, mesh) {
        if (!mesh) return null;
        
        const raycaster = new THREE.Raycaster(rayOrigin, rayDirection);
        const intersects = raycaster.intersectObject(mesh);
        
        if (intersects.length > 0) {
            return intersects[0].point;
        }
        
        return null;
    }
    
    checkAABBCollision(box1, box2) {
        // Simple AABB collision detection
        const min1 = box1.min;
        const max1 = box1.max;
        const min2 = box2.min;
        const max2 = box2.max;
        
        return (min1.x <= max2.x && max1.x >= min2.x) &&
               (min1.y <= max2.y && max1.y >= min2.y) &&
               (min1.z <= max2.z && max1.z >= min2.z);
    }
    
    // Check if a bullet hits an enemy
    checkBulletEnemyCollision(bullet, enemy) {
        return this.checkCollisionWithRadius(bullet.mesh, enemy.mesh, 0.1, 0.5);
    }
    
    // Check if player collides with enemy
    checkPlayerEnemyCollision(player, enemy) {
        return this.checkCollisionWithRadius(player.mesh, enemy.mesh, 0.5, 0.5);
    }
    
    // Get distance between two objects
    getDistance(mesh1, mesh2) {
        if (!mesh1 || !mesh2) return Infinity;
        
        return mesh1.position.distanceTo(mesh2.position);
    }
    
    // Check if object is within range of another
    isWithinRange(mesh1, mesh2, range) {
        const distance = this.getDistance(mesh1, mesh2);
        return distance <= range;
    }
    
    // Get the closest object from a list
    getClosestObject(referenceMesh, objectList) {
        if (!referenceMesh || !objectList || objectList.length === 0) return null;
        
        let closestObject = null;
        let closestDistance = Infinity;
        
        objectList.forEach(object => {
            const distance = this.getDistance(referenceMesh, object.mesh);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestObject = object;
            }
        });
        
        return closestObject;
    }
} 