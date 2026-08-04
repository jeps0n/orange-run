# Orange Run

*** 🎮 PLAY THE GAME: https://jeps0n.github.io/orange-run/ ***

A fast-paced arcade dodge game built with **Phaser 3** and **JavaScript**.

Orange Run started as a simple movement and collision prototype and evolved into a small, polished game focused on responsive controls, gameplay feedback, and clean code organization.

The goal is simple: control the orange player, avoid obstacles, and survive as long as possible while the challenge increases.

---

## Gameplay

* Move the player and avoid incoming obstacles
* Survive longer to increase your score
* React to collisions with visual and camera feedback
* Use desktop or mobile controls

The focus of the project was not only making the game functional, but making each interaction feel responsive and intentional.

---

## Features
 
### Gameplay Systems

* Player movement system
* Obstacle spawning and movement
* Collision detection
* Score tracking
* Game state management

### Player Feedback

* Camera shake on collision
* Flash and impact effect when hit
* Animated score updates
* Speed-based background movement

### Controls

* Keyboard controls for desktop
* Touch controls for mobile
* Three-tap debug toggle for mobile testing

### Developer Tools

* Toggleable debug panel
* Live player velocity information
* Obstacle speed display
* FPS monitoring
* Input debugging

---

## Project Structure

The project is organized around separate responsibilities rather than placing all logic inside the main game scene.

```
src/
│
├── entities/
│   ├── Player.js
│   └── Obstacle.js
│
├── systems/
│   ├── GameState.js
│   └── movement.js
│
├── ui/
│   ├── StartScreen.js
│   ├── GameOverScreen.js
│   ├── ScoreDisplay.js
│   ├── DebugPanel.js
│   └── BackgroundEffect.js
│
├── input.js
└── main.js
```

This structure allows gameplay logic, visual components, and debugging tools to evolve independently.

---

## Technical Decisions

### Phaser 3

I chose Phaser because it provides a strong foundation for 2D game development while still allowing direct control over gameplay systems and rendering.

### Component Separation

Instead of keeping all functionality inside one scene file, game objects, systems, and UI elements are separated into their own modules.

This made it easier to:

* iterate on gameplay quickly
* add feedback effects
* debug issues
* keep the codebase maintainable

### Shared Gameplay Variables

The background movement uses the same speed value as the obstacle system, keeping visual feedback synchronized with gameplay difficulty.

---

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL in your browser.

---

## Controls

### Desktop

* **WASD / Arrow Keys** — Move
* **Space** — Start / Restart
* **D** — Toggle debug panel

### Mobile

* Touch joystick — Move player
* Triple tap top-left corner — Toggle debug panel

---

## Future Improvements

Potential additions:

* More obstacle patterns
* Additional gameplay mechanics
* Sound effects
* High score tracking
* Expanded difficulty progression

---

## What I Learned

Building Orange Run helped me practice designing a small game with a focus on maintainability rather than just making a prototype work.

The biggest areas of growth were:

* separating systems by responsibility
* creating reusable UI components
* designing feedback that improves player experience
* balancing clean architecture with rapid iteration
