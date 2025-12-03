import { Engine } from './core/Engine';
import { LevelManager } from './core/LevelManager';
import { Level1 } from './game/Level1';
import { Level2 } from './game/Level2';
import './style.css';

const appRoot = document.getElementById('app')!;
const container = document.createElement('div');
container.className = 'game-container';
container.style.position = 'relative';
appRoot.appendChild(container);

// Initialize and mount the engine to the container
(async () => {
  const engine = new Engine();
  await engine.mount(container);
  
  // Create level manager and register levels
  const levelManager = new LevelManager(engine);
  levelManager.registerLevel('level1', new Level1(engine));
  levelManager.registerLevel('level2', new Level2(engine));
  
  // Start with level 1
  levelManager.loadLevel('level1');
  
  // Switch to level 2 after 5 seconds (for demo)
  setTimeout(() => {
    console.log('Switching to Level 2...');
    levelManager.loadLevel('level2');
  }, 5000);

})();