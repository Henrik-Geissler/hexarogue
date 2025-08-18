# Hexarogue - Frontend Only

A hexagonal tile-matching game built with React, TypeScript, and Vite.

## Features

- Hexagonal game board with tile placement mechanics
- Color and digit matching gameplay
- Relict system with special abilities
- Drag and drop tile placement
- Score tracking and win/lose conditions
- Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Game Rules

1. Place tiles on the hexagonal board by matching colors or shared digits with adjacent tiles
2. Complete sets of 3 placements to score points
3. Use discards strategically when you can't place tiles
4. Reach the target score to win
5. Collect relicts for special abilities and upgrades

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- Zustand (State Management)
- Three.js (for 3D elements)
- Howler.js (Audio)

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Game/          # Game-specific components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Game logic utilities
├── public/                # Static assets
└── index.html
```
