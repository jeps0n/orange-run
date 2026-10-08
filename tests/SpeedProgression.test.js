import test from "node:test";
import assert from "node:assert/strict";
import { getWorldSpeedForScore } from "../src/systems/SpeedProgression.js";
test("world speed increases by 0.02 per score and caps at score 69", () => {
    for (const [score, expected] of [
        [0, 0.20], [10, 0.40], [20, 0.60], [30, 0.80],
        [40, 1.00], [50, 1.20], [60, 1.40], [69, 1.58],
        [70, 1.58], [100, 1.58], [-5, 0.20]
    ]) {
        assert.ok(Math.abs(getWorldSpeedForScore(score) - expected) < 1e-10, `score ${score}`);
    }
});
