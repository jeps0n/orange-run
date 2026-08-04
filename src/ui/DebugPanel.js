export class DebugPanel {

    constructor(scene) {

        this.xyText = scene.add.text(
            20,
            50,
            "",
            {
                fontSize: "18px",
                fill: "#00ff00"
            }
        );

        this.fpsText = scene.add.text(
            20,
            100,
            "",
            {
                fontSize: "18px",
                fill: "#ffff00"
            }
        );

        this.inputText = scene.add.text(
            440,
            20,
            "",
            {
                fontSize: "14px",
                fontFamily: "monospace",
                fill: "#b0e0e6"
            }
        );

        this.obstacleText = scene.add.text(
            20,
            130,
            "",
            {
                fontSize: "18px",
                fill: "#ff5555"
            }
);
    }


    update(player, obstacle, movement, debug, fps) {

        this.xyText.setText(
            `vx: ${Math.round(player.sprite.body.velocity.x)}\n` +
            `vy: ${Math.round(player.sprite.body.velocity.y)}`
        );


        this.fpsText.setText(
            `FPS: ${Math.round(fps)}`
        );

        this.obstacleText.setText(
            `Obstacle Speed: ${obstacle.speed}`
        );


        this.inputText.setText(
            `
            Touch:  ${debug.touchActive}

            Center:
            x: ${Math.round(debug.joystickCenter.x)}
            y: ${Math.round(debug.joystickCenter.y)}

            Finger:
            x: ${Math.round(debug.touchPosition.x)}
            y: ${Math.round(debug.touchPosition.y)}

            Move:
            x: ${movement.x.toFixed(2)}
            y: ${movement.y.toFixed(2)}
            `
        );
    }

    setVisible(visible) {
        this.xyText.setVisible(visible);
        this.fpsText.setVisible(visible);
        this.inputText.setVisible(visible);
        this.obstacleText.setVisible(visible);
    }
}