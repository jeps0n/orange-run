// Handles all player input.
// Keyboard is used now; touch controls can be added here later.

let cursors;

// Setup controls when the game starts
export function setupInput(scene) {

    // Create keyboard arrow key controls
    cursors = scene.input.keyboard.createCursorKeys();
}

// Returns the current movement direction
// This keeps input separate from player movement logic.
export function getMovement() {
    console.log(cursors);
    return {
        x:
            (cursors.right.isDown ? 1 : 0) -
            (cursors.left.isDown ? 1 : 0),

        y:
            (cursors.down.isDown ? 1 : 0) -
            (cursors.up.isDown ? 1 : 0)
    };
}