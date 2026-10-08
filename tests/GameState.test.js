import test from "node:test";
import assert from "node:assert/strict";
import { GameState } from "../src/systems/GameState.js";

function withStorage(storage, run) {
    const previous = globalThis.localStorage;
    globalThis.localStorage = storage;
    try { run(); } finally {
        if (previous === undefined) delete globalThis.localStorage;
        else globalThis.localStorage = previous;
    }
}

const scene = { registry: { get: () => false } };

test("starting and ending a run updates its state", () => {
    withStorage({ getItem: () => null }, () => {
        const state = new GameState(scene);
        assert.equal(state.started, false);
        state.startGame();
        assert.equal(state.started, true);
        state.endGame();
        assert.equal(state.gameOver, true);
    });
});

test("high score is saved and new-record notification happens only once", () => {
    const writes = [];
    withStorage({ getItem: () => "2", setItem: (...args) => writes.push(args) }, () => {
        const state = new GameState(scene);
        assert.equal(state.addScore(), false);
        assert.equal(state.addScore(), false);
        assert.equal(state.addScore(), true);
        assert.equal(state.addScore(), false);
        assert.equal(state.highScore, 4);
        assert.deepEqual(writes, [
            ["orange-run-high-score", "3"],
            ["orange-run-high-score", "4"]
        ]);
    });
});

test("unavailable or invalid storage does not interrupt gameplay", () => {
    withStorage({ getItem: () => { throw Error("blocked"); }, setItem: () => { throw Error("blocked"); } }, () => {
        const state = new GameState(scene);
        assert.equal(state.highScore, 0);
        assert.equal(state.addScore(), true);
    });
    withStorage({ getItem: () => "not a score" }, () => {
        assert.equal(new GameState(scene).highScore, 0);
    });
});
