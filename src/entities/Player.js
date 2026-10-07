import Phaser from "phaser";

const PLAYER_RADIUS = 12;
const PLAYER_FORWARD_LIMIT_DEPTH = 0.72;
const PLAYER_REAR_LIMIT_DEPTH = 0.91;

const PLAYER_FILL = 0xff8500;
const PLAYER_STROKE = 0xffb347;
const SHIELD_COLOR = 0x42e8ff;

// The grounded ellipse is a shadow, not a power-up effect. Its geometry stays
// identical in both states; only its darker state color changes.
const SHADOW_NORMAL_COLOR = 0x7a3b00;
const SHADOW_SHIELDED_COLOR = 0x176b78;
const SHADOW_OFFSET_Y = 15;
const SHADOW_WIDTH = 24;
const SHADOW_HEIGHT = 6;
const SHADOW_ALPHA = 0.34;

// The shield is one strong, nearly continuous energy perimeter. Small gaps and
// gentle ripples keep it alive without making it read as separate fragments.
const SHIELD_RADIUS_X = 23;
const SHIELD_RADIUS_Y = 21;
const SHIELD_LINE_WIDTH = 2.4;
const SHIELD_SEGMENTS = 18;

// A couple of restrained traveling tension points borrow the angular character
// of the impact effect without turning the idle shield into a spiky effect.
const SHIELD_TENSION_AMOUNT = 0.018;
const SHIELD_TENSION_WIDTH = 0.11;

// Keep the entire shield visibly powered. Depth is communicated with only a
// subtle alpha shift so the rear never looks weak, depleted, or missing.
const SHIELD_FRONT_ALPHA = 0.90;
const SHIELD_REAR_ALPHA = 0.72;

const DEPTH_SHADOW = 2.8;
const DEPTH_SHIELD_REAR = 3.0;
const DEPTH_PLAYER = 3.2;
const DEPTH_SHIELD_FRONT = 3.4;

// Rear and front are separate only for draw order around Orange. Together they
// form one perimeter, interrupted by just a few narrow energy notches.
const REAR_FIELD_ARCS = [
    { start: 3.22, end: 4.67, radius: 1.00, phase: 0.2 },
    { start: 4.76, end: 6.18, radius: 1.01, phase: 1.7 }
];

const FRONT_FIELD_ARCS = [
    { start: 0.08, end: 1.43, radius: 1.01, phase: 2.2 },
    { start: 1.51, end: 3.06, radius: 1.00, phase: 0.8 }
];

/**
 * Player gameplay lives in lane/depth world space.
 *
 * Visual order is deliberate:
 * shadow -> rear shield energy -> Orange -> front shield energy.
 */
export class Player {
    constructor(scene, runway) {
        this.scene = scene;
        this.runway = runway;
        this.lane = 0;
        this.depth = 0.84;
        this.laneSpeed = 1.65;
        this.depthSpeed = 0.48;
        this.shielded = false;
        this.pulseCharges = 0;

        this.shadow = scene.add
            .ellipse(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT, SHADOW_NORMAL_COLOR, SHADOW_ALPHA)
            .setDepth(DEPTH_SHADOW);

        this.shieldRear = scene.add.graphics().setDepth(DEPTH_SHIELD_REAR).setVisible(false);

        this.sprite = scene.add
            .circle(0, 0, PLAYER_RADIUS, PLAYER_FILL)
            .setStrokeStyle(3, PLAYER_STROKE, 1)
            .setDepth(DEPTH_PLAYER);

        this.shieldFront = scene.add.graphics().setDepth(DEPTH_SHIELD_FRONT).setVisible(false);

        this.applyProjection();
    }

    move(movement, deltaSeconds) {
        const length = Math.hypot(movement.x, movement.y);
        if (length === 0) return;

        const x = movement.x / length;
        const y = movement.y / length;

        this.depth = Phaser.Math.Clamp(
            this.depth + y * this.depthSpeed * deltaSeconds,
            PLAYER_FORWARD_LIMIT_DEPTH,
            PLAYER_REAR_LIMIT_DEPTH
        );

        const requestedLane = this.lane + x * this.laneSpeed * deltaSeconds;
        this.lane = this.runway.clampLaneForShape(requestedLane, this.depth, PLAYER_RADIUS);
    }

    applyProjection() {
        this.lane = this.runway.clampLaneForShape(this.lane, this.depth, PLAYER_RADIUS);
        const projected = this.runway.project(this.lane, this.depth);

        this.sprite.setPosition(projected.x, projected.y).setScale(projected.scale);
        this.shieldRear.setPosition(projected.x, projected.y).setScale(projected.scale);
        this.shieldFront.setPosition(projected.x, projected.y).setScale(projected.scale);
        this.shadow
            .setPosition(projected.x, projected.y + SHADOW_OFFSET_Y * projected.scale)
            .setScale(projected.scale);
    }

    updateVisuals() {
        this.applyProjection();
        this.sprite.setStrokeStyle(3, PLAYER_STROKE, 1);

        const shadowColor = this.shielded ? SHADOW_SHIELDED_COLOR : SHADOW_NORMAL_COLOR;
        this.shadow.setFillStyle(shadowColor, SHADOW_ALPHA);

        this.shieldRear.setVisible(this.shielded);
        this.shieldFront.setVisible(this.shielded);

        if (this.shielded) {
            this.drawShieldField();
        }
    }

    drawShieldField() {
        const time = this.scene.time.now * 0.0045;

        drawEnergyArcs(this.shieldRear, REAR_FIELD_ARCS, time);
        drawEnergyArcs(this.shieldFront, FRONT_FIELD_ARCS, time);
    }

    setVisible(visible) {
        this.sprite.setVisible(visible);
        this.shadow.setVisible(visible);
        this.shieldRear.setVisible(visible && this.shielded);
        this.shieldFront.setVisible(visible && this.shielded);
    }

    giveShield() {
        this.shielded = true;
        this.updateVisuals();
    }

    consumeShield() {
        if (!this.shielded) return false;
        this.shielded = false;
        this.updateVisuals();
        return true;
    }

    givePulse(charges = 3) {
        this.pulseCharges = charges;
    }

    consumePulse() {
        if (this.pulseCharges <= 0) return false;
        this.pulseCharges -= 1;
        return true;
    }
}

function drawEnergyArcs(graphics, arcs, time) {
    graphics.clear();

    for (const arc of arcs) {
        let previousPoint = getEnergyPoint(arc, 0, time);

        for (let segment = 1; segment <= SHIELD_SEGMENTS; segment += 1) {
            const progress = segment / SHIELD_SEGMENTS;
            const point = getEnergyPoint(arc, progress, time);
            const midpointAngle = (previousPoint.angle + point.angle) * 0.5;
            const alpha = getShieldAlpha(midpointAngle);

            graphics.lineStyle(SHIELD_LINE_WIDTH, SHIELD_COLOR, alpha);
            graphics.beginPath();
            graphics.moveTo(previousPoint.x, previousPoint.y);
            graphics.lineTo(point.x, point.y);
            graphics.strokePath();

            previousPoint = point;
        }
    }
}

function getEnergyPoint(arc, progress, time) {
    const angle = Phaser.Math.Linear(arc.start, arc.end, progress);
    const ripple = Math.sin(time * 2.2 + arc.phase + progress * Math.PI * 2) * 0.025;
    const tension = getTravelingTension(progress, time, arc.phase);
    const radius = arc.radius + ripple + tension;

    return {
        angle,
        x: Math.cos(angle) * SHIELD_RADIUS_X * radius,
        y: Math.sin(angle) * SHIELD_RADIUS_Y * radius
    };
}

function getTravelingTension(progress, time, phase) {
    const firstCenter = (time * 0.055 + phase * 0.13) % 1;
    const secondCenter = (firstCenter + 0.47) % 1;

    return (
        triangularPulse(progress, firstCenter)
        - triangularPulse(progress, secondCenter) * 0.65
    ) * SHIELD_TENSION_AMOUNT;
}

function triangularPulse(progress, center) {
    const directDistance = Math.abs(progress - center);
    const wrappedDistance = Math.min(directDistance, 1 - directDistance);
    return Math.max(0, 1 - wrappedDistance / SHIELD_TENSION_WIDTH);
}

function getShieldAlpha(angle) {
    // sin(angle) maps rear/top (-1) to front/bottom (+1). The narrow alpha
    // range preserves depth while keeping every part of the shield strong.
    const depth = (Math.sin(angle) + 1) * 0.5;
    const smoothDepth = depth * depth * (3 - 2 * depth);

    return Phaser.Math.Linear(SHIELD_REAR_ALPHA, SHIELD_FRONT_ALPHA, smoothDepth);
}
