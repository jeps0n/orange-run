// Collision tolerances are expressed in normalized lane and depth coordinates.
const DEPTH_TOLERANCE = 0.045;
const LANE_TOLERANCE = 0.13;
const PICKUP_LANE_TOLERANCE = 0.15;

export function overlapsInWorldSpace(a, b, laneTolerance = LANE_TOLERANCE) {
    return Math.abs(a.depth - b.depth) <= DEPTH_TOLERANCE
        && Math.abs(a.lane - b.lane) <= laneTolerance;
}

export function playerHitsObstacle(player, obstacle) {
    return obstacle.active && overlapsInWorldSpace(player, obstacle);
}

export function playerCollectsPowerUp(player, powerUp) {
    return powerUp.active && overlapsInWorldSpace(player, powerUp, PICKUP_LANE_TOLERANCE);
}

/** Convert projected obstacle size into lane/depth padding for pulse hit detection. */
export function pulseHitsObstacle(pulse, obstacle, runway) {
    if (!obstacle.active) return false;

    const projected = runway.project(obstacle.lane, obstacle.depth);
    const obstacleHalfPixels = obstacle.localHalfWidth * projected.scale;
    const runwayHalfWidth = projected.bounds.width / 2;
    const lanePadding = runwayHalfWidth > 0 ? obstacleHalfPixels / runwayHalfWidth : 0;

    const depthStep = 0.002;
    const yStep = Math.abs(
        runway.getYAtDepth(Math.min(1, obstacle.depth + depthStep))
        - runway.getYAtDepth(Math.max(0, obstacle.depth - depthStep))
    ) / 2;
    const depthPadding = yStep > 0 ? (obstacleHalfPixels / yStep) * depthStep : 0;

    return pulse.contains(obstacle.lane, obstacle.depth, lanePadding, depthPadding);
}
