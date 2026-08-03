import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement, getInputDebug } from "./input.js";
import { Player } from "./entities/Player.js";
import { Obstacle } from "./entities/Obstacle.js";
import { updateMovement } from "./systems/movement.js";
import { DebugPanel } from "./ui/DebugPanel.js";
import { GameOverScreen } from "./ui/GameOverScreen.js";
import { GameState } from "./systems/GameState.js";

// game entities
let player;
let obstacle;

const gameWidth = 640;
const gameHeight = 480;

let gameState;

let gameOverScreen;
let debugPanel;
let restartKey;

let scoreText;

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
  gameState = new GameState();

  player = new Player(
    this,
    320,
    240
  );

  obstacle = new Obstacle(
    this,
    320,
    50
  );

    
  scoreText = this.add.text(
    20,
    20,
    "Score: 0",
    {
      fontSize: "24px",
      fill: "#ffffff"
    }
  );

  debugPanel = new DebugPanel(this);
  gameOverScreen = new GameOverScreen(this);

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

  // create restart key
  restartKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.R
  );

  this.input.on("pointerdown", () => {
    if (gameState.gameOver) {
        this.scene.restart();
    }
  });
}

// =====================
// Handle Player Input
// =====================
// main game loop
function update() {
  if (gameState.gameOver) {

    if (Phaser.Input.Keyboard.JustDown(restartKey)) {
      this.scene.restart();
    }
    return;
  }
  const movement = getMovement();

  updateMovement(
      player,
      movement
  );

  // reset obstacle when it leaves the screen
  if (obstacle.sprite.y > 480) {
    obstacle.reset();
    gameState.addScore();

    scoreText.setText(
        "Score: " + gameState.score
    );
  }
  debugPanel.update(
      player,
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