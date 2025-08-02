// Mock Three.js for testing
const THREE = {
    Scene: class Scene {
        constructor() {
            this.children = [];
            this.background = null;
            this.fog = null;
        }
        add(object) {
            this.children.push(object);
        }
        remove(object) {
            const index = this.children.indexOf(object);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        }
        traverse(callback) {
            this.children.forEach(callback);
        }
    },
    BoxGeometry: class BoxGeometry {
        constructor(width, height, depth) {
            this.width = width;
            this.height = height;
            this.depth = depth;
        }
    },
    PlaneGeometry: class PlaneGeometry {
        constructor(width, height, widthSegments, heightSegments) {
            this.width = width;
            this.height = height;
            this.widthSegments = widthSegments;
            this.heightSegments = heightSegments;
        }
    },
    PerspectiveCamera: class PerspectiveCamera {
        constructor(fov, aspect, near, far) {
            this.fov = fov;
            this.aspect = aspect;
            this.near = near;
            this.far = far;
            this.position = { x: 0, y: 0, z: 0 };
            this.rotation = { x: 0, y: 0, z: 0 };
        }
        updateProjectionMatrix() {}
        lookAt(target) {}
    },
    WebGLRenderer: class WebGLRenderer {
        constructor(options) {
            this.options = options;
            this.domElement = document.createElement('canvas');
            this.shadowMap = { enabled: false, type: null };
        }
        setSize(width, height) {}
        render(scene, camera) {}
        dispose() {}
    },
    Color: class Color {
        constructor(color) {
            this.color = color;
        }
    },
    Fog: class Fog {
        constructor(color, near, far) {
            this.color = color;
            this.near = near;
            this.far = far;
        }
    },
    AmbientLight: class AmbientLight {
        constructor(color, intensity) {
            this.color = color;
            this.intensity = intensity;
        }
    },
    DirectionalLight: class DirectionalLight {
        constructor(color, intensity) {
            this.color = color;
            this.intensity = intensity;
            this.position = { x: 0, y: 0, z: 0 };
            this.castShadow = false;
            this.shadow = {
                mapSize: { width: 1024, height: 1024 },
                camera: { near: 0.5, far: 500, left: -100, right: 100, top: 100, bottom: -100 }
            };
        }
    },
    CapsuleGeometry: class CapsuleGeometry {
        constructor(radius, height, radialSegments, heightSegments) {
            this.radius = radius;
            this.height = height;
            this.radialSegments = radialSegments;
            this.heightSegments = heightSegments;
        }
    },
    BoxGeometry: class BoxGeometry {
        constructor(width, height, depth) {
            this.width = width;
            this.height = height;
            this.depth = depth;
        }
    },
    SphereGeometry: class SphereGeometry {
        constructor(radius, widthSegments, heightSegments) {
            this.radius = radius;
            this.widthSegments = widthSegments;
            this.heightSegments = heightSegments;
        }
    },
    MeshLambertMaterial: class MeshLambertMaterial {
        constructor(parameters) {
            this.parameters = parameters;
            this.color = parameters.color || 0xffffff;
            this.emissive = parameters.emissive || 0x000000;
            this.emissiveIntensity = parameters.emissiveIntensity || 0;
        }
        dispose() {}
    },
    Mesh: class Mesh {
        constructor(geometry, material) {
            this.geometry = geometry;
            this.material = material;
            this.position = new THREE.Vector3(0, 0, 0);
            this.rotation = { x: 0, y: 0, z: 0 };
            this.castShadow = false;
            this.receiveShadow = false;
        }
    },
    CanvasTexture: class CanvasTexture {
        constructor(canvas) {
            this.canvas = canvas;
            this.wrapS = null;
            this.wrapT = null;
            this.repeat = { set: () => {} };
        }
    },
    RepeatWrapping: 'RepeatWrapping',
    Vector3: class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        clone() {
            return new THREE.Vector3(this.x, this.y, this.z);
        }
        set(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
        add(vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
            return this;
        }
        subVectors(vector1, vector2) {
            this.x = vector1.x - vector2.x;
            this.y = vector1.y - vector2.y;
            this.z = vector1.z - vector2.z;
            return this;
        }
        multiplyScalar(scalar) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
            return this;
        }
        normalize() {
            const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            if (length > 0) {
                this.x /= length;
                this.y /= length;
                this.z /= length;
            }
            return this;
        }
        distanceTo(vector) {
            const dx = this.x - vector.x;
            const dy = this.y - vector.y;
            const dz = this.z - vector.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        crossVectors(vector1, vector2) {
            this.x = vector1.y * vector2.z - vector1.z * vector2.y;
            this.y = vector1.z * vector2.x - vector1.x * vector2.z;
            this.z = vector1.x * vector2.y - vector1.y * vector2.x;
            return this;
        }
        applyMatrix4(matrix) {
            // Simplified matrix application
            return this;
        }
        copy(vector) {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z;
            return this;
        }
    },
    Matrix4: class Matrix4 {
        constructor() {
            this.elements = new Array(16).fill(0);
        }
        makeRotationY(angle) {
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            this.elements[0] = c;
            this.elements[2] = -s;
            this.elements[8] = s;
            this.elements[10] = c;
            return this;
        }
    },
    Clock: class Clock {
        constructor() {
            this.startTime = Date.now();
            this.oldTime = this.startTime;
            this.elapsedTime = 0;
        }
        getDelta() {
            const newTime = Date.now();
            const delta = (newTime - this.oldTime) / 1000;
            this.oldTime = newTime;
            return delta;
        }
        getElapsedTime() {
            return (Date.now() - this.startTime) / 1000;
        }
    },
    Raycaster: class Raycaster {
        constructor(origin, direction, near, far) {
            this.origin = origin;
            this.direction = direction;
            this.near = near;
            this.far = far;
        }
        intersectObject(object) {
            // Mock intersection test
            return [];
        }
    },
    PCFSoftShadowMap: 'PCFSoftShadowMap'
};

// Make THREE available globally
global.THREE = THREE;

// Mock Web Audio API
global.AudioContext = class AudioContext {
    constructor() {
        this.currentTime = 0;
        this.destination = {};
    }
    createOscillator() {
        return {
            frequency: {
                setValueAtTime: () => {},
                exponentialRampToValueAtTime: () => {},
                cancelScheduledValues: () => {}
            },
            connect: () => {},
            start: () => {},
            stop: () => {}
        };
    }
    createGain() {
        return {
            gain: {
                setValueAtTime: () => {},
                exponentialRampToValueAtTime: () => {},
                cancelScheduledValues: () => {}
            },
            connect: () => {}
        };
    }
    close() {}
};

global.webkitAudioContext = global.AudioContext;

// Mock DOM elements
document.getElementById = jest.fn((id) => {
    const elements = {
        'gameContainer': {
            appendChild: jest.fn(),
            removeChild: jest.fn()
        },
        'score': {
            textContent: ''
        },
        'health': {
            textContent: '',
            style: { color: '' }
        },
        'ammo': {
            textContent: '',
            style: { color: '' }
        },
        'startScreen': {
            style: { display: '' }
        },
        'gameOver': {
            style: { display: '' }
        },
        'finalScore': {
            textContent: ''
        },
        'crosshair': {
            style: { display: '' }
        }
    };
    return elements[id] || null;
});

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024
});

Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768
});

// Mock pointer lock API
Object.defineProperty(document, 'pointerLockElement', {
    writable: true,
    configurable: true,
    value: null
});

document.requestPointerLock = jest.fn();
document.exitPointerLock = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
    setTimeout(callback, 16);
    return 1;
});

// Mock console methods
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// Export THREE for module imports
module.exports = THREE; 