export class ScoreDisplay {

constructor(scene) {

    this.scene = scene;
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
        this.text.setColor("#ffaa00");

        this.scene.tweens.killTweensOf(this.text);

        this.scene.tweens.add({
            targets: this.text,
            scale: 1.2,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.text.setColor("#ffffff");
            }
        });
    }

}