const JOYSTICK_RADIUS = 40;
const JOYSTICK_DEAD_ZONE = 8;
const PULSE_ZONE = { x: 520, y: 380 };
let movementKeys;
let touchActive = false;
let touchPosition = { x: 0, y: 0 };
let joystickCenter = { x: 0, y: 0 };
let joystickVisual = { base: null, thumb: null };
export function setupInput(scene) {
    movementKeys = {
        wasd: scene.input.keyboard.addKeys("W,A,S,D"),
        arrows: scene.input.keyboard.createCursorKeys()
    };
    joystickVisual = {
        base: scene.add
            .circle(0, 0, JOYSTICK_RADIUS, 0xffffff, 0.08)
            .setStrokeStyle(1, 0xffffff, 0.3)
            .setDepth(12)
            .setVisible(false),
        thumb: scene.add
            .circle(0, 0, 14, 0xff8a00, 0.75)
            .setDepth(13)
            .setVisible(false)
    };
    scene.input.on("pointerdown", (pointer) => {
        if (isPulsePointer(pointer)) return;
        touchActive = true;
        joystickCenter = { x: pointer.x, y: pointer.y };
        touchPosition = { x: pointer.x, y: pointer.y };
        joystickVisual.base
            .setPosition(pointer.x, pointer.y)
            .setVisible(true)
            .setAlpha(1);
        joystickVisual.thumb
            .setPosition(pointer.x, pointer.y)
            .setVisible(true)
            .setAlpha(1);
    });
    scene.input.on("pointermove", (pointer) => {
        if (!touchActive) return;
        touchPosition = { x: pointer.x, y: pointer.y };
    });
    scene.input.on("pointerup", () => {
        touchActive = false;
        scene.tweens.add({
            targets: [joystickVisual.base, joystickVisual.thumb],
            alpha: 0,
            duration: 120,
            onComplete: () => {
                joystickVisual.base.setVisible(false);
                joystickVisual.thumb.setVisible(false);
            }
        });
    });
}
export function getMovement() {
    const keyboardMovement = getKeyboardMovement();
    if (keyboardMovement.x !== 0 || keyboardMovement.y !== 0) {
        return keyboardMovement;
    }
    return getTouchMovement();
}
function getKeyboardMovement() {
    const { wasd, arrows } = movementKeys;
    const movingLeft = wasd.A.isDown || arrows.left.isDown;
    const movingRight = wasd.D.isDown || arrows.right.isDown;
    const movingUp = wasd.W.isDown || arrows.up.isDown;
    const movingDown = wasd.S.isDown || arrows.down.isDown;
    return {
        x: Number(movingRight) - Number(movingLeft),
        y: Number(movingDown) - Number(movingUp)
    };
}
function getTouchMovement() {
    if (!touchActive) return { x: 0, y: 0 };
    const dx = touchPosition.x - joystickCenter.x;
    const dy = touchPosition.y - joystickCenter.y;
    const distance = Math.hypot(dx, dy);
    updateJoystickVisual(dx, dy, distance);
    if (distance < JOYSTICK_DEAD_ZONE) return { x: 0, y: 0 };
    const angle = Math.atan2(dy, dx);
    return {
        x: Math.round(Math.cos(angle)),
        y: Math.round(Math.sin(angle))
    };
}
function updateJoystickVisual(dx, dy, distance) {
    if (distance <= JOYSTICK_RADIUS) {
        joystickVisual.thumb.setPosition(touchPosition.x, touchPosition.y);
        return;
    }
    const angle = Math.atan2(dy, dx);
    joystickVisual.thumb.setPosition(
        joystickCenter.x + Math.cos(angle) * JOYSTICK_RADIUS,
        joystickCenter.y + Math.sin(angle) * JOYSTICK_RADIUS
    );
}
export function isPulsePointer(pointer) {
    return pointer.x >= PULSE_ZONE.x && pointer.y >= PULSE_ZONE.y;
}
export function getInputDebug() {
    return { touchActive, joystickCenter, touchPosition };
}
export function setupDebugGesture(onToggle) {
    let tapCount = 0;
    let resetTimer;
    return {
        isDebugTap(pointer) {
            if (pointer.x >= 120 || pointer.y >= 120) return false;
            tapCount += 1;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => { tapCount = 0; }, 1200);
            if (tapCount === 3) {
                onToggle();
                tapCount = 0;
            }
            return true;
        },
        destroy() {
            clearTimeout(resetTimer);
        }
    };
}
