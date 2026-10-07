import Phaser from "phaser";

const OBSTACLE_SIZE = 26;
const OBSTACLE_HALF_WIDTH = OBSTACLE_SIZE / 2;
const OUTER_FILL = 0xe51f3d;
const OUTER_STROKE = 0xff5a70;
const CORE_FILL = 0xffe8e8;

const START_DEPTH = 0.02;
const FINISH_DEPTH = 1;
const PLAYER_REAR_DEPTH = 0.91;

const START_WORLD_SPEED = 0.19;
const MAX_WORLD_SPEED = 0.73;
const MAX_SPEED_SCORE = 31;
const WORLD_SPEED_PER_SCORE = (MAX_WORLD_SPEED - START_WORLD_SPEED) / MAX_SPEED_SCORE;

const TRIANGLE_UNLOCK_SCORE = 10;
const CIRCLE_UNLOCK_SCORE = 20;

const MIN_ZIG_ZAG_ANGLE_DEGREES = 40;
const MAX_ZIG_ZAG_ANGLE_DEGREES = 53;
const TRIANGLE_CORE_SCALE = 0.38;
const TRIANGLE_CORE_CENTER_OFFSET_Y = OBSTACLE_SIZE * (1 - TRIANGLE_CORE_SCALE) / 6;

const MIN_SWEEP_DISTANCE = 0.12;
const MIN_SWEEP_CURVE_POWER = 1.35;
const MAX_SWEEP_CURVE_POWER = 2.15;

const HAZARD_TYPES = {
    SQUARE: "square",
    TRIANGLE: "triangle",
    CIRCLE: "circle"
};

/**
 * One projected hazard whose outer shape communicates movement behavior.
 * Red body + warm-white matching core is the shared enemy-faction language.
 *
 * Movement is authored in normalized runway lane/depth space. The runway's
 * literal edges are the only lateral boundary; there is no smaller invisible
 * trajectory box inside the road.
 */
export class Obstacle {
    constructor(scene, runway) {
        this.runway = runway;
        this.worldSpeed = START_WORLD_SPEED;
        this.lane = 0;
        this.depth = START_DEPTH;
        this.type = HAZARD_TYPES.SQUARE;
        this.active = false;

        this.startLane = 0;
        this.finishLane = 0;
        this.zigZagAngleDegrees = 45;
        this.zigZagDirection = 1;
        this.sweepCurvePower = 1;

        this.sprite = scene.add.graphics().setDepth(2);
        this.drawHazard();
        this.setVisible(false);
    }

    get localHalfWidth() {
        return OBSTACLE_HALF_WIDTH;
    }

    start(score = 0) {
        this.reset(score);
    }

    update(deltaSeconds) {
        if (!this.active) return;

        const previousDepth = this.depth;
        this.depth += this.worldSpeed * deltaSeconds;
        this.updateLaneForMovement(previousDepth);
        this.applyProjection();
    }

    updateLaneForMovement(previousDepth) {
        const travel = Phaser.Math.Clamp(
            (this.depth - START_DEPTH) / (FINISH_DEPTH - START_DEPTH),
            0,
            1
        );

        if (this.type === HAZARD_TYPES.TRIANGLE) {
            this.updateTriangleLane(previousDepth);
            return;
        }

        if (this.type === HAZARD_TYPES.CIRCLE) {
            // A Circle makes one continuous sweep in one direction. Varying the
            // easing power gives each random start/finish pair a different
            // curvature without ever reading or reacting to Orange.
            const curvedTravel = Math.pow(travel, this.sweepCurvePower);
            this.lane = Phaser.Math.Linear(this.startLane, this.finishLane, curvedTravel);
            return;
        }

        // The Square is intentionally simple: one lane, straight through the
        // complete player depth range and out through the foreground.
        this.lane = this.startLane;
    }

    updateTriangleLane(previousDepth) {
        const previousProjection = this.runway.project(this.lane, previousDepth);
        const nextY = this.runway.getYAtDepth(this.depth);
        const verticalTravel = Math.max(0, nextY - previousProjection.y);
        const angleRadians = Phaser.Math.DegToRad(this.zigZagAngleDegrees);
        const horizontalTravel = Math.tan(angleRadians) * verticalTravel;
        const requestedX = previousProjection.x + horizontalTravel * this.zigZagDirection;

        const nextBounds = this.runway.getBoundsAtDepth(this.depth);
        const nextScale = this.runway.getScaleAtDepth(this.depth);
        const projectedHalfWidth = OBSTACLE_HALF_WIDTH * nextScale;
        const leftLimit = nextBounds.left + projectedHalfWidth;
        const rightLimit = nextBounds.right - projectedHalfWidth;

        // Reflect at the literal runway edge instead of choosing a new random
        // target. Every leg therefore keeps one spawn-time angle and the same
        // mechanical left/right cadence for the Triangle's entire run.
        let reflectedX = requestedX;
        while (reflectedX < leftLimit || reflectedX > rightLimit) {
            if (reflectedX > rightLimit) {
                reflectedX = rightLimit - (reflectedX - rightLimit);
                this.zigZagDirection = -1;
            } else if (reflectedX < leftLimit) {
                reflectedX = leftLimit + (leftLimit - reflectedX);
                this.zigZagDirection = 1;
            }
        }

        this.lane = nextBounds.width > 0
            ? ((reflectedX - this.runway.centerX) * 2) / nextBounds.width
            : 0;
    }

    applyProjection() {
        // This is the only movement clamp. It represents the actual sloped road
        // edge at the hazard's current depth and accounts for the full body.
        // Trajectories themselves are free to request any lane on the runway.
        this.lane = this.runway.clampLaneForShape(this.lane, this.depth, OBSTACLE_HALF_WIDTH);
        const projected = this.runway.project(this.lane, this.depth);
        this.sprite.setPosition(projected.x, projected.y).setScale(projected.scale);
    }

    hasPassedForeground() {
        // At depth 1 the shared projection places the complete hazard beyond
        // the visible playfield, so recycling never occurs visibly on-screen.
        return this.depth >= FINISH_DEPTH;
    }

    reset(score = 0) {
        this.worldSpeed = getWorldSpeedForScore(score);
        this.type = chooseHazardType(score);
        this.depth = START_DEPTH;
        this.configureMovementPath();
        this.active = true;
        this.drawHazard();
        this.setVisible(true);
        this.applyProjection();
    }

    configureMovementPath() {
        const startLimit = this.runway.getSafeLaneLimit(START_DEPTH, OBSTACLE_HALF_WIDTH);
        const playerLimit = this.runway.getSafeLaneLimit(PLAYER_REAR_DEPTH, OBSTACLE_HALF_WIDTH);

        this.startLane = Phaser.Math.FloatBetween(-startLimit, startLimit);
        this.finishLane = this.startLane;
        this.zigZagAngleDegrees = 45;
        this.zigZagDirection = 1;
        this.sweepCurvePower = 1;

        if (this.type === HAZARD_TYPES.SQUARE) {
            // A straight Square may occupy every lane that can intersect the
            // player's widest movement boundary. Near the narrow horizon its
            // body is temporarily held by the literal road edge, then naturally
            // reaches its authored lane as the runway opens up.
            this.startLane = Phaser.Math.FloatBetween(-playerLimit, playerLimit);
            this.finishLane = this.startLane;
            this.lane = this.startLane;
            return;
        }

        if (this.type === HAZARD_TYPES.TRIANGLE) {
            this.zigZagAngleDegrees = Phaser.Math.FloatBetween(
                MIN_ZIG_ZAG_ANGLE_DEGREES,
                MAX_ZIG_ZAG_ANGLE_DEGREES
            );
            this.zigZagDirection = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        } else if (this.type === HAZARD_TYPES.CIRCLE) {
            const finishLimit = this.runway.getSafeLaneLimit(FINISH_DEPTH, OBSTACLE_HALF_WIDTH);
            this.finishLane = chooseDirectionalSweepFinish(this.startLane, finishLimit);
            this.sweepCurvePower = Phaser.Math.FloatBetween(
                MIN_SWEEP_CURVE_POWER,
                MAX_SWEEP_CURVE_POWER
            );
        }

        this.lane = this.startLane;
    }

    destroyAndReset(score = 0) {
        if (!this.active) return;
        this.active = false;
        this.setVisible(false);
        this.reset(score);
    }

    drawHazard() {
        this.sprite.clear();
        this.sprite.fillStyle(OUTER_FILL, 1);
        this.sprite.lineStyle(2, OUTER_STROKE, 0.9);

        if (this.type === HAZARD_TYPES.TRIANGLE) {
            drawTriangle(this.sprite, OBSTACLE_SIZE);
            this.sprite.fillStyle(CORE_FILL, 1);
            drawTriangle(
                this.sprite,
                OBSTACLE_SIZE * TRIANGLE_CORE_SCALE,
                false,
                TRIANGLE_CORE_CENTER_OFFSET_Y
            );
            return;
        }

        if (this.type === HAZARD_TYPES.CIRCLE) {
            this.sprite.fillCircle(0, 0, OBSTACLE_HALF_WIDTH);
            this.sprite.strokeCircle(0, 0, OBSTACLE_HALF_WIDTH);
            this.sprite.fillStyle(CORE_FILL, 1);
            this.sprite.fillCircle(0, 0, OBSTACLE_SIZE * 0.19);
            return;
        }

        const half = OBSTACLE_HALF_WIDTH;
        this.sprite.fillRect(-half, -half, OBSTACLE_SIZE, OBSTACLE_SIZE);
        this.sprite.strokeRect(-half, -half, OBSTACLE_SIZE, OBSTACLE_SIZE);
        const coreSize = OBSTACLE_SIZE * 0.38;
        this.sprite.fillStyle(CORE_FILL, 1);
        this.sprite.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);
    }

    setVisible(visible) {
        this.sprite.setVisible(visible && this.active);
    }
}

function getWorldSpeedForScore(score) {
    const cappedScore = Phaser.Math.Clamp(score, 0, MAX_SPEED_SCORE);
    return Math.min(START_WORLD_SPEED + cappedScore * WORLD_SPEED_PER_SCORE, MAX_WORLD_SPEED);
}

function chooseHazardType(score) {
    const availableTypes = [HAZARD_TYPES.SQUARE];
    if (score >= TRIANGLE_UNLOCK_SCORE) availableTypes.push(HAZARD_TYPES.TRIANGLE);
    if (score >= CIRCLE_UNLOCK_SCORE) availableTypes.push(HAZARD_TYPES.CIRCLE);
    return Phaser.Utils.Array.GetRandom(availableTypes);
}

function chooseDirectionalSweepFinish(startLane, finishLimit) {
    const canSweepLeft = startLane > -finishLimit + MIN_SWEEP_DISTANCE;
    const canSweepRight = startLane < finishLimit - MIN_SWEEP_DISTANCE;

    let direction;
    if (canSweepLeft && canSweepRight) {
        direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
    } else {
        direction = canSweepLeft ? -1 : 1;
    }

    if (direction < 0) {
        return Phaser.Math.FloatBetween(-finishLimit, startLane - MIN_SWEEP_DISTANCE);
    }

    return Phaser.Math.FloatBetween(startLane + MIN_SWEEP_DISTANCE, finishLimit);
}

function drawTriangle(graphics, size, stroke = true, offsetY = 0) {
    const half = size / 2;
    const points = [
        new Phaser.Math.Vector2(0, -half + offsetY),
        new Phaser.Math.Vector2(half, half + offsetY),
        new Phaser.Math.Vector2(-half, half + offsetY)
    ];

    graphics.fillPoints(points, true);
    if (stroke) graphics.strokePoints(points, true);
}
