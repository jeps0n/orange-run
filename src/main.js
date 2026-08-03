import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement, getInputDebug } from "./input.js";
import { Player } from "./entities/Player.js";
import { Obstacle } from "./entities/Obstacle.js";
import { updateMovement } from "./systems/movement.js";


// Player reference
let player;

// Obstacle reference
let obstacle;


const gameWidth = 640;
const gameHeight = 480;

// Tracks whether the game has ended
let gameOver;

let gameOverPanel;
let gameOverTitle;
let restartText;

let restartKey;

let score = 0;
let scoreText;

let xyText;
let fpsText;
let inputText;

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




  xyText = this.add.text(
    20,
    50,
    "",
    {
        fontSize: "18px",
        fill: "#00ff00"
    }
  );

  fpsText = this.add.text(
    20,
    100,
    "",
    {
        fontSize: "18px",
        fill: "#ffff00"
    }
  );

  inputText = this.add.text(
    440,
    20,
    "",
    {
        fontSize: "14px",
        fill: "#b0e0e6"
    }
  );

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

  // Create game over background panel
  gameOverPanel = this.add.rectangle(
    320,
    245,
    300,
    130,
    0x000000,
    0.5
  );
  gameOverTitle = this.add.text(
    320,
    220,
    "GAME OVER",
    {
      fontSize: "48px",
      fontStyle: "bold",
      fill: "#ffffff",
    }
  );

  // Smaller restart message
  restartText = this.add.text(
    320,
    270,
    "Press R to restart",
    {
      fontSize: "24px",
      fill: "#ffffff",
    }
  );
  gameOverPanel.setVisible(false);

  gameOverTitle.setVisible(false);
  gameOverTitle.setOrigin(0.5);

  restartText.setVisible(false);
  restartText.setOrigin(0.5);
  
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
  xyText.setText(
    `vx: ${Math.round(player.sprite.body.velocity.x)}\n` +
    `vy: ${Math.round(player.sprite.body.velocity.y)}`
  );

  fpsText.setText(
    `FPS: ${Math.round(this.game.loop.actualFps)}`
  );

  const debug = getInputDebug();

  inputText.setText(
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

function playerHitObstacle() {
  gameOver = true;
  player.sprite.body.setVelocity(0, 0);
  gameOverPanel.setVisible(true);
  gameOverTitle.setVisible(true);
  restartText.setVisible(true);
}