const BACKGROUND_COLOR = 0x05070d;
const BACKGROUND_DEPTH = -5;
/**
 * Draws the illustrated Orange Run environment behind the runway.
 *
 * The artwork is authored for the same 640x480 logical stage as the game.
 * Its visual horizon is aligned to RunwayGeometry.horizonY, so the runway and
 * landscape share one vanishing point without stretching or split-image seams.
 */
export class BackgroundRenderer {
    constructor(scene, runway) {
        this.runway = runway;
        this.baseGraphics = scene.add
            .graphics()
            .setDepth(BACKGROUND_DEPTH - 1);
        this.backgroundArt = scene.add
            .image(runway.centerX, runway.height / 2, "desert-background")
            .setOrigin(0.5)
            .setDepth(BACKGROUND_DEPTH);
        this.draw();
    }
    draw() {
        const { width, height } = this.runway;
        this.baseGraphics.clear();
        this.baseGraphics.fillStyle(BACKGROUND_COLOR, 1);
        this.baseGraphics.fillRect(0, 0, width, height);
        // The asset is authored at the game's 4:3 logical aspect ratio.
        // Uniform scale only: never independently stretch X or Y.
        const scale = Math.max(
            width / this.backgroundArt.width,
            height / this.backgroundArt.height
        );
        this.backgroundArt.setScale(scale);
        this.backgroundArt.setPosition(this.runway.centerX, height / 2);
    }
}
