import test from "node:test";
import assert from "node:assert/strict";
import { PulseAttack } from "../src/systems/PulseAttack.js";
test("pulse advances away from the player and widens over its lifetime", () => {
    const pulse = new PulseAttack({ lane: 0.3, depth: 0.84 });
    const initial = pulse.getVolume();
    assert.equal(initial.centerLane, 0.3);
    assert.equal(pulse.contains(0.3, initial.centerDepth), true);
    assert.equal(pulse.contains(-0.5, initial.centerDepth), false);
    pulse.update(0.11);
    const middle = pulse.getVolume();
    assert.ok(middle.centerDepth < initial.centerDepth);
    assert.ok(middle.halfLaneWidth > initial.halfLaneWidth);
    assert.equal(pulse.finished, false);
    pulse.update(0.11);
    assert.equal(pulse.progress, 1);
    assert.equal(pulse.finished, true);
    pulse.update(1);
    assert.equal(pulse.progress, 1);
});
test("pulse collision respects lane and depth padding", () => {
    const pulse = new PulseAttack({ lane: 0, depth: 0.8 });
    const { centerDepth } = pulse.getVolume();
    assert.equal(pulse.contains(0.1, centerDepth), false);
    assert.equal(pulse.contains(0.1, centerDepth, 0.03), true);
    assert.equal(pulse.contains(0, centerDepth + 0.03), false);
    assert.equal(pulse.contains(0, centerDepth + 0.03, 0, 0.02), true);
});
