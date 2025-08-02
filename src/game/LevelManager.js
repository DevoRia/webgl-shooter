export class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.fibonacciSequence = this.generateFibonacciSequence(20); // Перші 20 чисел Фібоначчі
        
        // Рівні на основі чисел Фібоначчі
        this.levels = this.generateLevels();
        
        // Callbacks
        this.onLevelUp = null;
        this.onScoreUpdate = null;
    }
    
    generateFibonacciSequence(n) {
        const sequence = [1, 1];
        for (let i = 2; i < n; i++) {
            sequence.push(sequence[i-1] + sequence[i-2]);
        }
        return sequence;
    }
    
    generateLevels() {
        const levels = [];
        
        this.fibonacciSequence.forEach((fibNumber, index) => {
            const level = {
                level: index + 1,
                requiredScore: fibNumber * 10, // Кожен рівень потребує fibNumber * 10 очок
                enemySpawnRate: Math.max(0.5, 3 - (index * 0.2)), // Швидкість спавну ворогів (секунди)
                enemySpeed: 2 + (index * 0.5), // Швидкість ворогів
                enemyHealth: 100 + (index * 20), // Здоров'я ворогів
                enemyDamage: 20 + (index * 5), // Шкода ворогів
                maxEnemies: 5 + Math.floor(index / 2), // Максимальна кількість ворогів одночасно
                color: this.getLevelColor(index + 1)
            };
            levels.push(level);
        });
        
        return levels;
    }
    
    getLevelColor(level) {
        // Кольори для різних рівнів
        const colors = [
            0xff0000, // Червоний - рівень 1
            0xff6600, // Помаранчевий - рівень 2
            0xffcc00, // Жовтий - рівень 3
            0x00ff00, // Зелений - рівень 4
            0x00ccff, // Блакитний - рівень 5
            0x9900ff, // Фіолетовий - рівень 6
            0xff00ff, // Маджента - рівень 7
            0x000000, // Білий - рівень 8+
        ];
        
        return colors[Math.min(level - 1, colors.length - 1)];
    }
    
    addScore(points) {
        this.score += points;
        
        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score);
        }
        
        // Перевіряємо чи гравець досяг нового рівня
        this.checkLevelUp();
    }
    
    checkLevelUp() {
        const currentLevelData = this.levels[this.currentLevel - 1];
        
        if (this.score >= currentLevelData.requiredScore) {
            this.levelUp();
        }
    }
    
    levelUp() {
        if (this.currentLevel < this.levels.length) {
            this.currentLevel++;
            
            if (this.onLevelUp) {
                const newLevelData = this.getCurrentLevelData();
                this.onLevelUp(this.currentLevel, newLevelData);
            }
        }
    }
    
    getCurrentLevelData() {
        return this.levels[this.currentLevel - 1];
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getScore() {
        return this.score;
    }
    
    getRequiredScoreForNextLevel() {
        if (this.currentLevel < this.levels.length) {
            return this.levels[this.currentLevel].requiredScore;
        }
        return null; // Максимальний рівень досягнуто
    }
    
    getProgressToNextLevel() {
        const currentLevelData = this.getCurrentLevelData();
        const nextLevelData = this.levels[this.currentLevel];
        
        if (!nextLevelData) return 1; // Максимальний рівень
        
        const currentLevelScore = currentLevelData.requiredScore;
        const nextLevelScore = nextLevelData.requiredScore;
        const scoreInCurrentLevel = this.score - currentLevelScore;
        const scoreNeededForNextLevel = nextLevelScore - currentLevelScore;
        
        return Math.min(1, Math.max(0, scoreInCurrentLevel / scoreNeededForNextLevel));
    }
    
    getFibonacciNumber(level) {
        return this.fibonacciSequence[level - 1] || 1;
    }
    
    reset() {
        this.currentLevel = 1;
        this.score = 0;
    }
} 