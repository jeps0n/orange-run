import { updateMovement } from "./movement.js";
import { PulseAttack } from "./PulseAttack.js";
import { playerHitsObstacle, pulseHitsObstacle } from "./CollisionSystem.js";
import { PowerUpSystem } from "./PowerUpSystem.js";

export class GameController {
    constructor({
        runway,
        player,
        obstacle,
        powerUp,
        gameState,
        presentation,
        onStart,
        onRestart
    }) {
        Object.assign(this, { runway, player, obstacle, gameState, onStart, onRestart });
        this.presentation = presentation;
        this.powerUps = new PowerUpSystem({ powerUp, player, effects: presentation.visualEffects });
        this.activePulse = null;

        player.setVisible(gameState.started);
        if (!gameState.started) obstacle.setVisible(false);
        else obstacle.start(gameState.score);
    }

    get canPlay() {
        return this.gameState.started && !this.gameState.gameOver;
    }

    handleAction() {
        if (!this.gameState.started) {
            this.gameState.startGame();
            this.onStart();
            this.player.setVisible(true);
            this.obstacle.start(this.gameState.score);
            this.presentation.startScreen?.hide();
        } else if (this.gameState.gameOver) {
            this.onRestart();
        }
    }

    usePulse() {
        if (!this.canPlay || !this.player.consumePulse()) return;
        this.activePulse = new PulseAttack(this.player);
        this.presentation.visualEffects.startPulse(this.activePulse);
    }

    update(deltaSeconds, movement) {
        this.presentation.scoreDisplay.updatePowerUps(this.player);
        if (!this.canPlay) {
            this.player.updateVisuals();
            return;
        }

        updateMovement(this.player, movement, deltaSeconds);
        this.player.updateVisuals();
        this.obstacle.update(deltaSeconds);
        this.powerUps.update(deltaSeconds);
        this.updatePulse(deltaSeconds);
        this.presentation.runwayRenderer.update(this.obstacle.worldSpeed, deltaSeconds);

        if (playerHitsObstacle(this.player, this.obstacle)) this.handleObstacleHit();

        // A passed hazard awards exactly one point before it is recycled, so
        // the new obstacle receives the updated difficulty for the next run.
        if (this.obstacle.hasPassedForeground()) {
            this.awardPoint();
            this.obstacle.reset(this.gameState.score);
            this.powerUps.maybeSpawn(this.gameState.score);
        }
    }

    handleObstacleHit() {
        if (this.gameState.gameOver || !this.obstacle.active) return;
        if (this.player.consumeShield()) {
            this.presentation.visualEffects.shieldImpact(this.player.sprite.x, this.player.sprite.y);
            this.obstacle.destroyAndReset(this.gameState.score);
            return;
        }

        this.gameState.endGame();
        this.presentation.visualEffects.playerDeath(this.player.sprite.x, this.player.sprite.y);
        this.presentation.gameOverScreen.show(this.gameState.score);
    }

    updatePulse(deltaSeconds) {
        if (!this.activePulse) return;
        const pulse = this.activePulse;
        pulse.update(deltaSeconds);
        this.presentation.visualEffects.updatePulse(pulse);

        // Award and recycle the hazard immediately; the captured display values
        // below keep the impact effect tied to the hazard that was actually hit.
        if (pulseHitsObstacle(pulse, this.obstacle, this.runway)) {
            const { x, y, scaleX } = this.obstacle.sprite;
            const type = this.obstacle.type;
            this.awardPoint();
            this.obstacle.destroyAndReset(this.gameState.score);
            this.presentation.visualEffects.pulseImpact(x, y, scaleX, type);
        }

        if (pulse.finished) {
            this.presentation.visualEffects.endPulse();
            this.activePulse = null;
        }
    }

    awardPoint() {
        const newRecord = this.gameState.addScore();
        this.presentation.scoreDisplay.update(this.gameState.score, this.gameState.highScore, newRecord);
    }
}
