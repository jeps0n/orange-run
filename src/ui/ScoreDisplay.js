const SHIELD_COLOR = "#42e8ff";
const PULSE_COLOR = "#a8ff2a";
const PRIMARY_TEXT = "#ffffff";
const MUTED_TEXT = "#7f91a8";
const HIGH_VALUE_TEXT = "#9aa8b8";
export class ScoreDisplay {
    constructor(scene, highScore = 0) {
        this.scene = scene;
        scene.add.text(18, 14, "SCORE", {
            fontSize: "10px",
            fontFamily: "monospace",
            fontStyle: "bold",
            fill: MUTED_TEXT,
            letterSpacing: 2
        }).setDepth(10);
        this.scoreText = scene.add.text(18, 28, "000", {
            fontSize: "27px",
            fontFamily: "monospace",
            fontStyle: "bold",
            fill: PRIMARY_TEXT
        }).setDepth(10);
        scene.add.text(18, 62, "HIGH", {
            fontSize: "9px",
            fontFamily: "monospace",
            fontStyle: "bold",
            fill: MUTED_TEXT,
            letterSpacing: 2
        }).setAlpha(0.72).setDepth(10);
        this.highText = scene.add.text(18, 74, formatScore(highScore), {
            fontSize: "18px",
            fontFamily: "monospace",
            fontStyle: "bold",
            fill: HIGH_VALUE_TEXT
        }).setAlpha(0.72).setDepth(10);
        this.shieldStatus = scene.add.text(622, 17, "", {
            fontSize: "12px",
            fontFamily: "monospace",
            fontStyle: "bold",
            fill: SHIELD_COLOR,
            letterSpacing: 1
        }).setOrigin(1, 0).setDepth(10);
        this.pulseStatus = scene.add.text(622, 36, "", {
            fontSize: "12px",
            fontFamily: "monospace",
            fontStyle: "bold",
            fill: PULSE_COLOR,
            letterSpacing: 1
        }).setOrigin(1, 0).setDepth(10);
    }
    update(score, highScore, isNewHighScore = false) {
        this.scoreText.setText(formatScore(score));
        this.highText.setText(formatScore(highScore));
        if (isNewHighScore) this.acknowledgeHighScore();
    }
    acknowledgeHighScore() {
        this.scene.tweens.killTweensOf(this.highText);
        this.highText.setAlpha(1).setFill(PRIMARY_TEXT);
        this.scene.tweens.add({
            targets: this.highText,
            alpha: 0.72,
            duration: 180,
            ease: "Quad.easeOut",
            onComplete: () => this.highText.setFill(HIGH_VALUE_TEXT)
        });
    }
    updatePowerUps(player) {
        this.shieldStatus.setText(player.shielded ? "SHIELD ●" : "");
        this.pulseStatus.setText(
            player.pulseCharges > 0 ? `PULSE ${"●".repeat(player.pulseCharges)}` : ""
        );
    }
}
function formatScore(score) {
    return String(score).padStart(3, "0");
}
