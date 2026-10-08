import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Load the real application entry point without opening a browser or canvas.
// Phaser is replaced only at the platform boundary; gameplay modules stay real.
const phaserStub = `
    export let gameConfig;
    export class Game { constructor(config) { gameConfig = config; } }
    export const AUTO = 0;
    export const Scale = { FIT: 1, CENTER_BOTH: 2 };
    export const Input = { Keyboard: { KeyCodes: { SPACE: 32, F2: 113 }, JustDown: () => false } };
    export const Math = {
        Clamp: (value, min, max) => globalThis.Math.max(min, globalThis.Math.min(max, value)),
        FloatBetween: (min, max) => (min + max) / 2,
        Between: () => 0,
        Linear: (start, end, amount) => start + (end - start) * amount,
        DegToRad: degrees => degrees * globalThis.Math.PI / 180,
        Vector2: class { constructor(x, y) { this.x = x; this.y = y; } }
    };
    export const Utils = { Array: { GetRandom: values => values[0] } };
    export default { Game, AUTO, Scale, Input, Math, Utils };
`;
const phaserUrl = `data:text/javascript,${encodeURIComponent(phaserStub)}`;
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === "phaser") return { url: phaserUrl, shortCircuit: true };
        if (specifier.endsWith(".css")) {
            return { url: "data:text/javascript,export default {};", shortCircuit: true };
        }
        return nextResolve(specifier, context);
    }
});

const phaserModule = await import(phaserUrl);
await import("../src/main.js");

function createDisplay() {
    const display = {
        x: 0, y: 0, width: 640, height: 480, scaleX: 1, scaleY: 1,
        visible: true,
        setPosition(x, y) { this.x = x; this.y = y; return this; },
        setScale(scale) { this.scaleX = scale; this.scaleY = scale; return this; },
        setVisible(visible) { this.visible = visible; return this; },
        add() { return this; },
        destroy() {},
        ...Object.fromEntries([
            "setDepth", "setOrigin", "setStrokeStyle", "setFillStyle", "setAlpha",
            "setInteractive", "clear", "fillStyle", "fillRect", "fillCircle",
            "fillEllipse", "fillTriangle", "fillPoints", "lineStyle", "lineBetween",
            "strokeRect", "strokeCircle", "strokeEllipse", "strokeLineShape",
            "strokePoints", "beginPath", "moveTo", "lineTo", "closePath", "fillPath",
            "strokePath", "arc", "fillRoundedRect", "strokeRoundedRect", "setText"
        ].map(name => [name, function () { return this; }]))
    };
    return display;
}

function createScene() {
    const listeners = new Map();
    const scene = {
        add: Object.fromEntries([
            "graphics", "image", "ellipse", "circle", "text", "container", "rectangle", "polygon"
        ].map(name => [name, () => createDisplay()])),
        registry: { get: () => false, set() {} },
        load: { image() {} },
        scene: { restart() {} },
        events: { once() {} },
        input: {
            on(name, handler) { listeners.set(name, handler); },
            keyboard: {
                addKey: () => ({ isDown: false }),
                addKeys: () => Object.fromEntries("WASD".split("").map(key => [key, { isDown: false }])),
                createCursorKeys: () => Object.fromEntries(["left", "right", "up", "down"].map(key => [key, { isDown: false }]))
            }
        },
        game: { loop: { actualFps: 60 } },
        tweens: { add() {} },
        cameras: { main: { shake() {} } }
    };
    return { scene, listeners };
}

test("scene initializes real gameplay systems and runs its first update", () => {
    assert.equal(typeof phaserModule.gameConfig.scene.create, "function");
    const { scene } = createScene();
    phaserModule.gameConfig.scene.preload.call(scene);
    phaserModule.gameConfig.scene.create.call(scene);

    assert.equal(scene.gameRuntime.obstacle.worldSpeed, 0.20);
    assert.equal(scene.gameRuntime.controller.canPlay, false);
    assert.doesNotThrow(() => phaserModule.gameConfig.scene.update.call(scene, 0, 16));
    assert.equal(scene.gameRuntime.pulseButton.visible, false);
});

test("scene starts gameplay through its real input wiring", () => {
    const { scene, listeners } = createScene();
    phaserModule.gameConfig.scene.create.call(scene);
    assert.equal(typeof listeners.get("pointerdown"), "function");
    listeners.get("pointerdown")({ x: 320, y: 240 });
    assert.equal(scene.gameRuntime.controller.canPlay, true);
    assert.doesNotThrow(() => phaserModule.gameConfig.scene.update.call(scene, 16, 16));
});
