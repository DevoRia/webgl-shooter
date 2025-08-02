export class AudioManager {
    constructor() {
        this.sounds = {};
        this.masterVolume = 0.5;
        this.isMuted = false;
        
        this.init();
    }
    
    init() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Initialize sounds
        this.createSounds();
    }
    
    createSounds() {
        // Create simple sound effects using Web Audio API
        this.createShootSound();
        this.createEnemyHitSound();
        this.createPlayerHitSound();
        this.createEmptySound();
    }
    
    createShootSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.sounds.shoot = { oscillator, gainNode, duration: 0.1 };
    }
    
    createEnemyHitSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        this.sounds.enemyHit = { oscillator, gainNode, duration: 0.2 };
    }
    
    createPlayerHitSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        this.sounds.playerHit = { oscillator, gainNode, duration: 0.3 };
    }
    
    createEmptySound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.sounds.empty = { oscillator, gainNode, duration: 0.1 };
    }
    
    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        const currentTime = this.audioContext.currentTime;
        
        // Create new oscillator for each sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Set initial values based on sound type
        if (soundName === 'shoot') {
            oscillator.frequency.setValueAtTime(800, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
        } else if (soundName === 'enemyHit') {
            oscillator.frequency.setValueAtTime(400, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.4 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        } else if (soundName === 'playerHit') {
            oscillator.frequency.setValueAtTime(200, currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.5 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        } else if (soundName === 'empty') {
            oscillator.frequency.setValueAtTime(150, currentTime);
            oscillator.frequency.setValueAtTime(150, currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
        }
        
        // Start and stop the sound
        oscillator.start(currentTime);
        oscillator.stop(currentTime + sound.duration);
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    mute() {
        this.isMuted = true;
    }
    
    unmute() {
        this.isMuted = false;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
    
    isMuted() {
        return this.isMuted;
    }
    
    getMasterVolume() {
        return this.masterVolume;
    }
    
    dispose() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
} 