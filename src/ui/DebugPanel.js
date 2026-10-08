const DEBUG_LABEL = "#7f91a8";
const DEBUG_ACCENT = "#66ff99";
const DEBUG_WARNING = "#ff6677";
const DEBUG_TEXT = "#d8dee9";
const DEBUG_FPS = "#ffff66";
const LABEL_X = 520;
const VALUE_X = 622;
const ROW_HEIGHT = 15;
const SECTION_GAP = 9;
const DEBUG_DEPTH = 30;
export class DebugPanel {
    constructor(scene) {
        const headingStyle = {
            fontSize: "9px",
            fontFamily: "monospace",
            fontStyle: "bold",
            color: DEBUG_LABEL
        };
        const rowStyle = {
            fontSize: "11px",
            fontFamily: "monospace",
            color: DEBUG_TEXT
        };
        this.elements = [];
        let y = 68;
        const addText = (x, top, content, style, rightAligned = false) => {
            const text = scene.add.text(x, top, content, style)
                .setOrigin(rightAligned ? 1 : 0, 0)
                .setDepth(DEBUG_DEPTH);
            this.elements.push(text);
            return text;
        };
        const addSection = (heading, fields, valueColor) => {
            addText(LABEL_X, y, heading, headingStyle);
            y += ROW_HEIGHT;
            const values = [];
            for (const field of fields) {
                addText(LABEL_X, y, field, rowStyle);
                values.push(addText(VALUE_X, y, "", {
                    ...rowStyle,
                    color: valueColor
                }, true));
                y += ROW_HEIGHT;
            }
            y += SECTION_GAP;
            return values;
        };
        this.playerValues = addSection("PLAYER", ["Lane", "Depth"], DEBUG_ACCENT);
        this.worldValues = addSection("WORLD", ["Hazard", "Speed", "Depth"], DEBUG_WARNING);
        this.inputValues = addSection("INPUT", ["Touch", "Move X", "Move Y"], DEBUG_TEXT);
        addText(LABEL_X, y, "FPS", rowStyle);
        this.fpsValue = addText(VALUE_X, y, "", {
            ...rowStyle,
            color: DEBUG_FPS
        }, true);
    }
    update(player, obstacle, movement, debug, fps) {
        const [lane, playerDepth] = this.playerValues;
        lane.setText(player.lane.toFixed(2));
        playerDepth.setText(player.depth.toFixed(2));
        const [hazard, speed, obstacleDepth] = this.worldValues;
        hazard.setText(obstacle.type);
        speed.setText(obstacle.worldSpeed.toFixed(3));
        obstacleDepth.setText(obstacle.depth.toFixed(2));
        const [touch, moveX, moveY] = this.inputValues;
        touch.setText(debug.touchActive ? "ON" : "OFF");
        moveX.setText(movement.x.toFixed(2));
        moveY.setText(movement.y.toFixed(2));
        this.fpsValue.setText(String(Math.round(fps)));
    }
    setVisible(visible) {
        for (const element of this.elements) element.setVisible(visible);
    }
}
