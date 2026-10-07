import Phaser from "phaser";

const POWER_UP_RADIUS = 9;
const SHIELD_COLOR = 0x42e8ff;
const PULSE_COLOR = 0x9dff3d;

/** One pickup = one circle. Color alone identifies the temporary ability. */
export class PowerUp {
    constructor(scene, runway) {
        this.runway = runway;
        this.type = null;
        this.active = false;
        this.worldSpeed = 0.17;
        this.lane = 0;
        this.depth = 0;

        this.sprite = scene.add.circle(-100, -100, POWER_UP_RADIUS, 0xffffff).setDepth(2);
        this.setVisible(false);
    }

    spawn(type, lane = Phaser.Math.FloatBetween(-0.72, 0.72)) {
        this.type = type;
        this.active = true;
        this.lane = lane;
        this.depth = 0.03;
        this.sprite.setFillStyle(type === "shield" ? SHIELD_COLOR : PULSE_COLOR);
        this.setVisible(true);
        this.applyProjection();
    }

    update(deltaSeconds) {
        if (!this.active) return;
        this.depth += this.worldSpeed * deltaSeconds;
        this.applyProjection();
        if (this.depth >= 1) this.hide();
    }

    applyProjection() {
        this.lane = this.runway.clampLaneForShape(this.lane, this.depth, POWER_UP_RADIUS);
        const projected = this.runway.project(this.lane, this.depth);
        this.sprite.setPosition(projected.x, projected.y).setScale(projected.scale);
    }

    hide() {
        this.active = false;
        this.setVisible(false);
    }

    setVisible(visible) {
        this.sprite.setVisible(visible && this.active);
    }
}
