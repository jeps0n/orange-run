export function updateMovement(player, movement) {

    let x = movement.x;
    let y = movement.y;

    const length = Math.sqrt(
        x * x +
        y * y
    );

    if (length > 0) {
        x /= length;
        y /= length;
    }

    player.sprite.body.setVelocity(
        x * player.speed,
        y * player.speed
    );
}