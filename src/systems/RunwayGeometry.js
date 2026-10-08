import Phaser from "phaser";
// Controls where the runway meets the horizon. Smaller values extend it farther.
const RUNWAY_FAR_Y = 130.25;
/**
 * Single source of truth for Orange Run's faux-3D world.
 *
 * Gameplay objects live in normalized world coordinates:
 *   lane  -1 = left edge, 0 = center, 1 = right edge
 *   depth  0 = horizon, 1 = foreground
 *
 * Nothing else should invent its own perspective math.
 */
export class RunwayGeometry {
    constructor({ width = 640, height = 480 } = {}) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.horizonY = RUNWAY_FAR_Y;
        this.foregroundY = height + 18;
        this.horizonWidth = 16;
        this.foregroundWidth = width * 0.94;
        // Nonlinear projection keeps the foreground wide while compressing distance.
        this.perspectiveExponent = 1.85;
    }
    clampDepth(depth) {
        return Phaser.Math.Clamp(depth, 0, 1);
    }
    projectDepth(depth) {
        return Math.pow(this.clampDepth(depth), this.perspectiveExponent);
    }
    getYAtDepth(depth) {
        return Phaser.Math.Linear(this.horizonY, this.foregroundY, this.projectDepth(depth));
    }
    getWidthAtDepth(depth) {
        return Phaser.Math.Linear(this.horizonWidth, this.foregroundWidth, this.projectDepth(depth));
    }
    getScaleAtDepth(depth) {
        return Phaser.Math.Linear(0.18, 1.35, this.projectDepth(depth));
    }
    getBoundsAtDepth(depth) {
        const width = this.getWidthAtDepth(depth);
        return {
            left: this.centerX - width / 2,
            right: this.centerX + width / 2,
            width
        };
    }
    /** Keep the complete projected shape inside the sloped runway. */
    getSafeLaneLimit(depth, localHalfWidth = 0) {
        const width = this.getWidthAtDepth(depth);
        const scale = this.getScaleAtDepth(depth);
        const projectedHalfWidth = localHalfWidth * scale;
        const halfRunway = width / 2;
        if (halfRunway <= 0) return 0;
        return Phaser.Math.Clamp(1 - projectedHalfWidth / halfRunway, 0, 1);
    }
    clampLaneForShape(lane, depth, localHalfWidth = 0) {
        const limit = this.getSafeLaneLimit(depth, localHalfWidth);
        return Phaser.Math.Clamp(lane, -limit, limit);
    }
    project(lane, depth) {
        const safeDepth = this.clampDepth(depth);
        const safeLane = Phaser.Math.Clamp(lane, -1, 1);
        const bounds = this.getBoundsAtDepth(safeDepth);
        return {
            x: this.centerX + safeLane * bounds.width / 2,
            y: this.getYAtDepth(safeDepth),
            scale: this.getScaleAtDepth(safeDepth),
            bounds
        };
    }
}
