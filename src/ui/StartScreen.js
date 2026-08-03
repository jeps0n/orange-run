export class StartScreen {

    constructor(scene) {

        this.title = scene.add.text(
            320,
            150,
            "DODGE",
            {
                fontSize: "64px",
                fontStyle: "bold",
                fill: "#ffffff"
            }
        );

        this.instructions = scene.add.text(
            320,
            250,
            "Press\nSPACE or TAP\nto Start",
            {
                fontSize: "24px",
                align: "center",
                fill: "#ffffff"
            }
        );

        this.title.setOrigin(0.5);
        this.instructions.setOrigin(0.5);
    }

    show() {

        this.title.setVisible(true);
        this.instructions.setVisible(true);

    }

    hide() {

        this.title.setVisible(false);
        this.instructions.setVisible(false);

    }

}