# Orange Run

🎮 **Play:** https://jeps0n.github.io/orange-run/

Orange Run is a small perspective arcade runner built with **Phaser 4** and **JavaScript**. The player moves across a neon runway, avoids incoming hazards, intercepts power-ups, and survives as the approach speed increases.

## Gameplay

- Red hazards approach from the horizon along the runway.
- Movement is constrained to the perspective-weighted playable surface.
- **Shield** absorbs one collision and is shown as a separate cyan energy field around the orange player.
- **Pulse** grants three forward-only attacks. Its narrow runway-space hit window rewards timing instead of acting like a general screen-clearing weapon.
- Hazards accelerate as the score increases.

## Controls

### Desktop

- **Arrow keys / WASD** — Move
- **Space** — Start / restart / use Pulse when charged
- **F2** — Toggle debug panel

### Mobile

- **Drag** — Virtual joystick movement
- **PULSE** — Use a Pulse charge when available
- **Triple tap top-left** — Toggle debug panel

## Architecture

```text
src/
├── entities/
│   ├── Obstacle.js
│   ├── Player.js
│   └── PowerUp.js
├── systems/
│   ├── GameState.js
│   ├── PulseAttack.js
│   ├── RunwayGeometry.js
│   └── movement.js
├── ui/
│   ├── BackgroundRenderer.js
│   ├── DebugPanel.js
│   ├── GameOverScreen.js
│   ├── RunwayRenderer.js
│   ├── ScoreDisplay.js
│   ├── StartScreen.js
│   └── VisualEffects.js
├── input.js
└── main.js
```

### Perspective model

Gameplay entities store **lane** and **depth** rather than arbitrary screen-space motion. `RunwayGeometry` projects those world values into screen X/Y, runway width, and scale using one nonlinear perspective curve. The runway grid, player bounds, hazards, power-ups, collisions, and Pulse targeting therefore share the same spatial model.

The rendering foundation keeps gameplay objects on a single shared projection while presentation effects remain isolated from gameplay state. Pulse and Shield use lightweight energy effects without particle, dust, or trail systems.

Hazard movement is shape-specific: Squares travel straight, Triangles reflect diagonally from runway edges, and Circles sweep across curved paths.

## Development

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.
