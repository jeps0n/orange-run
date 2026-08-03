import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement, getInputDebug } from "./input.js";
import { Player } from "./entities/Player.js";
import { Obstacle } from "./entities/Obstacle.js";
import { updateMovement } from "./systems/movement.js";
import { DebugPanel } from "./ui/DebugPanel.js";
import { GameOverScreen } from "./ui/GameOverScreen.js";


// Player reference
let player;

// Obstacle reference
let obstacle;


const gameWidth = 640;
const gameHeight = 480;

// Tracks whether the game has ended
let gameOver; //state
let gameOverScreen;
let debugPanel;
let restartKey;

let score = 0;
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
  // Reset game state
  gameOver = false;
  score = 0;
  scoreText = this.add.text(
    20,
    20,
    "Score: 0",
    {
      fontSize: "24px",
      fill: "#ffffff"
    }
  );

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

  debugPanel = new DebugPanel(this);

  // Initialize input controls (keyboard now, touch can be added later)
  setupInput(this);

  // Watch for collisions between the player and obstacle
  this.physics.add.overlap(
      player.sprite,
      obstacle.sprite,
      playerHitObstacle,
      null,
      this
  );


  gameOverScreen = new GameOverScreen(this);
  
  // Create restart key
  restartKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.R
  );

  this.input.on("pointerdown", () => {
    if (gameOver) {
        this.scene.restart();
    }
  });

}

// =====================
// Handle Player Input
// =====================
// Runs every frame and updates player movement
function update() {
  if (gameOver) {

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

  // Reset obstacle when it leaves the screen
  if (obstacle.sprite.y > 480) {
    obstacle.reset();
    score++;
    scoreText.setText("Score: " + score);
  }
  debugPanel.update(
      player,
      movement,
      getInputDebug(),
      this.game.loop.actualFps
  );
}

function playerHitObstacle() {

  gameOver = true;

  player.sprite.body.setVelocity(0, 0);

  gameOverScreen.show();
}