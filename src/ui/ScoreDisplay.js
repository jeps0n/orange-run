export class ScoreDisplay {

    constructor(scene) {
        this.text = scene.add.text(
            20,
            20,
            "Score: 0",
            {
                fontSize: "24px",
                fill: "#ffffff"
            }
        );
    }


    update(score) {
        this.text.setText(
            "Score: " + score
        );
    }

}