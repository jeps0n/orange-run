import Phaser from "phaser";

export class Obstacle {

    constructor(scene, x, y) {

        this.sprite = scene.add.rectangle(
            x,
            y,
            40,
            40,
            0xff0000
        );

        scene.physics.add.existing(this.sprite);

        this.speed = 120;

        this.sprite.body.setVelocityY(this.speed);
    } 
 
    reset() {
        this.sprite.y = 0;

        this.sprite.x = Phaser.Math.Between(20, 620);

        this.speed += 20;

        this.sprite.body.setVelocityY(this.speed);
    }

}

