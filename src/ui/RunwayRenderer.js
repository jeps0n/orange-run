const RUNWAY_COLOR = 0x07111d;
const GRID_COLOR = 0x2d75b8;
const EDGE_COLOR = 0xff7a00;

const FAR_EDGE_WIDTH = 1;
const NEAR_EDGE_WIDTH = 4;
const EDGE_ALPHA = 0.9;
const EDGE_SEGMENTS = 48;

const LANE_STEP = 0.2;
const GRID_SPACING = 0.075;
const GRID_LINE_COUNT = 16;

const POLE_BODY_COLOR = 0x27313D;
const POLE_CAP_COLOR = 0x9E5945;
const POLE_WIDTH = 4;
const POLE_CAP_RADIUS = 4;
const POLE_VOID_GAP = 17;
// Pole height changes the top position while the bottom remains anchored.
const POLE_HEIGHT = 158;

// Pole depth controls horizontal placement beside the projected runway.
const POLE_DEPTH = 0.69;

/**
 * Presentation-only renderer for the shared RunwayGeometry.
 *
 * All runway positions come from RunwayGeometry so rendering and gameplay
 * share the same projection.
 */
export class RunwayRenderer {
    constructor(scene, runway) {
        this.runway = runway;
        this.graphics = scene.add.graphics().setDepth(-3);
        this.travel = 0;
        this.draw();
    }

    draw() {
        const g = this.graphics;
        const { horizonY, foregroundY } = this.runway;
        const far = this.runway.getBoundsAtDepth(0);
        const near = this.runway.getBoundsAtDepth(1);

        g.clear();

        // Boundary poles belong to the world behind the runway. Drawing them
        // first lets the runway naturally occlude their inward portions.
        this.drawForwardBoundaryPoles(g);

        g.fillStyle(RUNWAY_COLOR, 1);
        g.fillPoints([
            { x: far.left, y: horizonY },
            { x: far.right, y: horizonY },
            { x: near.right, y: foregroundY },
            { x: near.left, y: foregroundY }
        ], true);

        this.drawLaneLines(g);
        this.drawCrossLines(g);
        this.drawRunwayEdges(g);
    }

    drawLaneLines(g) {
        for (let lane = -1; lane <= 1.001; lane += LANE_STEP) {
            const horizon = this.runway.project(lane, 0);
            const foreground = this.runway.project(lane, 1);
            const isCenter = Math.abs(lane) < 0.001;

            g.lineStyle(isCenter ? 2 : 1, GRID_COLOR, isCenter ? 0.58 : 0.38);
            g.lineBetween(horizon.x, horizon.y, foreground.x, foreground.y);
        }
    }

    drawCrossLines(g) {
        for (let i = 0; i < GRID_LINE_COUNT; i++) {
            const depth = (i * GRID_SPACING + this.travel) % 1;
            const bounds = this.runway.getBoundsAtDepth(depth);
            const y = this.runway.getYAtDepth(depth);
            const projectedDepth = this.runway.projectDepth(depth);
            const alpha = 0.18 + projectedDepth * 0.48;

            g.lineStyle(projectedDepth > 0.72 ? 2 : 1, GRID_COLOR, alpha);
            g.lineBetween(bounds.left, y, bounds.right, y);
        }
    }

    drawRunwayEdges(g) {
        // Rail thickness follows projected depth while the centerline stays on the runway edge.
        for (let i = 0; i < EDGE_SEGMENTS; i++) {
            const startDepth = i / EDGE_SEGMENTS;
            const endDepth = (i + 1) / EDGE_SEGMENTS;
            const start = this.runway.getBoundsAtDepth(startDepth);
            const end = this.runway.getBoundsAtDepth(endDepth);
            const startY = this.runway.getYAtDepth(startDepth);
            const endY = this.runway.getYAtDepth(endDepth);
            const visualDepth = this.runway.projectDepth((startDepth + endDepth) / 2);
            const width = FAR_EDGE_WIDTH + (NEAR_EDGE_WIDTH - FAR_EDGE_WIDTH) * visualDepth;
            g.lineStyle(width, EDGE_COLOR, EDGE_ALPHA);
            g.lineBetween(start.left, startY, end.left, endY);
            g.lineBetween(start.right, startY, end.right, endY);
        }
    }

    drawForwardBoundaryPoles(g) {
        // POLE_DEPTH keeps the poles horizontally aligned with the runway
        // perspective. POLE_HEIGHT controls the top without moving the base.
        const poleBounds = this.runway.getBoundsAtDepth(POLE_DEPTH);
        const shaftEndY = this.runway.height + POLE_CAP_RADIUS;
        const poleTopY = shaftEndY - POLE_HEIGHT;

        // Offset the poles beyond the rail; the runway occludes the lower shaft.
        const centerOffset = POLE_CAP_RADIUS + POLE_VOID_GAP;
        const leftX = poleBounds.left - centerOffset;
        const rightX = poleBounds.right + centerOffset;

        this.drawBoundaryPole(g, leftX, poleTopY, shaftEndY);
        this.drawBoundaryPole(g, rightX, poleTopY, shaftEndY);
    }

    drawBoundaryPole(g, x, topY, shaftEndY) {
        g.lineStyle(POLE_WIDTH, POLE_BODY_COLOR, 0.88);
        g.lineBetween(x, topY + POLE_CAP_RADIUS, x, shaftEndY);

        g.fillStyle(POLE_BODY_COLOR, 1);
        g.fillCircle(x, topY, POLE_CAP_RADIUS + 1);
        g.fillStyle(POLE_CAP_COLOR, 0.95);
        g.fillCircle(x, topY, POLE_CAP_RADIUS);
    }

    update(worldSpeed, deltaSeconds) {
        this.travel = (this.travel + worldSpeed * deltaSeconds) % GRID_SPACING;
        this.draw();
    }
}
