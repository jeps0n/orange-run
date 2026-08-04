export class GameOverScreen {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(
            scene.scale.width / 2,
            scene.scale.height / 2
        );

        this.background = scene.add.rectangle(
            0,
            0,
            360,
            220,
            0x000000,
            0.75
        );

        this.background.setStrokeStyle(
            2,
            0xffffff,
            0.15
        );

        this.title = scene.add.text(
            0,
            -60,
            "GAME OVER",
            {
                fontSize: "42px",
                fill: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.score = scene.add.text(
            0,
            0,
            "",
            {
                fontSize: "28px",
                fill: "#ffaa00"
            }
        ).setOrigin(0.5);

        this.restart = scene.add.text(
            0,
            60,
            "PRESS SPACE OR TAP TO RETRY",
            {
                fontSize: "18px",
                fill: "#bbbbbb"
            }
        ).setOrigin(0.5);

        this.container.add([
            this.background,
            this.title,
            this.score,
            this.restart
        ]);
        this.container.setVisible(false);
    }
    show(score) {
        this.score.setText(
            "Score: " + score
        );
        this.container.setVisible(true);
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300
        });

        this.scene.tweens.add({
            targets: this.restart,
            alpha: 0.5,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
    }
    hide() {
        this.container.setVisible(false);
    }
}