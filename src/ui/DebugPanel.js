export class DebugPanel {
    constructor(scene) {
        const textStyle = { fontSize: "13px", fontFamily: "monospace" };

        this.playerText = scene.add.text(20, 50, "", { ...textStyle, fill: "#66ff99" }).setDepth(30);
        this.fpsText = scene.add.text(20, 96, "", { ...textStyle, fill: "#ffff66" }).setDepth(30);
        this.obstacleText = scene.add.text(20, 120, "", { ...textStyle, fill: "#ff6677" }).setDepth(30);
        this.inputText = scene.add.text(400, 20, "", { ...textStyle, fontSize: "11px", fill: "#b0e0e6" }).setDepth(30);
    }

    update(player, obstacle, movement, debug, fps) {
        this.playerText.setText(
            `Player lane: ${player.lane.toFixed(2)}\nPlayer depth: ${player.depth.toFixed(2)}`
        );
        this.fpsText.setText(`FPS: ${Math.round(fps)}`);
        this.obstacleText.setText(
            `Hazard: ${obstacle.type}\nHazard depth: ${obstacle.depth.toFixed(2)}\nWorld speed: ${obstacle.worldSpeed.toFixed(3)}`
        );
        this.inputText.setText(
            `Touch: ${debug.touchActive}\n` +
            `Center: ${Math.round(debug.joystickCenter.x)}, ${Math.round(debug.joystickCenter.y)}\n` +
            `Finger: ${Math.round(debug.touchPosition.x)}, ${Math.round(debug.touchPosition.y)}\n` +
            `Move: ${movement.x.toFixed(2)}, ${movement.y.toFixed(2)}`
        );
    }

    setVisible(visible) {
        this.playerText.setVisible(visible);
        this.fpsText.setVisible(visible);
        this.inputText.setVisible(visible);
        this.obstacleText.setVisible(visible);
    }
}
