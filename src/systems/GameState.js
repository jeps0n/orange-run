export class GameState {

    constructor(scene) {

        this.started =
            scene.registry.get("hasStarted") ?? false;

        this.gameOver = false;
        this.score = 0;
    }


    startGame() {
        this.started = true;
    }


    endGame() {
        this.gameOver = true;
    }


    addScore() {
        this.score++;
    }

}