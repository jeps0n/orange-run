export class GameOverScreen {

    constructor(scene) {

        this.panel = scene.add.rectangle(
            320,
            245,
            300,
            130,
            0x000000,
            0.5
        );

        this.title = scene.add.text(
            320,
            220,
            "GAME OVER",
            {
                fontSize: "48px",
                fontStyle: "bold",
                fill: "#ffffff"
            }
        );

        this.restartText = scene.add.text(
            320,
            270,
            "Press\nSPACE or TAP\nto Restart",
            {
                fontSize: "24px",
                align: "center",
                fill: "#ffffff"
            }
        );


        this.title.setOrigin(0.5);
        this.restartText.setOrigin(0.5);

        this.hide();
    }


    show() {

        this.panel.setVisible(true);
        this.title.setVisible(true);
        this.restartText.setVisible(true);

    }


    hide() {

        this.panel.setVisible(false);
        this.title.setVisible(false);
        this.restartText.setVisible(false);

    }

}