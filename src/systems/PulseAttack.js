const PULSE_DURATION_SECONDS = 0.22;
const NEAR_OFFSET = 0.04;
const FAR_OFFSET = 0.17;
const START_HALF_LANE_WIDTH = 0.08;
const END_HALF_LANE_WIDTH = 0.20;
const HALF_DEPTH_THICKNESS = 0.014;
/**
 * One authoritative, moving Pulse volume.
 *
 * Collision and rendering read this same object every frame. The wave therefore
 * cannot visually travel through a hazard after gameplay has already decided
 * that the Pulse is somewhere else.
 */
export class PulseAttack {
    constructor(player) {
        this.originLane = player.lane;
        this.originDepth = player.depth;
        this.elapsedSeconds = 0;
        this.progress = 0;
        this.finished = false;
    }
    update(deltaSeconds) {
        this.elapsedSeconds += deltaSeconds;
        this.progress = Math.min(this.elapsedSeconds / PULSE_DURATION_SECONDS, 1);
        this.finished = this.progress >= 1;
    }
    getVolume() {
        const offset = lerp(NEAR_OFFSET, FAR_OFFSET, this.progress);
        const centerDepth = this.originDepth - offset;
        const halfLaneWidth = lerp(START_HALF_LANE_WIDTH, END_HALF_LANE_WIDTH, this.progress);
        return {
            centerLane: this.originLane,
            centerDepth,
            halfLaneWidth,
            halfDepthThickness: HALF_DEPTH_THICKNESS,
            progress: this.progress
        };
    }
    contains(
        lane,
        depth,
        lanePadding = 0,
        depthPadding = 0
    ) {
        const volume = this.getVolume();
        const insideLane = Math.abs(lane - volume.centerLane)
            <= volume.halfLaneWidth + lanePadding;
        const insideDepth = Math.abs(depth - volume.centerDepth)
            <= volume.halfDepthThickness + depthPadding;
        return insideLane && insideDepth;
    }
}
function lerp(start, end, progress) {
    return start + (end - start) * progress;
}
