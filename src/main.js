import Phaser from "phaser";
import "./style.css";

let player;

const config = {
    type: Phaser.AUTO,

    width: 800,
    height: 600,

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


function create() {
    // Create player as a blue square
    player = this.add.rectangle(
        400,
        300,
        50,
        50,
        0x00aaff
    );

    // Enable physics on the player
    this.physics.add.existing(player);

    player.body.setCollideWorldBounds(true);

    // Add keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
}


function update() {
    const speed = 250;

    player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
        player.body.setVelocityX(-speed);
    }

    if (this.cursors.right.isDown) {
        player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
        player.body.setVelocityY(-speed);
    }

    if (this.cursors.down.isDown) {
        player.body.setVelocityY(speed);
    }
}