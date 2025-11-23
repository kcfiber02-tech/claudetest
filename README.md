# First-Person Driving Game

A Three.js-based first-person driving game with a curving road, obstacles, and scoring system.

## Files

- `index.html` - Main HTML file with clean structure
- `styles.css` - All styling separated into its own file
- `game.js` - Refactored game logic with modular class-based architecture
- `driving-game.html` - Original single-file version (legacy)

## Refactoring Improvements

The codebase has been refactored to improve maintainability, readability, and extensibility:

### 1. Separation of Concerns
- **HTML**: Clean semantic structure without inline styles or scripts
- **CSS**: All styles in a dedicated stylesheet
- **JavaScript**: Game logic in a separate module

### 2. Configuration Management
- All magic numbers extracted into a centralized `Config` object
- Easy to adjust game parameters like speed, road width, physics, etc.
- Better documentation through structured config

### 3. Modular Class-Based Architecture

#### Core Classes:
- **`Game`**: Main game orchestrator that manages the game loop and coordinates all components
- **`InputController`**: Handles keyboard input with clean abstraction
- **`RoadManager`**: Manages road segments, markings, and grass
- **`TreeManager`**: Handles tree generation and infinite scrolling
- **`ObstacleManager`**: Manages obstacle cars and collision detection
- **`PlayerCar`**: Controls the player's car interior and steering wheel animation

### 4. Code Organization Benefits
- **Single Responsibility**: Each class has one clear purpose
- **Encapsulation**: Related data and methods grouped together
- **Maintainability**: Easier to modify specific features without affecting others
- **Extensibility**: Simple to add new features like power-ups, different vehicles, etc.
- **Testability**: Classes can be tested independently

### 5. Improved Code Quality
- Eliminated code duplication
- Consistent naming conventions
- Better separation between game state and rendering
- Cleaner update loops with dedicated methods

## How to Play

1. Open `index.html` in a web browser
2. Use keyboard controls:
   - **W / ↑**: Accelerate
   - **S / ↓**: Brake
   - **A / ←**: Turn Left
   - **D / →**: Turn Right
3. Avoid obstacles and try to maximize your score

## Technical Details

- Built with Three.js r128
- Features:
  - Procedurally generated curving road
  - Dynamic lighting and shadows
  - Infinite scrolling world
  - Collision detection
  - Physics-based car movement
  - First-person perspective with visible car interior
  - Animated steering wheel

## Future Enhancement Ideas

With the new modular structure, it's easier to add:
- Different car models
- Power-ups and collectibles
- Multiple road types/biomes
- Weather effects
- Sound effects and music
- Particle effects for collisions
- More obstacle variety
- Difficulty progression
