import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement, getInputDebug } from "./input.js";

import { Player } from "./entities/Player.js";
import { Obstacle } from "./entities/Obstacle.js";

import { updateMovement } from "./systems/movement.js";
import { GameState } from "./systems/GameState.js";

import { StartScreen } from "./ui/StartScreen.js";
import { ScoreDisplay } from "./ui/ScoreDisplay.js";
import { GameOverScreen } from "./ui/GameOverScreen.js";
import { DebugPanel } from "./ui/DebugPanel.js";
import { BackgroundEffect } from "./ui/BackgroundEffect.js";


// game objects
let player;
let obstacle;

const gameWidth = 640;
const gameHeight = 480;

let gameState;
let startScreen;
let gameOverScreen;
let debugPanel;

let continueKey;
let debugKey;

let debugVisible = false;
let debugTapCount = 0;
let debugTapTimer;
const debugTapZoneSize = 160;

let scoreDisplay;
let backgroundEffect;

// =====================
// Game Configuration
// =====================
const config = {
    type: Phaser.AUTO,
    
    // Keep the game resolution consistent while allowing different screen sizes
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth,
        height: gameHeight
    },

    backgroundColor: "#1b1b1b",

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    scene: {
        create,
        update
    }
};

new Phaser.Game(config);

// =====================
// Initialize Scene Objects and Systems
// =====================
function create() {

  // =====================
  // Game State
  // =====================
  gameState = new GameState(this);


  // =====================
  // Game Objects
  // =====================
  player = new Player(
      this,
      gameWidth / 2,
      gameHeight / 2
  );

  obstacle = new Obstacle(
      this,
      gameWidth / 2,
      50
  );

  setGameObjectsVisible(gameState.started);

  if (gameState.started) {
      obstacle.start();
  }


  // =====================
  // UI
  // =====================
  scoreDisplay = new ScoreDisplay(this);
  backgroundEffect = new BackgroundEffect(this);
  if (!this.registry.get("hasStarted")) {
      startScreen = new StartScreen(this);
  }

  gameOverScreen = new GameOverScreen(this);

  debugPanel = new DebugPanel(this);
  debugPanel.setVisible(debugVisible);


  // =====================
  // Input
  // =====================
  setupInput(this);

  continueKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
  );

  debugKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
  );


  // =====================
  // Physics
  // =====================
  this.physics.add.overlap(
      player.sprite,
      obstacle.sprite,
      playerHitObstacle,
      null,
      this
  );


  // =====================
  // Pointer Controls
  // =====================
  this.input.on("pointerdown", (pointer) => {
      if (handleDebugTap(pointer)) {
        return;
      }
      handleGameAction(this);
  });

}

// =====================
// Main Game Loop
// =====================
function update() {

    if (Phaser.Input.Keyboard.JustDown(debugKey)) {
        debugVisible = !debugVisible;
        debugPanel.setVisible(debugVisible);
    }

    if (!gameState.started || gameState.gameOver) {

        if (Phaser.Input.Keyboard.JustDown(continueKey)) {
            handleGameAction(this);
        }

        return;
    }

    backgroundEffect.update(
        obstacle.speed
    );

    const movement = getMovement();

    updateMovement(
        player,
        movement
    );

    if (obstacle.sprite.y > gameHeight) {
        obstacle.reset();
        gameState.addScore();

        scoreDisplay.update(
            gameState.score
        );
    }

    debugPanel.update(
        player,
        obstacle,
        movement,
        getInputDebug(),
        this.game.loop.actualFps
    );
}
function playerHitObstacle() {

  if (gameState.gameOver) {
      return;
  }

  gameState.endGame();

  this.cameras.main.shake(
    200,
    0.012
  );
this.tweens.add({
    targets: player.sprite,
    alpha: 0.2,
    duration: 50,
    yoyo: true,
    repeat: 1,

    onStart: () => {
        player.sprite.setFillStyle(0xffffff);
        player.sprite.setStrokeStyle(3, 0xff0000);
    },

    onComplete: () => {
        player.sprite.setFillStyle(0xa9825c);
        player.sprite.setStrokeStyle();
        player.sprite.setAlpha(1);
    }
});
  
  player.sprite.body.setVelocity(0, 0);
  gameOverScreen.show(gameState.score);
}

function startGame(scene) {

    gameState.startGame();

    scene.registry.set("hasStarted", true);

    setGameObjectsVisible(true);

    obstacle.start();

    startScreen?.hide();
}

function handleGameAction(scene) {
    if (!gameState.started) {
        startGame(scene);
        return;
    }
    if (gameState.gameOver) {
        scene.scene.restart();
    }
}

function setGameObjectsVisible(visible) {
    player.sprite.setVisible(visible);
    obstacle.sprite.setVisible(visible);
}

function handleDebugTap(pointer) {

    if (
        pointer.x < debugTapZoneSize &&
        pointer.y < debugTapZoneSize
    ) {

        debugTapCount++;

        clearTimeout(debugTapTimer);

        debugTapTimer = setTimeout(() => {
            debugTapCount = 0;
        }, 1200);

        if (debugTapCount === 3) {
            debugVisible = !debugVisible;
            debugPanel.setVisible(debugVisible);
            debugTapCount = 0;
        }

        return true;
    }

    return false;
}