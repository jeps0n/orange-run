export class StartScreen {

    constructor(scene) {

        this.scene = scene;

        this.container = scene.add.container(
            scene.scale.width / 2,
            scene.scale.height / 2
        );

        this.background = scene.add.rectangle(
            0,
            0,
            380,
            240,
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
            -70,
            "ORANGE RUN",
            {
                fontSize: "42px",
                fill: "#ff8000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);


        this.subtitle = scene.add.text(
            0,
            -20,
            "Dodge the obstacles",
            {
                fontSize: "22px",
                fill: "#cccccc"
            }
        ).setOrigin(0.5);


        this.startText = scene.add.text(
            0,
            70,
            "PRESS SPACE OR TAP TO START",
            {
                fontSize: "18px",
                fill: "#dddddd"
            }
        ).setOrigin(0.5);


        this.container.add([
            this.background,
            this.title,
            this.subtitle,
            this.startText
        ]);


        this.container.setVisible(true);

        this.container.setAlpha(0);

        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300
        });

        this.scene.tweens.add({
            targets: this.startText,
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