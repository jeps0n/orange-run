const HIGH_SCORE_STORAGE_KEY = "orange-run-high-score";

export class GameState {
    constructor(scene) {
        this.started = scene.registry.get("hasStarted") ?? false;
        this.gameOver = false;
        this.score = 0;
        this.highScore = loadHighScore();
        this.highScoreAtRunStart = this.highScore;
    }

    startGame() {
        this.started = true;
    }

    endGame() {
        this.gameOver = true;
    }

    addScore() {
        this.score += 1;

        if (this.score <= this.highScore) return false;

        this.highScore = this.score;
        saveHighScore(this.highScore);
        return this.score === this.highScoreAtRunStart + 1;
    }
}

function loadHighScore() {
    try {
        const storedScore = Number.parseInt(localStorage.getItem(HIGH_SCORE_STORAGE_KEY) ?? "0", 10);
        return Number.isFinite(storedScore) && storedScore > 0 ? storedScore : 0;
    } catch {
        return 0;
    }
}

function saveHighScore(score) {
    try {
        localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(score));
    } catch {
        // The game still works if browser storage is unavailable.
    }
}
