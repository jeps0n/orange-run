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

let scoreDisplay;

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
// Create Game Objects and Initialize Game Systems
// =====================
function create() {
  gameState = new GameState(this);

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

  scoreDisplay = new ScoreDisplay(this);

  if (!this.registry.get("hasStarted")) {
    startScreen = new StartScreen(this);
  }
  gameOverScreen = new GameOverScreen(this);
  debugPanel = new DebugPanel(this);

  // initialize input controls
  setupInput(this);

  // watch for collisions between the player and obstacle
  this.physics.add.overlap(
      player.sprite,
      obstacle.sprite,
      playerHitObstacle,
      null,
      this
  );

  continueKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SPACE
  );

  this.input.on("pointerdown", () => {
      handleGameAction(this);
  });
  }

// =====================
// Main Game Loop
// =====================
function update() {
  if (!gameState.started || gameState.gameOver) {

      if (Phaser.Input.Keyboard.JustDown(continueKey)) {
          handleGameAction(this);
      }

      return;
  }
  const movement = getMovement();

  updateMovement(
      player,
      movement
  );

  // reset obstacle when it leaves the screen
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
  gameState.endGame();
  player.sprite.body.setVelocity(0, 0);
  gameOverScreen.show();
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