// Coordinates are viewport CSS pixels, measured from the actual Phaser canvas.
// No viewport-width or viewport-height breakpoint decides visibility.
const CLEARANCE = 12;
function intersects(a, b) {
    return a.left < b.right && a.right > b.left &&
        a.top < b.bottom && a.bottom > b.top;
}
function withinViewport(rect, width, height) {
    return rect.left >= CLEARANCE && rect.top >= CLEARANCE &&
        rect.right <= width - CLEARANCE && rect.bottom <= height - CLEARANCE;
}
function candidate(left, top, width, height) {
    return { left, top, right: left + width, bottom: top + height };
}
/**
 * Find room for the entire tray, preferring the right gutter and otherwise
 * centering it under the actual game scene. Return null if neither fits.
 */
export function chooseSignaturePlacement(scene, signature, viewport) {
    const { width, height } = viewport;
    if (scene.width <= 0 || scene.height <= 0 ||
        signature.width <= 0 || signature.height <= 0) return null;
    const rightGutter = width - scene.right;
    if (rightGutter >= signature.width + 2 * CLEARANCE) {
        const right = candidate(
            scene.right + (rightGutter - signature.width) / 2,
            height - CLEARANCE - signature.height,
            signature.width,
            signature.height
        );
        if (withinViewport(right, width, height) && !intersects(right, scene)) {
            return { x: right.left, y: right.top, zone: "right" };
        }
    }
    const bottomGutter = height - scene.bottom;
    if (bottomGutter >= signature.height + 2 * CLEARANCE) {
        const bottom = candidate(
            scene.left + (scene.width - signature.width) / 2,
            height - CLEARANCE - signature.height,
            signature.width,
            signature.height
        );
        if (withinViewport(bottom, width, height) && !intersects(bottom, scene)) {
            return { x: bottom.left, y: bottom.top, zone: "bottom" };
        }
    }
    return null;
}
/** Keep the signature hidden until Phaser and the layout have real dimensions. */
export function setupTechSignature(game) {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const signature = document.getElementById("tech-signature");
    if (!signature) return;
    let frame = 0;
    let observedCanvas = null;
    const observer = typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    function layout() {
        frame = 0;
        signature.style.visibility = "hidden";
        const canvas = game.canvas;
        if (!canvas || !canvas.isConnected) return;
        if (canvas !== observedCanvas) {
            if (observedCanvas) observer?.unobserve(observedCanvas);
            observer?.observe(canvas);
            observedCanvas = canvas;
        }
        const scene = canvas.getBoundingClientRect();
        const credit = signature.getBoundingClientRect();
        const placement = chooseSignaturePlacement(scene, credit, {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        });
        if (!placement) return;
        signature.style.left = `${placement.x}px`;
        signature.style.top = `${placement.y}px`;
        signature.dataset.zone = placement.zone;
        signature.style.visibility = "visible";
    }
    function schedule() {
        // Hide immediately during a resize, not after the next animation frame.
        signature.style.visibility = "hidden";
        if (!frame) frame = window.requestAnimationFrame(layout);
    }
    window.addEventListener("resize", schedule);
    observer?.observe(signature);
    if (document.fonts?.ready) document.fonts.ready.then(schedule);
    // Phaser can create its canvas after the game constructor returns.
    // Its scale manager provides the first reliable sizing event.
    game.events.once("ready", () => {
        game.scale.on("resize", schedule);
        schedule();
    });
    schedule();
}
