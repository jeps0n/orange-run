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
                fill: "#b0e0e6"
            }
        );
    }


    update(player, movement, debug, fps) {

        this.xyText.setText(
            `vx: ${Math.round(player.sprite.body.velocity.x)}\n` +
            `vy: ${Math.round(player.sprite.body.velocity.y)}`
        );


        this.fpsText.setText(
            `FPS: ${Math.round(fps)}`
        );


        this.inputText.setText(
`Touch: ${debug.touchActive}

Center:
${Math.round(debug.joystickCenter.x)},
${Math.round(debug.joystickCenter.y)}

Finger:
${Math.round(debug.touchPosition.x)},
${Math.round(debug.touchPosition.y)}

Move:
${movement.x},
${movement.y}`
        );
    }

}