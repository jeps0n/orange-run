export class StartScreen {
    constructor(scene) {
        this.scene = scene;
        this.container = scene.add.container(320, 240).setDepth(20);
        this.background = scene.add.rectangle(0, 0, 430, 248, 0x05070d, 0.88).setStrokeStyle(1, 0xff7a00, 0.5);
        this.kicker = scene.add.text(0, -86, "DODGE  •  SURVIVE  •  STRIKE BACK", { fontSize: "11px", fontFamily: "monospace", fill: "#8b98aa" }).setOrigin(0.5);
        this.title = scene.add.text(0, -48, "ORANGE RUN", { fontSize: "46px", fontFamily: "Arial Black", fill: "#ff8200" }).setOrigin(0.5);
        this.subtitle = scene.add.text(0, 5, "Move fast. Red means danger.", { fontSize: "18px", fill: "#d8dee9" }).setOrigin(0.5);
        this.controls = scene.add.text(0, 42, "ARROWS / WASD  •  DRAG TO MOVE", { fontSize: "12px", fontFamily: "monospace", fill: "#8290a3" }).setOrigin(0.5);
        this.startText = scene.add.text(0, 84, "SPACE OR TAP TO START", { fontSize: "15px", fontFamily: "monospace", fontStyle: "bold", fill: "#ffffff" }).setOrigin(0.5);
        this.container.add([this.background, this.kicker, this.title, this.subtitle, this.controls, this.startText]);
        this.container.setAlpha(0);
        scene.tweens.add({ targets: this.container, alpha: 1, duration: 260 });
        scene.tweens.add({ targets: this.startText, alpha: 0.4, duration: 650, yoyo: true, repeat: -1 });
    }
    hide() { this.container.setVisible(false); }
}
