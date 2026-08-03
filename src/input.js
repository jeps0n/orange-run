// Handles all player input.
// Keyboard and touch controls are converted into the same movement format.

let cursors;

// Touch joystick state
// Stores where the player started touching and where the finger currently is.
let touchActive = false;
let touchPosition = {
    x: 0,
    y: 0
};

let joystickCenter = {
    x: 0,
    y: 0
};

let joystickVisual = {
    base: null,
    thumb: null,
    radius: 40
};

// Setup controls when the game starts
export function setupInput(scene) {

    cursors = scene.input.keyboard.createCursorKeys();

    // Create the visual joystick base (outer circle).
    // This is only a UI element and does not control player movement.
    joystickVisual.base = scene.add.circle(
        0,                       // Starting x position (updated when touch begins)
        0,                       // Starting y position (updated when touch begins)
        joystickVisual.radius,   // Size of the joystick movement area
        0xffffff,                // White color
        0.25                     // Transparency (alpha)
    );


    // Create the visual joystick thumb (inner circle).
    // This follows the player's finger position within the joystick radius.
    joystickVisual.thumb = scene.add.circle(
        0,       // Starting x position
        0,       // Starting y position
        18,      // Thumb size
        0xffffff,// White color
        0.5      // Transparency (alpha)
    );
    joystickVisual.base.setVisible(false);
    joystickVisual.thumb.setVisible(false);

    // Start tracking a touch and set the temporary joystick center.
    scene.input.on("pointerdown", (pointer) => {
        touchActive = true;

        joystickCenter.x = pointer.x;
        joystickCenter.y = pointer.y;

        touchPosition.x = pointer.x;
        touchPosition.y = pointer.y;

        joystickVisual.base
        .setPosition(pointer.x, pointer.y)
        .setVisible(true);

        joystickVisual.thumb
        .setPosition(pointer.x, pointer.y)
        .setVisible(true);

        scene.tweens.add({
        targets: [
            joystickVisual.base,
            joystickVisual.thumb
        ],
            alpha: 1,
            duration: 150
        });
    });
    
    // Update finger position while the player is holding the screen.
    scene.input.on("pointermove", (pointer) => {
        if (!touchActive) return;

        touchPosition.x = pointer.x;
        touchPosition.y = pointer.y;
    });

    scene.input.on("pointerup", () => {
        touchActive = false;

        scene.tweens.add({
            targets: [
                joystickVisual.base,
                joystickVisual.thumb
            ],
            alpha: 0,
            duration: 200,
            onComplete: () => {
                joystickVisual.base.setVisible(false);
                joystickVisual.thumb.setVisible(false);
            }
        });
    });
}

function updateJoystickVisual() {

    const dx = touchPosition.x - joystickCenter.x;
    const dy = touchPosition.y - joystickCenter.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    let thumbX = touchPosition.x;
    let thumbY = touchPosition.y;

    if (distance > joystickVisual.radius) {

        const angle = Math.atan2(dy, dx);

        thumbX =
            joystickCenter.x +
            Math.cos(angle) * joystickVisual.radius;

        thumbY =
            joystickCenter.y +
            Math.sin(angle) * joystickVisual.radius;
    }

    joystickVisual.thumb.setPosition(
        thumbX,
        thumbY
    );
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

    const dx = touchPosition.x - joystickCenter.x;
    const dy = touchPosition.y - joystickCenter.y;

    updateJoystickVisual();

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

export function getInputDebug() {
    return {
        touchActive,
        joystickCenter,
        touchPosition
    };
}