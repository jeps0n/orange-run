import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement, getInputDebug, isPulsePointer, setupDebugGesture } from "./input.js";
import { Player } from "./entities/Player.js";
import { Obstacle } from "./entities/Obstacle.js";
import { PowerUp } from "./entities/PowerUp.js";
import { GameState } from "./systems/GameState.js";
import { GameController } from "./systems/GameController.js";
import { RunwayGeometry } from "./systems/RunwayGeometry.js";
import { StartScreen } from "./ui/StartScreen.js";
import { ScoreDisplay } from "./ui/ScoreDisplay.js";
import { GameOverScreen } from "./ui/GameOverScreen.js";
import { DebugPanel } from "./ui/DebugPanel.js";
import { RunwayRenderer } from "./ui/RunwayRenderer.js";
import { BackgroundRenderer } from "./ui/BackgroundRenderer.js";
import { VisualEffects } from "./ui/VisualEffects.js";

const WIDTH = 640;
const HEIGHT = 480;
const PULSE_COLOR = 0xa8ff2a;

new Phaser.Game({
    type: Phaser.AUTO,
    parent: "app",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: WIDTH,
        height: HEIGHT
    },
    backgroundColor: "#05070d",
    scene: { preload, create, update }
});

function preload() {
    this.load.image("desert-background", "./art/desert-background.png");
}

function create() {
    const runway = new RunwayGeometry({ width: WIDTH, height: HEIGHT });
    new BackgroundRenderer(this, runway);
    const runwayRenderer = new RunwayRenderer(this, runway);
    const visualEffects = new VisualEffects(this, runway);
    const gameState = new GameState(this);
    const player = new Player(this, runway);
    const obstacle = new Obstacle(this, runway);
    const powerUp = new PowerUp(this, runway);
    const scoreDisplay = new ScoreDisplay(this, gameState.highScore);
    const debugPanel = new DebugPanel(this);
    const gameOverScreen = new GameOverScreen(this);
    const startScreen = !gameState.started ? new StartScreen(this) : null;
    const pulseButton = createPulseButton(this);

    const controller = new GameController({
        runway,
        player,
        obstacle,
        powerUp,
        gameState,
        presentation: { scoreDisplay, startScreen, gameOverScreen, runwayRenderer, visualEffects },
        onStart: () => this.registry.set("hasStarted", true),
        onRestart: () => this.scene.restart()
    });

    let debugVisible = false;
    const toggleDebug = () => {
        debugVisible = !debugVisible;
        debugPanel.setVisible(debugVisible);
    };
    debugPanel.setVisible(debugVisible);
    const debugGesture = setupDebugGesture(toggleDebug);
    setupInput(this);

    const continueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
    this.input.on("pointerdown", (pointer) => {
        if (debugGesture.isDebugTap(pointer)) return;
        if (controller.canPlay && isPulsePointer(pointer)) controller.usePulse();
        else controller.handleAction();
    });

    this.events.once("shutdown", () => debugGesture.destroy());
    this.gameRuntime = {
        controller,
        player,
        obstacle,
        debugPanel,
        pulseButton,
        debugKey,
        continueKey,
        toggleDebug,
        getDebugVisible: () => debugVisible
    };
}

function update(_time, deltaMs) {
    const {
        controller,
        player,
        obstacle,
        debugPanel,
        pulseButton,
        debugKey,
        continueKey,
        toggleDebug,
        getDebugVisible
    } = this.gameRuntime;
    const movement = getMovement();

    if (Phaser.Input.Keyboard.JustDown(debugKey)) toggleDebug();
    if (getDebugVisible()) {
        debugPanel.update(player, obstacle, movement, getInputDebug(), this.game.loop.actualFps);
    }

    // Cap frame time after stalls so one delayed frame cannot advance gameplay
    // far enough to skip collisions or create a large difficulty jump.
    controller.update(Math.min(deltaMs / 1000, 0.05), movement);
    pulseButton.setVisible(controller.canPlay && player.pulseCharges > 0);
    if (Phaser.Input.Keyboard.JustDown(continueKey)) {
        if (controller.canPlay) controller.usePulse();
        else controller.handleAction();
    }
}

function createPulseButton(scene) {
    const button = scene.add.container(575, 430).setDepth(14).setVisible(false);
    const circle = scene.add.circle(0, 0, 28, PULSE_COLOR, 0.10)
        .setStrokeStyle(2, PULSE_COLOR, 1);
    const label = scene.add.text(0, 0, "PULSE", {
        fontSize: "10px", fontFamily: "monospace", fontStyle: "bold", fill: "#a8ff2a"
    }).setOrigin(0.5);
    button.add([circle, label]);
    return button;
}
