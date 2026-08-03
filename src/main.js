import Phaser from "phaser";
import "./style.css";
import { setupInput, getMovement } from "./input.js";

// Player reference
// Allows update() to control the player created in create()
let player;

// =====================
// Game Configuration
// =====================

const config = {
    type: Phaser.AUTO,
    
    // Keep the game resolution consistent while allowing different screen sizes
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 480
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
// Create Game Objects
// =====================

function create() {

    // Create the player object
    player = this.add.rectangle(
        320,
        240,
        50,
        50,
        0x00aaff
    );

    // Add physics so the player object can move
    this.physics.add.existing(player);

    // Keep the player object inside the game window
    player.body.setCollideWorldBounds(true);

    // Enable arrow keys
    setupInput(this);
}

// =====================
// Handle Player Input
// =====================

// Runs every frame and updates player movement
function update() {

    const speed = 250;

    // Get input direction from input.js
    const movement = getMovement();

    // Move the player based on current input
    player.body.setVelocity(
        movement.x * speed,
        movement.y * speed
    );
}