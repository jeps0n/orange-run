import { playerCollectsPowerUp } from "./CollisionSystem.js";
const FIRST_PICKUP_SCORE = 4;
const SHIELD_COLOR = 0x42e8ff;
const PULSE_COLOR = 0xa8ff2a;
export class PowerUpSystem {
    constructor({
        powerUp,
        player,
        effects,
        randomInt = randomIntegerBetween
    }) {
        this.powerUp = powerUp;
        this.player = player;
        this.effects = effects;
        this.randomInt = randomInt;
        this.nextSpawnScore = FIRST_PICKUP_SCORE;
    }
    update(deltaSeconds) {
        this.powerUp.update(deltaSeconds);
        if (playerCollectsPowerUp(this.player, this.powerUp)) this.collect();
    }
    maybeSpawn(score) {
        if (this.powerUp.active || score < this.nextSpawnScore) return;
        this.powerUp.spawn(this.randomInt(0, 1) === 0 ? "shield" : "pulse");
        // Advance the threshold when the pickup is scheduled, not when it is
        // collected, so an active pickup cannot cause repeated spawns at one score.
        this.nextSpawnScore += this.randomInt(5, 8);
    }
    collect() {
        if (!this.powerUp.active) return;
        const { type, sprite } = this.powerUp;
        const { x, y } = sprite;
        this.powerUp.hide();
        // A pulse pickup grants a fixed three-charge reserve; shield pickups
        // replace the current shield state rather than stacking protection.
        if (type === "shield") this.player.giveShield();
        else this.player.givePulse(3);
        this.effects.pickup(x, y, type === "shield" ? SHIELD_COLOR : PULSE_COLOR);
    }
}
function randomIntegerBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
