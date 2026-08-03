// Handles all player input.
// Keyboard is used now; touch controls can be added here later.

let cursors;
let touchDirection = { x: 0, y: 0 };

// Setup controls when the game starts
export function setupInput(scene) {

    // Create keyboard arrow key controls
    cursors = scene.input.keyboard.createCursorKeys();

    // Create touch controls
    scene.input.on("pointerdown", (pointer) => {

        touchDirection.x = 0;
        touchDirection.y = 0;

        if (pointer.x < scene.scale.width / 2) {
            touchDirection.x = -1;
        }

        if (pointer.x > scene.scale.width / 2) {
            touchDirection.x = 1;
        }

        if (pointer.y < scene.scale.height / 2) {
            touchDirection.y = -1;
        }

        if (pointer.y > scene.scale.height / 2) {
            touchDirection.y = 1;
        }

    });

    scene.input.on("pointerup", () => {

        touchDirection.x = 0;
        touchDirection.y = 0;

    });
}

// Returns the current movement direction
// This keeps input separate from player movement logic.
export function getMovement() {
	return {
		x:
			(cursors.right.isDown ? 1 : 0) -
			(cursors.left.isDown ? 1 : 0) +
			touchDirection.x,

		y:
			(cursors.down.isDown ? 1 : 0) -
			(cursors.up.isDown ? 1 : 0) +
			touchDirection.y
	};
}