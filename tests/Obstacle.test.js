import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Replace only Phaser's rendering/random helpers; exercise the real Obstacle class.
const phaserStub = `
    const MathHelpers = {
        Clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        FloatBetween: (min, max) => (min + max) / 2,
        Between: () => 0,
        Linear: (start, end, amount) => start + (end - start) * amount,
        DegToRad: degrees => degrees * Math.PI / 180,
        Vector2: class { constructor(x, y) { this.x = x; this.y = y; } }
    };
    export default {
        Math: MathHelpers,
        Utils: { Array: { GetRandom: values => values[0] } }
    };
`;

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === "phaser") {
            return { url: `data:text/javascript,${encodeURIComponent(phaserStub)}`, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    }
});

const { Obstacle } = await import("../src/entities/Obstacle.js");

function createObstacle() {
    const graphics = {
        setDepth() { return this; },
        setVisible() { return this; },
        clear() { return this; },
        fillStyle() { return this; },
        lineStyle() { return this; },
        fillRect() { return this; },
        strokeRect() { return this; },
        fillCircle() { return this; },
        strokeCircle() { return this; },
        setPosition() { return this; },
        setScale() { return this; }
    };
    const scene = { add: { graphics: () => graphics } };
    const runway = {
        getSafeLaneLimit: () => 1,
        clampLaneForShape: lane => lane,
        project: (lane, depth) => ({ x: lane, y: depth, scale: 1 })
    };
    return new Obstacle(scene, runway);
}

test("obstacle initializes at the starting world speed without a runtime error", () => {
    const obstacle = createObstacle();
    assert.equal(obstacle.worldSpeed, 0.20);
    assert.equal(obstacle.active, false);
});

test("obstacle applies the score-based speed progression correctly", () => {
    const obstacle = createObstacle();
    for (const [score, expectedSpeed] of [
        [0, 0.20], [10, 0.40], [30, 0.80], [50, 1.20],
        [69, 1.58], [70, 1.58], [100, 1.58]
    ]) {
        obstacle.reset(score);
        assert.ok(
            Math.abs(obstacle.worldSpeed - expectedSpeed) < 1e-10,
            `score ${score}: expected ${expectedSpeed}, got ${obstacle.worldSpeed}`
        );
    }
});
