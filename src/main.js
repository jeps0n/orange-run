import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement, getInputDebug, isPulsePointer } from "./input.js";
import { Player } from "./entities/Player.js";
import { Obstacle } from "./entities/Obstacle.js";
import { PowerUp } from "./entities/PowerUp.js";
import { updateMovement } from "./systems/movement.js";
import { GameState } from "./systems/GameState.js";
import { RunwayGeometry } from "./systems/RunwayGeometry.js";
import { PulseAttack } from "./systems/PulseAttack.js";
import { StartScreen } from "./ui/StartScreen.js";
import { ScoreDisplay } from "./ui/ScoreDisplay.js";
import { GameOverScreen } from "./ui/GameOverScreen.js";
import { DebugPanel } from "./ui/DebugPanel.js";
import { RunwayRenderer } from "./ui/RunwayRenderer.js";
import { BackgroundRenderer } from "./ui/BackgroundRenderer.js";
import { VisualEffects } from "./ui/VisualEffects.js";

const GAME_WIDTH = 640;
const GAME_HEIGHT = 480;

const COLLISION_DEPTH_TOLERANCE = 0.045;
const COLLISION_LANE_TOLERANCE = 0.13;

const PULSE_COLOR = 0xa8ff2a;
const INITIAL_POWER_UP_SCORE = 4;

let player;
let obstacle;
let powerUp;
let gameState;
let startScreen;
let gameOverScreen;
let debugPanel;
let scoreDisplay;
let runwayRenderer;
let visualEffects;
let runway;
let continueKey;
let debugKey;
let pulseButton;
let debugVisible = false;
let debugTapCount = 0;
let debugTapTimer;
let nextPowerUpScore = INITIAL_POWER_UP_SCORE;
let activePulse = null;

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    backgroundColor: "#05070d",
    scene: { preload, create, update }
};

new Phaser.Game(config);

function preload() {
    this.load.image("desert-background", "./art/desert-background.png");
}

function create() {
    runway = new RunwayGeometry({ width: GAME_WIDTH, height: GAME_HEIGHT });
    new BackgroundRenderer(this, runway);
    runwayRenderer = new RunwayRenderer(this, runway);
    visualEffects = new VisualEffects(this, runway);
    gameState = new GameState(this);
    nextPowerUpScore = INITIAL_POWER_UP_SCORE;
    player = new Player(this, runway);
    obstacle = new Obstacle(this, runway);
    powerUp = new PowerUp(this, runway);
    scoreDisplay = new ScoreDisplay(this, gameState.highScore);
    debugPanel = new DebugPanel(this);
    gameOverScreen = new GameOverScreen(this);

    debugPanel.setVisible(debugVisible);
    if (!this.registry.get("hasStarted")) startScreen = new StartScreen(this);

    createPulseButton(this);
    setupInput(this);
    continueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);

    this.input.on("pointerdown", (pointer) => {
        if (handleDebugTap(pointer)) return;

        if (gameState.started && !gameState.gameOver && isPulsePointer(pointer)) {
            usePulse();
            return;
        }

        handleGameAction(this);
    });

    setGameObjectsVisible(gameState.started);
    if (gameState.started) obstacle.start(gameState.score);
}

function update(_time, deltaMs) {
    const deltaSeconds = Math.min(deltaMs / 1000, 0.05);
    const movement = getMovement();

    if (Phaser.Input.Keyboard.JustDown(debugKey)) toggleDebug();
    if (debugVisible) {
        debugPanel.update(player, obstacle, movement, getInputDebug(), this.game.loop.actualFps);
    }

    scoreDisplay.updatePowerUps(player);
    pulseButton.setVisible(gameState.started && !gameState.gameOver && player.pulseCharges > 0);

    if (!gameState.started || gameState.gameOver) {
        player.updateVisuals();
        if (Phaser.Input.Keyboard.JustDown(continueKey)) handleGameAction(this);
        return;
    }

    updateMovement(player, movement, deltaSeconds);
    player.updateVisuals();
    obstacle.update(deltaSeconds);
    powerUp.update(deltaSeconds);
    updatePulse(deltaSeconds);
    runwayRenderer.update(obstacle.worldSpeed, deltaSeconds);

    checkPlayerObstacleCollision();
    checkPowerUpCollection();

    if (Phaser.Input.Keyboard.JustDown(continueKey)) usePulse();

    if (obstacle.hasPassedForeground()) {
        awardPoint();
        obstacle.reset(gameState.score);
        maybeSpawnPowerUp();
    }
}

function createPulseButton(scene) {
    pulseButton = scene.add.container(575, 430).setDepth(14).setVisible(false);
    const circle = scene.add.circle(0, 0, 28, PULSE_COLOR, 0.10).setStrokeStyle(2, PULSE_COLOR, 1);
    const text = scene.add.text(0, 0, "PULSE", {
        fontSize: "10px",
        fontFamily: "monospace",
        fontStyle: "bold",
        fill: "#a8ff2a"
    }).setOrigin(0.5);
    pulseButton.add([circle, text]);
}

/**
 * Collision is deliberately expressed in the same lane/depth world coordinates
 * that drive rendering. Arcade Physics is not used for these checks.
 */
function overlapsInWorldSpace(a, b, laneTolerance = COLLISION_LANE_TOLERANCE) {
    const nearDepth = Math.abs(a.depth - b.depth) <= COLLISION_DEPTH_TOLERANCE;
    const nearLane = Math.abs(a.lane - b.lane) <= laneTolerance;
    return nearDepth && nearLane;
}

function checkPlayerObstacleCollision() {
    if (!obstacle.active || !overlapsInWorldSpace(player, obstacle)) return;
    playerHitObstacle();
}

function checkPowerUpCollection() {
    if (!powerUp.active || !overlapsInWorldSpace(player, powerUp, 0.15)) return;
    collectPowerUp();
}

function maybeSpawnPowerUp() {
    if (powerUp.active || gameState.score < nextPowerUpScore) return;

    const type = Phaser.Math.Between(0, 1) === 0 ? "shield" : "pulse";
    powerUp.spawn(type);
    nextPowerUpScore += Phaser.Math.Between(5, 8);
}

function collectPowerUp() {
    if (!powerUp.active) return;

    const type = powerUp.type;
    const pickupX = powerUp.sprite.x;
    const pickupY = powerUp.sprite.y;
    const color = type === "shield" ? 0x42e8ff : PULSE_COLOR;
    powerUp.hide();

    if (type === "shield") player.giveShield();
    else player.givePulse(3);

    visualEffects.pickup(pickupX, pickupY, color);
}

function playerHitObstacle() {
    if (gameState.gameOver || !obstacle.active) return;

    if (player.consumeShield()) {
        visualEffects.shieldImpact(player.sprite.x, player.sprite.y);
        obstacle.destroyAndReset(gameState.score);
        return;
    }

    gameState.endGame();
    visualEffects.playerDeath(player.sprite.x, player.sprite.y);
    gameOverScreen.show(gameState.score);
}

function usePulse() {
    if (!gameState.started || gameState.gameOver || !player.consumePulse()) return;

    activePulse = new PulseAttack(player);
    visualEffects.startPulse(activePulse);
}

function updatePulse(deltaSeconds) {
    if (!activePulse) return;

    activePulse.update(deltaSeconds);
    visualEffects.updatePulse(activePulse);

    if (obstacle.active && pulseOverlapsObstacle(activePulse, obstacle)) {
        const hitX = obstacle.sprite.x;
        const hitY = obstacle.sprite.y;
        const hitScale = obstacle.sprite.scaleX;
        const hitType = obstacle.type;
        awardPoint();
        obstacle.destroyAndReset(gameState.score);
        visualEffects.pulseImpact(hitX, hitY, hitScale, hitType);
    }

    if (activePulse.finished) {
        visualEffects.endPulse();
        activePulse = null;
    }
}

function pulseOverlapsObstacle(pulse, target) {
    // Padding accounts for the hazard's visible body so contact occurs when the
    // rendered pressure front reaches the red square, not only its center point.
    const projected = runway.project(target.lane, target.depth);
    const obstacleHalfPixels = target.localHalfWidth * 2 * projected.scale / 2;
    const runwayHalfWidth = projected.bounds.width / 2;
    const lanePadding = runwayHalfWidth > 0 ? obstacleHalfPixels / runwayHalfWidth : 0;

    // Convert half the visible hazard height into a small world-depth allowance.
    // Sampling the shared projection keeps this tied to RunwayGeometry.
    const depthStep = 0.002;
    const yStep = Math.abs(
        runway.getYAtDepth(Math.min(1, target.depth + depthStep))
        - runway.getYAtDepth(Math.max(0, target.depth - depthStep))
    ) / 2;
    const depthPadding = yStep > 0 ? (obstacleHalfPixels / yStep) * depthStep : 0;

    return pulse.contains(target.lane, target.depth, lanePadding, depthPadding);
}

function awardPoint() {
    const isNewHighScore = gameState.addScore();
    scoreDisplay.update(gameState.score, gameState.highScore, isNewHighScore);
}

function startGame(scene) {
    gameState.startGame();
    scene.registry.set("hasStarted", true);
    player.setVisible(true);
    obstacle.start(gameState.score);
    startScreen?.hide();
}

function handleGameAction(scene) {
    if (!gameState.started) {
        startGame(scene);
        return;
    }

    if (gameState.gameOver) scene.scene.restart();
}

function setGameObjectsVisible(visible) {
    player.setVisible(visible);
    if (!visible) obstacle.setVisible(false);
}

function toggleDebug() {
    debugVisible = !debugVisible;
    debugPanel.setVisible(debugVisible);
}

function handleDebugTap(pointer) {
    const inDebugZone = pointer.x < 120 && pointer.y < 120;
    if (!inDebugZone) return false;

    debugTapCount += 1;
    clearTimeout(debugTapTimer);
    debugTapTimer = setTimeout(() => { debugTapCount = 0; }, 1200);

    if (debugTapCount === 3) {
        toggleDebug();
        debugTapCount = 0;
    }

    return true;
}
