const START_WORLD_SPEED = 0.20;
const WORLD_SPEED_PER_SCORE = 0.02;
const MAX_SPEED_SCORE = 69;

// A score above the cap must never increase hazard travel speed further.
export function getWorldSpeedForScore(score) {
    const cappedScore = Math.max(0, Math.min(score, MAX_SPEED_SCORE));
    return START_WORLD_SPEED + cappedScore * WORLD_SPEED_PER_SCORE;
}
