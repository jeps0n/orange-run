import test from "node:test";
import assert from "node:assert/strict";
import { chooseSignaturePlacement } from "../src/ui/TechSignature.js";
const viewport = { width: 1200, height: 800 };
const signature = { width: 250, height: 35 };
function scene(left, top, width, height) {
    return { left, top, right: left + width, bottom: top + height, width, height };
}
function creditRect(position) {
    return { left: position.x, right: position.x + signature.width,
        top: position.y, bottom: position.y + signature.height };
}
function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
test("places the entire credit in a sufficiently wide right gutter", () => {
    const game = scene(110, 100, 700, 550);
    const result = chooseSignaturePlacement(game, signature, viewport);
    assert.equal(result.zone, "right");
    assert.equal(result.x, game.right + (viewport.width - game.right - signature.width) / 2);
    assert.equal(result.y, viewport.height - 12 - signature.height);
    assert.equal(overlaps(creditRect(result), game), false);
});
test("centers the entire credit beneath the scene when right gutter is too narrow", () => {
    const game = scene(70, 20, 1050, 650);
    const result = chooseSignaturePlacement(game, signature, viewport);
    assert.equal(result.zone, "bottom");
    assert.equal(result.x + signature.width / 2, game.left + game.width / 2);
    assert.equal(overlaps(creditRect(result), game), false);
});
test("hides the credit if neither gutter fits", () => {
    const game = scene(70, 30, 1050, 740);
    assert.equal(chooseSignaturePlacement(game, signature, viewport), null);
});
test("rejects bottom placement if the centered group would extend offscreen", () => {
    const game = scene(5, 20, 180, 650);
    const veryWideCredit = { width: 450, height: 35 };
    // Right gutter fits, so the signature can still be safely placed there.
    assert.equal(chooseSignaturePlacement(game, veryWideCredit, viewport).zone, "right");
    const noRight = scene(5, 20, 1150, 650);
    assert.equal(chooseSignaturePlacement(noRight, veryWideCredit, viewport).zone, "bottom");
});
test("never overlaps the game across continuously varying 4:3 FIT canvas sizes", () => {
    for (let width = 320; width <= 1600; width += 37) {
        for (let height = 240; height <= 1000; height += 31) {
            const scale = Math.min(width / 640, height / 480);
            const sceneWidth = 640 * scale;
            const sceneHeight = 480 * scale;
            const game = scene((width - sceneWidth) / 2, (height - sceneHeight) / 2,
                sceneWidth, sceneHeight);
            const position = chooseSignaturePlacement(game, signature, { width, height });
            if (!position) continue;
            const credit = creditRect(position);
            assert.equal(overlaps(credit, game), false, `${width}x${height}`);
            assert.ok(credit.left >= 12 && credit.right <= width - 12);
            assert.ok(credit.top >= 12 && credit.bottom <= height - 12);
        }
    }
});
test("waits for valid canvas and signature dimensions", () => {
    assert.equal(chooseSignaturePlacement(scene(0, 0, 0, 0), signature, viewport), null);
    assert.equal(chooseSignaturePlacement(scene(0, 0, 800, 600), { width: 0, height: 30 }, viewport), null);
});
test("right-gutter tray is centered in the available right space", () => {
    const game = scene(100, 70, 650, 650);
    const tray = { width: 200, height: 60 };
    const position = chooseSignaturePlacement(game, tray, viewport);
    assert.equal(position.zone, "right");
    assert.equal(position.x + tray.width / 2, (game.right + viewport.width) / 2);
});
test("larger padded tray is hidden when it cannot fit either gutter", () => {
    const game = scene(100, 0, 940, 760);
    assert.equal(chooseSignaturePlacement(game, { width: 260, height: 65 }, viewport), null);
});
