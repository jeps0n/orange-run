export class BackgroundEffect {

    constructor(scene) {

        this.lines = [];

        for (let i = 0; i < 8; i++) {

            const line = scene.add.rectangle(
                scene.scale.width / 2,
                i * 70,
                scene.scale.width,
                2,
                0xffffff,
                0.05
            );

            // Keep it behind the game objects
            line.setDepth(-1);

            this.lines.push(line);
        }
    }


update(speed) {
    this.lines.forEach(line => {
        line.y += speed * 0.01;
        if (line.y > 480) {
            line.y = -20;
        }

    });
}
}