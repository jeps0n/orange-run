export class GameState {
    constructor() {
        this.reset();
    }
    reset() {
        this.score = 0;
        this.gameOver = false;
    }
    addScore() {
        this.score++;
    }
    endGame() {
        this.gameOver = true;
    }
}