export class GameOverScreen {
    constructor(scene) {
        this.scene = scene;
        this.container = scene.add.container(320, 240).setDepth(20).setVisible(false);
        this.background = scene.add.rectangle(0, 0, 390, 210, 0x05070d, 0.92).setStrokeStyle(1, 0xff334f, 0.65);
        this.title = scene.add.text(0, -58, "RUN ENDED", { fontSize: "38px", fontFamily: "Arial Black", fill: "#ff334f" }).setOrigin(0.5);
        this.score = scene.add.text(0, -4, "", { fontSize: "24px", fontFamily: "monospace", fontStyle: "bold", fill: "#ff9d2e" }).setOrigin(0.5);
        this.restart = scene.add.text(0, 58, "SPACE OR TAP TO RETRY", { fontSize: "14px", fontFamily: "monospace", fontStyle: "bold", fill: "#ffffff" }).setOrigin(0.5);
        this.container.add([this.background, this.title, this.score, this.restart]);
    }
    show(score) {
        this.score.setText(`SCORE  ${String(score).padStart(3, "0")}`);
        this.container.setVisible(true).setAlpha(0);
        this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 220 });
        this.scene.tweens.add({ targets: this.restart, alpha: 0.4, duration: 650, yoyo: true, repeat: -1 });
    }
}
