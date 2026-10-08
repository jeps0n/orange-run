import test from "node:test";
import assert from "node:assert/strict";
import { PowerUpSystem } from "../src/systems/PowerUpSystem.js";
function createSystem(randomValues = [0, 5]) {
    const spawns = [];
    const grants = [];
    const effects = [];
    const powerUp = {
        active: false, type: null, sprite: { x: 10, y: 20 },
        spawn(type) { this.active = true; this.type = type; spawns.push(type); },
        hide() { this.active = false; }, update() {}
    };
    const player = {
        lane: 0, depth: 0.8,
        giveShield() { grants.push("shield"); },
        givePulse(charges) { grants.push(["pulse", charges]); }
    };
    const system = new PowerUpSystem({
        powerUp, player,
        effects: { pickup: (...args) => effects.push(args) },
        randomInt: () => randomValues.shift()
    });
    return { system, powerUp, spawns, grants, effects };
}
test("first pickup appears at score 4; scheduling advances once while active", () => {
    const { system, powerUp, spawns } = createSystem([0, 5, 1, 8]);
    system.maybeSpawn(3);
    assert.equal(spawns.length, 0);
    system.maybeSpawn(4);
    assert.deepEqual(spawns, ["shield"]);
    assert.equal(system.nextSpawnScore, 9);
    system.maybeSpawn(20);
    assert.equal(spawns.length, 1);
    powerUp.hide();
    system.maybeSpawn(8);
    assert.equal(spawns.length, 1);
    system.maybeSpawn(9);
    assert.deepEqual(spawns, ["shield", "pulse"]);
    assert.equal(system.nextSpawnScore, 17);
});
test("shield and pulse pickups grant the intended abilities exactly once", () => {
    const { system, powerUp, grants, effects } = createSystem();
    powerUp.spawn("shield");
    system.collect();
    system.collect();
    powerUp.spawn("pulse");
    system.collect();
    assert.deepEqual(grants, ["shield", ["pulse", 3]]);
    assert.equal(effects.length, 2);
    assert.deepEqual(effects.map(effect => effect.slice(0, 2)), [[10, 20], [10, 20]]);
});
test("pickup is collected only when player overlaps it", () => {
    const { system, powerUp, grants } = createSystem();
    powerUp.spawn("shield");
    powerUp.lane = 0.5;
    powerUp.depth = 0.8;
    system.update(0.016);
    assert.equal(grants.length, 0);
    powerUp.lane = 0;
    system.update(0.016);
    assert.deepEqual(grants, ["shield"]);
});
