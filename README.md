# Type or Die 🧟

A post-apocalyptic browser typing game built with React + Vite.

Zombies shuffle toward you, each carrying a word on their chest. Type the word to destroy the zombie before it reaches you. One touch means death.

## Features

- 🧟 **Zombie horde** — zombies spawn and move toward the player
- ⌨️ **ZType-style targeting** — start typing to auto-target the nearest matching zombie; highlighted progress shows typed characters
- 📈 **Progressive difficulty** — each wave (every 30 s) increases zombie speed and spawn rate
- 📊 **Stats tracking** — real-time WPM, error count, zombie count, and end-game accuracy
- 💀 **Game over** — a single zombie touch ends the game; full stat summary is shown
- 🎨 **Post-apocalyptic theme** — dark, gritty colour palette with neon-green / blood-red accents

## Controls

| Key | Action |
|-----|--------|
| Letters | Type the targeted zombie word |
| Backspace | Delete last character |
| Escape | Cancel current target |
| Enter / Space | Start game / Restart |

## Getting Started

```bash
npm install
npm run dev
```

Then open <http://localhost:5173> in your browser.

## Build

```bash
npm run build   # production bundle → dist/
npm run preview # preview the production build
```
