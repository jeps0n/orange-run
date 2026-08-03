// Handles all player input.
// Keyboard and touch controls are converted into the same movement format.

let cursors;

// Touch joystick state
// Stores where the player started touching and where the finger currently is.
let touchActive = false;

let joystickCenter = {
    x: 0,
    y: 0
};

let currentPointer = {
    x: 0,
    y: 0
};

// Setup controls when the game starts
export function setupInput(scene) {

    cursors = scene.input.keyboard.createCursorKeys();

    // Start tracking a touch and set the temporary joystick center.
    scene.input.on("pointerdown", (pointer) => {
        touchActive = true;

        joystickCenter.x = pointer.x;
        joystickCenter.y = pointer.y;

        currentPointer.x = pointer.x;
        currentPointer.y = pointer.y;
    });
    
    // Update finger position while the player is holding the screen.
    scene.input.on("pointermove", (pointer) => {
        if (!touchActive) return;

        currentPointer.x = pointer.x;
        currentPointer.y = pointer.y;
    });

    scene.input.on("pointerup", () => {
        touchActive = false;
    });
}

// Returns current movement direction.
// Keyboard and touch both output values from -1 to 1.
export function getMovement() {

    const keyboardX =
        (cursors.right.isDown ? 1 : 0) -
        (cursors.left.isDown ? 1 : 0);

    const keyboardY =
        (cursors.down.isDown ? 1 : 0) -
        (cursors.up.isDown ? 1 : 0);

    // Keyboard always takes priority
    if (keyboardX !== 0 || keyboardY !== 0) {
        return {
            x: keyboardX,
            y: keyboardY
        };
    }

    // No touch active
    if (!touchActive) {
        return {
            x: 0,
            y: 0
        };
    }

    const dx = currentPointer.x - joystickCenter.x;
    const dy = currentPointer.y - joystickCenter.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const deadZone = 8;

    if (distance < deadZone) {
        return {
            x: 0,
            y: 0
        };
    }

    const angle = Math.atan2(dy, dx);

    return {
        x: Math.round(Math.cos(angle)),
        y: Math.round(Math.sin(angle))
    };
}