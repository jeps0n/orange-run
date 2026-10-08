const SHIELD_COLOR = 0x42e8ff;
const PULSE_COLOR = 0xa8ff2a;
const DANGER_COLOR = 0xff334f;

/**
 * Presentation-only effects.
 *
 * Pulse visuals capture the player's world position when fired and animate
 * through the same fixed world-space envelope used by gameplay collision.
 * They never receive target coordinates and cannot bend, stop, or home on a hit.
 */
export class VisualEffects {
    constructor(scene, runway) {
        this.scene = scene;
        this.runway = runway;
    }

    startPulse(pulse) {
        this.endPulse();
        this.pulseGraphics = this.scene.add.graphics().setDepth(8);
        this.updatePulse(pulse);
    }

    updatePulse(pulse) {
        if (!this.pulseGraphics) return;
        this.pulseGraphics.clear();
        drawPulseWave(this.pulseGraphics, this.runway, pulse.getVolume());
    }

    endPulse() {
        this.pulseGraphics?.destroy();
        this.pulseGraphics = null;
    }

    shieldImpact(x, y) {
        this.shockwave(x, y, SHIELD_COLOR, 82, 4);
        this.flash(x, y, SHIELD_COLOR, 18);
        this.scene.cameras.main.shake(85, 0.004);
    }

    pulseImpact(
        x,
        y,
        obstacleScale = 1,
        hazardType = "square"
    ) {
        // Pulse energy stays lime; the destroyed hazard keeps its red material
        // identity as a few recognizable pieces shear apart from the hit.
        this.hazardBreakup(x, y, obstacleScale, hazardType);
        this.scene.cameras.main.shake(45, 0.0025);
    }

    pickup(x, y, color) {
        this.shockwave(x, y, color, 34, 2);
    }

    playerDeath(x, y) {
        this.shockwave(x, y, DANGER_COLOR, 68, 4);
        this.scene.cameras.main.shake(160, 0.009);
    }

    shockwave(
        x,
        y,
        color,
        radius,
        lineWidth
    ) {
        const ring = this.scene.add
            .circle(x, y, 10, 0x000000, 0)
            .setStrokeStyle(lineWidth, color, 0.95)
            .setDepth(9);

        this.scene.tweens.add({
            targets: ring,
            scale: radius / 10,
            alpha: 0,
            duration: 190,
            ease: "Quad.easeOut",
            onComplete: () => ring.destroy()
        });
    }

    flash(x, y, color, radius) {
        const flash = this.scene.add.circle(x, y, radius, color, 0.72).setDepth(9);
        this.scene.tweens.add({
            targets: flash,
            scale: 0.35,
            alpha: 0,
            duration: 95,
            ease: "Quad.easeOut",
            onComplete: () => flash.destroy()
        });
    }

    hazardBreakup(x, y, obstacleScale, hazardType) {
        // Every hazard breaks as the same rigid red material. The fragment
        // silhouette follows the owner so Triangle and Circle deaths still
        // read as members of the same faction.
        const pieces = getBreakupPieces(hazardType);

        for (const piece of pieces) {
            const fragment = this.scene.add
                .polygon(x, y, piece.points, DANGER_COLOR)
                .setStrokeStyle(1.5, 0xff5a70, 0.9)
                .setScale(obstacleScale)
                .setDepth(8);

            this.scene.tweens.add({
                targets: fragment,
                x: x + piece.offsetX * obstacleScale,
                y: y + piece.offsetY * obstacleScale,
                rotation: piece.rotation,
                scaleX: obstacleScale * 0.76,
                scaleY: obstacleScale * 0.76,
                alpha: 0,
                duration: 165,
                ease: "Quad.easeOut",
                onComplete: () => fragment.destroy()
            });
        }
    }
}

function getBreakupPieces(hazardType) {
    if (hazardType === "triangle") {
        return [
            { points: [0, -13, 0, -1, -11, 10], offsetX: -35, offsetY: -40, rotation: -0.44 },
            { points: [0, -13, 11, 10, 0, -1], offsetX: 36, offsetY: -39, rotation: 0.40 },
            { points: [-11, 10, 0, -1, 0, 13], offsetX: -28, offsetY: -18, rotation: 0.27 },
            { points: [0, -1, 11, 10, 0, 13], offsetX: 31, offsetY: -17, rotation: -0.29 }
        ];
    }

    if (hazardType === "circle") {
        return [
            { points: [-12, -5, -8, -11, 0, -13, 0, 0, -12, 3], offsetX: -34, offsetY: -38, rotation: -0.40 },
            { points: [0, -13, 8, -11, 12, -5, 12, 3, 0, 0], offsetX: 35, offsetY: -39, rotation: 0.37 },
            { points: [-12, 3, 0, 0, 0, 13, -8, 11], offsetX: -37, offsetY: -19, rotation: 0.29 },
            { points: [0, 0, 12, 3, 8, 11, 0, 13], offsetX: 39, offsetY: -18, rotation: -0.30 }
        ];
    }

    return [
        { points: [-12, -12, 1, -12, -2, -1, -11, 2], offsetX: -34, offsetY: -39, rotation: -0.42 },
        { points: [1, -12, 12, -12, 12, 1, 3, -2], offsetX: 35, offsetY: -42, rotation: 0.36 },
        { points: [-11, 2, -2, 0, 1, 12, -12, 12], offsetX: -39, offsetY: -20, rotation: 0.28 },
        { points: [0, -1, 12, 2, 12, 12, 1, 12], offsetX: 41, offsetY: -18, rotation: -0.31 }
    ];
}

/** Draw the exact moving attack volume as a shallow forward pressure front. */
function drawPulseWave(graphics, runway, volume) {
    const alpha = 0.95 * (1 - volume.progress * 0.68);

    drawPressureFront(graphics, runway, volume, 4, alpha);

    // Subtle echoes sit inside the same moving volume. They are presentation
    // only and never extend beyond the collision front.
    drawPressureFront(graphics, runway, {
        ...volume,
        centerDepth: volume.centerDepth + volume.halfDepthThickness * 0.55,
        halfLaneWidth: volume.halfLaneWidth * 0.82
    }, 2, alpha * 0.46);
}

function drawPressureFront(
    graphics,
    runway,
    volume,
    lineWidth,
    alpha
) {
    const left = runway.project(
        volume.centerLane - volume.halfLaneWidth,
        volume.centerDepth
    );
    const right = runway.project(
        volume.centerLane + volume.halfLaneWidth,
        volume.centerDepth
    );

    // Forward is toward the horizon (smaller depth). Pulling the center forward
    // produces a shallow pressure-front bow.
    const bowDepth = Math.max(
        0,
        volume.centerDepth - volume.halfDepthThickness * 0.72
    );
    const center = runway.project(volume.centerLane, bowDepth);

    graphics.lineStyle(lineWidth, PULSE_COLOR, alpha);
    graphics.beginPath();
    graphics.moveTo(left.x, left.y);

    const segmentCount = 14;
    for (let segment = 1; segment <= segmentCount; segment += 1) {
        const t = segment / segmentCount;
        const inverseT = 1 - t;
        const x = inverseT * inverseT * left.x
            + 2 * inverseT * t * center.x
            + t * t * right.x;
        const y = inverseT * inverseT * left.y
            + 2 * inverseT * t * center.y
            + t * t * right.y;
        graphics.lineTo(x, y);
    }

    graphics.strokePath();
}
