import Phaser from "phaser";
import "./style.css";

const config = {
    type: Phaser.AUTO,

    width: 800,
    height: 600,

    backgroundColor: "#1b1b1b",

    scene: {
        create
    }
};

new Phaser.Game(config);

function create() {
    this.add.text(
        300,
        280,
        "DODGE GAME",
        {
            fontSize: "48px",
            color: "#ffffff"
        }
    );
}