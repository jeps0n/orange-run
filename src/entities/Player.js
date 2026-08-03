export class Player {

    constructor(scene, x, y) {

        // Create the player visual
        this.sprite = scene.add.rectangle(
            x,
            y,
            50,
            50,
            0xff8800
        );

        // Add physics to the player
        scene.physics.add.existing(this.sprite);

        // Keep player inside game bounds
        this.sprite.body.setCollideWorldBounds(true);

        // Player settings
        this.speed = 250;
    }

}