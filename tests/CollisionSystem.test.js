import test from 'node:test';
import assert from 'node:assert/strict';
import { overlapsInWorldSpace, playerHitsObstacle, playerCollectsPowerUp, pulseHitsObstacle } from '../src/systems/CollisionSystem.js';

test('player collision uses lane and depth tolerances', () => {
    const player = { lane: 0, depth: 0.8 };
    assert.equal(overlapsInWorldSpace(player, { lane: 0.13, depth: 0.8 }), true);
    assert.equal(overlapsInWorldSpace(player, { lane: 0.14, depth: 0.8 }), false);
    assert.equal(playerHitsObstacle(player, { lane: 0, depth: 0.8, active: false }), false);
    assert.equal(playerCollectsPowerUp(player, { lane: 0.14, depth: 0.8, active: true }), true);
});

test('pulse hit uses projection-aware padding', () => {
    const runway = {
        project: () => ({ scale: 1, bounds: { width: 200 } }),
        getYAtDepth: (depth) => depth * 100
    };
    const obstacle = { active: true, lane: 0, depth: 0.5, localHalfWidth: 10 };
    let captured;
    const pulse = { contains: (...args) => { captured = args; return true; } };
    assert.equal(pulseHitsObstacle(pulse, obstacle, runway), true);
    assert.equal(captured[2], 0.1);
    assert.ok(captured[3] > 0);
    obstacle.active = false;
    assert.equal(pulseHitsObstacle(pulse, obstacle, runway), false);
});
