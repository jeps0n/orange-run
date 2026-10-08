import test from "node:test";
import assert from "node:assert/strict";
import { GameController } from "../src/systems/GameController.js";
function createGame({ shielded = false } = {}) {
    const calls = [];
    const gameState = {
        started: false, gameOver: false, score: 0, highScore: 0,
        startGame() { this.started = true; },
        endGame() { this.gameOver = true; },
        addScore() { this.score++; this.highScore = this.score; return true; }
    };
    const player = {
        lane: 0, depth: 0.84, sprite: { x: 10, y: 20 },
        setVisible: value => calls.push(["player visible", value]),
        updateVisuals() {}, move() {},
        consumeShield() { if (!shielded) return false; shielded = false; return true; },
        consumePulse: () => false
    };
    const obstacle = {
        lane: 0.7, depth: 0.5, active: true, worldSpeed: 0.2,
        sprite: { x: 1, y: 2, scaleX: 1 },
        setVisible: value => calls.push(["obstacle visible", value]),
        start: score => calls.push(["start", score]),
        update() {},
        hasPassedForeground: () => false,
        reset: score => calls.push(["reset", score]),
        destroyAndReset: score => calls.push(["destroy", score])
    };
    const controller = new GameController({
        runway: {}, player, obstacle,
        powerUp: { active: false, update() {}, spawn() {} },
        gameState,
        presentation: {
            scoreDisplay: { updatePowerUps() {}, update: (...args) => calls.push(["score", ...args]) },
            startScreen: { hide: () => calls.push(["hide start"]) },
            gameOverScreen: { show: score => calls.push(["game over", score]) },
            runwayRenderer: { update() {} },
            visualEffects: {
                shieldImpact: () => calls.push(["shield impact"]),
                playerDeath: () => calls.push(["death"])
            }
        },
        onStart: () => calls.push(["registry", "hasStarted", true]),
        onRestart: () => calls.push(["restart"])
    });
    return { controller, gameState, player, obstacle, calls };
}
test("starting a run activates gameplay; action after game over restarts scene", () => {
    const { controller, gameState, calls } = createGame();
    assert.equal(controller.canPlay, false);
    controller.handleAction();
    assert.equal(controller.canPlay, true);
    assert.ok(calls.some(call => call[0] === "hide start"));
    assert.deepEqual(calls.filter(call => call[0] === "registry"), [["registry", "hasStarted", true]]);
    gameState.endGame();
    controller.handleAction();
    assert.ok(calls.some(call => call[0] === "restart"));
});
test("a passed obstacle scores once and resets at the new score", () => {
    const { controller, gameState, obstacle, calls } = createGame();
    controller.handleAction();
    let passed = true;
    obstacle.hasPassedForeground = () => passed;
    controller.update(0.016, { x: 0, y: 0 });
    passed = false;
    controller.update(0.016, { x: 0, y: 0 });
    assert.equal(gameState.score, 1);
    assert.ok(calls.some(call => call[0] === "reset" && call[1] === 1));
});
test("shield consumes a hit; an unshielded hit ends the run", () => {
    const { controller, gameState, obstacle, calls } = createGame({ shielded: true });
    controller.handleAction();
    controller.handleObstacleHit();
    assert.equal(gameState.gameOver, false);
    assert.ok(calls.some(call => call[0] === "destroy"));
    controller.handleObstacleHit();
    assert.equal(gameState.gameOver, true);
    assert.ok(calls.some(call => call[0] === "game over"));
    const count = calls.length;
    controller.handleObstacleHit();
    assert.equal(calls.length, count);
});
