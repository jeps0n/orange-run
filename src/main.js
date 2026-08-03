import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement } from "./input.js";



// Player reference
// Allows update() to control the player created in create()
let player;

// Obstacle reference
let obstacle;

// Controls player movement speed
const playerSpeed = 250;

const gameWidth = 640;
const gameHeight = 480;

// Tracks whether the game has ended
let gameOver;
let restartKey;

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
  // Create the player object
  player = this.add.rectangle(
    320, // x position
    240, // y position
    50, // width
    50, // height
    0xff8800 // orange color
  );

  // Add physics so the player object can move
  this.physics.add.existing(player);

  // Keep the player object inside the game window
  player.body.setCollideWorldBounds(true);

  // Create falling obstacle
  obstacle = this.add.rectangle(
    320,    // x position (middle of 640 width)
    50,     // y position (near the top)
    40,     // width
    40,     // height
    0xff0000 // red color
  );

  // Add a physics body to the obstacle (for collision detection)
  this.physics.add.existing(obstacle);

  // Move the obstacle downward
  obstacle.body.setVelocityY(120);

  // Initialize input controls (keyboard now, touch can be added later)
  setupInput(this);

    // Create restart key
  restartKey = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.R
  );

  // Watch for collisions between the player and obstacle
  this.physics.add.overlap(
    player,
    obstacle,
    playerHitObstacle,
    null,
    this
  );
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

  // Get input direction from input.js
  const movement = getMovement();

  // Move the player based on current input
  player.body.setVelocity(
    movement.x * playerSpeed,
    movement.y * playerSpeed
  );

  // Reset obstacle when it leaves the screen
  if (obstacle.y > 480) {
    obstacle.y = 0;

    // Choose a random horizontal position
    obstacle.x = Phaser.Math.Between(20, 620);
  }
}

function playerHitObstacle() {
  gameOver = true;
  console.log("Game Over");
}